# チャットWebアプリ API設計書

## 1. 概要

本資料は、チャットWebアプリのAPI設計をまとめたものである。

本アプリでは、Next.js + Supabaseを利用する。
そのため、すべてを独自REST APIとして実装するのではなく、以下を使い分ける。

- Supabase Auth
- Supabase PostgreSQL
- Supabase Realtime
- Supabase Storage
- Next.js Route Handlers

MVPでは、学習しやすさと実装の分かりやすさを優先し、重要な業務処理はNext.js側のAPIとして定義する。

---

## 2. API設計方針

## 2.1 基本方針

- 認証はSupabase Authを利用する
- DB操作はSupabase Clientを利用する
- 複数テーブルをまたぐ処理はNext.js APIでまとめる
- チャットルーム作成のような整合性が必要な処理はAPI化する
- メッセージ送信はAPI化する
- ファイルアップロードはSupabase Storageを利用する
- Realtime購読はフロントエンド側で行う
- APIレスポンス形式は統一する
- エラーレスポンス形式も統一する

---

## 2.2 API分類

| 分類 | 実装方式 |
| --- | --- |
| ログイン | Supabase Auth |
| ログアウト | Supabase Auth |
| ログイン中ユーザー取得 | Supabase Auth + users取得 |
| ユーザー一覧取得 | Next.js API または Supabase Client |
| チャットルーム一覧取得 | Next.js API |
| 1対1チャットルーム作成 | Next.js API |
| メッセージ一覧取得 | Next.js API |
| メッセージ送信 | Next.js API |
| ファイルアップロード | Supabase Storage + Next.js API |
| リアルタイム購読 | Supabase Realtime |

---

## 2.3 認証方式

APIリクエスト時は、Supabase Authのセッションを利用する。

フロントエンドからAPIを呼ぶ際、ログイン済みユーザーであることを前提にする。  
API側では必ずログイン状態を検証する。

処理イメージ:

```text
1. APIリクエスト受信
2. Supabaseセッション確認
3. auth_user_id取得
4. usersテーブルからアプリ内user_id取得
5. 権限チェック
6. 業務処理
7. レスポンス返却
```

---

## 2.4 共通レスポンス形式

成功時:

```json
{
  "success": true,
  "data": {}
}
```

