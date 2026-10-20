/*
 * @Date: 2025-09-10 10:58:23
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import querystring from 'querystring';
import { Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import EmbedPage from '_components/EmbedPage';

// 行上使用的弹框
export const openAiApproveModal = (props = {}) => {
  const { documentCode, categoryCode, bindObjFieldValue } = props;
  const params = querystring.stringify({
    documentCode,
    categoryCode,
    bindObjFieldValue,
  });
  Modal.open({
    header: null,
    children: (
      <EmbedPage
        href="/pub/smbl/check-result"
        location={{
          search: `?${params}`,
        }}
      />
    ),
    cancelButton: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    drawer: true,
    style: { width: 1100 },
    bodyStyle: { padding: 0 },
  });
};

// 头上使用的弹框
export const headerAiApproveModal = params => {
  Modal.open({
    title: intl.get('sslm.common.button.intelligentReview').d('智能预审'),
    children: <EmbedPage href="/pub/smbl/check-result-card-panel" bindObjList={params} />,
    cancelButton: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    drawer: true,
    style: { width: 1100 },
    bodyStyle: { padding: 0 },
  });
};
