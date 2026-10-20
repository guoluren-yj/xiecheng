import React, { useState, useCallback } from 'react';
import intl from 'utils/intl';
import { noop, isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { Modal } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';

import SubAccount from '@/routes/components/SubAccount';
import { transfer } from '@/services/inquiryHallService';
import { batchTransfer } from '@/services/inquiryHallNewService';

/**
 * 转交按钮
 */
const TransferButton = (props) => {
  const {
    transferPermissionCodePrefix,
    sectionBiddingRef = {},
    afterTransferOk = noop,
    record: { rfxHeaderId } = {},
    organizationId,
    bidFlag,
  } = props;

  const [subAccountVisible, setSubAccountVisible] = useState(false);

  // 显示开标人子账户
  const showExpertModal = () => {
    setSubAccountVisible(true);
  };

  // 开标转交逻辑
  const handleTransfer = useCallback(
    async (selectRow, otherParams = {}) => {
      if (isEmpty(selectRow)) {
        notification.warning({
          message: intl
            .get('hzero.common.message.confirm.selected.atLeast')
            .d('请至少选择一行数据'),
        });
        return;
      }
      const { state: { checkedList = [] } = {} } = sectionBiddingRef.current || {};
      const { id } = selectRow;
      let result;
      try {
        if (checkedList.length) {
          result = getResponse(
            await batchTransfer({
              organizationId,
              openUserId: id,
              rfxHeaderId,
              projectLineSectionList: checkedList,
              ...otherParams,
            })
          );
        } else {
          result = getResponse(
            await transfer({ rfxHeaderId, openDeliverUserId: id, ...otherParams })
          );
        }
        if (result && !result.failed) {
          // 转交成功逻辑
          afterTransferOk();
          Modal.destroyAll();
        }
      } catch (err) {
        throw err;
      } finally {
        setSubAccountVisible(false);
      }
    },
    [rfxHeaderId, organizationId, sectionBiddingRef]
  );

  // 关闭开标人子账户弹框
  const closeTransferModal = () => {
    setSubAccountVisible(false);
  };

  // 开标人子账户弹框属性
  const expertModalProps = {
    visible: subAccountVisible,
    onOk: handleTransfer,
    onCancel: closeTransferModal,
    bidFlag,
  };

  return (
    <>
      <PermissionButton
        onClick={showExpertModal}
        type="c7n-pro"
        icon="call_missed_outgoing"
        permissionList={[
          {
            code: `${transferPermissionCodePrefix}.button.transfer`,
            type: 'button',
            meaning:
              intl.get(`ssrc.inquiryHall.view.message.button.confirmOpeningBid`).d('确认开标') -
              intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交'),
          },
        ]}
      >
        {intl.get(`ssrc.inquiryHall.view.message.button.transfer`).d('转交')}
      </PermissionButton>
      {subAccountVisible && <SubAccount {...expertModalProps} />}
    </>
  );
};

export default TransferButton;
