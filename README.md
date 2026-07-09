# チャットWebアプリ

## 概要

1対1でリアルタイムチャットできるWebアプリです。

学習用として開発しつつ、将来的に本番公開できる構成を目指します。

---

## 主な機能

MVPでは以下を実装します。

- 外部認証ログイン
- ログアウト
- ユーザー一覧
- 1対1チャットルーム作成
- チャットルーム一覧
- テキストメッセージ送信
- リアルタイム更新
- 画像送信
- ファイル送信

---

## 使用技術

| 分類 | 技術 |
| --- | --- |
| フロントエンド | Next.js |
| 言語 | TypeScript |
| UI | Tailwind CSS |
| 認証 | Supabase Auth |
| DB | Supabase PostgreSQL |
| リアルタイム | Supabase Realtime |
| ファイル保存 | Supabase Storage |
| ホスティング | Vercel |

---

## セットアップ

## 1. リポジトリを取得

```bash
git clone <repository-url>
cd chat-web-app
```

## 2. パッケージをインストール

pnpmの場合:

```bash
pnpm install
```

npmの場合:

```bash
npm install
```

## 3. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成します。

```bash
cp .env.example .env.local
```

`.env.local` にSupabaseの情報を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 4. 開発サーバー起動

pnpmの場合:

```bash
pnpm dev
```

npmの場合:

```bash
npm run dev
```

ブラウザで以下を開きます。

```text
http://localhost:3000
```

---

## 開発資料

設計資料は `docs/` に保存します。

| ファイル | 内容 |
| --- | --- |
| `00_project_plan.md` | プロジェクト計画 |
| `01_requirements.md` | 要件定義 |
| `02_technology_selection.md` | 技術選定 |
| `03_basic_design.md` | 基本設計 |
| `04_database_design.md` | DB設計 |
| `05_api_design.md` | API設計 |
| `06_screen_design.md` | 画面設計 |
| `07_detailed_design.md` | 詳細設計 |
| `08_development_plan_overview.md` | 開発実装計画 |
| `09_test_plan_overview.md` | テスト計画 |
| `10_release_plan_overview.md` | リリース計画 |
| `issues.md` | 課題管理 |
| `change-log.md` | 変更履歴 |

---

## 開発ルール

- `main` は本番リリース用
- `develop` は開発統合用
- 機能開発は `feature/*` ブランチで行います
- バグ修正は `fix/*` ブランチで行います
- ドキュメント更新は `docs/*` ブランチで行います

---

## 環境変数

| 変数名 | 内容 |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon public key |

注意:

- `.env.local` はGitにコミットしません
- Supabase service role key はフロントエンドに置きません

---

## MVP対象外

以下は初期MVPでは実装しません。

- 管理者機能
- スマホ最適化
- グループチャット
- 既読機能
- 未読数
- プッシュ通知
- メッセージ検索
- メッセージ編集
- メッセージ削除
- 通報機能
- ブロック機能

---

## 現在のフェーズ

Sprint 0: プロジェクト準備・環境構築
