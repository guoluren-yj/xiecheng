// 查询条件配置 静态
import intl from 'utils/intl';

export const getQueryConfig = () => {
  return {
    'SMBL.CACHE_CHECK_RULES_QUERY_BAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'enterpriseName',
          fieldCode: 'enterpriseName',
          fieldEditable: 1,
          fieldName: intl.get('smbl.checkRules.model.ruleName').d('规则名称'),
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
          defaultSortedField: 'operateTime',
          defaultSortedOrder: 'desc',
          filterName: intl.get('smbl.checkRules.placeholder.defaultSelected').d('默认筛选'),
          allFields: [
            // {
            //   customComparisonSet: ['='],
            //   fieldAlias: 'operateType',
            //   fieldCode: 'operateType',
            //   fieldEditable: 1,
            //   fieldName: intl.get(`sdat.creditLog.model.operateType`).d('操作类型'),
            //   fieldVisible: 1,
            //   lovInfo: { displayField: 'conditionInfo', valueField: 'conditionInfo' },
            //   modelCode: 'operateType',
            //   proDefaultFlag: 0,
            //   defaultValue: '',
            //   showFlag: 1,
            //   widget: {
            //     fieldWidget: 'SELECT',
            //     linkNewWindow: 0,
            //     sourceCode: 'SDAT.RISK_OPERATE_LOG_TYPE',
            //     axiosConfig: {
            //       method: 'GET',
            //       url: `${SRM_DATA_SDAT}/v1/${tenantId}/price-detail/price-condition`,
            //     },
            //     queryField: 'queryInfo',
            //     multipleFlag: 1,
            //   },
            //   rank: 0,
            //   gridSeq: 1,
            //   sortedFlag: 0,
            //   fixedFlag: 1,
            //   usedFlag: 1,
            // },
            // {
            //   customComparisonSet: ['IN'],
            //   fieldAlias: 'operateTime',
            //   fieldCode: 'operateTime',
            //   fieldEditable: 1,
            //   fieldName: intl.get(`sdat.creditLog.model.operateTime`).d('操作时间'),
            //   fieldVisible: 1,
            //   modelCode: 'operateTime',
            //   proDefaultFlag: 0,
            //   showFlag: 1,
            //   widget: {
            //     dateFormat: 'YYYY-MM-DD',
            //     fieldWidget: 'DATE_PICKER',
            //     linkNewWindow: 0,
            //     multipleFlag: 1,
            //   },
            //   rank: 0,
            //   gridSeq: 2,
            //   sortedFlag: 1,
            //   fixedFlag: 1,
            //   usedFlag: 1,
            // },
          ].filter(Boolean),
        },
      ],
    },
  };
};
