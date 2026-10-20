// 查询条件配置 静态
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDAT } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

export const getQueryConfig = () => {
  return {
    'SDAT.NEWS_OPINION': {
      sortedEnabled: 1,

      mergeFieldList: [
        {
          fieldAlias: 'enterpriseName',
          fieldCode: 'enterpriseName',
          fieldEditable: 1,
          fieldName: intl.get('sdat.newsPublicOpinion.model.orgNameCode').d('企业名称、编码'),
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
          filterName: intl.get('sdat.newsPublicOpinion.placeholder.defaultSelected').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'emotionType',
              fieldCode: 'emotionType',
              fieldEditable: 1,
              fieldName: intl.get('sdat.newsPublicOpinion.model.emotionType').d('情感类别'),
              fieldVisible: 1,
              lovInfo: { displayField: 'conditionInfo', valueField: 'conditionInfo' },
              modelCode: 'emotionType',
              proDefaultFlag: 0,
              defaultValue: '',
              showFlag: 1,
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                // lovInfo: { displayField: 'conditionInfo', valueField: 'conditionInfo' },
                sourceCode: 'SDAT.RISK_NEWS_EMOTION_TYPE', // lookupCode
                axiosConfig: {
                  method: 'GET',
                  url: `${SRM_DATA_SDAT}/v1/${organizationId}/price-detail/price-condition`,
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
              customComparisonSet: ['IN'],
              fieldAlias: 'publishDate',
              fieldCode: 'publishDate',
              fieldEditable: 1,
              fieldName: intl.get('sdat.newsPublicOpinion.model.publishDate').d('发布日期'),
              fieldVisible: 1,
              modelCode: 'publishDate',
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
