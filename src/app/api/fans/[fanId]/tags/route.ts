import { NextRequest, NextResponse } from "next/server";
import { addTagToFan, removeTagFromFan, getFanById } from "@/lib/fans";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ fanId: string }> }
) {
    try {
        const { fanId } = await params;
        const body = await req.json();
        const { tagName, organizationId } = body;

        if (!tagName || !organizationId) {
            return NextResponse.json(
                { error: "Tag name and organization ID are required" },
                { status: 400 }
            );
        }

        // Verify fan exists and belongs to organization
        const fan = await getFanById(fanId);
        if (!fan) {
            return NextResponse.json(
                { error: "Fan not found" },
                { status: 404 }
            );
        }

        if (fan.organizationId !== organizationId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const updatedFan = await addTagToFan(fanId, tagName, organizationId);

        return NextResponse.json(updatedFan, { status: 200 });
    } catch (error) {
        console.error("Error adding tag to fan:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ fanId: string }> }
) {
    try {
        const { fanId } = await params;
        const body = await req.json();
        const { tagId } = body;

        if (!tagId) {
            return NextResponse.json(
                { error: "Tag ID is required" },
                { status: 400 }
            );
        }

        // Verify fan exists
        const fan = await getFanById(fanId);
        if (!fan) {
            return NextResponse.json(
                { error: "Fan not found" },
                { status: 404 }
            );
        }

        // Verify tag belongs to fan
        const hasTag = fan.tags.some(tag => tag.id === tagId);
        if (!hasTag) {
            return NextResponse.json(
                { error: "Tag not found on this fan" },
                { status: 404 }
            );
        }

        const updatedFan = await removeTagFromFan(fanId, tagId);

        return NextResponse.json(updatedFan, { status: 200 });
    } catch (error) {
        console.error("Error removing tag from fan:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

