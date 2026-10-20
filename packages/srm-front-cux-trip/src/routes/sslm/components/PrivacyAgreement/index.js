/*
 * @Date: 2022-12-30 10:24:19
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';

import './index.less';
import AgreementDetail from './AgreementDetail';

export const getAgreementModal = props => {
  Modal.open({
    header: null,
    border: false,
    style: { width: 600 },
    bodyStyle: { padding: 0 },
    footer: null,
    className: 'sslm-agreement-modal',
    children: <AgreementDetail {...props} />,
  });
};