失敗時:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "ユーザー向けメッセージ"
  }
}
```

---

## 2.5 HTTPステータス方針

| ステータス | 用途 |
| ---: | --- |
| 200 | 取得成功 |
| 201 | 作成成功 |
| 400 | リクエスト不正 |
| 401 | 未認証 |
| 403 | 権限なし |
| 404 | 対象データなし |
| 409 | 重複・競合 |
| 413 | ファイルサイズ超過 |
| 415 | ファイル形式不正 |
| 500 | サーバーエラー |

---

## 2.6 共通エラーコード

| コード | HTTP | 内容 |
| --- | ---: | --- |
| UNAUTHORIZED | 401 | ログインしていない |
| FORBIDDEN | 403 | 権限がない |
| VALIDATION_ERROR | 400 | 入力値が不正 |
| NOT_FOUND | 404 | データが存在しない |
| ROOM_NOT_FOUND | 404 | チャットルームが存在しない |
| ROOM_ACCESS_DENIED | 403 | チャットルームに参加していない |
| MESSAGE_EMPTY | 400 | メッセージ本文が空 |
| MESSAGE_TOO_LONG | 400 | メッセージ本文が長すぎる |
| FILE_TOO_LARGE | 413 | ファイルサイズ上限超過 |
| FILE_TYPE_NOT_ALLOWED | 415 | 許可されていないファイル形式 |
| UPLOAD_FAILED | 500 | ファイルアップロード失敗 |
| INTERNAL_ERROR | 500 | 予期しないエラー |

---

## 3. API一覧

| API ID | メソッド | パス | 認証 | 概要 |
| --- | --- | --- | --- | --- |
| API-AUTH-01 | GET | `/api/me` | 必要 | ログイン中ユーザー取得 |
| API-USER-01 | GET | `/api/users` | 必要 | ユーザー一覧取得 |
| API-ROOM-01 | GET | `/api/chat-rooms` | 必要 | チャットルーム一覧取得 |
| API-ROOM-02 | POST | `/api/chat-rooms/direct` | 必要 | 1対1チャットルーム作成または取得 |
| API-ROOM-03 | GET | `/api/chat-rooms/:roomId` | 必要 | チャットルーム詳細取得 |
| API-MSG-01 | GET | `/api/chat-rooms/:roomId/messages` | 必要 | メッセージ一覧取得 |
| API-MSG-02 | POST | `/api/chat-rooms/:roomId/messages` | 必要 | メッセージ送信 |
| API-FILE-01 | POST | `/api/files/validate` | 必要 | ファイル送信前チェック |
| API-FILE-02 | POST | `/api/chat-rooms/:roomId/attachments` | 必要 | 添付付きメッセージ作成 |

注:

- Supabase Authのログイン/ログアウトはNext.js APIではなく、Supabase Auth Clientで実行する
- ファイル本体アップロードはSupabase Storageへ直接行う
- `API-FILE-02` はアップロード済みファイルをメッセージとしてDB登録するAPI

---

## 4. API詳細

# 4.1 API-AUTH-01 ログイン中ユーザー取得

## 基本情報

| 項目 | 内容 |
| --- | --- |
| メソッド | GET |
| パス | `/api/me` |
| 認証 | 必要 |
| 概要 | ログイン中のアプリ内ユーザー情報を取得する |

## 処理概要

```text
1. Supabase Authのセッションを確認
2. auth_user_idを取得
3. users.auth_user_idでアプリ内ユーザーを検索
4. 存在しなければ初回ログインとしてusersを作成
5. ユーザー情報を返す
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "displayName": "Taro",
      "avatarUrl": "https://example.com/avatar.png",
      "email": "taro@example.com"
    }
  }
}
```

## エラー

| HTTP | コード | 内容 |
| ---: | --- | --- |
| 401 | UNAUTHORIZED | 未ログイン |
| 500 | INTERNAL_ERROR | ユーザー取得失敗 |

---

# 4.2 API-USER-01 ユーザー一覧取得

## 基本情報

| 項目 | 内容 |
| --- | --- |
| メソッド | GET |
| パス | `/api/users` |
| 認証 | 必要 |
| 概要 | 自分以外のユーザー一覧を取得する |

## クエリパラメータ

| パラメータ | 必須 | 内容 |
| --- | ---: | --- |
| q | NO | 表示名検索。MVPでは未使用でもよい |
| limit | NO | 取得件数。初期値50 |

## 処理概要

```text
1. ログイン確認
2. 自分のアプリ内user_idを取得
3. usersから自分以外のユーザーを取得
4. 一覧を返す
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid-1",
        "displayName": "Alice",
        "avatarUrl": "https://example.com/alice.png"
      },
      {
        "id": "user-uuid-2",
        "displayName": "Bob",
        "avatarUrl": null
      }
    ]
  }
}
```

## エラー

| HTTP | コード | 内容 |
| ---: | --- | --- |
| 401 | UNAUTHORIZED | 未ログイン |
| 500 | INTERNAL_ERROR | ユーザー一覧取得失敗 |

---

# 4.3 API-ROOM-01 チャットルーム一覧取得

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | GET |
| パス | `/api/chat-rooms` |
| 認証 | 必要 |
| 概要 | 自分が参加している1対1チャットルーム一覧を取得する |

## 処理概要

```text
1. ログイン確認
2. 自分のuser_idを取得
3. direct_chat_room_membersから自分のroom_id一覧を取得
4. 各roomの相手ユーザー情報を取得
5. 各roomの最新メッセージを取得
6. 最新メッセージ日時の降順で返す
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "chatRooms": [
      {
        "id": "room-uuid",
        "partner": {
          "id": "partner-user-uuid",
          "displayName": "Alice",
          "avatarUrl": null
        },
        "latestMessage": {
          "id": "message-uuid",
          "type": "text",
          "body": "こんにちは",
          "createdAt": "2026-07-07T10:00:00Z"
        },
        "updatedAt": "2026-07-07T10:00:00Z"
      }
    ]
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 401 | UNAUTHORIZED | 未ログイン |
| 500 | INTERNAL_ERROR | ルーム一覧取得失敗 |

---

# 4.4 API-ROOM-02 1対1チャットルーム作成または取得

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | POST |
| パス | `/api/chat-rooms/direct` |
| 認証 | 必要 |
| 概要 | 指定ユーザーとの1対1チャットルームを作成、または既存ルームを取得する |

## リクエスト

```json
{
  "partnerUserId": "partner-user-uuid"
}
```

## バリデーション

| 項目 | ルール |
|---|---|
| partnerUserId | 必須 |
| partnerUserId | usersに存在する |
| partnerUserId | 自分自身ではない |

## 処理概要

