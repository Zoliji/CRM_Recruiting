import './globals.css';

export const metadata = {
  title: 'RecruitPro — CRM Recruiting',
  description: 'Software gestionale CRM per team di recruiting. Gestisci candidati, posizioni, pipeline e colloqui.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
