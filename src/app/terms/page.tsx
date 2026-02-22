import { LegalPageLayout } from "@/components/LegalPageLayout";
import Link from 'next/link';

export default function TermsPage() {
    return (
        <LegalPageLayout title="Terms of Service" lastUpdated="February 18, 2026">
            <div className="space-y-8 text-zinc-300">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using the Crowdfr platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the terms, you may not access the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                    <p>
                        Crowdfr provides a platform for artists and creators to build landing pages, collect fan contact information (email and phone numbers), and manage fan relationships. We provide tools for analytics, email marketing, and SMS campaigns.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                    <p>
                        To access certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                    </p>
                    <p className="mt-4">
                        You are responsible for safeguarding your password and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
                    <p>
                        You agree not to use the Service to:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>Violate any applicable national or international law or regulation.</li>
                        <li>Send unsolicited or unauthorized advertising, promotional materials, "junk mail," "spam," "chain letters," or any other form of solicitation.</li>
                        <li>Impersonate or attempt to impersonate Crowdfr, a Crowdfr employee, another user, or any other person or entity.</li>
                        <li>Upload or transmit any material that contains software viruses or any other computer code, files, or programs designed to interrupt, destroy, or limit the functionality of any computer software or hardware.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Data Collection and Compliance</h2>
                    <p>
                        You acknowledge that you are responsible for complying with all applicable laws and regulations regarding the collection and use of personal data, including but not limited to the General Data Protection Regulation (GDPR) and the Telephone Consumer Protection Act (TCPA).
                    </p>
                    <p className="mt-4">
                        When using our Service to collect fan information, you agree to:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>Obtain necessary consents from your fans.</li>
                        <li>Provide clear notice of how you will use their data.</li>
                        <li>Honor opt-out requests promptly.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are and will remain the exclusive property of Crowdfr and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                    </p>
                    <p className="mt-4">
                        You retain all rights to the content you post on the Service ("User Content"). By posting User Content, you grant Crowdfr a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with providing the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Termination</h2>
                    <p>
                        We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                    <p>
                        In no event shall Crowdfr, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Changes to Terms</h2>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will start to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms, please contact us at <a href="mailto:legal@crowdfr.com" className="text-indigo-400 hover:text-indigo-300">legal@crowdfr.com</a>.
                    </p>
                </section>
            </div>

            <div className="mt-12 text-center">
                <Link href="/" className="text-sm font-semibold text-zinc-500 hover:text-white transition-colors">
                    Return to Home
                </Link>
            </div>
        </LegalPageLayout>
    );
}
