/**
* index.tsx
* @date: 2023-02-07
* @author: zuoxiangyu <xiangyu.zuo@going-link.com>
* @version: 0.0.1
* @copyright Copyright (c) 2023, Hand
*/

import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SLOD } from 'srm-front-boot/lib/utils/config.js';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';

import {onHandleUpdateResult} from '../utils';

const organizationId = getCurrentOrganizationId();


function lineColumns():any {
    const nodeColumns = [
        {
            width: 100,
            type: 'string',
            name: 'statusMeaning',
            label: intl.get('slod.deliveryBoard.model.receipt.statusMeanings').d('更新结果'),
            renderer: ({ value, record }) => onHandleUpdateResult(value, record.get('status')),
        },
        {
            width: 100,
            type: 'string',
            name: 'createdName',
            label: intl.get('slod.deliveryBoard.model.receipt.createdNames').d('操作人'),
        },
        {
            width: 140,
            type: 'string',
            name: 'creationDate',
            label: intl.get('slod.deliveryBoard.model.receipt.creationDates').d('操作时间'),
            // renderer: ({ value }) => value && moment(value).format('YYYY-MM-DD'),
        },
        {
            width: 160,
            type: 'string',
            name: 'rcvTypeName',
            label: intl.get('slod.deliveryBoard.model.receipt.receiptRcvTypeName').d('订单号-行号-发运行号'),
            renderer: ({ record }) => {
                if (record.get('displayPoNum') && record.get('displayPoLineNum') && record.get('displayLineLocationNum')) {
                    return `${record.get('displayPoNum')}-${record.get('displayPoLineNum')}-${record.get('displayLineLocationNum')}`;
                } else {
                    return '-';
                }
            },
        },
        {
            width: 100,
            type: 'string',
            name: 'errorMsg',
            label: intl.get('slod.deliveryBoard.model.receipt.errorMsg').d('失败原因'),
        },
        {
            width: 140,
            type: 'string',
            name: 'oldDeliveryStrategyName',
            label: intl.get('slod.deliveryBoard.model.receipt.oldDeliveryStrategyName').d('原发货策略'),
        },
        {
            width: 140,
            type: 'string',
            name: 'oldTrxStrategyName',
            label: intl.get('slod.deliveryBoard.model.receipt.oldTrxStrategyName').d('原收货策略'),
        },
        {
            width: 140,
            type: 'string',
            name: 'deliveryStrategyName',
            label: intl.get('slod.deliveryBoard.model.receipt.deliveryStrategyName').d('更新发货策略'),
        },
        {
            width: 140,
            type: 'string',
            name: 'trxStrategyName',
            label: intl.get('slod.deliveryBoard.model.receipt.trxStrategyName').d('更新收货策略'),
        },
    ];

    // 收货查询
    const lineFetchList = (data) => {
        const queryData = filterNullValueObject({ ...data });
        return {
            url: `${SRM_SLOD}/v1/${organizationId}/delivery/strategy-change-record?campKey=p`,
            method: 'GET',
            data: queryData,
        };
    };

    return { nodeColumns, lineFetchList };
};

export { lineColumns };
