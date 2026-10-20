import intl from 'utils/intl';

export const getQueryConfig = () => {
  return {
    'SDAT.CUSTOMER_ACCOUNT_MGT.QUERY_BAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        // {
        //   fieldAlias: 'payTypeCode',
        //   fieldCode: 'payTypeCode',
        //   fieldEditable: 1,
        //   fieldName: intl.get('sdat.customerAccount.model.payTypeCode').d('交易类型代码'),
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
          filterName: intl.get('hzero.common.view.title.default.filter').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'tenantId',
              fieldCode: 'tenantId',
              fieldEditable: 1,
              fieldName: intl.get('sdat.customerAccount.model.tenantName').d('所属租户'),
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
                queryField: 'tenantName',
              },
              rank: 0,
              gridSeq: 0,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
            },
            {
              customComparisonSet: ['LIKE'],
              fieldAlias: 'host',
              fieldCode: 'host',
              fieldEditable: 1,
              fieldName: intl.get('sdat.customerAccount.model.host').d('支付系统域名'),
              fieldVisible: 1,
              // lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'host',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'INPUT',
                linkNewWindow: 0,
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 1,
            },
            {
              customComparisonSet: ['='],
              fieldAlias: 'enabledFlag',
              fieldCode: 'enabledFlag',
              fieldEditable: 1,
              fieldName: intl.get('sdat.customerAccount.model.status').d('状态'),
              fieldVisible: 1,
              lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'enabledFlag',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                lovInfo: { displayField: 'meaning', valueField: 'value' },
                sourceCode: 'SDAT.CUSTOMER_ACCOUNT_STATUS',
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 1,
            },
          ].filter(Boolean),
        },
      ],
    },
    'SDAT.SERVICE_CONFIG.QUERY_BAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'description',
          fieldCode: 'description',
          fieldEditable: 1,
          fieldName: intl
            .get('sdat.customerAccount.model.serviceQueryPlaceholder')
            .d('请输入场景描述进行查询'),
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
          filterName: intl.get('hzero.common.view.title.default.filter').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['LIKE'],
              fieldAlias: 'sceneCode',
              fieldCode: 'sceneCode',
              fieldEditable: 1,
              fieldName: intl.get('sdat.customerAccount.model.sceneCode').d('场景编码'),
              fieldVisible: 1,
              // lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'sceneCode',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'INPUT',
                linkNewWindow: 0,
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 1,
            },
          ].filter(Boolean),
        },
      ],
    },
  };
};
