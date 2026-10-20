/*
 * 供应商历史报价
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';

import intl from 'srm-front-boot/lib/utils/intl/index.js';
import TabsChildren from './Component';
import './index.less';

const HistoryButton = props => {
  const {
    title = '',
    btnText = '',
    activeTab,
    versionNumber = 0,
    extSourceReqId,
    supplierCompanyId,
  } = props;

  const handleHistoryClick = () => {
    Modal.open({
      title: intl
        .get('sslm.outsideProjectSetup.modal.quotationHistory', { name: title })
        .d(`{name}历史报价`),
      drawer: true,
      key: Modal.key(),
      style: { width: '1090px' },
      bodyStyle: { padding: 0 },
      children: (
        <TabsChildren
          activeTab={activeTab}
          versionNumber={versionNumber}
          extSourceReqId={extSourceReqId}
          supplierCompanyId={supplierCompanyId}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: okBtn => okBtn,
    });
  };

  return (
    <Button funcType="link" disabled={versionNumber === 0} onClick={handleHistoryClick}>
      {btnText}
    </Button>
  );
};

export default HistoryButton;
