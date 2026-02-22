
export interface EmailTemplate {
    id: string;
    name: string;
    description: string;
    category: "Announcements" | "Engagement" | "Sales & Promotion" | "Events" | "Seasonal";
    subject: string;
    html: (data: any) => string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: "new-release",
        name: "New Release",
        description: "Announce your latest single or album with cover art.",
        category: "Announcements",
        subject: "Out Now: [Release Title] by [Artist Name]",
        html: (data) => `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 40px; text-align: center;">
                <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: #888;">New Release</p>
                <img src="${data.coverUrl}" style="width: 100%; max-width: 400px; border-radius: 8px; margin: 30px 0;" />
                <h1 style="font-size: 32px; margin: 0;">${data.releaseTitle}</h1>
                <p style="color: #888; font-size: 18px; margin: 20px 0;">Stream the new single from ${data.artistName} on all platforms.</p>
                <a href="${data.listenUrl}" style="display: inline-block; background: #fff; color: #000; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; margin-top: 20px;">LISTEN NOW</a>
            </div>
        `
    },
    {
        id: "newsletter-update",
        name: "Artist Update",
        description: "Keep your fans engaged with a personal message.",
        category: "Engagement",
        subject: "An update from [Artist Name]",
        html: (data) => `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 40px;">
                <h1 style="font-size: 24px;">Hey [Fan Name],</h1>
                <p style="line-height: 1.6; font-size: 16px;">${data.message || "It's been a while since my last update! I've been working on so much new music and I can't wait to share it with you."}</p>
                <p style="line-height: 1.6; font-size: 16px;">Thanks for being part of the journey.</p>
                <p style="font-weight: bold;">- ${data.artistName}</p>
            </div>
        `
    },
    {
        id: "merch-drop",
        name: "Merch Drop",
        description: "Promote your latest merchandise collection.",
        category: "Sales & Promotion",
        subject: "New Merch Available Now!",
        html: (data) => `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 40px;">
                <h1 style="font-size: 28px; font-weight: 900;">NEW MERCH DROP</h1>
                <p style="color: #666;">Limited edition items available for a short time only.</p>
                <div style="display: flex; gap: 20px; justify-content: center; margin: 30px 0;">
                    ${data.items?.map((item: any) => `
                        <div style="flex: 1; border: 1px solid #eee; padding: 10px; border-radius: 8px;">
                            <img src="${item.imageUrl}" style="width: 100%; border-radius: 4px;" />
                            <p style="font-weight: bold; margin: 10px 0 5px 0;">${item.name}</p>
                            <p style="color: #888; font-size: 14px;">${item.price}</p>
                        </div>
                    `).join('') || '<p>Check out the store for more!</p>'}
                </div>
                <a href="${data.shopUrl}" style="display: inline-block; background: #000; color: #fff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: bold;">SHOP COLLECTION</a>
            </div>
        `
    },
    {
        id: "upcoming-show",
        name: "Tour Announcement",
        description: "Announce new tour dates and ticket availability.",
        category: "Events",
        subject: "[Tour Name] - On Sale Now!",
        html: (data) => `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f9f9f9;">
                <h1 style="font-size: 36px; text-align: center; margin: 0;">${data.tourName}</h1>
                <div style="margin: 40px 0;">
                    ${data.dates?.map((d: any) => `
                        <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #ddd;">
                            <span style="font-weight: bold;">${d.date}</span>
                            <span>${d.venue}, ${d.city}</span>
                        </div>
                    `).join('') || '<p style="text-align: center;">Dates coming soon!</p>'}
                </div>
                <a href="${data.ticketUrl}" style="display: block; background: #000; color: #fff; text-align: center; padding: 20px; text-decoration: none; font-weight: bold; font-size: 18px;">GET TICKETS</a>
            </div>
        `
    },
    {
        id: "holiday-special",
        name: "Holiday Message",
        description: "Send a special greeting during seasonal holidays.",
        category: "Seasonal",
        subject: "Happy Holidays from [Artist Name]",
        html: (data) => `
            <div style="font-family: cursive, serif; max-width: 600px; margin: 0 auto; text-align: center; padding: 60px; background: #fff; border: 10px double #eee;">
                <h1 style="color: #d44;">Happy Holidays!</h1>
                <p style="font-size: 18px; line-height: 1.8;">Wishing you all a wonderful holiday season filled with music and joy.</p>
                <div style="margin: 40px 0;">❄️ 🎹 ❄️</div>
                <p>Can't wait to see you in the new year!</p>
                <p style="font-weight: bold;">- ${data.artistName}</p>
            </div>
        `
    }
];
