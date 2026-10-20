/*
 * ListTooltip - 列表上【智能审核】列的渲染
 * @Date: 2026-03-30 10:03:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React from 'react';
import { Badge } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { renderStatus } from '@/routes/components/utils';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

const ListTooltip = params => {
  return (
    <Tooltip
      theme="light"
      placement="bottom"
      popupStyle={{ minWidth: 120 }}
      title={
        <div style={{ margin: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <Badge status="success" />
            <span>{intl.get('sslm.common.intelligentReview.passNum').d('通过数量')}</span>
            <span style={{ float: 'right' }}>{params.record?.get('aiApprovedCount') || 0}</span>
          </div>
          <div>
            <Badge status="error" />
            <span>{intl.get('sslm.common.intelligentReview.notPassNum').d('不通过数量')}</span>
            <span style={{ float: 'right' }}>{params.record?.get('aiRejectedCount') || 0}</span>
          </div>
        </div>
      }
    >
      {renderStatus({ ...params, IconComp: IntelligentReviewIcon })}
    </Tooltip>
  );
};

export default ListTooltip;
