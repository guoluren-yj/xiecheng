// 查询条件配置 静态
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

export const getQueryConfig = () => {
  return {
    'SDAT.CREDIT_LOG': {
      sortedEnabled: 1,
      mergeFieldList: [
        {
          fieldAlias: 'enterpriseName',
          fieldCode: 'enterpriseName',
          fieldEditable: 1,
          fieldName: intl
            .get('sdat.monitorStuff.model.orgNameCode')
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
          defaultSortedField: 'operateTime',
          defaultSortedOrder: 'desc',
          filterName: intl.get('sdat.monitorStuff.placeholder.defaultSelected').d('默认筛选'),
          allFields: [
            {
              customComparisonSet: ['='],
              fieldAlias: 'operateType',
              fieldCode: 'operateType',
              fieldEditable: 1,
              fieldName: intl.get(`sdat.creditLog.model.operateType`).d('操作类型'),
              fieldVisible: 1,
              lovInfo: { displayField: 'conditionInfo', valueField: 'conditionInfo' },
              modelCode: 'operateType',
              proDefaultFlag: 0,
              defaultValue: '',
              showFlag: 1,
              widget: {
                fieldWidget: 'SELECT',
                linkNewWindow: 0,
                sourceCode: 'SDAT.RISK_OPERATE_LOG_TYPE',
                axiosConfig: {
                  method: 'GET',
                  url: `${SRM_DATA_SDAT}/v1/${tenantId}/price-detail/price-condition`,
                },
                queryField: 'queryInfo',
                multipleFlag: 1,
              },
              rank: 0,
              gridSeq: 1,
              sortedFlag: 0,
              fixedFlag: 1,
              usedFlag: 1,
            },
            {
              customComparisonSet: ['IN'],
              fieldAlias: 'operateTime',
              fieldCode: 'operateTime',
              fieldEditable: 1,
              fieldName: intl.get(`sdat.creditLog.model.operateTime`).d('操作时间'),
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
            {
              customComparisonSet: ['='],
              fieldAlias: 'operateName',
              fieldCode: 'operateName',
              fieldEditable: 1,
              fieldName: intl.get(`sdat.creditLog.model.operateName`).d('操作人'),
              fieldVisible: 1,
              lovInfo: { displayField: 'operateName', valueField: 'operateName' },
              modelCode: 'operateName',
              proDefaultFlag: 0,
              defaultValue: '',
              showFlag: 1,
              widget: {
                fieldWidget: 'LOV',
                linkNewWindow: 0,
                sourceCode: 'SDAT.RISK_LOG_USER',
                axiosConfig: {
                  method: 'GET',
                  url: `${SRM_DATA_SDAT}/v1/${tenantId}/risk-operate-log/log-user`,
                  params: { ...passParams },
                },
                queryField: 'operateName',
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
