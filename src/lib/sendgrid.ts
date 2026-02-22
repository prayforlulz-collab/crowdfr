
export async function sendEmail(data: {
    to: string;
    toName?: string;
    from: string;
    fromName?: string;
    subject: string;
    html: string;
    text?: string;
    sendAt?: number; // Unix timestamp
    campaignId?: string;
}) {
    const apiKey = process.env.SENDGRID_API_KEY;

    if (!apiKey) {
        console.error("SENDGRID_API_KEY is not set in environment variables.");
        throw new Error("Email configuration missing.");
    }

    const personalization: any = {
        to: [
            {
                email: data.to,
                name: data.toName || data.to,
            },
        ],
        subject: data.subject,
    };

    if (data.sendAt) {
        personalization.send_at = data.sendAt;
    }

    if (data.campaignId) {
        personalization.custom_args = {
            campaignId: data.campaignId,
        };
    }

    const payload: any = {
        personalizations: [personalization],
        from: {
            email: data.from,
            name: data.fromName || "Crowdfr",
        },
        content: [
            {
                type: "text/html",
                value: data.html,
            },
        ],
    };

    if (data.campaignId) {
        payload.categories = [data.campaignId];
    }

    if (data.text) {
        payload.content.unshift({
            type: "text/plain",
            value: data.text,
        });
    }

    try {
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("SendGrid API Error:", JSON.stringify(errorData, null, 2));
            throw new Error(errorData.errors?.[0]?.message || "Failed to send email.");
        }

        return { success: true };
    } catch (error: any) {
        console.error("SendGrid Integration Error:", error.message);
        throw error;
    }
}

/**
 * Fetches global stats from SendGrid for a given date range.
 */
export async function getGlobalStats(startDate: string, endDate?: string) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error("Email configuration missing.");

    const url = new URL("https://api.sendgrid.com/v3/stats");
    url.searchParams.append("start_date", startDate);
    if (endDate) url.searchParams.append("end_date", endDate);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.message || "Failed to fetch stats.");
        }

        return await response.json();
    } catch (error: any) {
        console.error("SendGrid Stats Error:", error.message);
        throw error;
    }
}

/**
 * Fetches stats for a specific category (e.g., campaignId) from SendGrid.
 */
export async function getCategoryStats(category: string, startDate: string, endDate?: string) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error("Email configuration missing.");

    const url = new URL("https://api.sendgrid.com/v3/categories/stats");
    url.searchParams.append("categories", category);
    url.searchParams.append("start_date", startDate);
    if (endDate) url.searchParams.append("end_date", endDate);

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors?.[0]?.message || "Failed to fetch category stats.");
        }

        return await response.json();
    } catch (error: any) {
        console.error("SendGrid Category Stats Error:", error.message);
        throw error;
    }
}
