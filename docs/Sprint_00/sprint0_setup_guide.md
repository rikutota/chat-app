# Sprint 0 実装ガイド: プロジェクト準備・環境構築

## 1. Sprint 0 の目的

Sprint 0 の目的は、チャットWebアプリの開発を始められる状態にすることである。

このSprintでは、まだチャット機能そのものは作らない。  
まずは、Next.jsプロジェクト、Git、Supabase、環境変数、ドキュメント管理の土台を整える。

---

## 2. Sprint 0 のゴール

Sprint 0 が完了した時点で、以下の状態になっていることを目指す。

```text
・GitHubリポジトリがある
・Next.js + TypeScript プロジェクトが作成されている
・Tailwind CSS が使える
・Supabaseプロジェクトが作成されている
・環境変数の雛形がある
・READMEの仮版がある
・docs/issues.md がある
・docs/change-log.md がある
・ローカルでアプリが起動する
・初期コミットが作成されている
```

---

## 3. Sprint 0 で作るもの

| 種類 | 成果物 |
|---|---|
| アプリ | Next.jsプロジェクト |
| 設定 | TypeScript, Tailwind CSS, ESLint |
| 外部サービス | Supabaseプロジェクト |
| 環境変数 | `.env.local`, `.env.example` |
| ドキュメント | `README.md` |
| ドキュメント | `docs/issues.md` |
| ドキュメント | `docs/change-log.md` |
| Git | 初期コミット |

---

## 4. 推奨ディレクトリ構成

Sprint 0 完了時点では、以下のような構成を目指す。

```text
chat-web-app/
├─ app/
├─ components/
├─ lib/
│  └─ supabase/
├─ docs/
│  ├─ issues.md
│  └─ change-log.md
├─ public/
├─ README.md
├─ .env.local
├─ .env.example
├─ .gitignore
├─ package.json
├─ tsconfig.json
├─ next.config.ts
├─ tailwind.config.ts
└─ eslint.config.mjs
```

補足:

- `app/` はNext.js App Router用
- `components/` はUIコンポーネント用
- `lib/` は共通処理用
- `lib/supabase/` はSupabase Client用
- `docs/` は開発資料と記録用

---

## 5. 作業手順

## 5.1 作業用ディレクトリを作る

```bash
mkdir chat-web-app
cd chat-web-app
```

ただし、`create-next-app` で直接作る場合は、この手順は省略してよい。

---

## 5.2 Next.jsプロジェクト作成

pnpmを使う場合:

```bash
pnpm create next-app@latest chat-web-app
```

npmを使う場合:

```bash
npx create-next-app@latest chat-web-app
```

作成時の選択例:

```text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/ directory: No
App Router: Yes
Turbopack: 任意
Import alias: Yes
```

Import aliasは以下を推奨する。

```text
@/*
```

---

## 5.3 ローカル起動確認

```bash
cd chat-web-app
pnpm dev
```

npmの場合:

```bash
npm run dev
```

ブラウザで以下を開く。

```text
http://localhost:3000
```

確認すること:

```text
・Next.jsの初期画面が表示される
・ターミナルに大きなエラーが出ていない
```

---

## 5.4 不要な初期表示を整理

初期画面を簡単なトップ画面に変更する。

対象:

```text
app/page.tsx
```

仮の内容:

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">チャットWebアプリ</h1>
      <p className="mt-4 text-gray-600">
        1対1でリアルタイムチャットできるWebアプリです。
      </p>
    </main>
  );
}
```

確認:

```text
・トップ画面にアプリ名が表示される
・Tailwind CSSが反映されている
```

---

## 5.5 基本ディレクトリ作成

```bash
mkdir components
mkdir components/layout
mkdir components/common
mkdir components/chat
mkdir lib
mkdir lib/supabase
mkdir lib/auth
mkdir lib/chat
mkdir lib/api
mkdir lib/validation
mkdir docs
```

---

## 5.6 Supabaseプロジェクト作成

Supabaseで新規プロジェクトを作成する。

作成後、以下を取得する。

```text
Project URL
Anon public key
```

場所:

```text
Project Settings
  ↓
API
```

---

## 5.7 環境変数ファイル作成

`.env.local` を作成する。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`.env.example` も作成する。

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

注意:

```text
・.env.local はGitにコミットしない
・.env.example はGitにコミットする
・service role key はフロントエンドに置かない
```

---

## 5.8 Supabase Clientの雛形作成

対象:

```text
lib/supabase/client.ts
```

内容:

```ts
import { createClient } from '@supabase/supabase-js';

