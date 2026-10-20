import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentUser } from 'utils/utils';
import moment from 'moment';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const currentUser = getCurrentUser();

const SMND = '/smnd';

const currentDate = new Date();
const otherDate = moment(currentDate).format(DATETIME_MAX);
const threeDateBefore = moment(new Date(currentDate.setDate(currentDate.getDate() - 3))).format(
  DATETIME_MIN
);

const summaryData = key => ({
  forceValidate: true,
  primaryKey: 'errSumId',
  pageSize: 20,
  fields: [
    {
      name: 'sumNum',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.sumNum`).d('异常编号'),
    },
    {
      name: 'msgCode',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.msgCode`).d('消息编码'),
    },
    {
      name: 'msgDesc',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.msgDesc`).d('消息描述'),
    },
    {
      name: 'errDataCount',
      type: 'number',
      label: intl.get(`sitf.abnormalCallMonitoring.model.errDataCount`).d('异常明细数量'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.tenantName`).d('所属租户'),
    },
    {
      name: 'errCountSum',
      type: 'number',
      label: intl.get(`sitf.abnormalCallMonitoring.model.errCountSum`).d('错误次数'),
    },
    {
      name: 'issueLevelMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueLevelMeaning`).d('问题等级'),
    },
    {
      name: 'issueModuleMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueModuleMeaning`).d('问题模块'),
    },
    {
      name: 'issueSolution',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueSolution`).d('解决方案'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.processStatusMeaning`).d('异常处理状态'),
    },
    {
      name: 'issueNum',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueNum`).d('猪齿鱼bug号'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDate`).d('更新时间'),
    },
    {
      name: 'issueRoleFollow',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueRoleFollow`).d('默认跟进角色'),
    },
  ],

  queryFields: [
    {
      name: 'sumNum',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.sumNum`).d('异常编号'),
      merge: true,
    },
    {
      name: 'msgCode',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.msgCode`).d('消息编码'),
      merge: true,
    },
    {
      name: 'msgDesc',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.msgDesc`).d('消息描述'),
      merge: true,
    },
    {
      name: 'issueModules',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueModuleMeaning`).d('问题模块'),
      display: true,
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
      multipleFlag: true,
    },
    [
      'comprehensivesummarypending',
      'comprehensivesummaryprocessed',
      'comprehensivesummaryignore',
      'comprehensivesummaryall',
    ].includes(key) && {
      name: 'issueRoleFollows',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueRoleFollows`).d('跟进角色'),
      display: true,
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_ROLE_FOLLOW',
      multipleFlag: true,
    },
    {
      name: 'tenantId',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      label: intl.get(`sitf.abnormalCallMonitoring.model.tenantName`).d('所属租户'),
      display: true,
    },
    {
      name: 'issueLevel',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueLevelMeaning`).d('问题等级'),
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_LEVEL',
      display: true,
    },
    {
      name: 'issueNum',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueNumNew`).d('猪齿鱼'),
      display: true,
    },
    {
      name: 'lastUpdateDateRange',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateRange`).d('查询范围'),
      required: true,
      lookupCode: 'SMND.DATA_QUERY_TIME_RANGE',
      display: true,
      lock: true,
      defaultValue: '3D',
    },
    {
      name: 'lastUpdateDateFrom',
      type: 'dateTime',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateFrom`).d('更新时间从'),
      max: 'lastUpdateDateTo',
      required: true,
      display: true,
      lock: true,
      defaultValue: threeDateBefore,
      dynamicProps: {
        disabled: ({ record }) => ['3D', '1W'].includes(record.get('lastUpdateDateRange')),
      },
    },
    {
      name: 'lastUpdateDateTo',
      type: 'dateTime',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateTo`).d('更新时间至'),
      required: true,
      min: 'lastUpdateDateFrom',
      display: true,
      lock: true,
      defaultValue: otherDate,
      dynamicProps: {
        disabled: ({ record }) => ['3D', '1W'].includes(record.get('lastUpdateDateRange')),
      },
    },
    {
      name: 'lastUpdateDate',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateTo`).d('更新时间'),
      display: false,
      sortFlag: true,
      visible: false,
    },
  ].filter(Boolean),

  transport: {
    read: () => {
      return {
        url: `${SMND}/v1/monitor-err-sums`,
        method: 'GET',
      };
    },
  },
});

