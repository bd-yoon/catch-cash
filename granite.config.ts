export default {
  appName: 'catch-cash',
  brand: 'bd-yoon',
  webViewProps: { type: 'partner' },
  webServer: { command: 'npm run start', port: 3000 },
  build: { command: 'npm run build', outdir: '.next' },
  permissions: ['admob'],
};
