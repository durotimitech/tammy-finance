module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    devtools: process.env.DEVTOOLS === 'true',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  },
  server: {
    command: 'npm run dev',
    port: 3000,
    launchTimeout: 30000,
    debug: process.env.DEBUG === 'true',
  },
  browserContext: 'default'
};