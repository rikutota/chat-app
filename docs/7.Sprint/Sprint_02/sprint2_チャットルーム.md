# Sprint 2 実装ガイド: ユーザー一覧・1対1チャットルーム

## 1. 目的

Sprint 2 の目的は、ログイン済みユーザーが他のユーザーを選択し、1対1チャットルームを作成または取得できる状態にすることです。

---

## 2. ゴール

```text
・自分以外のユーザー一覧を表示できる
・ユーザーを選ぶと1対1チャットルームを作成できる
・同じ相手を選んだ場合は既存ルームを再利用できる
・自分のチャットルーム一覧を表示できる
・チャットルーム一覧からチャット画面へ遷移できる
```

---

## 3. 作るもの

| 種類 | 成果物 |
|---|---|
| DB | direct_chat_rooms |
| DB | direct_chat_room_members |
| API | `GET /api/users` |
| API | `POST /api/chat-rooms/direct` |
| API | `GET /api/chat-rooms` |
| 画面 | `/users` |
| 画面 | `/chats` |
| 共通関数 | `findOrCreateDirectRoom` |
| UI | UserList, UserListItem |
| UI | ChatRoomList, ChatRoomListItem |

---

## 4. 作業ブランチ

```bash
git checkout develop
git pull
git checkout -b feat/direct-chat-room
```

---

## 5. 作業手順

## 5.1 ルーム系テーブル作成

```sql
create table if not exists public.direct_chat_rooms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.direct_chat_room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.direct_chat_rooms(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(room_id, user_id)
);

create index if not exists idx_direct_chat_room_members_room_id
on public.direct_chat_room_members(room_id);

create index if not exists idx_direct_chat_room_members_user_id
on public.direct_chat_room_members(user_id);
```

---

## 5.2 `/api/users` 実装

作成ファイル:

```text
app/api/users/route.ts
```

処理:

```text
1. getCurrentAppUserで自分を取得
2. usersから自分以外を取得
3. display_name順で返す
```

---

## 5.3 ユーザー一覧画面作成

作成ファイル:

```text
app/users/page.tsx
```

表示:

```text
・ユーザー名
・アイコン
・チャット開始ボタン
・ローディング
・エラー
・空状態
```

---

## 5.4 1対1ルーム作成API実装

作成ファイル:

```text
app/api/chat-rooms/direct/route.ts
```

処理:

```text
1. getCurrentAppUserで自分を取得
2. partnerUserIdを受け取る
3. partnerUserIdが自分自身でないか確認
4. partnerUserIdが存在するか確認
5. 既存ルームを探す
6. あれば既存roomを返す
7. なければroomとmembersを作成する
```

コメントすること:

```text
・既存ルームを探す理由
・自分自身とのルームを禁止する理由
・MVPでは同時作成の完全対策を後回しにすること
```

---

## 5.5 チャットルーム一覧API実装

作成ファイル:

```text
app/api/chat-rooms/route.ts
```

処理:

```text
1. getCurrentAppUserで自分を取得
2. 自分が参加しているroomを取得
3. roomごとに相手ユーザーを取得
4. 最新メッセージがあれば取得
5. 一覧として返す
```

---

## 5.6 チャットルーム一覧画面作成

作成ファイル:

```text
app/chats/page.tsx
```

表示:

```text
・チャット相手名
・相手アイコン
・最新メッセージ
・最終更新日時
・新規チャットボタン
・空状態
```

---

## 6. タスク一覧

| ID | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S2-01 | ルーム系テーブル作成 | High | room, membersが作成済み |
| S2-02 | `/api/users` 実装 | High | 自分以外を返す |
| S2-03 | ユーザー一覧画面 | High | `/users` に一覧表示 |
| S2-04 | `findOrCreateDirectRoom` 実装 | High | 既存確認と作成ができる |
| S2-05 | `/api/chat-rooms/direct` 実装 | High | ルーム作成/取得できる |
| S2-06 | `/api/chat-rooms` 実装 | High | 自分のルーム一覧を返す |
| S2-07 | チャット一覧画面 | High | `/chats` に一覧表示 |
| S2-08 | チャット開始導線 | High | `/users` からroomへ遷移 |
| S2-09 | 空状態UI | Medium | データなし表示がある |
| S2-10 | 動作確認 | High | 2ユーザーで確認済み |

---

## 7. 動作確認

```text
・User Aでログインする
・User Bでも一度ログインしてusersに作成しておく
・User Aで /users を開く
・User Bが一覧に表示される
・User Bのチャット開始を押す
・direct_chat_rooms にroomが作成される
・direct_chat_room_members に2人分作成される
・/chats にルームが表示される
・同じUser Bを再度選んでも重複roomが作られない
```

---

## 8. コミット例

```bash
git add .
git commit -m "feat: ユーザー一覧と1対1チャットルーム作成を追加"
```

---

## 9. このSprintでやらないこと

```text
・メッセージ送信
・Realtime
・画像/ファイル送信
・既読/未読
```
