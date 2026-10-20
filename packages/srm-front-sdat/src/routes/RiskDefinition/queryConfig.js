// 查询条件配置 静态
import intl from 'utils/intl';

export const getQueryConfig = () => {
  return {
    'SDAT.RISK_CONTROL_DEFINITION_SEARCH_BAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        // {
        //   fieldAlias: 'companyName',
        //   fieldCode: 'companyName',
        //   fieldEditable: 1,
        //   fieldName: intl.get('sdat.riskDefinition.model.businessName').d('企业名称'),
        //   fieldVisible: 1,
        //   gridSeq: 0,
        //   showFlag: 0,
        //   sortedFlag: 0,
        //   customComparisonSet: ['LIKE'],
        //   widget: {
        //     fieldWidget: 'INPUT',
        //     linkNewWindow: 0,
        //     multipleFlag: 0,
        //   },
        // },
      ],
      systemFilters: [
        {
          defaultFlag: 1,
          defaultSortedField: 'lastUpdateTime',
          defaultSortedOrder: 'desc',
          filterName: intl.get('sdat.riskDefinition.placeholder.defaultSelected').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'scope',
              fieldCode: 'scope',
              fieldEditable: 1,
              fieldName: intl.get(`sdat.riskDefinition.model.applicationScope`).d('适用范围'),
              fieldVisible: 1,
              lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'scope',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                lovInfo: { displayField: 'meaning', valueField: 'value' },
                sourceCode: 'SDAT.RISK_DEFINITION_SCOPE',
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 2,
            },
            {
              customComparisonSet: ['IN'],
              fieldAlias: 'dateRange',
              fieldCode: 'dateRange',
              fieldEditable: 1,
              fieldName: intl.get('sdat.riskDefinition.model.lastUpdateTime').d('最后更新时间'),
              fieldVisible: 1,
              modelCode: 'dateRange',
              proDefaultFlag: 0,
              showFlag: 0,
              widget: {
                dateFormat: 'YYYY-MM-DD',
                fieldWidget: 'DATE_PICKER',
                linkNewWindow: 0,
                multipleFlag: 1,
              },
              rank: 4,
              gridSeq: 6,
              sortedFlag: 1,
              usedFlag: 1,
              fixedFlag: 1,
            },
          ].filter(Boolean),
        },
      ],
    },
  };
};
