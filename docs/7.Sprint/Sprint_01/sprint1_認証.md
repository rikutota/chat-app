# Sprint 1 実装ガイド: 認証・ユーザー基盤

## 1. 目的

Sprint 1 の目的は、ユーザーが外部認証でログインし、アプリ内ユーザーとして扱える状態を作ることです。

このSprintでは、チャット機能そのものにはまだ入りません。  
ログイン、ログアウト、ユーザー情報取得、認証ガード、プロフィール表示までを完成させます。

---

## 2. ゴール

```text
・Googleログインできる
・ログアウトできる
・初回ログイン時にusersテーブルへアプリ内ユーザーが作成される
・ログイン済みユーザーの情報を /api/me で取得できる
・未ログインで保護画面へアクセスすると /login へ遷移する
・/profile で自分の情報を表示できる
```

---

## 3. 作るもの

| 種類 | 成果物 |
|---|---|
| Supabase設定 | Google OAuth設定 |
| DB | usersテーブル |
| API | `GET /api/me` |
| 共通関数 | `getCurrentAppUser` |
| 画面 | `/login` |
| 画面 | `/profile` |
| 共通UI | Header |
| 共通処理 | 認証ガード |
| 処理 | ログアウト |

---

## 4. 作業ブランチ

```bash
git checkout develop
git pull
git checkout -b feat/auth
```

---

## 5. 作業手順

## 5.1 Supabase Auth Google OAuth設定

Supabase DashboardでGoogleログインを有効化します。

```text
Authentication
  ↓
Providers
  ↓
Google
  ↓
Enable
```

Google Cloud ConsoleでOAuth Clientを作成し、SupabaseのCallback URLを登録します。

ローカル用Redirect URL例:

```text
http://localhost:3000/**
```

---

## 5.2 usersテーブル作成

Supabase SQL Editorで実行します。

```sql
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  display_name text not null,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_auth_user_id
on public.users(auth_user_id);
```

---

## 5.3 `/api/me` 実装

作成ファイル:

```text
app/api/me/route.ts
```

役割:

```text
・Supabase Authのログインユーザーを取得する
・usersテーブルにアプリ内ユーザーがあるか確認する
・なければ作成する
・アプリ内ユーザー情報を返す
```

---

## 5.4 `getCurrentAppUser` 実装

作成ファイル:

```text
lib/auth/getCurrentAppUser.ts
```

コメントすること:

```text
・Supabase Authのユーザーとアプリ内usersを分ける理由
・初回ログイン時にusersへ作成する理由
・未ログイン時に処理を止める理由
```

---

## 5.5 ログイン画面作成

作成ファイル:

```text
app/login/page.tsx
```

表示:

```text
・ログインタイトル
・説明文
・Googleでログインボタン
・エラー表示
```

---

## 5.6 ログアウト処理

想定配置:

```text
components/layout/Header.tsx
```

処理:

```text
1. ログアウトボタンを押す
2. Supabase AuthのsignOutを呼ぶ
3. /login へ遷移する
```

---

## 5.7 認証ガード

対象:

```text
/chats
/users
/chats/[roomId]
/profile
```

Sprint 1では最低限 `/profile` で確認します。

---

## 5.8 プロフィール画面作成

作成ファイル:

```text
app/profile/page.tsx
```

表示:

```text
・表示名
・メールアドレス
・アイコン
・ログアウトボタン
```

---

## 6. タスク一覧

| ID | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S1-01 | Google OAuth設定 | High | Googleログインが有効 |
| S1-02 | usersテーブル作成 | High | usersが作成済み |
| S1-03 | `/api/me` 実装 | High | ログイン中ユーザーを返せる |
| S1-04 | getCurrentAppUser実装 | High | API共通でユーザー取得できる |
| S1-05 | ログイン画面作成 | High | `/login` が表示される |
| S1-06 | Googleログイン処理 | High | ログイン後に遷移できる |
| S1-07 | ログアウト処理 | High | セッションを削除できる |
| S1-08 | 認証ガード | High | 未ログインで保護画面を開けない |
| S1-09 | プロフィール画面 | Medium | 自分の情報を表示できる |
| S1-10 | 動作確認 | High | 認証導線が一通り動く |

---

## 7. 動作確認

```text
・/login が表示される
・Googleログインできる
・ログイン後 /chats または /profile に遷移する
・usersテーブルにレコードが作成される
・/api/me が自分の情報を返す
・/profile に表示名とメールが表示される
・ログアウトできる
・未ログインで /profile を開くと /login へ遷移する
```

---

## 8. コミット例

```bash
git add .
git commit -m "feat: Googleログインとユーザー基盤を追加"
```

---

## 9. このSprintでやらないこと

```text
・ユーザー一覧
・チャットルーム作成
・メッセージ送信
・Realtime
・画像/ファイル送信
・Vercelデプロイ
```
