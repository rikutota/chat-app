# Issues

このファイルでは、開発中の課題、不具合、未決定事項を管理する。

---

## 記録ルール

新しい課題は、以下の形式で追加する。

```md
## ISSUE-001: タイトル

### 種別

Bug / Task / Question / Improvement

### 優先度

High / Medium / Low

### 状態

Open / In Progress / Done / Pending

### 内容

### 再現手順

### 期待結果

### 実際の結果

### 対応方針

### メモ
```

---

## ISSUE-001: Supabase AuthのGoogle OAuth設定

### 種別

Task

### 優先度

High

### 状態

Open

### 内容

Sprint 1でGoogle OAuthを設定する。

### 対応方針

Supabase Authentication > Providers からGoogleを有効化する。  
Google Cloud ConsoleでOAuth Clientを作成し、Supabase callback URLを登録する。

### メモ

Sprint 0では未対応。
