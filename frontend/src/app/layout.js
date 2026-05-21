import './globals.css';

export const metadata = {
  title: 'Smart Lost & Found',
  description: 'Report and track lost and found items with real-time updates.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
