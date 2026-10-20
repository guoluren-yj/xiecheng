/* eslint-disable import/no-cycle */
import intl from 'utils/intl';

import { dsFieldsMap, detailDsFieldsMap } from './data';

const tableDs = (key, parentKey, singleConfig) => ({
  selection: false,
  pageSize: 20,
  // autoQuery: true,
  fields: dsFieldsMap(key)[parentKey],
  transport: {
    read({ data }) {
      return {
        url: singleConfig.queryUrl,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: `${singleConfig.searchCode},${singleConfig.customizedCode}`,
        },
      };
    },
  },
});

const detailDs = (key, parentKey, singleConfig)=>({
  selection: false,
  pageSize: 20,
  // autoQuery: true,
  fields: detailDsFieldsMap(key)[parentKey],
  transport: {
    read({ data }) {
      return {
        url: singleConfig.queryUrl,
        method: 'GET',
        data: {
          ...data,
          ...singleConfig.params,
          customizeUnitCode: singleConfig.searchCode,
        },
      };
    },
  },
});

const logDS = () => ({
  fields: [
    {
      name: 'pullTypeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.serveName').d('服务名称'),
    },
    {
      name: 'messageKey',
      type: 'string',
      label: intl.get('smodr.ecBill.model.messageKey').d('电商商品编码'),
    },
    {
      name: 'ecOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.ecOrderCode').d('电商订单编码'),
    },
    {
      name: 'ecInteractionModeMeaning',
      type: 'string',
      label: intl.get('smodr.ecBill.model.ecInteractionModeMeaning').d('电商接入方式'),
    },
    {
      name: 'ecSubOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.ecSubOrderCode').d('电商子订单编码'),
    },
    {
      name: 'srmOrderCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.srmMallOrderCode').d('商城订单编码'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('smodr.ecBill.model.requestTime').d('请求时间'),
    },
    {
      name: 'requestMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.requestParam').d('请求参数'),
    },
    {
      name: 'responseMessage',
      type: 'string',
      label: intl.get('smodr.ecBill.model.responseParam').d('响应参数'),
    },
    {
      name: 'applicationNo',
      type: 'string',
      label: intl.get('smodr.ecBill.model.applicationNo').d('开票申请编码'),
    },
    {
      name: 'ecConsignmentCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.deliveryIdsCode').d('电商送货单编码'),
    },
    {
      name: 'afsApplyCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsApplyCode').d('商城售后申请单编码'),
    },
    {
      name: 'ecAfsApplyCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.afsOrderIdCodes').d('电商售后申请单编码'),
    },
    {
      name: 'ecBillCode',
      type: 'string',
      label: intl.get('smodr.ecBill.model.billIdCode').d('电商对账单编码'),
    },
  ],
});

export { tableDs, detailDs, logDS };
