# 📒 新增文章指南 (How to Add New Post)

歡迎來到 **PP微軟筆記**！本指南將教您如何新增教學文章。

## 步驟 1: 建立 Markdown 檔案

在專案的 `content/` 資料夾中，建立一個新的 `.md` 檔案。檔名建議使用英文小寫，並用連字號分隔，例如：
- `azure-conditional-access.md`
- `microsoft-intune-setup.md`

## 步驟 2: 新增文章資訊 (Metadata)

在檔案的最上方，必須加入以下的 `Frontmatter` 區塊（用 `---` 包夾）：

```yaml
---
id: azure-conditional-access  # 文章的唯一 ID (通常設定跟檔名一樣)
title: 如何設定 Azure 條件式存取？  # 文章標題
date: 2024-02-15               # 發布日期 (YYYY-MM-DD)
author: Peter                  # 作者名稱
tags:                          # 標籤 (可多個)
  - Security
  - Azure AD
excerpt: 這篇文章將教你如何在 10 分鐘內設定好最基本的條件式存取原則。 # 文章簡介 (會顯示在首頁列表)
---
```

## 步驟 3: 撰寫文章內容

在 Frontmatter 下方，使用標準的 Markdown 語法撰寫您的教學內容。

- **標題**: 可直接使用 `##` (H2) 或 `###` (H3)。 (請勿使用 `# H1`，系統會自動帶入標題)
- **程式碼**: 使用 \`\`\` 包夾程式碼區塊。
- **圖片**: `<img src="..." alt="...">`
- **YouTube 影片**: 使用我們設定好的容器：
    ```html
    <div class="video-wrapper">
        <iframe src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>
    </div>
    ```

## 步驟 4: 更新網站索引

新增完檔案後，必須執行腳本來更新 `posts.json`，網站上才會顯示新文章。

開啟您的終端機 (Terminal / PowerShell)，執行以下指令：

```powershell
python scripts/build_posts.py
```

看到 `Successfully generated posts.json` 即代表成功！

## 步驟 5: 預覽

開啟 `index.html` (或重新整理瀏覽器) 即可看到您的新文章出現在列表中。
