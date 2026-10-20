/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-18 17:43:15
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-01 17:45:49
 */
import React from 'react';
import intl from 'utils/intl';
import { Modal } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import BillDetailModal from '@/routes/components/BillDetailModal.js';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

const ExecutionBillDetail = function ExecutionBillDetail({ record, customizeTable }) {
  const openModal = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '742px' },
      bodyStyle: { paddingTop: '20px' },
      title: intl
        .get(`sprm.purchaseRequisitionInquiry.view.message.title.executionBillDetail`)
        .d('执行单据详情'),
      children: (
        <BillDetailModal
          prLineId={record.get('prLineId')}
          uomPrecision={record.get('uomPrecision')}
          pubPathFlag
          enableDisplayTabs
          customizeTable={customizeTable}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      onOk: () => {},
      okText: intl.get('hzero.common.status.closed').d('关闭'),
      footer: (okBtn) => okBtn,
    });
  };

  return (
    <>
      <a onClick={() => openModal()}>
        {intl.get(`${commonPrompt}.executionBillDetail`).d('执行单据详情')}
      </a>
    </>
  );
};

export default withRouter(ExecutionBillDetail);