```text
1. ログイン確認
2. 自分のuser_idを取得
3. partnerUserIdの存在確認
4. partnerUserIdが自分自身でないことを確認
5. 自分が参加しているroom_id一覧を取得
6. その中で相手も参加しているroom_idを探す
7. 既存ルームがあればそのroomを返す
8. なければdirect_chat_roomsを作成
9. direct_chat_room_membersに自分と相手を登録
10. 作成したroomを返す
```

## レスポンス

既存ルームがある場合も新規作成した場合も同じ形式で返す。

```json
{
  "success": true,
  "data": {
    "chatRoom": {
      "id": "room-uuid",
      "partner": {
        "id": "partner-user-uuid",
        "displayName": "Alice",
        "avatarUrl": null
      },
      "isNew": true
    }
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 400 | VALIDATION_ERROR | partnerUserIdが不正 |
| 401 | UNAUTHORIZED | 未ログイン |
| 404 | NOT_FOUND | 相手ユーザーが存在しない |
| 409 | VALIDATION_ERROR | 自分自身とはチャットできない |
| 500 | INTERNAL_ERROR | ルーム作成失敗 |

## 注意点

MVPではアプリ側で既存ルーム確認を行う。  
将来的にはDBの `room_key` による重複防止を検討する。

---

# 4.5 API-ROOM-03 チャットルーム詳細取得

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | GET |
| パス | `/api/chat-rooms/:roomId` |
| 認証 | 必要 |
| 概要 | 指定チャットルームの詳細を取得する |

## パスパラメータ

| パラメータ | 内容 |
|---|---|
| roomId | チャットルームID |

## 処理概要

```text
1. ログイン確認
2. roomIdの存在確認
3. 自分がroomに参加しているか確認
4. 相手ユーザー情報を取得
5. room情報を返す
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "chatRoom": {
      "id": "room-uuid",
      "partner": {
        "id": "partner-user-uuid",
        "displayName": "Alice",
        "avatarUrl": null
      },
      "createdAt": "2026-07-07T10:00:00Z"
    }
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 401 | UNAUTHORIZED | 未ログイン |
| 403 | ROOM_ACCESS_DENIED | 参加していないルーム |
| 404 | ROOM_NOT_FOUND | ルームが存在しない |
| 500 | INTERNAL_ERROR | ルーム詳細取得失敗 |

---

# 4.6 API-MSG-01 メッセージ一覧取得

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | GET |
| パス | `/api/chat-rooms/:roomId/messages` |
| 認証 | 必要 |
| 概要 | 指定チャットルームのメッセージ一覧を取得する |

## パスパラメータ

| パラメータ | 内容 |
|---|---|
| roomId | チャットルームID |

## クエリパラメータ

| パラメータ | 必須 | 内容 |
|---|---:|---|
| limit | NO | 取得件数。初期値50 |
| before | NO | 指定日時より前のメッセージを取得 |

## 処理概要

```text
1. ログイン確認
2. roomIdの存在確認
3. 自分がroomに参加しているか確認
4. messagesをcreated_at昇順で取得
5. 添付がある場合はmessage_attachmentsも取得
6. メッセージ一覧を返す
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-uuid-1",
        "roomId": "room-uuid",
        "sender": {
          "id": "user-uuid",
          "displayName": "Taro",
          "avatarUrl": null
        },
        "type": "text",
        "body": "こんにちは",
        "attachment": null,
        "createdAt": "2026-07-07T10:00:00Z"
      },
      {
        "id": "message-uuid-2",
        "roomId": "room-uuid",
        "sender": {
          "id": "user-uuid-2",
          "displayName": "Alice",
          "avatarUrl": null
        },
        "type": "image",
        "body": null,
        "attachment": {
          "id": "attachment-uuid",
          "fileName": "image.png",
          "filePath": "rooms/room-uuid/message-uuid/image.png",
          "mimeType": "image/png",
          "fileSize": 123456
        },
        "createdAt": "2026-07-07T10:01:00Z"
      }
    ]
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 401 | UNAUTHORIZED | 未ログイン |
| 403 | ROOM_ACCESS_DENIED | 参加していないルーム |
| 404 | ROOM_NOT_FOUND | ルームが存在しない |
| 500 | INTERNAL_ERROR | メッセージ取得失敗 |

---

# 4.7 API-MSG-02 メッセージ送信

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | POST |
| パス | `/api/chat-rooms/:roomId/messages` |
| 認証 | 必要 |
| 概要 | テキストメッセージを送信する |

## リクエスト

```json
{
  "type": "text",
  "body": "こんにちは"
}
```

## バリデーション

| 項目 | ルール |
|---|---|
| type | `text` のみ |
| body | 必須 |
| body | 空文字不可 |
| body | 最大2000文字 |

## 処理概要

```text
1. ログイン確認
2. 自分のuser_idを取得
3. roomIdの存在確認
4. 自分がroomに参加しているか確認
5. bodyのバリデーション
6. messagesへINSERT
7. 作成したメッセージを返す
8. Supabase Realtimeにより購読中の画面へ反映
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message-uuid",
      "roomId": "room-uuid",
      "senderId": "user-uuid",
      "type": "text",
      "body": "こんにちは",
      "createdAt": "2026-07-07T10:00:00Z"
    }
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 400 | MESSAGE_EMPTY | 本文が空 |
| 400 | MESSAGE_TOO_LONG | 本文が長すぎる |
| 401 | UNAUTHORIZED | 未ログイン |
| 403 | ROOM_ACCESS_DENIED | 参加していないルーム |
| 404 | ROOM_NOT_FOUND | ルームが存在しない |
| 500 | INTERNAL_ERROR | メッセージ送信失敗 |

