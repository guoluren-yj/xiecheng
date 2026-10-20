import React, {createElement} from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import {isObservable, observable, toJS } from 'mobx';

import chat from "@/assets/chat.svg";


type ChatNumProps = {
    unReadNum?: number | undefined;
    headerId?: string | number | undefined;
};

interface Props {
    icon?: string;
    value?: string;
    idType?: string;
    id?: string | undefined;
    unreadQuantity?: number;
    data?: ChatNumProps | any;
    children?: any;
}

const RenderChat = observer((props: Props) => {
  const { id = '', value = '-', data = [], unreadQuantity, children } = props;

  const renderChatNode = (obj: ChatNumProps | any) => {
    if (isEmpty(obj)) return <span />;
    const num = obj?.unReadNum > 99 ? '99+' : obj?.unReadNum;
    if (!isEmpty(obj) && obj?.unReadNum > 0) {
      return (
        <Tooltip
          key={obj?.headerId}
          title={`${num}${intl.get('sinv.receiptWorkbench.view.tooltip.unreadMessages').d('条在线沟通消息未读')}`}
        >
          <img alt='' src={chat} />
        </Tooltip>
      );
    }
    return <span />;
  };

  const renderMessageNode = () => {
    if (unreadQuantity) {
      const messageLogging = unreadQuantity > 99 ? '99+' : unreadQuantity;
      return (
        <Tooltip
          placement="topRight"
          title={`${messageLogging}${intl
            .get('sinv.receiptExecution.model.receipt.unreadMessage')
            .d('条留言消息未读')}`}
        >
          <span style={{ color: 'red' }}>&#40;{messageLogging}&#41;</span>
        </Tooltip>
      );
    }
  };

  const renderList = () => {
    const link = createElement('a', { href: '#', onClick: children?.props?.onClick }, value);
    const list = isObservable(data) ? observable(data) : [];
    const chatData = toJS(list);
    return (
      <>
        {link}
        {renderMessageNode()}
        {chatData?.map(item => {
          if (item?.headerId === id) {
            return renderChatNode(item);
          }
          return <span />;
        })}
      </>
    );
  };

  return (
    <>
      {renderList()}
    </>
  );
});


export default(RenderChat);