const detailsCommon = () => ({
  fields: [
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.processStatusMeaning`).d('异常处理状态'),
    },
    {
      name: 'msgCode',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.msgCode`).d('消息编号'),
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.errorMessage`).d('错误信息'),
    },
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.documentCode`).d('单据编号'),
    },
    {
      name: 'callName',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.callName`).d('异常调用名称'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.tenantName`).d('所属租户'),
    },
    {
      name: 'errorTimes',
      type: 'number',
      label: intl.get(`sitf.abnormalCallMonitoring.model.errorTimes`).d('错误次数'),
    },
    {
      name: 'issueLevelMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueLevelMeaning`).d('问题等级'),
    },
    {
      name: 'issueModuleMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueModuleMeaning`).d('问题模块'),
    },
    {
      name: 'issueSolution',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueSolution`).d('解决方案'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.sourceFromMeaning`).d('数据来源'),
    },
    {
      name: 'traceId',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.traceId`).d('Trace id'),
    },
    {
      name: 'callKey',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.callKey`).d('唯一主键'),
    },
    {
      name: 'issueNum',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueNum`).d('猪齿鱼bug号'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDate`).d('更新时间'),
    },
    {
      name: 'issueRoleFollow',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueRoleFollow`).d('默认跟进角色'),
    },
  ],
  queryFields: [
    {
      name: 'documentCode',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.documentCode`).d('单据编号'),
      merge: true,
    },
    {
      name: 'callName',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.callNameNew`).d('名称'),
      merge: true,
    },
    {
      name: 'issueModules',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueModuleMeaning`).d('问题模块'),
      display: true,
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_MODULE',
      multipleFlag: true,
    },
    {
      name: 'sourceFrom',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.sourceFromMeaning`).d('数据来源'),
      lookupCode: 'SMND.ERR_DATA_SOURCE',
      display: true,
    },
    {
      name: 'tenantId',
      type: 'object',
      lovCode: 'HPFM.TENANT',
      label: intl.get(`sitf.abnormalCallMonitoring.model.tenantName`).d('所属租户'),
      display: true,
    },
    {
      name: 'issueLevel',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueLevelMeaning`).d('问题等级'),
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_LEVEL',
      display: true,
    },
    {
      name: 'issueNum',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueNumNew`).d('猪齿鱼'),
      display: true,
    },
  ],
});

const detailsData = (key) => ({
  forceValidate: true,
  pageSize: 20,
  primaryKey: 'errDataId',
  fields: detailsCommon().fields,

  queryFields: [
    {
      name: 'lastUpdateDateRange',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateRange`).d('查询范围'),
      required: true,
      lookupCode: 'SMND.DATA_QUERY_TIME_RANGE',
      display: true,
      lock: true,
      defaultValue: '3D',
    },
    {
      name: 'lastUpdateDateFrom',
      type: 'dateTime',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateFrom`).d('更新时间从'),
      max: 'lastUpdateDateTo',
      required: true,
      display: true,
      lock: true,
      defaultValue: threeDateBefore,
      dynamicProps: {
        disabled: ({ record }) => ['3D', '1W'].includes(record.get('lastUpdateDateRange')),
      },
    },
    {
      name: 'lastUpdateDateTo',
      type: 'dateTime',
      label: intl.get(`sitf.abnormalCallMonitoring.model.lastUpdateDateTo`).d('更新时间至'),
      required: true,
      min: 'lastUpdateDateFrom',
      display: true,
      lock: true,
      defaultValue: otherDate,
      dynamicProps: {
        disabled: ({ record }) => ['3D', '1W'].includes(record.get('lastUpdateDateRange')),
      },
    },
    {
      name: 'msgCode',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.msgCode`).d('消息编号'),
      display: true,
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.errorMessage`).d('错误信息'),
      display: true,
    },
    [
      'comprehensivedetailpending',
      'comprehensivedetailprocessed',
      'comprehensivedetailignore',
      'comprehensivedetailall',
    ].includes(key) && {
      name: 'issueRoleFollows',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueRoleFollows`).d('跟进角色'),
      display: true,
      lookupCode: 'SRM.HPFM_MESSAGE_ISSUE_ROLE_FOLLOW',
      multipleFlag: true,
    },
    ...detailsCommon().queryFields,
  ].filter(Boolean),

  transport: {
    read: () => {
      return {
        url: `${SMND}/v1/monitor-err-datas`,
        method: 'GET',
      };
    },
  },
});

