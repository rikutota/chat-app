1. ブランチの作成．feat/auth
2. supabaseのproviderでgoogleを有効化
3. google cloud consoleでプロジェクトを作成
4. 「APIとサービス」からgoogleログインの設定
5. SupabaseSQL Editorでアプリ内ユーザーを管理するためのusersテーブルを作った
6. サーバー用Supabase Clientを作成
   1. lib/supabase/server.ts
   2. これはAPI Route側でCookieを読み取り，「このリクエストはログイン済みユーザーから来ているか？」を確認するためのもの
7. getCurrentAppUserを作成した
   1. この関数の役割は
      1. Supabase Authでログイン中ユーザーを確認
      2. usersテーブルに対応するユーザーがいるか探す
      3. いなければ初回ログインとして作成
      4. アプリ内ユーザー情報を返す
   2. 今後，チャットルーム作成やメッセージ送信でも使う
8. /api/meを作成
   1. 今ログインしている自分のユーザー情報を返すAPIを作成