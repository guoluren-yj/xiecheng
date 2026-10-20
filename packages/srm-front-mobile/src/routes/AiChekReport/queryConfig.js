import intl from 'utils/intl';

export const getQueryConfig = () => {
  return {
    'SMBL.AI_CHECK_REPORT_LIST_QUERYBAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'batchId',
          fieldCode: 'batchId',
          fieldEditable: 1,
          fieldName: intl.get('smbl.aiChekReport.model.batchId').d('批次号'),
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
              fieldAlias: 'documentCode',
              fieldCode: 'documentCode',
              fieldEditable: 1,
              fieldName: intl.get('smbl.aiChekReport.model.documentCode').d('流程单据编码'),
              fieldVisible: 1,
              modelCode: 'documentCode',
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
              customComparisonSet: ['LIKE'],
              fieldAlias: 'categoryCode',
              fieldCode: 'categoryCode',
              fieldEditable: 1,
              fieldName: intl.get('smbl.aiChekReport.model.categoryCode').d('流程分类编码'),
              fieldVisible: 1,
              modelCode: 'categoryCode',
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
              customComparisonSet: ['IN'],
              fieldAlias: 'operateTime',
              fieldCode: 'operateTime',
              fieldEditable: 1,
              fieldName: intl.get(`smbl.aiChekReport.model.operateTime`).d('操作时间'),
              fieldVisible: 1,
              modelCode: 'operateTime',
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
    'SDAT.SERVICE_CONFIG.QUERY_BAR': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'description',
          fieldCode: 'description',
          fieldEditable: 1,
          fieldName: intl
            .get('smbl.aiChekReport.model.serviceQueryPlaceholder')
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
              fieldName: intl.get('smbl.aiChekReport.model.sceneCode').d('场景编码'),
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
