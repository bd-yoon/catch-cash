import type { Metadata, Viewport } from 'next';
import './globals.css';
import TDSWrapper from './TDSWrapper';

export const metadata: Metadata = {
  title: '캐치 캐쉬',
  description: '매 시간 숨겨진 단어를 가장 먼저 맞춰 포인트를 획득하세요!',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <TDSWrapper>
          {children}
        </TDSWrapper>
      </body>
    </html>
  );
}
