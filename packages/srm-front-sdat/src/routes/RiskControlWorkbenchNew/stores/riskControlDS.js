/* eslint-disable no-param-reassign */
/**
 * 风险工作台
 * @Author: qingxiang.luo@going-link.com
 * @Date: 2023-03-06
 * @Copyright: Copyright (c) 2023, Zhenyun
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { HZERO_IAM } from 'utils/config';
import { SRM_DATA_SDAT } from '@/utils/config';

const organizationId = getCurrentOrganizationId();

const BUCKET_DIRECTORY = 'sdat-risk-workbench';

// const { id } = getCurrentUser();

/**
 * ⻛险供应商 列表 DS
 * @returns
 */
const RiskProviderDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/operate-logs`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskControl.model.supplierName`).d('供应商名称'),
      name: 'supplierName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskControl.model.externalRiskLevel`).d('外部⻛险等级'),
      name: 'riskLevel',
      type: 'string',
      help: 'asdf',
    },
    {
      label: intl.get(`sdat.riskControl.model.registryDate`).d('注册时间'),
      name: 'registrationTime',
      type: 'date',
    },
    {
      label: intl.get(`sdat.riskControl.model.riskTimes`).d('⻛险事件次数'),
      name: 'riskTimes',
      type: 'number',
    },
    // {
    //   label: intl.get(`sdat.riskControl.model.successfulTimes`).d('近30天中标次数及金额'),
    //   name: 'successfulTimes',
    //   type: 'string',
    // },
    // {
    //   label: intl.get(`sdat.riskControl.model.performance`).d('上一次考评绩效'),
    //   name: 'performance',
    //   type: 'string',
    // },
  ],
  events: {},
});

/**
 * 风险事件详情 弹窗 DS
 * @returns
 */
const IncidentDetailDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/monitor-company`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorBusiness.model.enterpriseCode').d('企业编码'),
      name: 'enterpriseCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.enterpriseName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.outerRiskLevels').d('外部风险等级'),
      name: 'riskLevel',
      type: 'string',
      lookupCode: 'SDAT.RISK_LEVEL_TYPE',
      help: intl
        .get('sdat.monitorBusiness.view.model.tooltip')
        .d('风险等级评估来自于企业资信服务商企查查'),
    },
    {
      label: intl.get('sdat.monitorBusiness.model.socialCode').d('统一社会信用代码'),
      name: 'socialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.isErp').d('是否ERP'),
      name: 'erpFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get('sdat.monitorBusiness.model.lastScanningTimes').d('上次扫描时间'),
      name: 'lastScanTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.registerAppTime').d('注册平台时间'),
      name: 'registerTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.monitorBusiness.model.riskCount').d('风险事件次数'),
      name: 'countInfo',
      type: 'string',
    },
    // {
    //   label: intl.get('sdat.monitorBusiness.model.monthCount').d('近30天中标次数及金额'),
    //   name: 'monthCount',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.monitorBusiness.model.monthOrderCount').d('近30天订单数量及金额'),
    //   name: 'monthOrder',
    //   type: 'string',
    // },
    // {
    //   label: intl.get('sdat.monitorBusiness.model.lastAppraisal').d('上一次考评绩效'),
    //   name: 'scoreAndTime',
    //   type: 'string',
    // },
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskEventAttach`).d('风险事件附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 风险凭证基本信息 DS
 * @returns
 */
const RiskVoucherDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/customer-risk-process/${data.riskEventId}`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskControl.model.defendant`).d('被告人/被告/被上诉人/被申请人'),
      name: 'defendant',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskControl.model.plaintiff`).d('公诉人/原告/上诉人/申请人'),
      name: 'plaintiff',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskControl.model.caseNumber`).d('案号'),
      name: 'caseNumber',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskControl.model.courtName`).d('法院名称'),
      name: 'courtName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskControl.model.putDate`).d('立案日期'),
      name: 'putDate',
      type: 'date',
    },
  ],
  events: {},
});

/**
 * 风险凭证处置信息 DS
 * @returns
 */
const DisposalDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/operate-logs`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      const param = data[0] || {};
      const actionList = param?.processAction ?? [];
      const userList = param?.broadcastReceivers ?? [];

      delete param.processAction;
      delete param.processAction;

      if (userList.length) {
        userList.forEach((item) => {
          item.userId = item.id || item.userId;
        });
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/customer-risk-process`,
        data: {
          ...param,
          processAction: actionList.join(','),
          broadcastReceivers: userList,
        },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const param = data[0] || {};
      const actionList = param?.processAction ?? [];
      const userList = param?.broadcastReceivers ?? [];

      delete param.processAction;
      delete param.processAction;

      if (userList.length) {
        userList.forEach((item) => {
          item.userId = item.id || item.userId;
        });
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/customer-risk-process`,
        data: {
          ...param,
          processAction: actionList.join(','),
          broadcastReceivers: userList,
        },
        method: 'PUT',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskControl.model.disposalAction`).d('处置动作'),
      name: 'actionCode',
      type: 'string',
      // multiple: true,
      required: true,
    },
    {
      label: intl.get(`sdat.riskControl.model.disposalAction`).d('处置动作'),
      name: 'processAction',
      type: 'string',
      // multiple: true,
      required: true,
      lookupCode: 'SDAT.WB2_PROCESS_ACTION',
    },
    {
      label: intl.get(`sdat.riskControl.model.disposalFeedback`).d('处置反馈'),
      name: 'processFeedback',
      type: 'string',
      lookupCode: 'SDAT.PROCESS_FEEDBACK',
    },
    {
      label: intl.get(`sdat.riskControl.model.disposalReason`).d('处置理由'),
      name: 'processReason',
      required: true,
      type: 'string',
      maxLength: 200,
    },
    {
      label: intl.get(`sdat.riskControl.model.businessOrderNum`).d('业务单据号'),
      name: 'bizNum',
      type: 'string',
    },
    {
      name: 'riskEventId',
    },
    {
      name: 'broadcastWay',
    },
    {
      name: 'tenantId',
    },
    {
      name: 'userId',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.dealWithAttach`).d('处置附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 子账户选择列表
 * @returns
 */
const AccountListDS = () => ({
  pageSize: 20,
  primaryKey: 'id',
  cacheSelection: true,
  transport: {
    read: ({ data, params }) => {
      delete data.companyObj;
      delete params.companyObj;
      return {
        url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging`,
        params: {
          ...data,
          ...params,
        },
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.realName`).d('名称'),
      name: 'realName',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.realName`).d('名称'),
      name: 'realName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.company`).d('公司'),
      name: 'companyObj',
      type: 'object',
      multiple: true,
      lovCode: 'SDAT.COMPANY_FILTER',
    },
    {
      name: 'companyIds',
      bind: 'companyObj.companyId',
    },
  ],
  events: {},
});

/**
 * 子账户展示列表
 * @returns
 */
const AccountViewListDS = () => ({
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  paging: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-process/process-user`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.realName`).d('名称'),
      name: 'realName',
      type: 'string',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.loginName`).d('账号'),
      name: 'loginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.realName`).d('名称'),
      name: 'realName',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 新增风险事件DS
 * @returns
 */
