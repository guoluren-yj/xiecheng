// 查询条件配置 静态
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

// eslint-disable-next-line no-unused-vars
const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

const todayObj = new Date();
const dateStr = `${todayObj.getFullYear()}-${todayObj.getMonth() + 1}-${todayObj.getDate()}`;

export const getQueryConfig = (fromMsg, options) => {
  return {
    'SDAT.MONITOR_STUFF': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'enterpriseName',
          fieldCode: 'enterpriseName',
          fieldEditable: 1,
          fieldName: intl.get('sdat.monitorStuff.model.orgNameCode').d('企业名称、编码'),
          fieldVisible: 1,
          gridSeq: 0,
          showFlag: 0,
          sortedFlag: 0,
          customComparisonSet: ['LIKE'],
          widget: {
            fieldWidget: 'INPUT',
            linkNewWindow: 0,
            multipleFlag: 0,
          },
        },
      ],
      systemFilters: [
        {
          defaultFlag: 1,
          defaultSortedField: 'publishDate',
          defaultSortedOrder: 'desc',
          filterName: intl.get('sdat.monitorStuff.placeholder.defaultSelected').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'riskLevel',
              fieldCode: 'riskLevel',
              fieldEditable: 1,
              fieldName: intl.get('sdat.monitorStuff.model.riskLevel').d('风险级别'),
              fieldVisible: 1,
              lovInfo: { displayField: 'conditionInfo', valueField: 'conditionInfo' },
              modelCode: 'riskLevel',
              proDefaultFlag: 0,
              defaultValue: '',
              showFlag: 1,
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                sourceCode: 'SDAT.RISK_EVENT_LEVEL', // 尚未补全
                axiosConfig: {
                  method: 'GET',
                  url: `${SRM_DATA_SDAT}/v1/${tenantId}/price-detail/price-condition`,
                },
                queryField: 'queryInfo',
              },
              rank: 0,
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
            },
            {
              customComparisonSet: ['='],
              fieldAlias: 'dimensionCode',
              fieldCode: 'dimensionCode',
              fieldEditable: 1,
              fieldName: intl.get('sdat.monitorStuff.model.dimensionCode').d('事件维度'),
              fieldVisible: 1,
              modelCode: 'dimensionCode',
              defaultValue: '',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'TREE_SELECT',
                linkNewWindow: 0,
              },
              rank: 0,
              gridSeq: 2,
              sortedFlag: 1,
              fixedFlag: 1,
              usedFlag: 1,
              optionsForTree: options,
            },
            {
              customComparisonSet: ['IN'],
              fieldAlias: 'publishDate',
              fieldCode: 'publishDate',
              fieldEditable: 1,
              fieldName: intl.get('sdat.monitorStuff.model.publishDate').d('变动日期'),
              fieldVisible: 1,
              modelCode: 'publishDafte',
              defaultValue: fromMsg ? dateStr : '',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                dateFormat: 'YYYY-MM-DD',
                fieldWidget: 'DATE_PICKER',
                linkNewWindow: 0,
                multipleFlag: 1,
              },
              rank: 0,
              gridSeq: 2,
              sortedFlag: 1,
              fixedFlag: 1,
              usedFlag: 1,
            },
          ].filter(Boolean),
        },
      ],
    },
  };
};