const detailsSummaryData = () => ({
  selection: false,
  fields: detailsCommon().fields,

  queryFields: detailsCommon().queryFields,

  transport: {
    read: values => {
      const {
        data: { errSumId },
      } = values;
      return {
        url: `${SMND}/v1/monitor-err-datas/${errSumId}`,
        method: 'GET',
      };
    },
  },
});

const changeStatusData = () => ({
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'processStatus',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.processStatus`).d('状态'),
      lookupCode: 'SMND.ERR_PROCESS_STATUS',
      required: true,
      defaultValue: 'IGNORED',
    },
    {
      name: 'processedBy',
      type: 'object',
      label: intl.get(`sitf.abnormalCallMonitoring.model.processedBy`).d('处理人'),
      required: true,
      lovCode: 'SMND.TENANT_USER',
      transformRequest: value => value && value.id,
      defaultValue: {
        id: currentUser.id,
        realName: currentUser.realName,
      },
    },
    {
      name: 'processDate',
      type: 'date',
      label: intl.get(`sitf.abnormalCallMonitoring.model.processDate`).d('处理时间'),
      required: true,
    },
    {
      name: 'issueSolution',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.issueSolution`).d('解决方案'),
      dynamicProps: {
        required: ({ record }) => record.get('processStatus') === 'PROCESSED',
      },
    },
    {
      name: 'supplReason',
      type: 'string',
      label: intl.get(`sitf.abnormalCallMonitoring.model.supplReason`).d('补充原因'),
      dynamicProps: {
        required: ({ record }) => record.get('processStatus') === 'IGNORED',
      },
    },
  ],
});

const exportSummaryUrl = `${SMND}/v1/monitor-err-sums/export`;
const exportDetailUrl = `${SMND}/v1/monitor-err-datas/export`;

// 汇总计数
export async function fetchSummaryCount(params) {
  return request(`${SMND}/v1/monitor-err-sums/count`, {
    method: 'GET',
    query: params,
  });
}

// 详情计数
export async function fetchDetailsCount(params) {
  return request(`${SMND}/v1/monitor-err-datas/count`, {
    method: 'GET',
    query: params,
  });
}

// 变更状态
export async function fetchChangeStatus(params, tabKey) {
  return request(
    tabKey === 'summary'
      ? `${SMND}/v1/monitor-err-sums/change-process-status`
      : `${SMND}/v1/monitor-err-datas/change-process-status`,
    {
      method: 'POST',
      body: params,
    }
  );
}
// 操作记录
export async function fetchOperation(rfxSplitNum) {
  return request(`${SMND}/v1/monitor-opr-recs/${rfxSplitNum}`,
    {
      method: 'GET',
    }
  );
}

export {
  summaryData,
  detailsData,
  changeStatusData,
  detailsSummaryData,
  exportSummaryUrl,
  exportDetailUrl,
};
