import { NextResponse } from "next/server";

// const serverurl = "https://easysplit-backend-4.onrender.com";
const mlurl = "https://bill-analyzer.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imgdata = body.imgdata;
    // const authToken = body.authToken;

    const response = await fetch(mlurl + "/analyzebill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${authToken}`,
      },

      body: JSON.stringify({ imgdata: imgdata }),
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error analyzing bill:", error);
    return NextResponse.json(
      { error: "Failed to analyze bill" },
      { status: 500 }
    );
  }
}
