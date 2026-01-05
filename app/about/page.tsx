import { Sprout, Target, Award, Users, Leaf, Heart, TrendingUp, Shield } from "lucide-react";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                                <Sprout className="h-4 w-4 text-primary" />
                                <span className="text-sm font-semibold text-primary">Since 2020</span>
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                Growing Dreams, One Seed at a Time
                            </h1>
                            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                At Green Valley Seeds, we're passionate about helping gardeners across Pakistan cultivate beautiful, thriving gardens with premium quality seeds and expert guidance.
                            </p>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-lg">
                                <Image
                                    src="/uploads/vimg.jpg"
                                    alt="Green Valley Seeds - Growing Dreams"
                                    width={600}
                                    height={600}
                                    className="w-full h-full object-cover"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                <Target className="h-7 w-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Mission</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                To empower every Pakistani gardener with access to premium quality seeds, tools, and knowledge, making gardening accessible, enjoyable, and successful for everyone from beginners to experts.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                <Award className="h-7 w-7 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Vision</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                To become Pakistan's most trusted gardening partner, fostering a community of passionate gardeners who grow sustainable, organic, and beautiful gardens that enrich lives and communities.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="bg-white dark:bg-black border-y border-zinc-200 dark:border-zinc-800 py-20 px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Our Story
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            From a small seed collection to Pakistan's trusted gardening partner
                        </p>
                    </div>

                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                            Green Valley Seeds was born from a simple passion: the love of gardening and the desire to share it with others. What started as a small collection of heirloom seeds in 2020 has grown into a comprehensive gardening resource serving thousands of customers across Pakistan.
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                            We noticed that many aspiring gardeners struggled to find quality seeds and reliable information. That's when we decided to bridge this gap by curating the finest seeds from around the world and providing expert guidance to help every garden flourish.
                        </p>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Today, we're proud to serve a growing community of gardeners who trust us for premium seeds, gardening tools, and expert advice. Every seed we sell represents our commitment to quality, sustainability, and your gardening success.
                        </p>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Our Core Values
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            The principles that guide everything we do
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Shield,
                                title: "Quality First",
                                description: "We source only the highest quality seeds, rigorously tested for germination and purity."
                            },
                            {
                                icon: Heart,
                                title: "Customer Care",
                                description: "Your success is our success. We're here to support you every step of the way."
                            },
                            {
                                icon: Leaf,
                                title: "Sustainability",
                                description: "We promote organic, eco-friendly gardening practices for a healthier planet."
                            },
                            {
                                icon: Users,
                                title: "Community",
                                description: "Building a vibrant community of gardeners who share knowledge and passion."
                            }
                        ].map((value, index) => (
                            <div key={index} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:border-primary/50 transition-all group">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-primary/5 border-y border-zinc-200 dark:border-zinc-800 py-16 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: "5000+", label: "Happy Customers" },
                            { number: "500+", label: "Products" },
                            { number: "50+", label: "Cities Served" },
                            { number: "98%", label: "Satisfaction Rate" }
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
                            Why Choose Green Valley Seeds?
                        </h2>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400">
                            What sets us apart from the rest
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: TrendingUp,
                                title: "High Germination Rate",
                                description: "Our seeds are tested to ensure 85%+ germination rates, giving you the best chance of success."
                            },
                            {
                                icon: Shield,
                                title: "Quality Guarantee",
                                description: "100% satisfaction guaranteed. If you're not happy, we'll make it right."
                            },
                            {
                                icon: Users,
                                title: "Expert Support",
                                description: "Our team of gardening experts is always ready to help with advice and guidance."
                            },
                            {
                                icon: Leaf,
                                title: "Organic Options",
                                description: "Wide selection of organic and heirloom seeds for sustainable gardening."
                            },
                            {
                                icon: Award,
                                title: "Trusted Brand",
                                description: "Thousands of satisfied customers trust us for their gardening needs."
                            },
                            {
                                icon: Heart,
                                title: "Passion Driven",
                                description: "We're gardeners too! We only sell products we'd use in our own gardens."
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow">
                                <feature.icon className="h-8 w-8 text-primary mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-br from-primary to-primary/80 py-20 px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to Start Your Gardening Journey?
                    </h2>
                    <p className="text-lg text-white/90 mb-8">
                        Join thousands of happy gardeners across Pakistan. Browse our collection and start growing today!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/shop"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-primary font-semibold hover:bg-white/90 transition-all shadow-lg hover:scale-105"
                        >
                            Browse Products
                        </a>
                        <a
                            href="/contact"
                            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-transparent border-2 border-white text-white font-semibold hover:bg-white/10 transition-all"
                        >
                            Contact Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
