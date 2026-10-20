// 查询条件配置 静态
import intl from 'utils/intl';
// import { SRM_DATA_SDAT } from '@/utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// const tenantId = getCurrentOrganizationId();

export const getQueryConfig = (isSubscribe = false) => {
  return {
    'SDAT.SUPPLIER_BLACKLIST': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'enterpriseName',
          fieldCode: 'enterpriseName',
          fieldEditable: 1,
          fieldName: intl
            .get('sdat.supplierBlacklistManage.model.orgNameCode')
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
          // defaultFlag: 1,
          // defaultSortedField: 'lastUpdatedTime',
          // defaultSortedOrder: 'desc',
          filterName: intl.get('hzero.common.view.title.default.filter').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'userName',
              fieldCode: 'userName',
              fieldEditable: 1,
              fieldName: intl.get('sdat.supplierBlacklistManage.model.operator').d('操作人'),
              fieldVisible: 1,
              // lovInfo: { displayField: 'meaning', valueField: 'value' },
              modelCode: 'userName',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                fieldWidget: 'INPUT',
                linkNewWindow: 0,
                // lovInfo: { displayField: 'meaning', valueField: 'value' },
                // sourceCode: 'SDAT.RISK_LEVEL_TYPE',
              },
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
              rank: 2,
            },
            {
              customComparisonSet: ['IN'],
              fieldAlias: 'addTime',
              fieldCode: 'addTime',
              fieldEditable: 1,
              fieldName: intl.get('sdat.supplierBlacklistManage.model.addTime').d('添加时间'),
              fieldVisible: 1,
              modelCode: 'addTime',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                dateFormat: 'YYYY-MM-DD',
                fieldWidget: 'DATE_PICKER',
                linkNewWindow: 0,
                multipleFlag: 1, // 是否是range
              },
              rank: 0,
              gridSeq: 2,
              // sortedFlag: 1,
              fixedFlag: 1,
              usedFlag: 1,
            },
            isSubscribe && {
              customComparisonSet: ['IN'],
              fieldAlias: 'updateTime',
              fieldCode: 'updateTime',
              fieldEditable: 1,
              fieldName: intl
                .get('sdat.supplierBlacklistManage.model.updateTime')
                .d('关系图谱更新时间'),
              fieldVisible: 1,
              modelCode: 'updateTime',
              proDefaultFlag: 0,
              showFlag: 1,
              widget: {
                dateFormat: 'YYYY-MM-DD',
                fieldWidget: 'DATE_PICKER',
                linkNewWindow: 0,
                multipleFlag: 1, // 是否是range
              },
              rank: 0,
              gridSeq: 2,
              // sortedFlag: 1,
              fixedFlag: 1,
              usedFlag: 1,
            },
          ].filter(Boolean),
        },
      ],
    },
  };
};
