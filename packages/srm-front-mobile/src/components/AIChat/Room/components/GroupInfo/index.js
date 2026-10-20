import React, { Component } from 'react';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Button, Icon, Modal, Form, DataSet, TextArea } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { renameRoomDS, announcementDS } from './indexDS';
import styles from './index.less';

export default class GroupInfo extends Component {
  renameRoom = () => {
    const { roomInfo } = this.props;
    const renameDataSet = new DataSet(renameRoomDS());
    renameDataSet.loadData([
      {
        businessTitle: roomInfo.roomName,
        roomId: roomInfo.roomId,
        companyId: roomInfo.currentUser?.companyId,
      },
    ]);
    Modal.open({
      drawer: true,
      title: intl.get('smbl.chat.view.title.renameRoom').d('修改群名称'),
      style: { width: 380 },
      children: (
        <Form dataSet={renameDataSet} labelLayout="float">
          <TextArea name="businessTitle" showLengthInfo />
        </Form>
      ),
      onOk: async () => {
        const result = await renameDataSet.validate();
        if (!result) return false;
        if (!renameDataSet.dirty) return true;
        const response = await renameDataSet.submit();
        return !!getResponse(response);
      },
    });
  };

  modifyRoomNotice = () => {
    const { announcement, roomInfo } = this.props;
    const announcementDataSet = new DataSet(announcementDS());
    announcementDataSet.loadData([
      {
        roomId: roomInfo.roomId,
        msgContent: announcement,
        senderCompanyId: roomInfo.currentUser?.companyId,
      },
    ]);
    Modal.open({
      drawer: true,
      title: intl.get('smbl.chat.view.title.modifyNotice').d('修改群公告'),
      style: { width: 380 },
      contentStyle: { height: '100%' },
      bodyStyle: { height: '100%' },
      children: (
        <Form dataSet={announcementDataSet} labelLayout="float">
          <TextArea name="msgContent" showLengthInfo resize="vertical" />
        </Form>
      ),
      onOk: async () => {
        const result = await announcementDataSet.validate();
        if (!result) return false;
        if (!announcementDataSet.dirty) return true;
        const response = await announcementDataSet.submit();
        return !!getResponse(response);
      },
    });
  };

  render() {
    const { pageStyle, onClose, roomInfo, announcement } = this.props;
    const groupMemberClass = classnames(styles['smbl-chat-room-group-info'], {
      [styles['smbl-chat-room-group-info-cover']]: pageStyle === 'cover',
      [styles['smbl-chat-room-group-info-right']]: pageStyle !== 'cover',
    });

    const GroupInfoItem = ({ title, content, showArrow = true, onClick }) => {
      return (
        <div className={styles['smbl-chat-room-group-info-item']}>
          <div className={styles['smbl-chat-room-group-info-item-title']}>{title}</div>
          <div
            className={styles['smbl-chat-room-group-info-item-content']}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
          >
            <div>{content}</div>
            {showArrow && (
              <Icon
                type="keyboard_arrow_right"
                className={styles['smbl-chat-room-group-info-item-content-arrow']}
              />
            )}
          </div>
        </div>
      );
    };

    return (
      <div className={groupMemberClass}>
        <Button
          className={styles['smbl-chat-room-group-info-close-btn']}
          funcType="flat"
          icon="close"
          onClick={onClose}
        />
        <div className={styles['smbl-chat-room-group-info-title']}>
          {intl.get('smbl.chat.view.title.chatRoomInfo').d('聊天信息')}
        </div>
        <GroupInfoItem
          title={intl.get('smbl.chat.model.room.groupName').d('群聊名称')}
          content={roomInfo.roomName}
          onClick={roomInfo.purchaseFlag && this.renameRoom}
        />
        <GroupInfoItem
          title={intl.get('smbl.chat.model.room.groupNotice').d('群公告')}
          content={announcement || intl.get('smbl.chat.model.room.noSetting').d('未设置')}
          onClick={roomInfo.purchaseFlag && this.modifyRoomNotice}
        />
      </div>
    );
  }
}
