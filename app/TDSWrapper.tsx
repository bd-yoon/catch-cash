'use client';

import { TDSMobileProvider, useUserAgent } from '@toss/tds-mobile';

export default function TDSWrapper({ children }: { children: React.ReactNode }) {
  const userAgent = useUserAgent();

  return (
    <TDSMobileProvider userAgent={userAgent} resetGlobalCss={false}>
      {children}
    </TDSMobileProvider>
  );
}
