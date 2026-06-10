# Not KNOT SMP Registration Website

Baby-blue and white GitHub Pages site for your SMP registration quiz.

## What is inside

- `/index.html` - public quiz page
- `/admindur/` - admin login page
- `/assets/` - CSS and JavaScript
- `/config.js` - site settings
- `/backend/google-apps-script/Code.gs` - optional Google Sheets backend so responses save online

## Important truth nugget

GitHub Pages is static hosting. That means GitHub can show the website, but it cannot store private quiz responses by itself. This ZIP includes a Google Sheets backend so the GitHub site can save responses and your `/admindur` page can read them with an admin key.

Without the backend, responses only save in the browser that submitted them. That is good for testing, not for a real public application page.

## Upload to GitHub

1. Make a new GitHub repo.
2. Upload every file/folder from this ZIP.
3. Go to **Settings > Pages**.
4. Source: **Deploy from a branch**.
5. Branch: **main** and folder: **root**.
6. Save.

Your site will be live at something like:

```text
yourgithubusername.github.io/repo-name
```

## Custom domain with your Minecraft server domain

Use a subdomain for the quiz so it does not fight your Minecraft DNS.

Recommended:

```text
quiz.yourdomain.com  -> GitHub Pages
play.yourdomain.com  -> Minecraft server
```

For GitHub Pages DNS, add:

```text
Type: CNAME
Name: quiz
Value: yourgithubusername.github.io
```

Then in GitHub:

```text
Repo > Settings > Pages > Custom domain > quiz.yourdomain.com
```

## Connect real response storage with Google Sheets

1. Create a new Google Sheet.
2. Click **Extensions > Apps Script**.
3. Open `backend/google-apps-script/Code.gs` from this ZIP.
4. Copy/paste the whole file into Apps Script.
5. Change this line:

```js
const ADMIN_KEY = 'CHANGE_ME_TO_A_LONG_SECRET_KEY';
```

Example:

```js
const ADMIN_KEY = 'my-super-secret-admin-key-123';
```

6. Click **Deploy > New deployment**.
7. Pick **Web app**.
8. Set:
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Deploy and copy the Web App URL. It should end in `/exec`.
10. Open `config.js` and paste it here:

```js
appsScriptUrl: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec",
```

11. Commit/upload the edited `config.js` to GitHub.

Now quiz submissions should go into your Google Sheet.

## Admin page

Go to:

```text
https://quiz.yourdomain.com/admindur/
```

Enter the same admin key you put inside Apps Script.

You can view responses and download them as CSV.

## Local demo password

If you have not connected Google Sheets yet, the admin page uses this demo password from `config.js`:

```js
localAdminPassword: "changeme"
```

This is not real security. It is only for testing browser-only responses.

## Privacy / safety note

The quiz asks for contact info and birthday. Be careful if kids are filling this out. You may want to change the birthday field to "Age" or "Age range" instead.
