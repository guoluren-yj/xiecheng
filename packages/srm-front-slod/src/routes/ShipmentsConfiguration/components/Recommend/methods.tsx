/**
* index.tsx
* @date: 2023-06-016
* @author: zuoxiangyu <xiangyu.zuo@going-link.com>
* @version: 0.0.1
* @copyright Copyright (c) 2023, Hand
*/

import React from 'react';
// import moment from 'moment';
import { Modal, Button } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SLOD } from 'srm-front-boot/lib/utils/config.js';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import DetailIndex from '../../ShipmentsStrategy/Detail';

const organizationId = getCurrentOrganizationId();

function lineColumns(): any {
    const nodeColumns = [
        {
            name: 'strategyCode',
            type: 'string',
            label: intl.get('slod.shipmentsConfiguration.model.strategyCode').d('策略编码'),
        },
        {
            name: 'strategyName',
            type: 'intl',
            label: intl.get('slod.shipmentsConfiguration.model.strategyName').d('策略描述'),
        },
        {
            name: 'sourceCode',
            type: 'string',
            label: intl.get('slod.shipmentsConfiguration.model.sourceCode').d('来源单据'),
            lookupCode: 'SLOD.STRATEGY_SOURCE',
        },
        {
            name: 'dataVersion',
            type: 'string',
            label: intl.get('slod.shipmentsConfiguration.model.dataVersion').d('数据版本'),
        },
        {
            name: 'operation',
            type: 'string',
            label: intl.get('slod.shipmentsConfiguration.model.operation').d('操作'),
            renderer: ({ record }) => (
              <a onClick={()=>onOpenDetail(record)}>
                {intl.get(`hzero.common.button.look`).d('查看')}
              </a>
        ),
        },
    ];

    const onOpenDetail = (record) => {
        const id = record?.get("strategyHeaderId");
        const modalProps = {
            math: {
                id,
                classify: "history",
                headerShowFlag: true,
            },
        };
        const modal = Modal.open({
            drawer: true,
            title: intl.get('slod.shipmentsConfiguration.model.detailCheck').d('详情预览'),
            style: { width: '742px' },
            children: <DetailIndex {...modalProps} />,
            closable: true,
            contentStyle: {
                padding: 0,
            },
            footer: <Button color={ButtonColor.primary} onClick={()=>modal.close()}>{intl.get(`hzero.common.btn.close`).d('关闭')}</Button>,
        });
    };

    // 收货查询
    const lineFetchList = (data) => {
        const queryData = filterNullValueObject({ ...data });
        return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy/copy-strategy-header/list`,
        method: 'GET',
        data: queryData,
        };
    };

    return { nodeColumns, lineFetchList };
};

export { lineColumns };
