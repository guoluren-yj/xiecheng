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
          fieldName: intl.get('sdat.monitorBusiness.model.businessName').d('企业名称、编码'),
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
          defaultSortedField: 'offerDate',
          defaultSortedOrder: 'asc',
          filterName: intl.get('sdat.monitorBusiness.placeholder.defaultSelected').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'cooperationFlag',
              fieldCode: 'cooperationFlag',
              fieldEditable: 1,
              fieldName: intl.get('sdat.monitorBusiness.model.isCooperate').d('是否合作'),
              fieldVisible: 1,
              lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'cooperationFlag',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                lovInfo: { displayField: 'meaning', valueField: 'value' },
                sourceCode: 'SDAT.WORKBENCH_COOPERATION_FLAG',
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 2,
            },
            {
              customComparisonSet: ['='],
              fieldAlias: 'effectiveFlag',
              fieldCode: 'effectiveFlag',
              fieldEditable: 1,
              fieldName: intl.get('sdat.monitorBusiness.model.isActive').d('是否有效'),
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
            // {
            //   customComparisonSet: ['IN'],
            //   fieldAlias: 'registerTime',
            //   fieldCode: 'registerTime',
            //   fieldEditable: 1,
            //   fieldName: intl.get('sdat.monitorBusiness.model.registerAppTime').d('注册平台时间'),
            //   fieldVisible: 1,
            //   modelCode: 'registerTime',
            //   proDefaultFlag: 0,
            //   showFlag: 1,
            //   widget: {
            //     dateFormat: 'YYYY-MM-DD',
            //     fieldWidget: 'DATE_PICKER',
            //     linkNewWindow: 0,
            //     multipleFlag: 1, // 是否是range
            //   },
            //   rank: 0,
            //   gridSeq: 2,
            //   // sortedFlag: 1,
            //   fixedFlag: 1,
            //   usedFlag: 1,
            // },
          ].filter(Boolean),
        },
      ],
    },
  };
};
