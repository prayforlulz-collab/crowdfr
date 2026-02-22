import { prisma } from "@/lib/prisma"

interface AuditLogParams {
    action: string
    entityType: "USER" | "ORGANIZATION" | "ARTIST" | "RELEASE"
    entityId: string
    entityLabel?: string
    performedBy: string
    adminEmail?: string
    reason?: string
    metadata?: Record<string, any>
}

export async function logAdminAction(params: AuditLogParams) {
    try {
        await prisma.auditLog.create({
            data: {
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                entityLabel: params.entityLabel,
                performedBy: params.performedBy,
                adminEmail: params.adminEmail,
                reason: params.reason,
                metadata: params.metadata ? JSON.stringify(params.metadata) : null,
            },
        })
    } catch (error) {
        // Don't let audit logging failures break the main operation
        console.error("Failed to log admin action:", error)
    }
}

export function getActionLabel(action: string): string {
    const labels: Record<string, string> = {
        USER_SUSPENDED: "Suspended user",
        USER_ACTIVATED: "Activated user",
        USER_DELETED: "Soft-deleted user",
        USER_RESTORED: "Restored user",
        USER_PASSWORD_RESET: "Reset password",
        USER_MFA_RESET: "Reset MFA",
        USER_SESSIONS_REVOKED: "Force logged out",
        ORG_PRO_UPGRADED: "Upgraded to PRO",
        ORG_PRO_DOWNGRADED: "Downgraded from PRO",
        ORG_DISABLED: "Disabled organization",
        ORG_ENABLED: "Enabled organization",
        ORG_OWNERSHIP_TRANSFERRED: "Transferred ownership",
        ARTIST_HIDDEN: "Hidden artist",
        ARTIST_VISIBLE: "Made artist visible",
        ARTIST_DELETED: "Soft-deleted artist",
        RELEASE_HIDDEN: "Hidden release",
        RELEASE_VISIBLE: "Made release visible",
        RELEASE_DELETED: "Soft-deleted release",
        CONTENT_BULK_HIDDEN: "Bulk hidden content",
        CONTENT_BULK_VISIBLE: "Bulk made content visible",
        NOTE_ADDED: "Added admin note",
    }
    return labels[action] || action
}
