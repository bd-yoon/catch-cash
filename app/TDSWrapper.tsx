'use client';

// TDS는 앱인토스 환경에서만 동작 → Vercel 테스트 시 패스스루
export default function TDSWrapper({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
