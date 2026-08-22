import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
	test('home page loads with title and nav', async ({ page }) => {
		const errors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') errors.push(msg.text());
		});

		await page.goto('/');

		await expect(page).toHaveTitle(/Daniel Green/);
		await expect(page.locator('h1')).toHaveText('Daniel Green');
		await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Blog' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
		expect(errors).toEqual([]);
	});

	test('nav links go to the right pages', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('link', { name: 'Blog' }).click();
		await expect(page).toHaveURL(/\/blog\/?$/);
		await expect(page.locator('h1')).toHaveText('All posts');

		await page.getByRole('link', { name: 'About' }).click();
		await expect(page).toHaveURL(/\/about\/?$/);
		await expect(page.locator('h1')).toHaveText('Daniel Green');
	});
});

test.describe('about / CV page', () => {
	test('shows expected CV sections', async ({ page }) => {
		await page.goto('/about');

		for (const heading of ['Profile', 'Core Skills', 'Education', 'Experience']) {
			await expect(page.getByRole('heading', { name: heading })).toBeVisible();
		}
	});
});

test.describe('email obfuscation', () => {
	test('header, footer, and about links resolve to a working mailto after load', async ({
		page,
	}) => {
		await page.goto('/about');

		const headerLink = page.locator('header a[data-eu]');
		const footerLink = page.locator('footer a[data-eu]');
		const aboutLink = page.locator('.cv-meta a[data-eu]');

		await expect(headerLink).toHaveAttribute('href', 'mailto:dgreen03@gmail.com');
		await expect(footerLink).toHaveAttribute('href', 'mailto:dgreen03@gmail.com');
		await expect(aboutLink).toHaveAttribute('href', 'mailto:dgreen03@gmail.com');
		await expect(aboutLink).toHaveText('dgreen03@gmail.com');
	});

	test('raw HTML never contains the plaintext email address', async ({ request }) => {
		const html = await (await request.get('/about')).text();
		expect(html).not.toContain('dgreen03@gmail.com');
	});
});
