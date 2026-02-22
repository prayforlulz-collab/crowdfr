import { LegalPageLayout } from "@/components/LegalPageLayout";
import Link from 'next/link';

export default function FAQPage() {
    return (
        <LegalPageLayout title="Frequently Asked Questions" lastUpdated="February 18, 2026">
            <div className="space-y-8 text-zinc-300">

                <div className="space-y-6">
                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">What is Crowdfr?</h3>
                        <p>
                            Crowdfr is an all-in-one platform for independent artists and creators to launch new music, build their fan contact list (emails & phone numbers), and grow their audience with integrated marketing tools.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">Is Crowdfr free to use?</h3>
                        <p>
                            We offer a free tier that allows you to create a landing page and collect fan contacts. For advanced features like unlimited contacts, custom domains, and automated email/SMS campaigns, we offer premium subscription plans. Check our <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300">Pricing page</Link> for more details.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">How do I export my fan data?</h3>
                        <p>
                            You own your data. You can export your entire fan list (emails, phone numbers, location data) as a CSV file at any time from your dashboard settings. We believe in artist independence, so we never lock you in.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">Is my data safe?</h3>
                        <p>
                            Yes, we take security seriously. We use industry-standard encryption to protect your data and your fans' information. We do not sell your data to third parties.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">Does Crowdfr comply with GDPR and CCPA?</h3>
                        <p>
                            Yes, we are committed to compliance with global data protection regulations, including GDPR (Europe) and CCPA (California). We provide tools to help you manage consent and data rights for your fans.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">Can I use my own domain?</h3>
                        <p>
                            Yes! Premium users can connect their own custom domain (e.g., yourname.com) to their Crowdfr landing pages for a fully branded experience.
                        </p>
                    </div>

                    <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/5">
                        <h3 className="text-xl font-bold text-white mb-2">How does the "Pre-Save" feature work?</h3>
                        <p>
                            Crowdfr integrates with major streaming platforms like Spotify and Apple Music. When fans "pre-save" your upcoming release, it's automatically added to their library the moment it drops, boosting your day-one streams.
                        </p>
                    </div>
                </div>

                <section className="mt-12 pt-8 border-t border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-4">Still have questions?</h2>
                    <p>
                        We're here to help! Reach out to our support team at <a href="mailto:support@crowdfr.com" className="text-indigo-400 hover:text-indigo-300">support@crowdfr.com</a> and we'll get back to you as soon as possible.
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
