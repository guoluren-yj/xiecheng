/**
 * 即刻3.0最左侧菜单选项（消息/助手）
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { useRef, memo } from 'react';
import CLN from 'classnames';
import intl from 'utils/intl';
import MessageIcon from '@/assets/icons/message.png';
import AssistatntIcon from '@/assets/icons/assistant.png';
import { CHAT_PANEL_TYPE } from '../../constant';
import styles from './index.less';

const PanelTypeList = (props) => {
  const { panelType, aiOpenFlag, panelTypeChange } = props;
  const cacheRef = useRef({
    chatTypeList: [
      {
        type: CHAT_PANEL_TYPE.MESSAGE,
        // title: intl.get('smbl.chatHub.view.planeType.message').d('消息'),
        title: intl.get('smbl.chatHub.model.search.contacts').d('聊天室'),
        icon: MessageIcon,
      },
      // {
      //   type: CHAT_PANEL_TYPE.ASSISTANT,
      //   title: intl.get('smbl.chatHub.view.planeType.assistant').d('助手'),
      //   icon: AssistatntIcon,
      // },
      aiOpenFlag === 'true' && {
        type: CHAT_PANEL_TYPE.AI_ASSISTANT,
        title: intl.get('smbl.chatHub.view.planeType.aiAgent').d('AI助理'),
        icon: AssistatntIcon,
      },
    ].filter(Boolean),
  });

  return (
    <div className={CLN(styles['chat-type'], 'flex-column')}>
      {cacheRef.current.chatTypeList.map((item) => (
        <div
          className={CLN(styles['chat-type-item'], 'flex-column', 'flex-center', {
            [styles.active]: item.type === panelType,
          })}
          key={item.type}
          onClick={() => {
            panelTypeChange(item.type);
          }}
        >
          <img src={item.icon} alt={item.title} />
          <span>{item.title}</span>
        </div>
      ))}
    </div>
  );
};

export default memo(PanelTypeList);
