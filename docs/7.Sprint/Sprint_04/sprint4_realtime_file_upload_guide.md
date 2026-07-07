# Sprint 4 実装ガイド: Realtime・画像/ファイル送信

## 1. 目的

Sprint 4 の目的は、チャット体験をMVP要件まで引き上げることです。  
具体的には、メッセージのリアルタイム更新、画像送信、ファイル送信を実装します。

---

## 2. ゴール

```text
・相手の画面に新着メッセージがリアルタイムで表示される
・画像を送信できる
・画像をチャット画面に表示できる
・ファイルを送信できる
・ファイル名とサイズを表示できる
・ファイルサイズと形式の制限が効く
```

---

## 3. 作るもの

| 種類 | 成果物 |
|---|---|
| DB | message_attachments |
| Supabase | Storage bucket |
| Supabase | Realtime設定 |
| API | `POST /api/files/validate` |
| API | `POST /api/chat-rooms/:roomId/attachments` |
| 共通関数 | `validateFile` |
| 共通関数 | `sanitizeFileName` |
| 共通関数 | `formatFileSize` |
| UI | ImageMessage |
| UI | FileMessage |
| UI | AttachmentButton |
| 機能 | Realtime購読 |
| 機能 | Storageアップロード |

---

## 4. 作業ブランチ

```bash
git checkout develop
git pull
git checkout -b feat/realtime-file-upload
```

---

## 5. 作業手順

## 5.1 message_attachmentsテーブル作成

```sql
create table if not exists public.message_attachments (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null unique references public.messages(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  mime_type text not null,
  file_size integer not null check (file_size > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_message_attachments_message_id
on public.message_attachments(message_id);
```

---

## 5.2 Storage bucket作成

Supabase Storageで以下のbucketを作成します。

```text
chat-attachments
```

MVPではPublicで検証してもよいです。  
本格公開ではPrivate + Signed URLを検討します。

---

## 5.3 Realtime設定確認

`messages` テーブルのINSERTを購読できる状態にします。

確認:

```text
・messages INSERTがRealtime対象になっている
・room_idでfilterできる
```

---

## 5.4 チャット画面にRealtime購読を追加

対象:

```text
app/chats/[roomId]/page.tsx
```

処理:

```text
1. チャット画面表示時にmessages INSERTを購読
2. room_idが現在のroomIdのものだけ受け取る
3. 既に表示済みのmessageIdなら追加しない
4. 未表示ならmessage詳細を取得して追加
5. 画面離脱時に購読解除
```

コメントすること:

```text
・room単位で購読している理由
・二重表示を防ぐ理由
・画面離脱時に解除する理由
```

---

## 5.5 ファイル検証API実装

作成ファイル:

```text
app/api/files/validate/route.ts
```

処理:

```text
1. ログイン確認
2. fileName, mimeType, fileSize, fileKindを受け取る
3. fileKindがimage/fileか確認
4. サイズ制限を確認
5. MIMEタイプを確認
6. OKならvalid trueを返す
```

---

## 5.6 添付付きメッセージAPI実装

作成ファイル:

```text
app/api/chat-rooms/[roomId]/attachments/route.ts
```

処理:

```text
1. getCurrentAppUser
2. assertRoomMember
3. typeがimage/fileか確認
4. attachment情報を検証
5. messagesへinsert
6. message_attachmentsへinsert
7. メッセージと添付情報を返す
```

---

## 5.7 フロントでStorageアップロード実装

処理:

```text
1. ファイル選択
2. フロント側で簡易チェック
3. /api/files/validate
4. Storageへupload
5. /api/chat-rooms/:roomId/attachments
6. 画面に追加
```

Storage path例:

```text
rooms/{roomId}/{timestamp}_{safeFileName}
```

---

## 5.8 ImageMessage / FileMessage実装

画像メッセージ:

```text
・画像プレビュー
・ファイル名
・送信日時
```

ファイルメッセージ:

```text
・ファイル名
・ファイルサイズ
・ダウンロードリンク
・送信日時
```

---

## 6. タスク一覧

| ID | タスク | 優先度 | 完了条件 |
|---|---|---|---|
| S4-01 | Realtime設定確認 | High | messages INSERTを購読できる |
| S4-02 | Realtime購読実装 | High | 相手画面に自動反映 |
| S4-03 | 二重表示対策 | High | 同じmessageが重複しない |
| S4-04 | attachmentsテーブル | High | 添付情報を保存できる |
| S4-05 | Storage bucket作成 | High | chat-attachmentsがある |
| S4-06 | ファイル検証API | High | サイズ・形式チェックできる |
| S4-07 | Storageアップロード | High | ファイルを保存できる |
| S4-08 | 添付メッセージAPI | High | attachment付きmessageを作れる |
| S4-09 | 画像表示 | High | 画像プレビューできる |
| S4-10 | ファイル表示 | High | ファイル名・サイズ表示 |
| S4-11 | アップロード中UI | Medium | 送信中が分かる |
| S4-12 | エラー処理 | High | 不正ファイルでエラー表示 |
| S4-13 | 動作確認 | High | 2ユーザーで確認済み |

---

## 7. 動作確認

```text
・User AとUser Bで同じroomを開く
・User Aがテキスト送信
・User B画面に自動表示される
・User A画面で二重表示されない
・画像png/jpg/webpを送信できる
・画像がプレビュー表示される
・pdf/txt/csv/zipを送信できる
・ファイル名とサイズが表示される
・5MB超の画像は送れない
・10MB超のファイルは送れない
・exe/htmlなどは送れない
```

---

## 8. コミット例

```bash
git add .
git commit -m "feat: Realtimeとファイル送信を追加"
```

---

## 9. このSprintでやらないこと

```text
・スマホ最適化
・既読
・未読数
・プッシュ通知
・Storageの厳密なPrivate運用
```
