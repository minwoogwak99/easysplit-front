import { NextResponse } from "next/server";

// const serverurl = "https://easysplit-backend-4.onrender.com/analyzebill";
const mlurl = "https://bill-analyzer.onrender.com";

export async function GET() {
  const res = await fetch(mlurl);

  console.log(res);

  return NextResponse.json(await res.json());
}
