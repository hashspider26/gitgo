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
	transpilePackages: [
		"@libsql/client",
		"@libsql/core",
		"@libsql/hrana-client",
		"@libsql/isomorphic-ws",
		"@libsql/isomorphic-fetch",
	],
	experimental: {
		optimizeCss: false, // Disable CSS optimization to reduce memory
		outputFileTracingIncludes: {
			"/*": ["./node_modules/@libsql/**/*"],
			"/**": ["./node_modules/@libsql/**/*"],
		},
	},
	// Reduce build output
	output: 'standalone', // Creates a minimal production build
	// Disable source maps in production to save memory
	productionBrowserSourceMaps: false,
};

export default nextConfig;


