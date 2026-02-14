---
id: entra-id-basics
title: Microsoft Entra ID 基礎入門：身分識別的新時代
date: 2026-02-14
author: Peter
tags:
  - Entra ID
  - Identity
  - Admin
excerpt: 深入了解 Microsoft Entra ID (前身為 Azure AD) 的核心概念，以及它如何重塑現代企業的安全防護邊界。
---

隨著雲端運算的普及，企業的安全邊界已經不再是防火牆，而是**身分識別 (Identity)**。Microsoft Entra ID（前身為 Azure Active Directory）正是微軟針對這個新時代所提出的身分識別與存取管理 (IAM) 解決方案。

<img src="https://learn.microsoft.com/zh-tw/entra/architecture/media/resilience-in-infrastructure/admin-resilience-overview.png" alt="Entra ID Architecture">

## 什麼是 Entra ID？

簡單來說，Entra ID 是微軟的雲端目錄服務。它不僅僅是 Windows Server AD 的雲端版本，更是一個完整的身分識別平台，支援多種應用程式、裝置和使用者的認證與授權。

### 核心功能

1. **單一登入 (SSO)**：使用者只需登入一次，即可存取所有授權的應用程式。
2. **多重要素驗證 (MFA)**：除了密碼之外，增加第二層驗證機制（如手機 App、簡訊），大幅提升安全性。
3. **條件式存取 (Conditional Access)**：根據使用者的登入地點、裝置狀態、應用程式敏感度等條件，動態決定是否允許存取。

## 觀念解析：Entra ID vs AD DS

很多初學者容易搞混這兩者，請參考以下影片的詳細說明：

<div class="video-wrapper">
    <iframe src="https://www.youtube.com/embed/fbSVgC8nGz4?si=gFmt0Y4vJd6tSElb" frameborder="0" allowfullscreen></iframe>
</div>

如影片所述，Entra ID 是扁平式架構，透過 HTTP/HTTPS 通訊；而傳統 AD DS 是階層式架構，依賴 LDAP/Kerberos。

## 實戰：建立你的第一個使用者

在 Entra admin center 中建立使用者非常簡單。你也可以使用 PowerShell 來自動化這個過程：

```powershell
# 連接到 Microsoft Entra ID
Connect-MgGraph -Scopes "User.ReadWrite.All"

# 建立新使用者參數
$NewUser = @{
    DisplayName = "張大明"
    Ticket = "ZhangDaming"
    UserPrincipalName = "daming.zhang@yourtenant.onmicrosoft.com"
    AccountEnabled = $true
    MailNickname = "daming"
    PasswordProfile = @{
        ForceChangePasswordNextSignIn = $true
        Password = "StrongPassword123!"
    }
}

# 執行建立指令
New-MgUser -BodyParameter $NewUser
```

## 結語

Entra ID 是現代企業 IT 的基石。掌握它，你就能有效地保護企業資源，同時賦予員工靈活工作的能力。在下一篇文章中，我們將深入探討如何設定 **Conditional Access Policy**，敬請期待！
