import { LegalPageLayout } from "@/components/LegalPageLayout";
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <LegalPageLayout title="Privacy Policy" lastUpdated="February 18, 2026">
            <div className="space-y-8 text-zinc-300">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                    <p>
                        Crowdfr ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website or use our services ("Services") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                    <p>
                        We collect several types of information from and about users of our Services, including:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li><strong>Personal Information:</strong> Information by which you may be personally identified, such as name, postal address, e-mail address, telephone number, and social media handles ("personal information").</li>
                        <li><strong>Usage Data:</strong> Information about your internet connection, the equipment you use to access our Services, and usage details.</li>
                        <li><strong>Marketing Data:</strong> Your preferences in receiving marketing from us and our third parties and your communication preferences.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                    <p>
                        We use information that we collect about you or that you provide to us, including any personal information:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>To present our Services and their contents to you.</li>
                        <li>To provide you with information, products, or services that you request from us.</li>
                        <li>To fulfill any other purpose for which you provide it, including connecting artists with their fans.</li>
                        <li>To perform analytics and improve our Services.</li>
                        <li>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</li>
                        <li>To notify you about changes to our Services or any products or services we offer or provide though it.</li>
                        <li>For marketing purposes, with your consent where required by law.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Sharing Your Information</h2>
                    <p>
                        We may disclose aggregated information about our users, and information that does not identify any individual, without restriction. We may disclose personal information that we collect or you provide as described in this privacy policy:
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li>To our subsidiaries and affiliates.</li>
                        <li>To contractors, service providers, and other third parties we use to support our business.</li>
                        <li>To a buyer or other successor in the event of a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Crowdfr's assets.</li>
                        <li>To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
                        <li>To analytics providers such as Google Analytics to help us understand how our Service is used.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. International Data Transfers</h2>
                    <p>
                        Your information, including Personal Data, is processed at Crowdfr's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                    </p>
                    <p className="mt-4">
                        If you are located outside United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to United States and process it there. Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Your Data Protection Rights (GDPR)</h2>
                    <p>
                        If you are a resident of the European Economic Area (EEA), you have certain data protection rights to ensure fair and transparent processing of your personal data. Crowdfr aims to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li><strong>The right to access, update or delete the information we have on you.</strong> whenever made possible, you can access, update or request deletion of your Personal Data directly within your account settings section. If you are unable to perform these actions yourself, please contact us to assist you.</li>
                        <li><strong>The right of rectification.</strong> You have the right to have your information rectified if that information is inaccurate or incomplete.</li>
                        <li><strong>The right to object.</strong> You have the right to object to our processing of your Personal Data.</li>
                        <li><strong>The right of restriction.</strong> You have the right to request that we restrict the processing of your personal information.</li>
                        <li><strong>The right to data portability.</strong> You have the right to be provided with a copy of the information we have on you in a structured, machine-readable and commonly used format.</li>
                        <li><strong>The right to withdraw consent.</strong> You also have the right to withdraw your consent at any time where Crowdfr relied on your consent to process your personal information.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. California Privacy Rights (CCPA)</h2>
                    <p>
                        Under the California Consumer Privacy Act (CCPA), California residents have specific rights regarding their personal information. This section describes your CCPA rights and explains how to exercise those rights.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                        <li><strong>Access to Specific Information and Data Portability Rights:</strong> You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months.</li>
                        <li><strong>Deletion Request Rights:</strong> You have the right to request that we delete any of your personal information that we collected from you and retained, subject to certain exceptions.</li>
                        <li><strong>Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
                    </ul>
                </section>


                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Security of Your Data</h2>
                    <p>
                        The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
                    <p>
                        Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us. If we become aware that we have collected Personal Data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from our servers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
                    <p>
                        If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@crowdfr.com" className="text-indigo-400 hover:text-indigo-300">privacy@crowdfr.com</a>.
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
