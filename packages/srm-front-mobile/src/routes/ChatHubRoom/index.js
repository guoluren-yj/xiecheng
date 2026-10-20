import React, { useEffect, useState, useRef } from 'react';
import ChatRoom from '@/components/Chat/Room';
import MessageHandler, { Events, Messages } from '@/components/Chat/Message/message-handler';

const ChatHubRoom = () => {
  const [roomInfo, setRoomInfo] = useState({});
  const cacheRef = useRef({ roomInfo: {} });
  useEffect(() => {
    const loadChatRoom = (data) => {
      setRoomInfo(data.content);
      cacheRef.current.roomInfo = data.content;
    };
    MessageHandler.on(Events.sendLoadChatRoom, loadChatRoom).start();
    MessageHandler.postParentMessage(Messages.sendOnlineChatRoomMessage);
    return () => {
      MessageHandler.cancel(Events.sendLoadChatRoom);
    };
  }, []);

  return (
    <>
      <ChatRoom
        showHeader
        groupSetting
        onlyLoadRoomOnce={false}
        businessCode="source-bidding"
        integratedType="jike"
        memberCountType="company"
        suppliersChatType="single"
        pageStyle="right"
        defaultSubType="none"
        contentStyle={{ width: '100%', height: '100%' }}
        roomParams={roomInfo}
        showClose={false}
        supplierGroupSetting={false}
        purchaseGroupSetting={false}
      />
    </>
  );
};

export default ChatHubRoom;
