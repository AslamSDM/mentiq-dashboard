import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

function getWebhookSecret(): string {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("WEBHOOK_SECRET is required");
  }
  return secret;
}

function generateWebhookSignature(payload: string): string {
  const secret = getWebhookSecret();
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex");
}

async function updateSubscription(data: Record<string, unknown>) {
  try {
    const payload = JSON.stringify(data);
    const signature = generateWebhookSignature(payload);

    const response = await fetch(`${BACKEND_URL}/webhook/subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Signature": signature,
      },
      body: payload,
    });

    return response.ok;
  } catch {
    return false;
  }
}

async function recordPayment(data: Record<string, unknown>) {
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

    return response.ok;
  } catch {
    return false;
  }
}

async function checkAutoUpgrade(accountId: string) {
  try {
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
      return null;
    }

    return response.json();
  } catch {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { accountId, tier, userCount, price } = session.metadata || {};

        if (!accountId || !tier) {
          break;
        }

        let subscription: Stripe.Subscription | null = null;
        if (session.subscription && typeof session.subscription === "string") {
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

        if (session.customer && typeof session.customer === "string") {
          try {
            await stripe.customers.update(session.customer, {
              metadata: { accountId },
            });
          } catch {
            // Ignore customer update failures
          }
        }

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
          current_period_start: (subscription as Stripe.Subscription & { current_period_start?: number })?.current_period_start
            ? new Date(
                (subscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000
              ).toISOString()
            : new Date().toISOString(),
          current_period_end: (subscription as Stripe.Subscription & { current_period_end?: number })?.current_period_end
            ? new Date(
                (subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000
              ).toISOString()
            : new Date().toISOString(),
          trial_start: subscription?.trial_start
            ? new Date(subscription.trial_start * 1000).toISOString()
            : null,
          trial_end: subscription?.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        });

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
          } catch {
            // Ignore onboarding init failures
          }
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const { accountId } = subscription.metadata || {};

        if (!accountId) {
          break;
        }

        if (accountId && subscription.id) {
          try {
            await stripe.subscriptions.update(subscription.id, {
              metadata: { accountId },
            });
          } catch {
            // Ignore metadata update failures
          }
        }

        await updateSubscription({
          account_id: accountId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          current_period_start: new Date(
            (subscription as Stripe.Subscription & { current_period_start: number }).current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            (subscription as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000
          ).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        });

        if (subscription.status === "active") {
          await checkAutoUpgrade(accountId);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { accountId } = subscription.metadata || {};

        if (!accountId) {
          break;
        }

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
        let accountId: string | undefined;

        if (
          (invoice as Stripe.Invoice & { subscription?: string }).subscription &&
          typeof (invoice as Stripe.Invoice & { subscription?: string }).subscription === "string"
        ) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as Stripe.Invoice & { subscription: string }).subscription
          );
          accountId = subscription.metadata?.accountId;
        }

        if (!accountId && invoice.customer) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer.id;
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              accountId = (customer as Stripe.Customer).metadata?.accountId;
            }
          } catch {
            // Ignore customer retrieval failures
          }
        }

        if (!accountId) {
          break;
        }

        await recordPayment({
          account_id: accountId,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: "succeeded",
          stripe_invoice_id: invoice.id,
          stripe_charge_id: (invoice as Stripe.Invoice & { charge?: string }).charge,
          stripe_payment_id: (invoice as Stripe.Invoice & { payment_intent?: string }).payment_intent,
          description: invoice.description || "Subscription payment",
          invoice_number: invoice.number,
          invoice_pdf: invoice.invoice_pdf,
          paid_at: (invoice as Stripe.Invoice & { status_transitions?: { paid_at?: number } }).status_transitions?.paid_at
            ? new Date(
                (invoice as Stripe.Invoice & { status_transitions: { paid_at: number } }).status_transitions.paid_at * 1000
              ).toISOString()
            : new Date().toISOString(),
        });

        if ((invoice as Stripe.Invoice & { subscription?: string }).subscription) {
          await updateSubscription({
            account_id: accountId,
            stripe_subscription_id: (invoice as Stripe.Invoice & { subscription: string }).subscription,
            status: "active",
          });
        }

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        let accountId: string | undefined;

        if (
          (invoice as Stripe.Invoice & { subscription?: string }).subscription &&
          typeof (invoice as Stripe.Invoice & { subscription?: string }).subscription === "string"
        ) {
          const subscription = await stripe.subscriptions.retrieve(
            (invoice as Stripe.Invoice & { subscription: string }).subscription
          );
          accountId = subscription.metadata?.accountId;
        }

        if (!accountId && invoice.customer) {
          const customerId = typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer.id;
          try {
            const customer = await stripe.customers.retrieve(customerId);
            if (customer && !customer.deleted) {
              accountId = (customer as Stripe.Customer).metadata?.accountId;
            }
          } catch {
            // Ignore customer retrieval failures
          }
        }

        if (!accountId) {
          break;
        }

        await recordPayment({
          account_id: accountId,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: "failed",
          stripe_invoice_id: invoice.id,
          description: invoice.description || "Failed subscription payment",
          failed_at: new Date().toISOString(),
        });

        if ((invoice as Stripe.Invoice & { subscription?: string }).subscription) {
          await updateSubscription({
            account_id: accountId,
            stripe_subscription_id: (invoice as Stripe.Invoice & { subscription: string }).subscription,
            status: "past_due",
          });
        }

        break;
      }

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
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
