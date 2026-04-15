import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

// Stripe price IDs for each plan — base price + overage meters
const PLAN_PRICES: Record<
  string,
  {
    name: string;
    basePrice: number;
    basePriceId: string;
    overagePriceIds: string[];
  }
> = {
  starter: {
    name: "Starter",
    basePrice: 21,
    basePriceId: "price_1TMFQwEnZGKTei6CeoxV2frF",
    overagePriceIds: [
      "price_1TMFQyEnZGKTei6CO6FqOf2s", // Paid Users overage
      "price_1TMFQzEnZGKTei6CKgpZfC0B", // Session Replays overage
      "price_1TMFR1EnZGKTei6C34YBJEkm", // Emails overage
      "price_1TMFR3EnZGKTei6Cr0Q3WpnU", // AI Generations overage
      "price_1TMFR4EnZGKTei6CZ1juzUMV", // Team Members overage
    ],
  },
  growth: {
    name: "Growth",
    basePrice: 199,
    basePriceId: "price_1TMFR6EnZGKTei6CBzMBAqtB",
    overagePriceIds: [
      "price_1TMFR8EnZGKTei6C0000GPUO", // Paid Users overage
      "price_1TMFR9EnZGKTei6C0000GPSR", // Session Replays overage
      "price_1TMFRAEnZGKTei6C0000GPEM", // Emails overage
      "price_1TMFRBEnZGKTei6C0000GPAI", // AI Generations overage
      "price_1TMFRCEnZGKTei6C0000GPTM", // Team Members overage
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { tierId } = body;

    if (!tierId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const plan = PLAN_PRICES[tierId];
    if (!plan) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Build line items: base price + all overage meter prices
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: plan.basePriceId, quantity: 1 },
      ...plan.overagePriceIds.map((priceId) => ({ price: priceId })),
    ];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: session.user.email!,
      line_items: lineItems,
      metadata: {
        accountId: (session.user as any).id || session.user.email!,
        tier: tierId,
        price: plan.basePrice.toString(),
      },
      subscription_data: {
        metadata: {
          accountId: (session.user as any).id || session.user.email!,
          tier: tierId,
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing?canceled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
