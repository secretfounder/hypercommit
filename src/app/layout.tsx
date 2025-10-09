import type { Metadata } from "next";
import { Honk, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme";

const ibmPlexSans = IBM_Plex_Sans({
	variable: "--font-ibm-plex-sans",
	subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
	variable: "--font-ibm-plex-mono",
	subsets: ["latin"],
	weight: "400",
});

const honk = Honk({
	variable: "--font-honk",
});

export const metadata: Metadata = {
	title: "Hypercommit",
	description: "A code platform for the 21st century.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			className="bg-secondary dark:bg-black"
			lang="en"
			suppressHydrationWarning
		>
			<body
				className={`min-h-screen bg-secondary dark:bg-black ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${honk.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
