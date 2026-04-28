export const metadata = {
  title: 'CyberPlatform Academy',
  description: 'Academy LMS - Build your knowledge before entering the live range',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}

