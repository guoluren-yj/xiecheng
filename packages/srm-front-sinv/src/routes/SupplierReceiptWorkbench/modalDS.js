/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 创建策略
const modalTableDS = () => ({
  primaryKey: 'rcvTrxLineId',
  selection: 'single', // 设置table 单选多选
  fields: [
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeCode').d('事务编码'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeName').d('移动类型'),
    },
  ],
  queryFields: [
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeCode').d('事务编码'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeName').d('移动类型'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/lovs/sql/data`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

// 退货策略
const sendTableDS = () => ({
  // primaryKey: 'rcvTrxLineId',
  selection: 'single', // 设置table 单选多选和无勾选
  fields: [
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.returnTypeCodes').d('退货类型编码'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.returnTypeNames').d('退货类型'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.nodeConfigNames').d('退货节点'),
    },
  ],
  queryFields: [
    {
      name: 'rcvTypeCode',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.returnTypeCodes').d('退货类型编码'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptWorkbench.model.receipt.returnTypeNames').d('退货类型'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/line/reverse-node-url`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { modalTableDS, sendTableDS };
