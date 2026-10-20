/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-26 15:47:27
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from '../index.less';
import HistoricalVersion from '../Details/HistoryVersion';

const handleOpenHistoryVersion = ({ title, strategyId }) => {
  Modal.open({
    title,
    key: Modal.key(),
    movable: false,
    drawer: true,
    okCancel: false,
    style: { width: 742 },
    className: styles['policy-version-history-model'],
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <HistoricalVersion strategyId={strategyId} />,
  });
};

export { handleOpenHistoryVersion };
