import DashboardSidebar from "@/components/DashboardSidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0c] text-white">
            <DashboardSidebar />
            <main className="flex-1 w-full overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
