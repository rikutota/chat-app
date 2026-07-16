import { NextResponse } from 'next/server';
import { getCurrentAppUser } from '@/lib/auth/getCurrentAppUser';
import { createServerSupabaseClient } from '@/lib/supabase/server';

type RequestBody = {
  partnerUserId?: string;
};

type DirectChatRoomMember = {
  room_id: string;
};

/**
 * 1対1チャットルームを作成、または既存ルームを取得するAPI。
 *
 * 同じ2人の間にチャットルームが複数作られないように、
 * まず既存ルームを探し、なければ新規作成する。
 */
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentAppUser();
    const supabase = await createServerSupabaseClient();

    const body = (await request.json()) as RequestBody;
    const partnerUserId = body.partnerUserId;

    if (!partnerUserId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'チャット相手が指定されていません。',
          },
        },
        { status: 400 },
      );
    }

    if (partnerUserId === currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PARTNER',
            message: '自分自身とはチャットを開始できません。',
          },
        },
        { status: 400 },
      );
    }

    /**
     * 指定された相手ユーザーが実在するか確認する。
     *
     * 存在しないユーザーIDでチャットルームを作ると、
     * 不正な参加者データが作られる可能性があるため先に検証する。
     */
    const { data: partnerUser, error: partnerUserError } = await supabase
      .from('users')
      .select('id')
      .eq('id', partnerUserId)
      .maybeSingle();

    if (partnerUserError) {
      console.error('partner user select error:', partnerUserError);
      throw new Error('FAILED_TO_FETCH_PARTNER_USER');
    }

    if (!partnerUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PARTNER_NOT_FOUND',
            message: 'チャット相手が見つかりません。',
          },
        },
        { status: 404 },
      );
    }

    /**
     * 自分が参加しているチャットルーム一覧を取得する。
     *
     * その中に相手も参加しているルームがあれば、
     * 既存の1対1チャットルームとして再利用する。
     */
    const { data: myRoomMembers, error: myRoomMembersError } = await supabase
      .from('direct_chat_room_members')
      .select('room_id')
      .eq('user_id', currentUser.id);

    if (myRoomMembersError) {
      console.error('my room members select error:', myRoomMembersError);
      throw new Error('FAILED_TO_FETCH_MY_ROOMS');
    }

    const myRoomIds = ((myRoomMembers ?? []) as DirectChatRoomMember[]).map(
      (member) => member.room_id,
    );

    if (myRoomIds.length > 0) {
      const { data: existingPartnerMember, error: existingPartnerMemberError } =
        await supabase
          .from('direct_chat_room_members')
          .select('room_id')
          .eq('user_id', partnerUserId)
          .in('room_id', myRoomIds)
          .maybeSingle();

      if (existingPartnerMemberError) {
        console.error(
          'existing partner member select error:',
          existingPartnerMemberError,
        );
        throw new Error('FAILED_TO_FETCH_EXISTING_ROOM');
      }

      if (existingPartnerMember) {
        return NextResponse.json({
          success: true,
          data: {
            roomId: existingPartnerMember.room_id,
            created: false,
          },
        });
      }
    }

    /**
     * 既存ルームがなければ、新しいチャットルームを作る。
     */
    const { data: createdRoom, error: createRoomError } = await supabase
      .from('direct_chat_rooms')
      .insert({})
      .select('id')
      .single();

    if (createRoomError || !createdRoom) {
      console.error('direct chat room insert error:', createRoomError);
      throw new Error('FAILED_TO_CREATE_ROOM');
    }

    /**
     * 作成したルームに、自分と相手の2人を参加者として登録する。
     */
    const { error: membersInsertError } = await supabase
      .from('direct_chat_room_members')
      .insert([
        {
          room_id: createdRoom.id,
          user_id: currentUser.id,
        },
        {
          room_id: createdRoom.id,
          user_id: partnerUserId,
        },
      ]);

    if (membersInsertError) {
      console.error('direct chat room members insert error:', membersInsertError);
      throw new Error('FAILED_TO_CREATE_ROOM_MEMBERS');
    }

    return NextResponse.json({
      success: true,
      data: {
        roomId: createdRoom.id,
        created: true,
      },
    });
  } catch (error) {
    console.error('/api/chat-rooms/direct error:', error);

    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'ログインが必要です。',
          },
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'チャットルームの作成に失敗しました。',
        },
      },
      { status: 500 },
    );
  }
}