---

# 4.8 API-FILE-01 ファイル送信前チェック

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | POST |
| パス | `/api/files/validate` |
| 認証 | 必要 |
| 概要 | アップロード前にファイル情報を検証する |

## リクエスト

```json
{
  "fileName": "sample.png",
  "mimeType": "image/png",
  "fileSize": 123456,
  "fileKind": "image"
}
```

## バリデーション

| 項目 | ルール |
|---|---|
| fileName | 必須 |
| mimeType | 必須 |
| fileSize | 必須 |
| fileKind | `image` または `file` |
| fileSize | 上限以下 |
| mimeType | 許可リストに含まれる |

## MVPでの制限案

### 画像

| 項目 | 内容 |
|---|---|
| 最大サイズ | 5MB |
| 許可MIME | image/jpeg, image/png, image/webp |

### 一般ファイル

| 項目 | 内容 |
|---|---|
| 最大サイズ | 10MB |
| 許可MIME | application/pdf, text/plain, text/csv, application/zip |

## レスポンス

```json
{
  "success": true,
  "data": {
    "valid": true
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 413 | FILE_TOO_LARGE | ファイルサイズ超過 |
| 415 | FILE_TYPE_NOT_ALLOWED | 許可されていないファイル形式 |
| 401 | UNAUTHORIZED | 未ログイン |
| 500 | INTERNAL_ERROR | 検証失敗 |

---

# 4.9 API-FILE-02 添付付きメッセージ作成

## 基本情報

| 項目 | 内容 |
|---|---|
| メソッド | POST |
| パス | `/api/chat-rooms/:roomId/attachments` |
| 認証 | 必要 |
| 概要 | Supabase Storageへアップロード済みのファイルを、メッセージとしてDB登録する |

## 前提

ファイル本体は、このAPIを呼ぶ前にSupabase Storageへアップロード済みである。

## リクエスト

```json
{
  "type": "image",
  "body": null,
  "attachment": {
    "fileName": "sample.png",
    "filePath": "rooms/room-uuid/temp/sample.png",
    "mimeType": "image/png",
    "fileSize": 123456
  }
}
```

ファイルメッセージの場合:

```json
{
  "type": "file",
  "body": null,
  "attachment": {
    "fileName": "document.pdf",
    "filePath": "rooms/room-uuid/temp/document.pdf",
    "mimeType": "application/pdf",
    "fileSize": 456789
  }
}
```

## バリデーション

| 項目 | ルール |
|---|---|
| type | `image` または `file` |
| attachment.fileName | 必須 |
| attachment.filePath | 必須 |
| attachment.mimeType | 必須 |
| attachment.fileSize | 必須 |
| fileSize | 上限以下 |
| mimeType | 許可リストに含まれる |

## 処理概要

```text
1. ログイン確認
2. 自分のuser_idを取得
3. roomIdの存在確認
4. 自分がroomに参加しているか確認
5. 添付ファイル情報をバリデーション
6. messagesへINSERT
7. message_attachmentsへINSERT
8. 作成したメッセージと添付情報を返す
9. Supabase Realtimeにより購読中の画面へ反映
```

## レスポンス

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "message-uuid",
      "roomId": "room-uuid",
      "senderId": "user-uuid",
      "type": "image",
      "body": null,
      "attachment": {
        "id": "attachment-uuid",
        "fileName": "sample.png",
        "filePath": "rooms/room-uuid/temp/sample.png",
        "mimeType": "image/png",
        "fileSize": 123456
      },
      "createdAt": "2026-07-07T10:00:00Z"
    }
  }
}
```

