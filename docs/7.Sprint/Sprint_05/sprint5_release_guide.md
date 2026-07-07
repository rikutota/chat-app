# Sprint 5 実装ガイド: 仕上げ・テスト・デプロイ

## 1. 目的

Sprint 5 の目的は、MVPとして見せられる状態まで仕上げ、Vercelへデプロイすることです。

---

## 2. ゴール

```text
・MVP機能が一通り動作する
・ローディング、エラー、空状態が整っている
・READMEが更新されている
・手動テストが完了している
・Vercelへデプロイできる
・本番URLでログイン、チャット、ファイル送信ができる
```

---

## 3. 作るもの

| 種類 | 成果物 |
|---|---|
| UI | エラー表示統一 |
| UI | ローディング表示統一 |
| UI | 空状態表示統一 |
| 文書 | README更新 |
| 文書 | `.env.example` 更新 |
| 文書 | issues更新 |
| 文書 | change-log更新 |
| テスト | 手動テスト |
| デプロイ | Vercel設定 |
| デプロイ | Production Deploy |
| 確認 | 本番スモークテスト |

---

## 4. 作業ブランチ

```bash
git checkout develop
git pull
git checkout -b chore/mvp-release
```

---

## 5. 作業手順

## 5.1 UIを整える

対象:

```text
・トップ画面
・ログイン画面
・チャット一覧
・ユーザー一覧
・チャット画面
・プロフィール画面
```

確認:

```text
・極端に崩れていない
・ボタンが分かりやすい
・エラーが読める
・空状態が分かる
・送信中/アップロード中が分かる
```

---

## 5.2 共通表示を統一する

作る/見直すコンポーネント:

```text
components/common/Loading.tsx
components/common/ErrorMessage.tsx
components/common/EmptyState.tsx
```

コメントすること:

```text
・共通化して画面ごとの表示揺れを減らす目的
```

---

## 5.3 READMEを更新する

READMEに以下を追記・整理します。

```text
・アプリ概要
・使用技術
・機能一覧
・セットアップ手順
・環境変数
・Supabase設定
・ローカル起動方法
・デプロイ方法
・開発資料一覧
```

---

## 5.4 手動テストを実施する

参照資料:

```text
09_test_cases.md
09_acceptance_checklist.md
```

最低限確認:

```text
・ログイン
・ログアウト
・ユーザー一覧
・チャットルーム作成
・テキストメッセージ送信
・Realtime反映
・画像送信
・ファイル送信
・権限チェック
```

---

## 5.5 Vercelへ接続する

VercelでGitHubリポジトリを選択してプロジェクトを作成します。

設定:

```text
Framework: Next.js
Production Branch: main
Build Command: next build
```

環境変数:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 5.6 Supabase Redirect URLを追加する

Vercel URLが決まったら、Supabase Authに追加します。

```text
https://your-app.vercel.app/**
```

---

## 5.7 本番スモークテスト

確認:

```text
・本番URLが開ける
・Googleログインできる
・usersが作成される
・ユーザー一覧が表示される
・チャットルームを作成できる
・テキストメッセージを送信できる
・Realtimeで表示される
・画像を送信できる
・ファイルを送信できる
・他人のルームにアクセスできない
```

---

## 6. タスク一覧

| ID | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S5-01 | UI調整 | Medium | 表示崩れが少ない |
| S5-02 | エラー表示統一 | High | 主要エラーが表示される |
| S5-03 | ローディング統一 | Medium | 通信中が分かる |
| S5-04 | 空状態統一 | Medium | データなし表示がある |
| S5-05 | 手動テスト | High | 主要ケース確認済み |
| S5-06 | 不具合修正 | High | Critical/Highが0件 |
| S5-07 | README更新 | High | 起動/設定手順がある |
| S5-08 | Vercel連携 | High | deployできる |
| S5-09 | 環境変数設定 | High | Productionに設定済み |
| S5-10 | Supabase URL設定 | High | Redirect URLが設定済み |
| S5-11 | 本番デプロイ | High | Production Deploy成功 |
| S5-12 | 本番確認 | High | 本番で主要導線OK |

---

## 7. リリース前チェック

```text
・pnpm build が成功する
・Lintが通る
・不要なconsole.logがない
・.env.localがGitに入っていない
・READMEが更新済み
・SupabaseのURL設定が正しい
・Vercel環境変数が正しい
・Critical / High の不具合が0件
```

---

## 8. コミット例

```bash
git add .
git commit -m "chore: MVPリリース準備を追加"
```

README更新なら:

```bash
git commit -m "docs: READMEにデプロイ手順を追加"
```

---

## 9. Sprint 5 完了条件

```text
・Vercel Production Deployが成功している
・本番URLでトップ画面が表示される
・本番URLでログインできる
・本番URLで1対1チャットできる
・Realtime更新が確認できる
・画像/ファイル送信が確認できる
・権限チェックが確認できる
・READMEが更新済み
・change-log.mdにリリース記録がある
```

---

## 10. MVP後の次候補

```text
・RLS強化
・Storage Private化
・Signed URL
・スマホ対応
・既読機能
・未読数
・通報機能
・Sentry導入
```
