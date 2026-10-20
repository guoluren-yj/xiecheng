// 查询条件配置 静态
import intl from 'utils/intl';

export const getQueryConfig = () => {
  return {
    'SDAT.RISK_SCHEME_TEMPLATE_SEARCH_BAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'planNumber',
          fieldCode: 'planNumber',
          fieldEditable: 1,
          fieldName: intl.get('sdat.schemeTemplate.model.schemeCode').d('方案编码、描述'),
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
          // defaultFlag: 1,
          // defaultSortedField: 'offerDate',
          // defaultSortedOrder: 'asc',
          filterName: intl.get('hzero.common.view.title.default.filter').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'tenantId',
              fieldCode: 'tenantId',
              fieldEditable: 1,
              fieldName: intl.get(`sdat.schemeTemplate.model.tenant`).d('租户'),
              fieldVisible: 1,
              lovInfo: { displayField: 'tenantName', valueField: 'tenantId' },
              modelCode: 'tenantId',
              proDefaultFlag: 0,
              defaultValue: '',
              showFlag: 1,
              widget: {
                fieldWidget: 'LOV',
                linkNewWindow: 0,
                sourceCode: 'HPFM.TENANT',
              },
              rank: 0,
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
            },
          ].filter(Boolean),
        },
      ],
    },
  };
};
