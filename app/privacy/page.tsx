import { Shield, Lock, Eye, FileText, Mail, Phone } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Privacy Policy | Green Valley Seeds",
    description: "Privacy Policy for Green Valley Seeds - Learn how we protect and handle your personal information.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                            <Shield className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary">Privacy & Security</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
                        </p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-500">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-4xl px-4 py-16">
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                    {/* Information We Collect */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Information We Collect</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                We collect information that you provide directly to us when you:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Create an account or place an order</li>
                                <li>Subscribe to our newsletter or marketing communications</li>
                                <li>Contact us through our contact form or customer service</li>
                                <li>Participate in surveys or promotions</li>
                            </ul>
                            <p className="mt-4">
                                The types of information we may collect include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Personal Information:</strong> Name, email address, phone number, shipping address</li>
                                <li><strong>Payment Information:</strong> Payment method details (processed securely through payment processors)</li>
                                <li><strong>Order Information:</strong> Products purchased, order history, delivery preferences</li>
                                <li><strong>Account Information:</strong> Username, password (encrypted), account preferences</li>
                            </ul>
                        </div>
                    </section>

                    {/* How We Use Your Information */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">How We Use Your Information</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Process and fulfill your orders</li>
                                <li>Send you order confirmations and shipping updates</li>
                                <li>Respond to your inquiries and provide customer support</li>
                                <li>Send you marketing communications (with your consent)</li>
                                <li>Improve our website, products, and services</li>
                                <li>Detect and prevent fraud or abuse</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Information Sharing</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                We do not sell your personal information. We may share your information only in the following circumstances:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Service Providers:</strong> With third-party service providers who help us operate our business (e.g., payment processors, shipping companies)</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                            </ul>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Data Security</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                            </p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Encryption of sensitive data in transit and at rest</li>
                                <li>Secure payment processing</li>
                                <li>Regular security assessments and updates</li>
                                <li>Access controls and authentication measures</li>
                            </ul>
                            <p className="mt-4">
                                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                            </p>
                        </div>
                    </section>

                    {/* Your Rights */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                                <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your Rights</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access and receive a copy of your personal information</li>
                                <li>Correct inaccurate or incomplete information</li>
                                <li>Request deletion of your personal information</li>
                                <li>Object to or restrict processing of your information</li>
                                <li>Withdraw consent for marketing communications at any time</li>
                                <li>Request data portability</li>
                            </ul>
                            <p className="mt-4">
                                To exercise these rights, please contact us using the information provided below.
                            </p>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                                <Eye className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Cookies and Tracking</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and personalize content. You can control cookies through your browser settings, but disabling cookies may affect website functionality.
                            </p>
                        </div>
                    </section>

                    {/* Children's Privacy */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                                <Shield className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Children's Privacy</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                            </p>
                        </div>
                    </section>

                    {/* Changes to This Policy */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
                                <FileText className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Changes to This Policy</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                            </p>
                        </div>
                    </section>

                    {/* Contact Us */}
                    <section className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Contact Us</h2>
                        </div>
                        <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
                            <p>
                                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
                            </p>
                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <a href="mailto:fr56123213@gmail.com" className="text-primary hover:underline">
                                        fr56123213@gmail.com
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-primary" />
                                    <a href="tel:03707963625" className="text-primary hover:underline">
                                        0370-7963625
                                    </a>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="font-medium">Green Valley Seeds</p>
                                        <p>Mianwali, Punjab, Pakistan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Back to Home */}
                <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                    <Link
                        href="/"
                        className="inline-flex items-center text-primary hover:underline font-medium"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

