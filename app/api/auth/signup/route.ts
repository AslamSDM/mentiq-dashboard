import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companyName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const response = await apiClient.signup(name, email, password);

    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