const EventCreateDS = () => ({
  transport: {
    create: ({ data }) => {
      const param = data[0] || {};
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/wb2-risk-event/create-manual-event`,
        data: {
          ...param,
          tenantId: getCurrentOrganizationId(),
        },
        method: 'POST',
      };
    },
  },
  fields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskBusiness`).d('风险企业'),
      name: 'companyObj',
      type: 'object',
      ignore: 'always',
      lovCode: 'SDAT.WB2_RISK_BUSINESS_LIST',
      // dynamicProps: {
      //   lovQueryAxiosConfig: () => {
      //     return {
      //       url: `${SRM_DATA_SDAT}/v1/${organizationId}/wb2-risk-event/all-partner`,
      //       method: 'GET',
      //     };
      //   },
      // },
      required: true,
    },
    {
      name: 'enterpriseName',
      bind: 'companyObj.supplierCompanyName',
    },
    {
      name: 'supplierCompanyId',
      bind: 'companyObj.supplierCompanyId',
    },
    {
      name: 'socialCode',
      bind: 'companyObj.unifiedSocialCode',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.eventName`).d('事件标题'),
      name: 'manualEventName',
      type: 'string',
      maxLength: 20,
      required: true,
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskDesc`).d('风险描述'),
      name: 'manualEventDesc',
      type: 'string',
      maxLength: 200,
      required: true,
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskLevel`).d('风险等级'),
      name: 'eventLevel',
      type: 'string',
      lookupCode: 'SDAT.WORKBENCH_EVENT_LEVEL',
      required: true,
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskType`).d('风险类型'),
      name: 'secondItemCode',
      type: 'string',
      required: true,
    },
    {
      name: 'firstItemCode',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.chargePerson`).d('负责人'),
      name: 'chargeList',
      type: 'object',
      lovCode: 'SDAT.RISK_SCAN_CONFIG_V2_USER_LIST',
      ignore: 'always',
      noCache: true,
      multiple: true,
      required: true,
      dynamicProps: {
        lovQueryAxiosConfig: () => {
          return {
            url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging?asyncCountFlag=1`,
            method: 'POST',
          };
        },
      },
    },
    {
      name: 'responsibleUserIds',
      bind: 'chargeList.id',
    },
    {
      label: intl.get(`sdat.riskScanConfig.model.stakeholder`).d('干系人'),
      name: 'stakeholderList',
      type: 'object',
      lovCode: 'SDAT.RISK_SCAN_CONFIG_V2_USER_LIST',
      ignore: 'always',
      noCache: true,
      multiple: true,
      dynamicProps: {
        lovQueryAxiosConfig: () => {
          return {
            url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging?asyncCountFlag=1`,
            method: 'POST',
          };
        },
      },
    },
    {
      name: 'relationUserIds',
      bind: 'stakeholderList.id',
    },
    // {
    //   name: 'themeName',
    // },
    // {
    //   label: intl.get(`sdat.riskNewDefinition.model.chargePerson`).d('经办人'),
    //   name: 'personObj',
    //   type: 'object',
    //   ignore: 'always',
    //   lovCode: 'SDAT.WORK_PLACE_USER_LIST',
    //   multiple: true,
    //   required: true,
    //   dynamicProps: {
    //     lovQueryAxiosConfig: () => {
    //       return {
    //         url: `${HZERO_IAM}/hzero/v1/${getCurrentOrganizationId()}/users/have/company/paging`,
    //         method: 'POST',
    //       };
    //     },
    //   },
    // },
    // {
    //   name: 'personList',
    //   bind: 'personObj.id',
    // },
    // {
    //   name: 'nameList',
    //   bind: 'personObj.realName',
    // },
    // {
    //   label: intl.get(`sdat.riskNewDefinition.model.calculationDimension`).d('计算维度'),
    //   name: 'dimension',
    //   type: 'string',
    //   required: true,
    //   lookupCode: 'SDAT.RISK_DEFINITION_SCOPE',
    // },
    // {
    //   label: intl.get(`sdat.riskNewDefinition.model.companyScope`).d('可选公司范围'),
    //   name: 'scopeObj',
    //   type: 'object',
    //   ignore: 'always',
    //   lovCode: 'SDAT.RISK_WORKPLACE_COMPANY_LIST',
    //   dynamicProps: {
    //     required: ({ record }) => {
    //       return record.get('dimension') === '1';
    //     },
    //   },
    // },
    // {
    //   label: intl.get(`sdat.riskNewDefinition.model.supplierScope`).d('可选供应商分类范围'),
    //   name: 'supplierObj',
    //   type: 'object',
    //   ignore: 'always',
    //   lovCode: 'SDAT.RISK_WORKPLACE_SUPPLIER_LIST',
    //   dynamicProps: {
    //     required: ({ record }) => {
    //       return record.get('dimension') === '2';
    //     },
    //   },
    // },
    // {
    //   name: 'companyId',
    //   dynamicProps: {
    //     bind: ({ record }) => {
    //       return record.get('dimension') === '1' ? 'scopeObj.companyId' : 'supplierObj.categoryId';
    //     },
    //   },
    // },
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskEventAttach`).d('风险事件附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 附件信息 DS
 * @returns
 */
const AttachmentDS = () => ({
  transport: {},
  pageSize: 10,
  fields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskEventAttach`).d('风险事件附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 关闭事件表单 DS
 * @returns
 */
const CloseFormDS = () => ({
  transport: {},
  fields: [
    {
      label: intl.get(`sdat.riskNewDefinition.model.closeRemark`).d('关闭备注'),
      name: 'remark',
      type: 'string',
      maxLength: 500,
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.closeEventAttach`).d('关闭事件附件'),
      name: 'closeAttachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 关闭事件表格 DS
 * @returns
 */
const CloseTableDS = () => ({
  transport: {},
  paging: false,
  selection: false,
  fields: [
    {
      name: 'eventNumber',
      label: intl.get(`sdat.riskNewDefinition.model.eventNum`).d('事件编码'),
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.riskDesc`).d('风险描述'),
      name: 'eventName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.closeRemark`).d('关闭备注'),
      name: 'remark',
      type: 'string',
      maxLength: 500,
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.closeEventAttach`).d('关闭事件附件'),
      name: 'closeAttachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

/**
 * 风险广播 DS
 * @returns
 */
const BroadcastDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/operate-logs`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    create: ({ data }) => {
      const param = data[0] || {};
      const actionList = param?.processAction ?? [];
      const userList = param?.broadcastReceivers ?? [];

      delete param.processAction;
      delete param.processAction;

      if (userList.length) {
        userList.forEach((item) => {
          item.userId = item.id || item.userId;
        });
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/customer-risk-process`,
        data: {
          ...param,
          processAction: actionList.join(','),
          broadcastReceivers: userList,
        },
        method: 'POST',
      };
    },
    update: ({ data }) => {
      const param = data[0] || {};
      const actionList = param?.processAction ?? [];
      const userList = param?.broadcastReceivers ?? [];

      delete param.processAction;
      delete param.processAction;

      if (userList.length) {
        userList.forEach((item) => {
          item.userId = item.id || item.userId;
        });
      }

      return {
        url: `${SRM_DATA_SDAT}/v1/${organizationId}/customer-risk-process`,
        data: {
          ...param,
          processAction: actionList.join(','),
          broadcastReceivers: userList,
        },
        method: 'PUT',
      };
    },
  },
  pageSize: 10,
  primaryKey: 'id',
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get(`sdat.riskControl.model.disposalAction`).d('处置动作'),
      name: 'processAction',
      type: 'string',
      multiple: true,
      required: true,
      lookupCode: 'SDAT.WB2_PROCESS_ACTION',
    },
    {
      label: intl.get(`sdat.riskControl.model.disposalFeedback`).d('处置反馈'),
      name: 'processFeedback',
      type: 'string',
      lookupCode: 'SDAT.PROCESS_FEEDBACK',
    },
    {
      label: intl.get(`sdat.riskControl.model.broadcastContent`).d('广播内容'),
      name: 'processReason',
      required: true,
      type: 'string',
      maxLength: 200,
    },
    {
      name: 'riskEventId',
    },
    {
      name: 'broadcastWay',
    },
    {
      name: 'tenantId',
    },
    {
      name: 'userId',
    },
    {
      label: intl.get(`sdat.riskNewDefinition.model.broadcastAttach`).d('风险广播附件'),
      name: 'attachmentUuid',
      type: 'attachment',
      max: 10,
      fileSize: 500 * 1024 * 1024,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: BUCKET_DIRECTORY,
    },
  ],
  events: {},
});

export {
  RiskProviderDS,
  IncidentDetailDS,
  RiskVoucherDS,
  DisposalDS,
  AccountListDS,
  AccountViewListDS,
  EventCreateDS,
  AttachmentDS,
  BroadcastDS,
  CloseFormDS,
  CloseTableDS,
};