## エラー

| HTTP | コード | 内容 |
|---:|---|---|
| 400 | VALIDATION_ERROR | 添付情報が不正 |
| 401 | UNAUTHORIZED | 未ログイン |
| 403 | ROOM_ACCESS_DENIED | 参加していないルーム |
| 404 | ROOM_NOT_FOUND | ルームが存在しない |
| 413 | FILE_TOO_LARGE | ファイルサイズ超過 |
| 415 | FILE_TYPE_NOT_ALLOWED | ファイル形式不正 |
| 500 | INTERNAL_ERROR | 添付メッセージ作成失敗 |

---

## 5. Supabase Auth処理

## 5.1 ログイン

Supabase Auth Clientを利用する。

例:

```text
supabase.auth.signInWithOAuth()
```

Googleログインを第一候補とする。

## 5.2 ログアウト

Supabase Auth Clientを利用する。

```text
supabase.auth.signOut()
```

## 5.3 ログイン状態監視

フロントエンドでSupabase Authのセッション状態を監視する。

```text
onAuthStateChange
```

ログイン後に `/api/me` を呼び、アプリ内ユーザーを取得または作成する。

---

## 6. Supabase Realtime設計

## 6.1 購読対象

チャット画面では、開いている `roomId` の `messages` INSERTを購読する。

対象:

```text
table: messages
event: INSERT
filter: room_id = current roomId
```

## 6.2 受信後の処理

```text
1. messages INSERTイベントを受信
2. message_idを取得
3. 必要に応じて添付情報を取得
4. 画面のメッセージ一覧に追加
5. 自分が送ったメッセージとの重複表示を防ぐ
```

## 6.3 注意点

- API送信直後に画面へ即時反映する場合、Realtimeで同じメッセージを二重追加しないようにする
- 画面離脱時に購読解除する
- 接続エラー時は再読み込みまたは再取得で復旧できるようにする

---

## 7. ファイルアップロード設計

## 7.1 全体フロー

MVPでは、ファイルをStorageへアップロードした後、DBにメッセージ情報を登録する。

```text
1. ユーザーがファイルを選択
2. フロント側で簡易チェック
3. `/api/files/validate` でサーバー側チェック
4. Supabase Storageへアップロード
5. `/api/chat-rooms/:roomId/attachments` でDB登録
6. Realtimeで相手画面に反映
```

---

## 7.2 Storageパス

MVPでは以下の形式を採用する。

```text
rooms/{roomId}/{timestamp}_{fileName}
```

例:

```text
rooms/abc-room-uuid/20260707100000_sample.png
```

将来的には `messageId` を含むパスへ変更する。

```text
rooms/{roomId}/{messageId}/{fileName}
```

---

## 7.3 画像表示

画像メッセージの場合、チャット画面内にプレビュー表示する。

対象MIME:

```text
image/jpeg
image/png
image/webp
```

---

## 7.4 ファイル表示

一般ファイルの場合、以下を表示する。

- ファイル名
- ファイルサイズ
- ダウンロードリンク

---

## 8. バリデーション詳細

## 8.1 メッセージ本文

| 項目 | ルール |
|---|---|
| 空文字 | 不可 |
| 空白のみ | 不可 |
| 最大文字数 | 2000文字 |
| 改行 | 許可 |
| HTML | 表示時にエスケープ |

---

## 8.2 画像ファイル

| 項目 | ルール |
|---|---|
| 最大サイズ | 5MB |
| MIME | image/jpeg, image/png, image/webp |
| 拡張子 | jpg, jpeg, png, webp |

---

## 8.3 一般ファイル

| 項目 | ルール |
|---|---|
| 最大サイズ | 10MB |
| MIME | application/pdf, text/plain, text/csv, application/zip |
| 拡張子 | pdf, txt, csv, zip |

---

## 9. API利用フロー

## 9.1 初回ログイン

```text
1. ユーザーがログイン画面を開く
2. Supabase AuthでOAuthログイン
3. ログイン成功
4. `/api/me` を呼ぶ
5. usersに存在しなければ作成
6. `/chats` へ遷移
```

---

## 9.2 チャット開始

