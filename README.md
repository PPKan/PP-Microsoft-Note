# 📒 PP微軟筆記 (Entra ID Masterclass)

A professional, static blog website designed for technical tutorials, featuring a Microsoft-themed design, dark mode, and markdown content support.

## 🚀 Key Features

- **Static Architecture**: Built with pure HTML/CSS/JS. fast and secure.
- **Dynamic Content**: Posts are written in Markdown with YAML Frontmatter.
- **Auto-Generated Index**: Python script generates `posts.json` from markdown files.
- **Premium Design**: Microsoft-inspired UI, responsive grid layout, glassmorphism.
- **Video/Media Support**: Optimized video embedding and image handling.
- **Search**: Client-side search functionality.

## 🛠️ Local Development

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   ```

2. **Add a new post**
   - Create a `.md` file in `content/`.
   - Add the required Frontmatter (see `NEW_POST_GUIDE.md`).

3. **Build the index**
   Run the Python script to update `posts.json`:
   ```bash
   python scripts/build_posts.py
   ```

4. **Preview**
   Open `index.html` in your browser or run a local server:
   ```bash
   python -m http.server 8000
   ```

## ☁️ Deploy to Cloudflare Pages

This project is optimized for **Cloudflare Pages**. It will automatically rebuild the site whenever you push a new change (like adding a markdown file) to GitHub.

### Step 1: Push to GitHub
Upload this folder to a new GitHub repository.

### Step 2: Create Project in Cloudflare Pages
1. Log in to the Cloudflare Dashboard.
2. Go to **Workers & Pages** > **Create Application** > **Pages**.
3. Connect to your GitHub account and select this repository.

### Step 3: Build Configuration (Crucial!)
Configure the build settings as follows:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `None` |
| **Build Command** | `python scripts/build_posts.py` |
| **Build Output Directory** | (Leave Empty) *or set to `.`* |
| **Root Directory** | (Leave Empty) |

### Step 4: Save and Deploy
Click **Save and Deploy**. Cloudflare will:
1. Clone your repo.
2. Run `python scripts/build_posts.py` to regenerate `posts.json` from your latest markdown files.
3. Deploy the static files (HTML, CSS, JS, content) to the edge.

---

### 📝 How to update the site?
Just add a new markdown file to `content/`, commit, and push to GitHub. Cloudflare will handle the rest!
