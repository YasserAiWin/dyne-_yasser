const { chromium } = require('playwright')

const BASE = process.env.BASE_URL || 'http://localhost:5174'
const OUT = '.screenshots'

async function login(page, roleLabel) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  // Click role tab: 'صاحب المتجر' (owner) or 'المدير العام' (admin)
  await page.getByRole('button', { name: roleLabel }).click()
  await page.fill('input[name="phone"]', '+222 36 12 45 67')
  await page.fill('input[name="password"]', 'test')
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click()
  await page.waitForTimeout(800)
}

async function shot(page, path, file) {
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800) // let mockDelay (400ms) resolve
  await page.screenshot({ path: `${OUT}/${file}`, fullPage: true })
  console.log('saved', file)
}

;(async () => {
  const browser = await chromium.launch()

  // ---- Desktop: all 8 pages ----
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()

  // Login page (no auth)
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${OUT}/01-login.png`, fullPage: true })
  console.log('saved 01-login.png')

  // Admin pages
  await login(page, 'المدير العام')
  await shot(page, '/admin/dashboard', '02-admin-dashboard.png')
  await shot(page, '/admin/shops', '03-admin-shops.png')
  await shot(page, '/admin/shops/create', '04-admin-shops-create.png')
  await shot(page, '/admin/subscriptions', '05-admin-subscriptions.png')

  // Shop pages
  await login(page, 'صاحب المتجر')
  await shot(page, '/shop/dashboard', '06-shop-dashboard.png')
  await shot(page, '/shop/customers', '07-shop-customers.png')
  await shot(page, '/shop/customers/1', '08-shop-customer-profile.png')
  await ctx.close()

  // ---- Tablet (768) ----
  const tctx = await browser.newContext({ viewport: { width: 768, height: 1024 } })
  const tpage = await tctx.newPage()
  await login(tpage, 'المدير العام')
  await shot(tpage, '/admin/dashboard', 'responsive-tablet-admin-dashboard.png')
  await tctx.close()

  // ---- Mobile (390) ----
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mpage = await mctx.newPage()
  await mpage.goto(`${BASE}/login`, { waitUntil: 'networkidle' })
  await mpage.waitForTimeout(400)
  await mpage.screenshot({ path: `${OUT}/responsive-mobile-login.png`, fullPage: true })
  console.log('saved responsive-mobile-login.png')
  await login(mpage, 'صاحب المتجر')
  await shot(mpage, '/shop/customers', 'responsive-mobile-shop-customers.png')
  await mctx.close()

  await browser.close()
  console.log('DONE')
})().catch((e) => { console.error(e); process.exit(1) })
