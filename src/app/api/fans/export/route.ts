import { NextRequest, NextResponse } from "next/server";
import { getFansByOrganization } from "@/lib/fans";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const organizationId = searchParams.get("organizationId");

        if (!organizationId) {
            return NextResponse.json(
                { error: "Organization ID is required" },
                { status: 400 }
            );
        }

        const fans = await getFansByOrganization(organizationId);

        // Convert to CSV
        const headers = ["Email", "Name", "Country", "Created At", "Status"];
        const rows = fans.map((fan: any) => [
            fan.email,
            fan.name || "",
            fan.country || "",
            fan.createdAt.toISOString(),
            fan.subscriptions.map((s: any) => s.status).join("; ")
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(","))
        ].join("\n");

        return new NextResponse(csvContent, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="fans-export-${organizationId}.csv"`,
            },
        });
    } catch (error) {
        console.error("Error exporting fans:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
