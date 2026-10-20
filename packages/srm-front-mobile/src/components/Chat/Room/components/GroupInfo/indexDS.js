import intl from 'utils/intl';
import { SRM_SMBL } from '_utils/config';

export const renameRoomDS = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'businessTitle',
      label: intl.get('smbl.chat.model.room.groupName').d('群聊名称'),
      maxLength: 500,
      required: true,
    },
  ],
  transport: {
    submit: ({ data }) => {
      const body = data.length ? data[0] : data;
      return {
        url: `${SRM_SMBL}/v1/chat-online/room/rename-room`,
        method: 'POST',
        data: body,
      };
    },
  },
});

export const announcementDS = () => ({
  autoQuery: false,
  fields: [
    {
      name: 'msgContent',
      label: intl.get('smbl.chat.model.room.groupNotice').d('群公告'),
    },
  ],
  transport: {
    submit: ({ data }) => {
      const body = data.length ? data[0] : data;
      return {
        url: `${SRM_SMBL}/v1/chat-online/messages/publish-announcement`,
        method: 'POST',
        data: body,
      };
    },
  },
});
