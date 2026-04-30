import "./globals.css";

export const metadata = {
  title: "Home Rental Admin",
  description: "Administrative console for the Home Rental platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

