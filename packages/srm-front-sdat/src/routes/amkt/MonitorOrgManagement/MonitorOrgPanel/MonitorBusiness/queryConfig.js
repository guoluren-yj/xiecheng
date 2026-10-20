// 查询条件配置 静态
import intl from 'utils/intl';

export const getQueryConfig = () => {
  return {
    'SDAT.SUPPLIER_MONITOR_BUSINESS_LIST': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'enterpriseName',
          fieldCode: 'enterpriseName',
          fieldEditable: 1,
          fieldName: intl
            .get('sdat.monitorOrgManagement.model.businessName')
            .d('企业名称、统一社会信用代码'),
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
          filterName: intl
            .get('sdat.monitorOrgManagement.placeholder.defaultSelected')
            .d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'effectiveFlag',
              fieldCode: 'effectiveFlag',
              fieldEditable: 1,
              fieldName: intl.get('sdat.monitorOrgManagement.model.isActive').d('是否有效'),
              fieldVisible: 1,
              lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'effectiveFlag',
              proDefaultFlag: 0,
              showFlag: 1,
              defaultValue: '1',
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                lovInfo: { displayField: 'meaning', valueField: 'value' },
                sourceCode: 'SDAT.EFFECTIVE_FLAG',
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 3,
            },
          ].filter(Boolean),
        },
      ],
    },
  };
};
