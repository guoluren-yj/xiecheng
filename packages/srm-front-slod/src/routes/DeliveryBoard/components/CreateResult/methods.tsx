/**
* index.tsx
* @date: 2023-02-07
* @author: zuoxiangyu <xiangyu.zuo@going-link.com>
* @version: 0.0.1
* @copyright Copyright (c) 2023, Hand
*/

import React from 'react';
// import moment from 'moment';
import { Tag } from 'choerodon-ui';

import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SLOD } from 'srm-front-boot/lib/utils/config.js';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

const organizationId = getCurrentOrganizationId();

const renderStatus = (code, meaning) => {
    const colorConfigList = [
      {
        // 绿色
        status: [2],
        color: '#ebf7f1',
        style: { color: '#47b883' },
      },
      {
        // 红色
        status: [3],
        color: ' #ffeeeb',
        style: { color: '#f56649' },
      },
    ];
    const colorConfig = colorConfigList.find((i) => i.status.includes(Number(code)));
    return (
      <Tag color={colorConfig?.color} style={colorConfig?.style}>
        {meaning}
      </Tag>
    );
  };

function lineColumns():any {
const nodeColumns = [
    {
        width: 140,
        type: 'string',
        name: 'processStatusMeaning',
        label: intl.get('slod.deliveryBoard.model.receipt.result').d('结果'),
        renderer: ({ value, record }) => renderStatus(record?.get('processStatus'), value),
    },
    {
        width: 140,
        type: 'string',
        name: 'nodeConfigName',
        label: intl.get('slod.deliveryBoard.model.receipt.deliveryNode').d('节点'),
    },
    {
        width: 140,
        type: 'string',
        name: 'lastUpdateDate',
        label: intl.get('slod.deliveryBoard.model.receipt.creationDates').d('操作时间'),
        // renderer: ({ value }) => value && moment(value).format('YYYY-MM-DD'),
    },
    {
        width: 140,
        type: 'string',
        name: 'processMessage',
        label: intl.get('slod.deliveryBoard.model.receipt.resMsg').d('返回信息'),
    },
];

// 收货查询
    const lineFetchList = (data) => {
        const {params} = data;
        const queryData = filterNullValueObject({ ...data, ...params });
return {
url: `${SRM_SLOD}/v1/${organizationId}/delivery/auto-create-record/page?campKey=p`,
method: 'GET',
data: queryData,
};
};

return { nodeColumns, lineFetchList };
};

export { lineColumns };
