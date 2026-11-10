import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Design system fonts: Inter for text and headlines, IBM Plex Mono for system IDs and metadata.
const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
	variable: "--font-plex-mono",
	subsets: ["latin"],
	weight: ["400", "500"],
});

// Follow the system light/dark preference with the DS theme attribute (no flash: runs before paint).
const themeScript = `try{var m=matchMedia('(prefers-color-scheme: dark)');var s=function(){document.documentElement.dataset.theme=m.matches?'dark':'light'};s();m.addEventListener('change',s)}catch(e){}`;

export const metadata: Metadata = {
	title: "ADM · Diretório de Skills, Plugins e MCP Servers",
	description: "Diretório unificado de Skills, Agents, Plugins e MCP Servers a partir do Anthropic Directory.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="pt-BR" className={`${inter.variable} ${plexMono.variable}`} suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="antialiased">
				{children}
			</body>
		</html>
	);
}
