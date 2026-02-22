
import { sendEmail } from "./src/lib/sendgrid";

async function testEmail() {
    console.log("Starting email test...");

    // Use the SENDGRID_FROM_EMAIL from .env if available, otherwise fallback
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || "noreply@crowdfr.com";

    try {
        await sendEmail({
            to: "mario@example.com", // Keeping this as a placeholder, user can check logs or specify
            from: fromEmail,
            subject: "Crowdfr Email Test",
            html: "<h1>It Works!</h1><p>Your SendGrid integration is live.</p>",
            text: "It Works! Your SendGrid integration is live."
        });
        console.log("✅ Email sent successfully!");
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}

// Manually load env for standalone script if not running via Next.js
// Since we are running with ts-node or similar, we might need dotenv
// But for now, let's assume the environment is loaded or we run with `node --env-file=.env` (Node 20+)
// or just rely on the user running it within the context. 
// Actually, let's explicitly load dotenv to be safe for a standalone script
require('dotenv').config();

testEmail();
