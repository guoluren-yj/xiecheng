import React, { Fragment } from 'react';
import { Modal, Button, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import {
  saveBidAnnouncement,
  submitBidAnnouncement,
  queryBidAnnouncement,
} from '@/services/inquiryHallService';

import Container from './Container';
import { formDS, contentTableDS, targetTableDS } from './indexDS';

const useBidAnnouncementModal = () => {
  const openBidAnnouncementModal = (props) => {
    const { rfxHeaderId } = props;
    const formDs = new DataSet(formDS());
    const contentTableDs = new DataSet(contentTableDS());
    const targetTableDs = new DataSet(targetTableDS());

    // 初始化
    const init = async () => {
      const res = await queryBidAnnouncement({ rfxHeaderId });
      if (getResponse(res)) {
        formDs.loadData([res]);
        if (formDs?.current?.get('bidAnnouncementContent') !== 'ALL_SUPPLIER') {
          contentTableDs.loadData(res.supplierLineContentList);
        }
        if (formDs?.current?.get('bidAnnouncementTarget') !== 'ALL_SUPPLIER') {
          targetTableDs.loadData(res.supplierLineTargetList);
        }
      }
    };

    // 保存提交
    const handleOk = async (type = '') => {
      const { current } = formDs || {};
      let params = {};
      if (
        current?.get('bidAnnouncementContent') !== 'ALL_SUPPLIER' &&
        current?.get('bidAnnouncementTarget') !== 'ALL_SUPPLIER'
      ) {
        params = {
          ...current?.toData(),
          supplierLineContentList: contentTableDs?.toData(),
          supplierLineTargetList: targetTableDs?.toData(),
        };
      } else if (
        current?.get('bidAnnouncementContent') === 'ALL_SUPPLIER' &&
        current?.get('bidAnnouncementTarget') !== 'ALL_SUPPLIER'
      ) {
        params = {
          ...current?.toData(),
          supplierLineTargetList: targetTableDs?.toData(),
        };
      } else if (
        current?.get('bidAnnouncementContent') !== 'ALL_SUPPLIER' &&
        current?.get('bidAnnouncementTarget') === 'ALL_SUPPLIER'
      ) {
        params = {
          ...current?.toData(),
          supplierLineContentList: contentTableDs?.toData(),
        };
      } else {
        params = {
          ...current?.toData(),
        };
      }

      let res;
      if (type === 'submit') {
        res = await submitBidAnnouncement(params);
      } else if (type === 'save') {
        res = await saveBidAnnouncement(params);
      }
      if (getResponse(res)) {
        notification.success();
        if (type === 'save') {
          init();
          return false;
        }
        return true;
      }
      return false;
    };

    const Props = {
      init,
      formDs,
      contentTableDs,
      targetTableDs,
      rfxHeaderId,
    };

    Modal.open({
      key: Modal.key(),
      title: intl.get('ssrc.common.model.common.bidAnnouncement').d('唱标'),
      children: <Container {...Props} />,
      style: { width: '742px' },
      drawer: true,
      closable: true,
      onOk: () => handleOk('submit'),
      okText: intl.get(`ssrc.common.model.common.publish`).d('发布'),
      footer: (okBtn, cancelBtn) => {
        return (
          <Fragment>
            {okBtn}
            <Button
              onClick={async () => {
                await handleOk('save');
              }}
            >
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.onlySaveButton`).d('仅保存')}
            </Button>
            {cancelBtn}
          </Fragment>
        );
      },
    });
  };
  return {
    openBidAnnouncementModal,
  };
};

export default useBidAnnouncementModal;