```text
1. `/users` を開く
2. `/api/users` でユーザー一覧取得
3. チャットしたい相手を選ぶ
4. `/api/chat-rooms/direct` をPOST
5. 既存ルームまたは新規ルームIDを取得
6. `/chats/{roomId}` へ遷移
```

---

## 9.3 テキストメッセージ送信

```text
1. チャット画面で本文を入力
2. 送信ボタン押下
3. `/api/chat-rooms/{roomId}/messages` をPOST
4. messagesへ保存
5. 送信者画面に反映
6. 受信者画面にはRealtimeで反映
```

---

## 9.4 画像・ファイル送信

```text
1. ファイル選択
2. フロントでサイズ・形式を簡易チェック
3. `/api/files/validate` でサーバー側チェック
4. Supabase Storageへアップロード
5. `/api/chat-rooms/{roomId}/attachments` をPOST
6. messagesとmessage_attachmentsへ保存
7. Realtimeで相手画面に反映
```

---

## 10. セキュリティ方針

## 10.1 API側で必ず確認すること

- ログイン済みか
- アプリ内ユーザーが存在するか
- 対象チャットルームが存在するか
- 自分が対象チャットルームに参加しているか
- 送信者IDをクライアントから信用しない
- ファイルサイズが制限内か
- ファイル形式が許可されているか

---

## 10.2 クライアントから信用しない項目

以下はクライアントから送られても信用しない。

- senderId
- createdAt
- updatedAt
- authUserId
- isAdmin
- roomMember情報

送信者や日時はAPI側・DB側で決定する。

---

## 10.3 RLSとの関係

MVPではまずAPI側でチェックを行う。  
その後、Supabase RLSを有効化し、DBレベルでも保護する。

理想:

```text
API側チェック
  +
Supabase RLS
```

二重に守ることで、不正な直接DBアクセスを防ぎやすくする。

---

## 11. 実装上の共通処理

## 11.1 getCurrentAppUser

API内で共通利用する関数。

役割:

```text
1. Supabase Authセッション取得
2. auth_user_id取得
3. usersテーブルからアプリ内ユーザー取得
4. なければ必要に応じて作成
5. appUserを返す
```

---

## 11.2 assertRoomMember

チャットルーム参加チェック用の共通関数。

役割:

```text
1. roomIdを受け取る
2. appUser.idを受け取る
3. direct_chat_room_membersを検索
4. 存在しなければ403
5. 存在すれば処理継続
```

---

## 11.3 validateMessageBody

テキストメッセージ検証用。

ルール:

```text
・trim後に空ならエラー
・2000文字超過ならエラー
```

---

## 11.4 validateFile

ファイル検証用。

ルール:

```text
・fileName必須
・mimeType必須
・fileSize必須
・画像は5MB以内
・一般ファイルは10MB以内
・MIMEタイプは許可リスト方式
・拡張子も許可リスト方式
```

---

## 12. ディレクトリ構成案

Next.js App Routerを想定する。

```text
app/
├─ api/
│  ├─ me/
│  │  └─ route.ts
│  ├─ users/
│  │  └─ route.ts
│  ├─ chat-rooms/
│  │  ├─ route.ts
│  │  ├─ direct/
│  │  │  └─ route.ts
│  │  └─ [roomId]/
│  │     ├─ route.ts
│  │     ├─ messages/
│  │     │  └─ route.ts
│  │     └─ attachments/
│  │        └─ route.ts
│  └─ files/
│     └─ validate/
│        └─ route.ts
├─ login/
├─ chats/
│  ├─ page.tsx
│  └─ [roomId]/
│     └─ page.tsx
├─ users/
│  └─ page.tsx
└─ profile/
   └─ page.tsx

lib/
├─ supabase/
│  ├─ client.ts
│  ├─ server.ts
│  └─ types.ts
├─ auth/
│  └─ getCurrentAppUser.ts
├─ chat/
│  ├─ assertRoomMember.ts
│  └─ findOrCreateDirectRoom.ts
├─ validation/
│  ├─ message.ts
│  └─ file.ts
└─ api/
   ├─ response.ts
   └─ errors.ts
```

---

## 13. 未決定事項

| 項目 | 状態 |
|---|---|
| Googleログイン以外のOAuth | 未決定 |
| RLSの具体SQL | DB詳細または実装時に決定 |
| Storageバケットの公開/非公開 | Storage設計時に決定 |
| ファイルURLの取得方式 | 実装時に決定 |
| 画像圧縮 | MVPでは対象外 |
| APIテスト方法 | テスト計画で決定 |
| 楽観的UI更新 | フロント実装時に決定 |

---