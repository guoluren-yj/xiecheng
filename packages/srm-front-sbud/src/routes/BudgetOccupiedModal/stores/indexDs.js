/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 17:17:02
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-20 17:42:42
 */
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
// import { c7nAmountFormatterOptions } from '@/routes/utils';
import { getCurrentOrganizationId } from 'utils/utils';
// 设置sbdm国际化前缀 - common - model
const commonPrompt = 'sbdm.common.model.common';
const organizationId = getCurrentOrganizationId();

// 数据来源
const dataSourcesList = () => {
  return [
    {
      meaning: intl.get(`${commonPrompt}.occupiedOrAppliedDetailTitle`).d('占用/核销明细'),
      value: 'all',
    },
    {
      meaning: intl.get(`${commonPrompt}.occupiedDetail`).d('占用明细'),
      value: 'occupy',
    },
    {
      meaning: intl.get(`${commonPrompt}.appliedDetail`).d('核销明细'),
      value: 'cancellation',
    },
  ];
};

// 聚合方式
const aggregationMethodList = () => {
  return [
    {
      meaning: intl.get(`${commonPrompt}.detailExpansion`).d('按明细展开'),
      value: 'detail',
    },
    {
      meaning: intl.get(`${commonPrompt}.documentAggregation`).d('按单据聚合'),
      value: 'document',
    },
    {
      meaning: intl.get(`${commonPrompt}.lotNumAggregationModal`).d('按初始单据聚合'),
      value: 'batch',
    },
  ];
};

const listDS = ({ budgetLineId }) => {
  return {
    autoQuery: false,
    autoCreate: false,
    dataToJSON: 'all',
    primaryKey: 'uniqueKey',
    paging: 'server',
    idField: 'uniqueKey',
    parentField: 'parentUniqueKey',
    pageSize: 20,
    transport: {
      read: ({ data = {} }) => {
        const { documentDate = {}, ...other } = data;
        if (budgetLineId) {
          return {
            url: `/sbdm/v1/${organizationId}/budget-line/occupy-detail-view/${budgetLineId}`,
            method: 'GET',
            data: { ...other, ...documentDate },
          };
        }
      },
    },
    fields: [
      {
        name: 'documentNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.documentNumAndLineNum`).d('单据编码-行号'),
      },
      {
        name: 'documentTypeMeaning',
        label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
      },
      {
        name: 'documentDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.occupiedDate`).d('占用时间'),
      },
      {
        name: 'amount',
        type: 'number',
        label: intl.get(`${commonPrompt}.occupiedOrAppliedAmount`).d('占用/核销金额'),
      },
      {
        name: 'incomingIdentityMeaning',
        type: 'string',
        label: intl.get(`${commonPrompt}.incomingIdentity`).d('传入标识'),
      },
      {
        name: 'lotNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lotNumModal`).d('初始占用单据'),
      },
      {
        name: 'parentDocumentNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.parentDocumentNum`).d('上游单据编码'),
      },
      {
        name: 'operatorName',
        type: 'string',
        label: intl.get(`${commonPrompt}.operatorName`).d('操作人'),
      },
    ],
    queryFields: [
      {
        name: 'documentDate',
        type: 'dateTime',
        range: ['documentDateFrom', 'documentDateTo'],
        format: DEFAULT_DATETIME_FORMAT,
        label: intl.get(`${commonPrompt}.occupiedDate`).d('占用时间'),
      },
      {
        name: 'documentType',
        lookupCode: 'SBDM.DOCUMENT_TYPE_ALL',
        label: intl.get(`${commonPrompt}.documentType`).d('单据类型'),
      },
      {
        name: 'lotNum',
        type: 'string',
        label: intl.get(`${commonPrompt}.lotNumModal`).d('初始占用单据'),
      },
      {
        name: 'operatorName',
        type: 'string',
        label: intl.get(`${commonPrompt}.operatorName`).d('操作人'),
      },
    ],
  };
};

const dataSourcesDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        name: 'dataSources',
        type: 'string',
        defaultValue: 'all',
        options: new DataSet({
          selection: 'single',
          data: dataSourcesList(),
        }),
      },
    ],
  };
};

export { listDS, dataSourcesDS, aggregationMethodList };
