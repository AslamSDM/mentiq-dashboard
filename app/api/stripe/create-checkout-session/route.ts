import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

const PRICING_CONFIG: Record<
  string,
  {
    name: string;
    basePrice: number;
  }
> = {
  launch: { name: "Launch", basePrice: 49 },
  traction: { name: "Traction", basePrice: 149 },
  momentum: { name: "Momentum", basePrice: 299 },
  scale: { name: "Scale", basePrice: 699 },
  expansion: { name: "Expansion", basePrice: 1499 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, tierId, userCount } = body;

    if (!projectId || !tierId || !userCount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const tierConfig = PRICING_CONFIG[tierId];
    if (!tierConfig) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    // Calculate price based on user count (same logic as frontend)
    const getTierRange = (tier: string) => {
      const ranges: Record<string, [number, number]> = {
        launch: [1, 100],
        traction: [101, 500],
        momentum: [501, 1000],
        scale: [1001, 5000],
        expansion: [5001, 10000],
      };
      return ranges[tier];
    };

    const range = getTierRange(tierId);
    const multiplier =
      1 + ((userCount - range[0]) / (range[1] - range[0])) * 0.3;
    const finalPrice = Math.round(tierConfig.basePrice * multiplier);

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: session.user.email!,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Mentiq ${tierConfig.name} Plan`,
              description: `For ${userCount.toLocaleString()} paid users`,
              images: ["https://mentiq.com/logo.png"],
            },
            unit_amount: finalPrice * 100, // Stripe uses cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        accountId: (session.user as any).id || session.user.email!,
        tier: tierId,
        userCount: userCount.toString(),
        price: finalPrice.toString(),
      },
      subscription_data: {
        metadata: {
          accountId: (session.user as any).id || session.user.email!,
          tier: tierId,
          userCount: userCount.toString(),
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/pricing?canceled=true`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
