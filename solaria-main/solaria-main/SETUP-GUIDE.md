# Solaria Parfums: Supabase setup guide

Follow these steps in order. It takes about 15 minutes.

## 1. Create the project
1. Go to https://supabase.com and sign in (or create a free account).
2. Click **New project**.
3. Name: `solaria`. Choose a **strong database password** and save it somewhere safe. Pick the region closest to your customers (Southeast Asia / Singapore for the Philippines).
4. Click **Create new project** and wait until it finishes starting.

## 2. Create the database
1. In the left menu open **SQL Editor** > **New query**.
2. Open `solaria-setup.sql`, copy **everything**, paste it in, and click **Run**.
   You should see "Success. No rows returned". This creates:
   - `products` and `product_variants` (each perfume has its own sizes, prices and stock)
   - `orders`, `order_items`, `addresses`, `reviews`, `stock_alerts`, `contact_messages`, `admins`
   - security rules (Row Level Security), the ordering/cancelling/review functions, and the `product-images` storage bucket
3. (Optional) Run `solaria-sample-data.sql` in a new query to add 6 sample perfumes. You can delete them later in the Admin page.

## 3. Create your admin account
1. Open **Authentication** > **Users** > **Add user** > **Create new user**.
2. Email: `solariasupport@gmail.com`, choose a password, and tick **Auto Confirm User**.
3. Back in **SQL Editor**, run this in a new query (use the same email):

```sql
insert into public.admins (email, user_id)
select u.email, u.id from auth.users u
where lower(u.email) = lower('solariasupport@gmail.com')
  and not exists (select 1 from public.admins a where lower(a.email) = lower(u.email));
```

## 4. Connect the website
1. Open **Project Settings** > **API Keys** (or **Data API**).
2. Copy the **Project URL** and the **publishable** key (older projects call it the `anon` key).
3. Open `db.js` and replace the two placeholders at the top:
   `PASTE_YOUR_PROJECT_URL_HERE` and `PASTE_YOUR_PUBLISHABLE_KEY_HERE`.

Never put the `service_role` / secret key in the website. The publishable key is safe because the security rules protect the data.

## 5. Allow login links to come back to your site
1. **Authentication** > **URL Configuration**.
2. Set **Site URL** to your live website address (for testing use `http://localhost:5500`).
3. Under **Redirect URLs** add `https://YOUR-SITE/login.html` (and the localhost one while testing). Confirmation and password-reset emails use this.

## 6. Run and test
The site is plain HTML. Open the folder with the VS Code **Live Server** extension, or host it on Netlify, Vercel, Cloudflare Pages or GitHub Pages.

Checklist:
1. Sign in with the admin email, then open **Account > Admin**.
2. **Add fragrance**: name, "Inspired by", notes, photo, and one or more sizes (ml, price, stock). Save.
3. Open the shop, add a perfume to the cart and place a test order (cash on delivery).
4. In Admin > Orders change the status to *delivered*, then leave a review as the customer.
5. Send a message on the Contact page and read it in Admin > Messages.

## 7. Before going live
- **Email sending:** Supabase's built-in email has a very low hourly limit. Under **Authentication > SMTP Settings** connect your own email provider so sign-up confirmation emails reach every customer.
- **Prices, shipping and voucher:** shipping is PHP 150, free from PHP 2,500, with a PHP 100 first-order voucher. To change them edit `SOLRules` in `cart.js` **and** the matching numbers in `place_order` in `solaria-setup.sql` (re-run that file). The server always has the final say.
- **Legal pages:** `privacy.html`, `terms.html` and the returns period in `shipping-returns.html` are templates (highlighted). Have them reviewed.
- **Payments:** GCash/Maya are disabled until you add a payment provider.
- **Social link:** the footer shows `@solaria` as text. Add your real profile URL in `layout.js`.

## 8. Admin portal (separate from customers)
- Staff sign in at `admin-login.html` (not linked anywhere on the store; bookmark it). It uses its own session, so it never mixes with a customer login.
- Admin accounts are refused on the customer `login.html`.
- Run `solaria-admin-upgrade.sql` once (SQL Editor) so admin rights depend only on the `admins` table.
- Turn on **Authentication > Providers > Email > Confirm email**, and give admins strong, unique passwords.
