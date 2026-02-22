
import AuditLogList from "@/components/admin/AuditLogList"

export default function AuditLogPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Audit Log</h1>
                <p className="text-zinc-400">Global read-only log of all admin actions across the platform.</p>
            </header>

            <AuditLogList />
        </div>
    )
}
