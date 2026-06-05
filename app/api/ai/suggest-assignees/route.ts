import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = req.headers.get("Authorization") ?? "";

  try {
    const upstream = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}api/ai/suggest-assignees/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth,
        },
        body: await req.text(),
      }
    );

    const data: unknown = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json(
      { detail: "Upstream AI service request failed." },
      { status: 502 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ detail: "Method not allowed." }, { status: 405 });
}
