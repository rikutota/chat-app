# Sprint 3 実装ガイド: テキストメッセージ機能

## 1. 目的

Sprint 3 の目的は、1対1チャットルーム内でテキストメッセージを送信・表示できる状態にすることです。

---

## 2. ゴール

```text
・チャット画面を表示できる
・メッセージ一覧を表示できる
・テキストメッセージを送信できる
・空文字や長すぎる本文を送信できない
・参加していないroomにはアクセスできない
```

---

## 3. 作るもの

| 種類 | 成果物 |
|---|---|
| DB | messages |
| API | `GET /api/chat-rooms/:roomId` |
| API | `GET /api/chat-rooms/:roomId/messages` |
| API | `POST /api/chat-rooms/:roomId/messages` |
| 共通関数 | `assertRoomMember` |
| 共通関数 | `validateTextMessage` |
| 画面 | `/chats/[roomId]` |
| UI | ChatHeader |
| UI | MessageList |
| UI | MessageBubble |
| UI | MessageInput |

---

## 4. 作業ブランチ

```bash
git checkout develop
git pull
git checkout -b feat/text-message
```

---

## 5. 作業手順

## 5.1 messagesテーブル作成

```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.direct_chat_rooms(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  message_type text not null check (message_type in ('text', 'image', 'file')),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_messages_room_id_created_at
on public.messages(room_id, created_at);

create index if not exists idx_messages_sender_id
on public.messages(sender_id);
```

---

## 5.2 `assertRoomMember` 実装

作成ファイル:

```text
lib/chat/assertRoomMember.ts
```

役割:

```text
・ログイン中ユーザーが指定roomに参加しているか確認する
・参加していなければ403相当のエラーにする
```

コメントすること:

```text
・他人のチャット閲覧を防ぐためのチェックであること
```

---

## 5.3 ルーム詳細API実装

作成ファイル:

```text
app/api/chat-rooms/[roomId]/route.ts
```

処理:

```text
1. getCurrentAppUser
2. roomIdの存在確認
3. assertRoomMember
4. 相手ユーザー情報を取得
5. room情報を返す
```

---

## 5.4 メッセージ一覧API実装

作成ファイル:

```text
app/api/chat-rooms/[roomId]/messages/route.ts
```

GET処理:

```text
1. getCurrentAppUser
2. assertRoomMember
3. messagesをroom_idで取得
4. sender情報を付与
5. created_at昇順で返す
```

---

## 5.5 メッセージ送信API実装

同じファイルでPOST処理を実装します。

```text
POST /api/chat-rooms/:roomId/messages
```

処理:

```text
1. getCurrentAppUser
2. assertRoomMember
3. bodyを検証
4. messagesへinsert
5. 作成したmessageを返す
```

---

## 5.6 `validateTextMessage` 実装

作成ファイル:

```text
lib/validation/message.ts
```

ルール:

```text
・string以外は不可
・空文字不可
・空白のみ不可
・最大2000文字
```

---

## 5.7 チャット画面作成

作成ファイル:

```text
app/chats/[roomId]/page.tsx
```

表示:

```text
・戻るボタン
・相手ユーザー名
・メッセージ一覧
・入力欄
・送信ボタン
・ローディング
・エラー
・空状態
```

---

## 6. タスク一覧

| ID | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S3-01 | messagesテーブル作成 | High | messagesが作成済み |
| S3-02 | assertRoomMember実装 | High | 参加者チェックができる |
| S3-03 | ルーム詳細API | High | roomと相手情報を返す |
| S3-04 | メッセージ一覧API | High | room内メッセージを返す |
| S3-05 | メッセージ送信API | High | textを保存できる |
| S3-06 | validateTextMessage | High | 空文字・長文を拒否 |
| S3-07 | チャット画面 | High | `/chats/[roomId]` を表示 |
| S3-08 | MessageInput | High | 入力と送信ができる |
| S3-09 | MessageBubble | Medium | 自分/相手を区別表示 |
| S3-10 | 動作確認 | High | 2ユーザーで送信確認 |

---

## 7. 動作確認

```text
・/chats からroomを開ける
・過去メッセージが表示される
・新規メッセージを送信できる
・送信後に画面へ追加される
・空文字を送れない
・2001文字を送れない
・User Cで他人のroomを開けない
・User Cで他人のroomへPOSTできない
```

---

## 8. コミット例

```bash
git add .
git commit -m "feat: テキストメッセージ送信機能を追加"
```

---

## 9. このSprintでやらないこと

```text
・Realtime自動反映
・画像送信
・ファイル送信
・既読/未読
```
