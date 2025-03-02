import { NextResponse } from "next/server";

const serverurl = "https://easysplit-backend-4.onrender.com";

export const POST = async (request: Request) => {
  const body = await request.json();
  const billSessionId = body.billSessionId;
  const payerId = body.payerId;
  const authToken = body.authToken;

  try {
    const queryParams = new URLSearchParams({
      billSessionId,
      payerId,
    }).toString();

    const res = await fetch(`${serverurl}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ billSessionId, payerId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Payment failed:", errorText);
      return NextResponse.json(
        { error: "Failed to pay bill", details: errorText },
        { status: res.status }
      );
    }

    const responseData = await res.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal server error during payment" },
      { status: 500 }
    );
  }
};
