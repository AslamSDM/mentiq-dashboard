import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Get webhook secret at runtime to ensure it's loaded
function getWebhookSecret(): string {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    console.error("🚨 WEBHOOK_SECRET environment variable is not set!");
    throw new Error("WEBHOOK_SECRET is required");
  }
  return secret;
}

// Helper function to generate HMAC signature for webhook requests
function generateWebhookSignature(payload: string): string {
  const secret = getWebhookSecret();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const signature = hmac.digest("hex");

  // Debug logging
  console.log("🔐 Generating webhook signature:");
  console.log("   Secret length:", secret.length);
  console.log("   Payload length:", payload.length);
  console.log("   Generated signature:", signature);

  return signature;
}

// Helper function to update subscription in backend
async function updateSubscription(data: any) {
  try {
    const payload = JSON.stringify(data);
    const signature = generateWebhookSignature(payload);

    console.log("📤 Sending to backend:", `${BACKEND_URL}/webhook/subscription`);
    console.log("   Payload:", payload.substring(0, 200) + "...");

    const response = await fetch(`${BACKEND_URL}/webhook/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body: payload,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to update subscription:", error);
      console.error("Response status:", response.status);
      return false;
    }

    console.log("✅ Subscription updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating subscription:", error);
    return false;
  }
}

// Helper function to record payment
async function recordPayment(data: any) {
  try {
    const payload = JSON.stringify(data);
    const signature = generateWebhookSignature(payload);

    const response = await fetch(`${BACKEND_URL}/webhook/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body: payload,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to record payment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error recording payment:", error);
    return false;
  }
}

// Helper function to check and trigger auto-upgrade if needed
// User count is now calculated automatically by the backend
async function checkAutoUpgrade(accountId: string) {
  try {
    console.log(`🔄 Checking auto-upgrade for account ${accountId}`);
    
    const response = await fetch(
      `${BACKEND_URL}/api/v1/subscriptions/${accountId}/check-upgrade`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY || ""}`,
          "X-Account-ID": accountId,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to check auto-upgrade:", error);
      return null;
    }

    const result = await response.json();
    if (result.result?.upgraded) {
      console.log(`✅ Auto-upgraded account ${accountId} from ${result.result.old_tier} to ${result.result.new_tier}`);
      console.log(`   Calculated users: ${result.calculated_users}`);
    }
    return result;
  } catch (error) {
    console.error("Error checking auto-upgrade:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment successful:", {
          sessionId: session.id,
          customerId: session.customer,
          metadata: session.metadata,
        });

        // Get subscription details from metadata
        const { accountId, tier, userCount, price } = session.metadata || {};

        if (!accountId || !tier) {
          console.error("Missing metadata in checkout session");
          break;
        }

        // Fetch subscription details from Stripe and update its metadata
        let subscription: Stripe.Subscription | null = null;
        if (session.subscription && typeof session.subscription === "string") {
          // Update subscription metadata with accountId so invoice events can find it
          subscription = await stripe.subscriptions.update(
            session.subscription,
            {
              metadata: {
                accountId,
                tier,
                userCount: userCount || "0",
              },
            }
          );
        }

        // Also update customer metadata for fallback lookups
        if (session.customer && typeof session.customer === "string") {
          try {
            await stripe.customers.update(session.customer, {
              metadata: { accountId },
            });
          } catch (e) {
            console.error("Failed to update customer metadata:", e);
          }
        }

        // Create or update subscription in database
        await updateSubscription({
          account_id: accountId,
          tier,
          user_count: parseInt(userCount || "0"),
          monthly_price: parseInt(price || "0"),
          status: subscription?.status || "active",
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          stripe_price_id: subscription?.items.data[0]?.price.id,
          stripe_product_id: subscription?.items.data[0]?.price
            .product as string,
          current_period_start: (subscription as any)?.current_period_start
            ? new Date(
                (subscription as any).current_period_start * 1000
              ).toISOString()
            : new Date().toISOString(),
          current_period_end: (subscription as any)?.current_period_end
            ? new Date(
                (subscription as any).current_period_end * 1000
              ).toISOString()
            : new Date().toISOString(),
          trial_start: subscription?.trial_start
            ? new Date(subscription.trial_start * 1000).toISOString()
            : null,
          trial_end: subscription?.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        });

        // Record the initial payment
        if (session.amount_total && session.amount_total > 0) {
          await recordPayment({
            account_id: accountId,
            amount: session.amount_total,
            currency: session.currency || "usd",
            status: "succeeded",
            stripe_invoice_id: session.invoice,
            stripe_payment_id: session.payment_intent,
            description: `Initial payment for ${tier} tier`,
            paid_at: new Date().toISOString(),
          });
        }

        // Initialize onboarding status for new signup
        if (session.metadata?.isSignupFlow === "true") {
          try {
            await fetch(`${BACKEND_URL}/api/v1/onboarding/status`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.BACKEND_API_KEY || ""}`,
                "X-Account-ID": accountId,
              },
              body: JSON.stringify({
                account_id: accountId,
                data_connection_shown: false,
              }),
            });
          } catch (error) {
            console.error("Failed to initialize onboarding status:", error);
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          metadata: subscription.metadata,
        });

        const { accountId } = subscription.metadata || {};

        if (!accountId) {
          console.error("Missing accountId in subscription metadata");
          break;
        }

        // Ensure subscription metadata has accountId (in case it was missing)
        if (accountId && subscription.id) {
          try {
            await stripe.subscriptions.update(subscription.id, {
              metadata: { accountId },
            });
          } catch (e) {
            console.error("Failed to update subscription metadata:", e);
          }
        }

        // Update subscription status and billing period
        await updateSubscription({
          account_id: accountId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(
            (subscription as any).current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            (subscription as any).current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        });

        // Check if account needs auto-upgrade (user count calculated by backend)
        if (subscription.status === "active") {
          await checkAutoUpgrade(accountId);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Subscription canceled:", {
          subscriptionId: subscription.id,
          metadata: subscription.metadata,
        });

        const { accountId } = subscription.metadata || {};

        if (!accountId) {
          console.error("Missing accountId in subscription metadata");
          break;
        }

        // Mark subscription as canceled
        await updateSubscription({
          account_id: accountId,
          stripe_subscription_id: subscription.id,
          status: "canceled",
          canceled_at: new Date().toISOString(),
        });

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment succeeded:", {
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
          customerId: invoice.customer,
        });

        // Get account ID from subscription metadata, falling back to customer metadata
        let accountId: string | undefined;

        // Try subscription metadata first
        if (
          (invoice as any).subscription &&
          typeof (invoice as any).subscription === "string"
        ) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription
          );
          accountId = subscription.metadata?.accountId;
        }

        // Fallback: try customer metadata
        if (!accountId && invoice.customer) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer.id;
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              accountId = (customer as Stripe.Customer).metadata?.accountId;
            }
          } catch (e) {
            console.error("Failed to retrieve customer:", e);
          }
        }

        if (!accountId) {
          console.error("Could not find accountId for invoice:", invoice.id);
          break;
        }

        // Record successful payment
        await recordPayment({
          account_id: accountId,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "succeeded",
          stripe_invoice_id: invoice.id,
          stripe_charge_id: (invoice as any).charge,
          stripe_payment_id: (invoice as any).payment_intent,
          description: invoice.description || "Subscription payment",
          invoice_number: invoice.number,
          invoice_pdf: invoice.invoice_pdf,
          paid_at: (invoice as any).status_transitions?.paid_at
            ? new Date(
                (invoice as any).status_transitions.paid_at * 1000
              ).toISOString()
            : new Date().toISOString(),
        });

        // Update subscription status to active if it was past_due
        if ((invoice as any).subscription) {
          await updateSubscription({
            account_id: accountId,
            stripe_subscription_id: (invoice as any).subscription,
            status: "active",
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice payment failed:", {
          invoiceId: invoice.id,
          subscriptionId: (invoice as any).subscription,
          customerId: invoice.customer,
        });

        // Get account ID from subscription metadata, falling back to customer metadata
        let accountId: string | undefined;

        // Try subscription metadata first
        if (
          (invoice as any).subscription &&
          typeof (invoice as any).subscription === "string"
        ) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as any).subscription
          );
          accountId = subscription.metadata?.accountId;
        }

        // Fallback: try customer metadata
        if (!accountId && invoice.customer) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer.id;
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              accountId = (customer as Stripe.Customer).metadata?.accountId;
            }
          } catch (e) {
            console.error("Failed to retrieve customer:", e);
          }
        }

        if (!accountId) {
          console.error("Could not find accountId for invoice:", invoice.id);
          break;
        }

        // Record failed payment
        await recordPayment({
          account_id: accountId,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: "failed",
          stripe_invoice_id: invoice.id,
          description: invoice.description || "Failed subscription payment",
          failed_at: new Date().toISOString(),
        });

        // Update subscription status to past_due
        if ((invoice as any).subscription) {
          await updateSubscription({
            account_id: accountId,
            stripe_subscription_id: (invoice as any).subscription,
            status: "past_due",
          });
        }

        // TODO: Send email notification to customer about failed payment

        break;
      }

      // Events we acknowledge but don't need to handle
      case "customer.created":
      case "customer.updated":
      case "customer.subscription.created":
      case "customer.subscription.trial_will_end":
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.paid":
      case "invoice.upcoming":
      case "payment_intent.created":
      case "payment_intent.succeeded":
      case "charge.succeeded":
        // These events are informational - no action needed
        console.log(`Acknowledged event: ${event.type}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
