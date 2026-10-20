/**
 * 即刻3.0助手开通页
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import React, { memo } from 'react';
import CLN from 'classnames';
import intl from 'utils/intl';
import { Tag } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { CHAT_PANEL_TYPE } from '../constant';
import { getText } from '../utils';
import MessageHandler, { Messages } from '@/components/Chat/Message/message-handler';
import styles from './index.less';

const AssistantOpen = (props) => {
  const { className, activeRoom, setPanelType, setShowContent } = props;
  const isOpen = !!activeRoom?.openFlag; // 是否开通

  const onButtonClick = () => {
    if (isOpen) {
      setPanelType(CHAT_PANEL_TYPE.MESSAGE);
      setShowContent(activeRoom.type);
    } else {
      const tabInfo = {
        key: '/spfm/amkt-appstore',
        path: '/spfm/amkt-appstore',
        title: intl.get('spfm.certificateAuthority.view.message.title.appstore').d('应用商店'),
      };
      MessageHandler.postParentMessage(Messages.openNewTab, tabInfo, 'tabInfo');
    }
  };

  return (
    <div className={CLN(styles['assistant-open'], 'flex', className)}>
      <div className={CLN(styles['assistant-open-inner'], 'flex-column')}>
        <div className={CLN(styles['assistant-open-info'], 'flex')}>
          <div className={CLN(styles['assistant-open-info-left'], 'flex-column')}>
            <span>{getText(activeRoom.roomName)}</span>
            {isOpen ? (
              <Tag color="green">{intl.get('smbl.chatHub.tag.assistant.open').d('已开通')}</Tag>
            ) : (
              <Tag color="orange">{intl.get('smbl.chatHub.tag.assistant.notOpen').d('未开通')}</Tag>
            )}
          </div>
          <img src={activeRoom.icon} alt="" />
        </div>
        <div className={styles['assistant-open-desc']}>{getText(activeRoom.description)}</div>
        <Button color="primary" style={{ maxWidth: '100%' }} onClick={onButtonClick}>
          {isOpen
            ? intl.get('smbl.chatHub.view.button.use').d('去使用')
            : intl.get('smbl.chatHub.view.button.open').d('开通')}
        </Button>
      </div>
    </div>
  );
};

export default memo(AssistantOpen);
