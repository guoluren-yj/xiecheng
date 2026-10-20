/* eslint-disable global-require */
import React, { Fragment, Component } from 'react';
import { Button, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isElementOverflowed } from '@/utils/utils';
import { openTab, getMenuLeafData } from 'utils/menuTab';
import styles from './index.less';

export default class ChatRoomHeader extends Component {
  ref = React.createRef(null);

  titleWithTooltip = false;

  componentDidUpdate() {
    const _titleWithTooltip = isElementOverflowed(this.ref.current);
    if (_titleWithTooltip !== this.titleWithTooltip) {
      this.titleWithTooltip = _titleWithTooltip;
      this.forceUpdate();
    }
  }

  roomNameClick = () => {
    const { roomNameJump, roomInfo, onClose } = this.props;
    const { purchaseFlag, businessUrl } = roomInfo;
    if (!roomNameJump) {
      return;
    }
    try {
      const _businessUrl = JSON.parse(businessUrl);
      const url = purchaseFlag ? _businessUrl?.purPcUrl : _businessUrl?.supPcUrl;
      if (!url) {
        return;
      }
      const menuList = getMenuLeafData();
      let tabInfo = null;
      menuList.forEach(item => {
        if (url.includes(item.path) && (!tabInfo || tabInfo.path.length < item.path.length)) {
          tabInfo = item;
        }
      });
      if (tabInfo) {
        openTab({
          title: tabInfo.title,
          key: tabInfo.path,
          path: url.slice(url.indexOf(tabInfo.path)),
        });
        onClose();
      }
    } catch (error) {
      console.warn('跳转地址解析失败');
    }
  };

  // 点击查看成员列表
  checkGroupMember = () => {
    const { onGroupMemberClick } = this.props;
    if (typeof onGroupMemberClick === 'function') {
      onGroupMemberClick();
    }
  };

  // 点击查看聊天信息
  checkGroupInfo = () => {
    const { onGroupInfoClick } = this.props;
    if (typeof onGroupInfoClick === 'function') {
      onGroupInfoClick();
    }
  };

  // 点击关闭
  close = () => {
    const { onClose } = this.props;
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // 房间人员统计
  getRoomTotalCount = (type, roomInfo) => {
    const countMap = {}; // 统计类型映射map
    const memberList = []; // 需统计的人员列表
    memberList.push(...(roomInfo?.purchase?.members || []));
    (roomInfo?.suppliers || []).forEach(item => {
      memberList.push(...(item?.members || []));
    });
    memberList.forEach(item => {
      const value = item[`${type}Id`];
      if (!value) return;
      countMap[value] = true;
    });
    return Object.keys(countMap).length;
  };

  render() {
    const {
      roomInfo,
      memberCountType = 'company',
      showClose = true,
      groupSetting = true,
      supplierGroupSetting = false,
      purchaseGroupSetting = true,
      groupMemberEnable = true,
    } = this.props;
    const number = roomInfo?.tenantCount
      ? roomInfo?.tenantCount
      : this.getRoomTotalCount(memberCountType, roomInfo);
    const { purchaseFlag } = roomInfo || {};
    const groupSettingEnable =
      groupSetting && (purchaseFlag ? purchaseGroupSetting : supplierGroupSetting);
    return (
      <Fragment>
        <div className={styles['smbl-chat-room-header']}>
          <Tooltip
            placement="bottom"
            title={roomInfo?.roomName}
            trigger={this.titleWithTooltip ? 'hover' : 'false'}
          >
            <div
              className={styles['smbl-chat-room-header-title']}
              ref={this.ref}
              onClick={this.roomNameClick}
            >
              {roomInfo?.roomName}
            </div>
          </Tooltip>
          {(groupMemberEnable || groupSettingEnable) && (
            <div className={styles['smbl-chat-room-header-split']} />
          )}
          {groupMemberEnable && (
            <Tooltip
              placement="bottom"
              title={intl.get('smbl.chat.view.message.checkGroupMember').d('查看成员列表')}
            >
              <Button
                size="small"
                funcType="flat"
                className={styles['smbl-chat-room-peoples-btn']}
                onClick={this.checkGroupMember}
              >
                <img src={require('../../../../../assets/chat_room_peoples.svg')} alt="" />
                <span className={styles['smbl-chat-room-peoples-btn-number']}>{number}</span>
              </Button>
            </Tooltip>
          )}
          {groupSettingEnable && (
            <Tooltip
              placement="bottom"
              title={intl.get('smbl.chat.view.message.checkGroupInfo').d('查看聊天信息')}
            >
              <Button
                size="small"
                funcType="flat"
                icon="more_horiz"
                className={styles['smbl-chat-room-peoples-btn']}
                style={{ borderRadius: '2px', color: '#868D9C' }}
                onClick={this.checkGroupInfo}
              />
            </Tooltip>
          )}
          {showClose && (
            <Button
              funcType="flat"
              icon="close"
              className={styles['smbl-chat-room-header-close-btn']}
              onClick={this.close}
            />
          )}
        </div>
      </Fragment>
    );
  }
}
