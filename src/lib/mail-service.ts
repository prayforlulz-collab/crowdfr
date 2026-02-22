import { sendEmail } from "./sendgrid";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@crowdfr.com"; // Use configured sender or default

export async function sendVerificationEmail(email: string, token: string, name?: string) {
    const confirmLink = `${baseUrl}/api/auth/verify?token=${token}`;

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #000;">Welcome to Crowdfr!</h1>
        <p>Hi ${name || "there"},</p>
        <p>Thanks for creating an account. Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${confirmLink}">${confirmLink}</a></p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
    </div>
    `;

    // In development, log the link if no API key
    if (!process.env.SENDGRID_API_KEY) {
        console.log("------------------------------------------");
        console.log(`[Dev Email] To: ${email}`);
        console.log(`[Dev Email] Subject: Verify your Crowdfr account`);
        console.log(`[Dev Email] Link: ${confirmLink}`);
        console.log("------------------------------------------");
        return { success: true };
    }

    return await sendEmail({
        to: email,
        from: FROM_EMAIL,
        subject: "Verify your Crowdfr account",
        html,
    });
}

export async function sendFanSubscriptionConfirmation(email: string, link: string, artistName: string, releaseTitle: string) {
    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #000;">Confirm your subscription</h1>
        <p>You're almost there!</p>
        <p>You signed up to get updates from <strong>${artistName}</strong> related to their release <strong>"${releaseTitle}"</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${link}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirm Subscription</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${link}">${link}</a></p>
    </div>
    `;

    if (!process.env.SENDGRID_API_KEY) {
        console.log("------------------------------------------");
        console.log(`[Dev Email] To: ${email}`);
        console.log(`[Dev Email] Subject: Confirm subscription to ${artistName}`);
        console.log(`[Dev Email] Link: ${link}`);
        console.log("------------------------------------------");
        return { success: true };
    }

    return await sendEmail({
        to: email,
        from: FROM_EMAIL,
        subject: `Confirm subscription to ${artistName}`,
        html,
    });
}
