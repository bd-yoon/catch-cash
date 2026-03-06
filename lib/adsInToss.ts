declare global {
  interface Window {
    AdsInToss?: {
      showRewardedAd: (unitId: string) => Promise<{ rewarded: boolean }>;
    };
  }
}

const TEST_ID = 'ait-ad-test-rewarded-id';

export async function showRewardedAd(unitId: string = TEST_ID): Promise<boolean> {
  try {
    const result = await window.AdsInToss?.showRewardedAd(unitId);
    return result?.rewarded ?? false;
  } catch (e) {
    console.warn('Ad not available:', e);
    return false;
  }
}
