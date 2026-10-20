import React, { useCallback, useState } from 'react';
import { Modal, Checkbox, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import styles from './index.less';
import { ReactComponent as ToastImg } from '../../assets/illustrator_notice_new.svg';

function SystemNotificationModal(props = {}) {
  const currentOrganizationId = getCurrentOrganizationId();
  const [modalVisible, handleModalVisible] = useState(true);
  const [unShowFlag, handleUnShowFlag] = useState(currentOrganizationId !== 0);

  const onChange = (e) => {
    handleUnShowFlag(e.target && e.target.checked);
  };

  const setUnShowFlag = () => {
    const { readNotice, cancel, noticeId } = props;
    if (readNotice) {
      readNotice(noticeId);
    }
    if (cancel) {
      cancel(noticeId).then((res) => {
        if (res) {
          handleModalVisible(false);
        }
      });
    }
  };

  const goDetail = useCallback(() => {
    getDvaApp()._store.dispatch(
      // routerRedux为window上的属性，如报错，请检查是否设置到window上
      // eslint-disable-next-line no-undef
      routerRedux.push({
        pathname: `/spfm/notices/previewOnly/${props.noticeId}`,
      })
    );
    if (unShowFlag) {
      setUnShowFlag(unShowFlag);
    } else {
      handleModalVisible(false);
    }
  }, [props.noticeId, unShowFlag]);

  return (
    <Modal
      visible={modalVisible}
      wrapClassName={styles['self-modal-notice']}
      footer={null}
      width={600}
      zIndex={props.priority ? props.priority + 1000000 : 1000000}
      maskStyle={{ backgroundColor: 'rgba(0,0,0,.25)' }}
      onCancel={() => {
        handleModalVisible(false);
      }}
    >
      <div className="self-modal-header">
        <ToastImg />
      </div>
      <div className="self-modal-title">{props.title}</div>
      <div className="self-modal-content">
        <div dangerouslySetInnerHTML={{ __html: props.content }} />
      </div>
      <div className="self-modal-footer">
        <Checkbox value={unShowFlag} onChange={onChange}>
          {intl.get('hzero.common.systemNotification.message.checkbox').d('不再提示')}
        </Checkbox>
        <Button className="go-info" onClick={goDetail}>
          {intl.get('hzero.common.button.details').d('查看详情')}
        </Button>
        <Button
          type="primary"
          className="go-info"
          style={{ margin: '0 20px 0 16px' }}
          onClick={() => {
            if (unShowFlag) {
              setUnShowFlag(unShowFlag);
            } else {
              handleModalVisible(false);
            }
          }}
        >
          {intl.get('hzero.common.systemNotification.modal.button').d('已读')}
        </Button>
      </div>
    </Modal>
  );
}

export default SystemNotificationModal;
