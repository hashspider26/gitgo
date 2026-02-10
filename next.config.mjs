/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		domains: ["www.shutterstock.com", "images.unsplash.com", "res.cloudinary.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "www.shutterstock.com",
				pathname: "/image-photo/**",
			},
			{
				protocol: "https",
				hostname: "images.unsplash.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				pathname: "/**",
			},
		],
	},
	// Optimize for cPanel builds
	swcMinify: true,
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production',
	},
	// Reduce build memory usage
	experimental: {
		optimizeCss: false, // Disable CSS optimization to reduce memory
	},
	// Reduce build output
	output: 'standalone', // Creates a minimal production build
	// Disable source maps in production to save memory
	productionBrowserSourceMaps: false,
};

export default nextConfig;


