-- Sprint 2: 1対1チャットルーム用テーブル作成
--
-- direct_chat_rooms:
--   1対1チャットルーム本体を管理する。
--
-- direct_chat_room_members:
--   どのユーザーがどのチャットルームに参加しているかを管理する。
--
-- 注意:
--   このSQLはSupabase SQL Editorで実行済みの内容を、
--   リポジトリ上に履歴として残すためのもの。

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

notify pgrst, 'reload schema';