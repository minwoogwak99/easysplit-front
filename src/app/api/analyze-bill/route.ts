import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward the request to the bill analyzer API using GET with a body
    // Note: This is not standard HTTP behavior but some APIs accept it
    const response = await fetch(
      "https://bill-analyzer.onrender.com/analyzebill",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Using node-fetch or undici (which Next.js uses internally) allows sending body with GET
        body: JSON.stringify({ imgdata: body.imgdata }),
      }
    );

    // Get the response data
    const data = await response.json();

    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error analyzing bill:", error);
    return NextResponse.json(
      { error: "Failed to analyze bill" },
      { status: 500 }
    );
  }
}
