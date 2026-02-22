import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const fanId = searchParams.get("fanId");
    const releaseId = searchParams.get("releaseId");
    const platform = searchParams.get("platform");

    if (!fanId || !releaseId || !platform) {
        return NextResponse.json({ error: "Missing required query params" }, { status: 400 });
    }

    try {
        const presave = await prisma.preSave.findUnique({
            where: {
                fanId_releaseId_platform: {
                    fanId,
                    releaseId,
                    platform
                }
            }
        });

        return NextResponse.json({
            presaved: !!presave,
            status: presave?.status || null
        });

    } catch (e) {
        console.error("Presave Status Error:", e);
        return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
    }
}