export function createBrowserSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
```

必要パッケージを追加する。

```bash
pnpm add @supabase/supabase-js
```

npmの場合:

```bash
npm install @supabase/supabase-js
```

---

## 5.9 README作成

`README.md` を作成する。

内容は仮版でよい。

記載するもの:

```text
・アプリ概要
・使用技術
・セットアップ手順
・環境変数
・ローカル起動方法
・開発資料一覧
```

---

## 5.10 issues.md 作成

対象:

```text
docs/issues.md
```

目的:

```text
・詰まったこと
・未解決事項
・バグ
・後で対応すること
```

を記録する。

---

## 5.11 change-log.md 作成

対象:

```text
docs/change-log.md
```

目的:

```text
・仕様変更
・設計変更
・実装方針変更
・リリース記録
```

を記録する。

---

## 5.12 Git初期化

```bash
git init
git add .
git commit -m "chore: initial project setup"
```

GitHubリポジトリ作成後:

```bash
git remote add origin <repository-url>
git branch -M main
git push -u origin main
```

developブランチを作る場合:

```bash
git checkout -b develop
git push -u origin develop
```

---

## 6. Sprint 0 タスク一覧

| ID | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S0-01 | GitHubリポジトリ作成 | High | リポジトリが存在する |
| S0-02 | Next.jsプロジェクト作成 | High | ローカル起動できる |
| S0-03 | TypeScript設定確認 | High | 型エラーなく起動する |
| S0-04 | Tailwind CSS確認 | High | Tailwindのスタイルが反映される |
| S0-05 | ESLint確認 | Medium | lintコマンドが実行できる |
| S0-06 | 基本ディレクトリ作成 | High | components, lib, docsがある |
| S0-07 | Supabaseプロジェクト作成 | High | Project URLとAnon Keyを取得できる |
| S0-08 | `.env.local` 作成 | High | Supabase環境変数が設定されている |
| S0-09 | `.env.example` 作成 | High | 必要な環境変数名が書かれている |
| S0-10 | Supabase Client雛形作成 | High | client.tsが存在する |
| S0-11 | README仮版作成 | Medium | READMEに概要と起動手順がある |
| S0-12 | issues.md作成 | Medium | docs/issues.mdがある |
| S0-13 | change-log.md作成 | Medium | docs/change-log.mdがある |
| S0-14 | 初期コミット | High | 初期コミットが作成されている |

---

## 7. Sprint 0 完了条件

以下をすべて満たしたらSprint 0完了。

```text
・Next.jsアプリがローカルで起動する
・トップ画面に仮のアプリ名が表示される
・Tailwind CSSが反映される
・Supabaseプロジェクトが作成済み
・.env.local が存在する
・.env.example が存在する
・Supabase Clientの雛形がある
・README.md がある
・docs/issues.md がある
・docs/change-log.md がある
・GitHubにpush済み
```

---

## 8. Sprint 0 でやらないこと

Sprint 0では以下はまだ実装しない。

```text
・ログイン機能
・DBテーブル作成
・ユーザー一覧
・チャットルーム作成
・メッセージ送信
・Realtime購読
・画像/ファイル送信
・Vercelデプロイ
```

これらはSprint 1以降で実装する。

---

## 9. よくある詰まりポイント

## 9.1 create-next-appで選択を間違えた

対処:

```text
・学習初期なら作り直してOK
・TypeScript, Tailwind, App Routerを入れる
```

---

## 9.2 Supabase環境変数が読み込まれない

確認:

```text
・.env.local がプロジェクトルートにあるか
・変数名が NEXT_PUBLIC_ で始まっているか
・dev serverを再起動したか
```

---

## 9.3 Tailwindが反映されない

確認:

```text
・globals.css が読み込まれているか
・classNameにTailwindクラスを書いているか
・Next.jsを再起動したか
```

---

## 9.4 Gitに.env.localを入れてしまいそう

対策:

```text
・.gitignoreに.env*.localが含まれているか確認
・git statusで確認してからcommitする
```

---

## 10. 次のSprint

Sprint 0完了後、Sprint 1に進む。

Sprint 1では以下を実装する。

```text
・Google OAuth設定
・usersテーブル作成
・/api/me
・ログイン画面
・ログアウト
・認証ガード
・プロフィール画面
```
