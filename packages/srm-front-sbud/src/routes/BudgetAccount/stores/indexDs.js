/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:17:02
 * @LastEditors: yanglin
 * @LastEditTime: 2023-04-26 13:55:38
 */
import intl from 'utils/intl';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const tenantId = getCurrentOrganizationId();

export default () => {
  return {
    autoQuery: true,
    autoCreate: false,
    dataToJSON: 'all',
    selection: 'multiple',
    transport: {
      read: ({ data = {} }) => {
        const { operateDate = {}, ...other } = data;
        return {
          url: `/sbdm/v1/${tenantId}/budget-account/list`,
          method: 'GET',
          data: { ...other, ...operateDate, asyncCountFlag: 'Y' },
        };
      },
    },
    pageSize: 20,
    fields: [
      {
        name: 'documentType',
        type: 'string',
        lookupCode: 'SBDM.DOCUMENT_TYPE_ALL',
        label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
      },
      {
        name: 'documentNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.documentNum`).d('单据编码'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.callDate`).d('调用时间'),
      },
      {
        name: 'operationType',
        type: 'string',
        lookupCode: 'SBDM.OPERATION_TYPE',
        label: intl.get(`${commonPrompt}.operationType`).d('调用接口类型'),
      },
      // {
      //   name: 'lineAmount',
      //   type: 'number',
      //   label: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
      //   // dynamicProps: {
      //   //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //   //     record.get('financialPrecision')
      //   //   ),
      //   // },
      // },
      {
        name: 'amount',
        type: 'number',
        label: intl.get(`${commonPrompt}.thisOccupiedAmount`).d('本次占用金额'),
        // dynamicProps: {
        //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
        //     record.get('financialPrecision')
        //   ),
        // },
      },
      {
        name: 'incomingIdentity',
        type: 'string',
        lookupCode: 'SBDM.INCOMING_IDENTITY',
        label: intl.get(`${commonPrompt}.incomingIdentity`).d('传入标识'),
      },
      {
        name: 'sourceDocumentNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.sourceDocumentNum`).d('来源单号'),
      },
      {
        name: 'operator',
        type: 'string',
        label: intl.get(`${commonPrompt}.operatorName`).d('操作人'),
      },
      {
        name: 'lotNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lotNum`).d('批次编码'),
      },
      {
        name: 'rollbackFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`${commonPrompt}.rollbackFlag`).d('回滚标识'),
      },
      {
        name: 'rollbackDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.rollbackDate`).d('回滚日期'),
      },
      {
        name: 'errorFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.errorFlag`).d('是否异常'),
      },
      {
        name: 'budgetType',
        type: 'string',
        lookupCode: 'SBDM.BUDGET_OCCUPY_TYPE',
        label: intl.get(`${commonPrompt}.callee`).d('被调用方'),
      },
    ],
    queryFields: [
      {
        name: 'documentType',
        type: 'string',
        lookupCode: 'SBDM.DOCUMENT_TYPE_ALL',
        label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
      },
      {
        name: 'operateDate',
        type: 'dateTime',
        range: ['operateDateFrom', 'operateDateTo'],
        format: getDateTimeFormat(),
        label: intl.get(`${commonPrompt}.callDate`).d('调用时间'),
      },
      {
        name: 'lotNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lotNum`).d('批次编码'),
      },
      {
        name: 'sourceDocumentNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.sourceDocumentNum`).d('来源单号'),
      },
      {
        name: 'errorFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`${commonPrompt}.errorFlag`).d('是否异常'),
      },
      {
        name: 'budgetType',
        type: 'string',
        lookupCode: 'SBDM.BUDGET_OCCUPY_TYPE',
        label: intl.get(`${commonPrompt}.callee`).d('被调用方'),
      },
    ],
  };
};
