"use client"

import EmailCapture from "../EmailCapture"

interface EmailCaptureSectionProps {
    data: {
        ctaText?: string
        successMessage?: string
        organizationId?: string
        releaseId?: string
        showName?: boolean
        nameRequired?: boolean
        showPhone?: boolean
        phoneRequired?: boolean
        progressive?: boolean
        emailButtonText?: string
        phoneButtonText?: string
    }
    context?: {
        organizationId: string
        releaseId: string
    }
}

export default function EmailCaptureSection({ data, context }: EmailCaptureSectionProps) {
    const organizationId = context?.organizationId || data.organizationId || ''
    const releaseId = context?.releaseId || data.releaseId || ''

    if (!organizationId) {
        return (
            <div className="py-20 px-4 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 text-sm font-bold uppercase">Configure Email Capture with Organization ID</p>
            </div>
        )
    }

    return (
        <div className="py-12 px-4">
            <EmailCapture
                organizationId={organizationId}
                releaseId={releaseId}
                ctaText={data.ctaText}
                successMessage={data.successMessage}
                fields={{
                    showName: data.showName !== false,
                    nameRequired: data.nameRequired,
                    showPhone: data.showPhone,
                    phoneRequired: data.phoneRequired,
                    emailButtonText: data.emailButtonText,
                    phoneButtonText: data.phoneButtonText
                }}
                progressive={data.progressive}
            />
        </div>
    )
}
