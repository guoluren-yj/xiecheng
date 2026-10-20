/**
 * tableDS store
 */
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';

import { Prefix } from '@/utils/globalVariable';
import { getBatchOperationFlag } from '@/utils/utils';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.projectSetup';
const defaultPageSize = 20;

// 工作流审批信息加在
const workflowLoad = async ({ dataSet }) => {
  const businessKeys = dataSet.reduce((pre, record) => {
    const key = record.get('businessKey');
    if (key) {
      pre.push(key);
    }
    return pre;
  }, []);
  if (!isEmpty(businessKeys)) {
    // 查询审批按钮显示状态
    const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(businessKeys);
    // 查询审批记录数据
    const approvaFlags = await queryBatchApprovaFlag(businessKeys);
    // 查询撤销按钮显示状态
    const operationFlags = await getBatchOperationFlag(businessKeys);
    dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
  }
};

// 全部
const AllDS = () => ({
  primaryKey: 'sourceProjectId',
  selection: false,
  pageSize: defaultPageSize,
  fields: [
    {
      name: 'sourceProjectStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    // {
    //   name: 'sourceProjectObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.sourceProjectInfo`).d('寻源项目信息'),
    //   multiLine: true,
    // },
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectNum`).d('项目编号'),
      // bind: 'sourceProjectObj.sourceProjectNum',
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectName`).d('项目名称'),
      // bind: 'sourceProjectObj.sourceProjectName',
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
      // bind: 'sourceProjectObj.sourceCategoryMeaning',
    },
    {
      name: 'secondarySourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceMethod`).d('寻源方式'),
      // bind: 'sourceProjectObj.sourceMethodMeaning',
    },
    {
      name: 'implementation',
      label: intl.get(`${promptCode}.model.projectSetup.implementation`).d('执行情况'),
    },
    {
      name: 'sourceDate',
      label: intl.get(`${promptCode}.model.projectSetup.sourceDate`).d('寻源时间'),
    },
    {
      name: 'companyName',
      label: intl.get(`${promptCode}.model.projectSetup.companyName`).d('公司'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    // {
    //   name: 'creationInfoObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.creationInfo`).d('创建信息'),
    //   multiLine: true,
    // },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.creationDate`).d('创建日期'),
      // bind: 'creationInfoObj.creationDate',
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdByName`).d('创建人'),
      // bind: 'creationInfoObj.createdByName',
    },
    {
      name: 'createUnitName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdUnitName`).d('创建人部门'),
      // bind: 'creationInfoObj.createUnitName',
    },
    {
      name: 'syncStatusFlag',
      type: 'number',
      label: intl.get(`${promptCode}.model.projectSetup.exportStatus`).d('同步状态'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonSearch = {} },
      } = dataSet;
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/source-projects/all`,
        data: {
          customizeUnitCode:
            'SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER,SSRC.PROJECT_SETUP.NEW_LIST.ALL',
          ...commonSearch,
        },
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const businessKeys = dataSet.reduce((pre, record) => {
        const key = record.get('businessKey');
        if (key) {
          pre.push(key);
        }
        return pre;
      }, []);
      if (!isEmpty(businessKeys)) {
        // 查询审批按钮显示状态
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(businessKeys);
        // 查询审批记录数据
        const approvaFlags = await queryBatchApprovaFlag(businessKeys);
        // 查询撤销按钮显示状态
        const operationFlags = await getBatchOperationFlag(businessKeys);
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

// 待发布
const ToBeReleasedDS = () => ({
  primaryKey: 'sourceProjectId',
  selection: false,
  pageSize: defaultPageSize,
  fields: [
    {
      name: 'sourceProjectStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    // {
    //   name: 'sourceProjectObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.sourceProjectInfo`).d('寻源项目信息'),
    //   multiLine: true,
    // },
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectNum`).d('项目编号'),
      // bind: 'sourceProjectObj.sourceProjectNum',
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectName`).d('项目名称'),
      // bind: 'sourceProjectObj.sourceProjectName',
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
      // bind: 'sourceProjectObj.sourceCategoryMeaning',
    },
    {
      name: 'secondarySourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceMethod`).d('寻源方式'),
      // bind: 'sourceProjectObj.sourceMethodMeaning',
    },
    {
      name: 'finishingRate',
      label: intl.get(`${promptCode}.model.projectSetup.finishingRate`).d('完成度'),
    },
    {
      name: 'sourceDate',
      label: intl.get(`${promptCode}.model.projectSetup.sourceDate`).d('寻源时间'),
    },
    {
      name: 'companyName',
      label: intl.get(`${promptCode}.model.projectSetup.companyName`).d('公司'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    // {
    //   name: 'creationInfoObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.creationInfo`).d('创建信息'),
    //   multiLine: true,
    // },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.creationDate`).d('创建日期'),
      // bind: 'creationInfoObj.creationDate',
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdByName`).d('创建人'),
      // bind: 'creationInfoObj.createdByName',
    },
    {
      name: 'createUnitName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdUnitName`).d('创建人部门'),
      // bind: 'creationInfoObj.createUnitName',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonSearch = {} },
      } = dataSet;
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/source-projects/un-release`,
        data: {
          customizeUnitCode:
            'SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER,SSRC.PROJECT_SETUP.NEW_LIST.TO_BE_RELEASED',
          ...commonSearch,
        },
      };
    },
  },
});

// 进行中_待处理
const WaitingDS = () => ({
  primaryKey: 'sourceProjectId',
  selection: false,
  pageSize: 5,
  fields: [
    {
      name: 'sourceProjectStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    // {
    //   name: 'sourceProjectObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.sourceProjectInfo`).d('寻源项目信息'),
    //   multiLine: true,
    // },
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectNum`).d('项目编号'),
      // bind: 'sourceProjectObj.sourceProjectNum',
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectName`).d('项目名称'),
      // bind: 'sourceProjectObj.sourceProjectName',
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
      // bind: 'sourceProjectObj.sourceCategoryMeaning',
    },
    {
      name: 'secondarySourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceMethod`).d('寻源方式'),
      // bind: 'sourceProjectObj.sourceMethodMeaning',
    },
    {
      name: 'implementation',
      label: intl.get(`${promptCode}.model.projectSetup.implementation`).d('执行情况'),
    },
    {
      name: 'sourceDate',
      label: intl.get(`${promptCode}.model.projectSetup.sourceDate`).d('寻源时间'),
    },
    {
      name: 'companyName',
      label: intl.get(`${promptCode}.model.projectSetup.companyName`).d('公司'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    // {
    //   name: 'creationInfoObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.creationInfo`).d('创建信息'),
    //   multiLine: true,
    // },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.creationDate`).d('创建日期'),
      // bind: 'creationInfoObj.creationDate',
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdByName`).d('创建人'),
      // bind: 'creationInfoObj.createdByName',
    },
    {
      name: 'createUnitName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdUnitName`).d('创建人部门'),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonSearch = {} },
      } = dataSet;
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/source-projects/to-be-processed`,
        data: {
          customizeUnitCode:
            'SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER,SSRC.PROJECT_SETUP.NEW_LIST.PENDING',
          ...commonSearch,
        },
      };
    },
  },
  events: {
    load: async (...args) => {
      await workflowLoad(...args);
    },
  },
});

// 进行中_待审批
const PendingDS = () => ({
  primaryKey: 'sourceProjectId',
  selection: false,
  pageSize: 5,
  fields: [
    {
      name: 'sourceProjectStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    // {
    //   name: 'sourceProjectObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.sourceProjectInfo`).d('寻源项目信息'),
    //   multiLine: true,
    // },
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectNum`).d('项目编号'),
      // bind: 'sourceProjectObj.sourceProjectNum',
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectName`).d('项目名称'),
      // bind: 'sourceProjectObj.sourceProjectName',
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
      // bind: 'sourceProjectObj.sourceCategoryMeaning',
    },
    {
      name: 'secondarySourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceMethod`).d('寻源方式'),
      // bind: 'sourceProjectObj.sourceMethodMeaning',
    },
    {
      name: 'implementation',
      label: intl.get(`${promptCode}.model.projectSetup.implementation`).d('执行情况'),
    },
    {
      name: 'sourceDate',
      label: intl.get(`${promptCode}.model.projectSetup.sourceDate`).d('寻源时间'),
    },
    {
      name: 'companyName',
      label: intl.get(`${promptCode}.model.projectSetup.companyName`).d('公司'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    // {
    //   name: 'creationInfoObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.creationInfo`).d('创建信息'),
    //   multiLine: true,
    // },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.creationDate`).d('创建日期'),
      // bind: 'creationInfoObj.creationDate',
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdByName`).d('创建人'),
      // bind: 'creationInfoObj.createdByName',
    },
    {
      name: 'createUnitName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdUnitName`).d('创建人部门'),
      // bind: 'creationInfoObj.createUnitName',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonSearch = {} },
      } = dataSet;
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/source-projects/pending`,
        data: {
          customizeUnitCode:
            'SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER,SSRC.PROJECT_SETUP.NEW_LIST.PENDING_APPROVAL',
          ...commonSearch,
        },
      };
    },
  },
  events: {
    load: async (...args) => {
      await workflowLoad(...args);
    },
  },
});

// 完成
const FinishedDS = () => ({
  primaryKey: 'sourceProjectId',
  selection: false,
  pageSize: defaultPageSize,
  fields: [
    {
      name: 'sourceProjectStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'action',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    // {
    //   name: 'sourceProjectObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.sourceProjectInfo`).d('寻源项目信息'),
    //   multiLine: true,
    // },
    {
      name: 'sourceProjectNum',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectNum`).d('项目编号'),
      // bind: 'sourceProjectObj.sourceProjectNum',
    },
    {
      name: 'sourceProjectName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceProjectName`).d('项目名称'),
      // bind: 'sourceProjectObj.sourceProjectName',
    },
    {
      name: 'sourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
      // bind: 'sourceProjectObj.sourceCategoryMeaning',
    },
    {
      name: 'secondarySourceCategoryMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceCategory`).d('寻源类别'),
    },
    {
      name: 'sourceMethodMeaning',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.sourceMethod`).d('寻源方式'),
      // bind: 'sourceProjectObj.sourceMethodMeaning',
    },
    {
      name: 'biddingInfo',
      label: intl.get(`${promptCode}.model.projectSetup.biddingInfo`).d('中标情况'),
      maxLength: 300,
    },
    {
      name: 'finishedDate',
      label: intl.get(`${promptCode}.model.projectSetup.sourceFinishedDate`).d('寻源完成时间'),
    },
    {
      name: 'companyName',
      label: intl.get(`${promptCode}.model.projectSetup.companyName`).d('公司'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrgName`).d('采购组织名称'),
    },
    // {
    //   name: 'creationInfoObj',
    //   type: 'object',
    //   label: intl.get(`${promptCode}.model.projectSetup.creationInfo`).d('创建信息'),
    //   multiLine: true,
    // },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.creationDate`).d('创建日期'),
      // bind: 'creationInfoObj.creationDate',
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdByName`).d('创建人'),
      // bind: 'creationInfoObj.createdByName',
    },
    {
      name: 'createUnitName',
      type: 'string',
      label: intl.get(`${promptCode}.model.projectSetup.createdUnitName`).d('创建人部门'),
      // bind: 'creationInfoObj.createUnitName',
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const {
        queryParameter: { commonSearch = {} },
      } = dataSet;
      return {
        method: 'GET',
        url: `${Prefix}/${organizationId}/source-projects/finish`,
        data: {
          customizeUnitCode:
            'SSRC.PROJECT_SETUP.NEW_LIST.SOURCE_FILTER,SSRC.PROJECT_SETUP.NEW_LIST.FINISHED',
          ...commonSearch,
        },
      };
    },
  },
});

const SourcingTemplateDS = (record, selectedLength) => ({
  autoCreate: true,
  fields: [
    {
      // 此列（天齐锂业）二开 勿删
      name: 'templateId',
      label: intl.get(`${promptCode}.model.projectSetup.sourcingTemplate`).d('寻源模板'),
      required: true,
      type: 'object',
      lovCode: 'SSRC.TEMPLATE_NAME',
      // 此列（天齐锂业）二开 对象结构勿改动勿删
      lovPara: Object.assign(
        {},
        {
          sourceCategory: record.get('sourceCategory') === 'BID' ? 'BID' : 'RFX',
          secondarySourceCategory:
            record.get('secondarySourceCategory') === 'NEW_BID' ? 'NEW_BID' : null,
          sourceProjectId: record.get('sourceProjectId'),
        },
        record.get('sourceCategory') === 'BID' && {
          subjectMatterRule: record.get('subjectMatterRule'),
        }
      ),
      transformRequest: (value = {}) => value?.templateId,
    },
    {
      name: 'bidRuleType',
      type: 'string',
      bind: 'templateId.bidRuleType',
    },
    {
      name: 'qualificationType',
      bind: 'templateId.qualificationType',
    },
    {
      name: 'mergeType',
      label: intl.get(`${promptCode}.model.projectSetup.prequalMergeType`).d('资格预审合并方式'),
      type: 'string',
      lookupCode: 'SSRC_PREQUAL_MERGE_TYPE',
      dynamicProps: {
        required({ record: r, dataSet: { queryParameter } }) {
          const { subjectMatterRule } = queryParameter;
          return (
            subjectMatterRule === 'PACK' &&
            r.get('qualificationType') === 'PRE' &&
            selectedLength > 1
          );
        },
      },
    },
  ],
});

const rfiTemplateDS = () => ({
  autoCreate: true,
  selection: 'single',
  fields: [
    {
      name: 'rfTemplateLov',
      type: 'object',
      lovCode: 'SSRC.RF_TEMPLATE',
      lovPara: {
        latestFlag: 'Y',
        sourceCategory: 'RFI',
      },
    },
    {
      name: 'templateId',
      bind: 'rfTemplateLov.templateId',
    },
  ],
});

const rfpTemplateDS = () => ({
  autoCreate: true,
  selection: 'single',
  fields: [
    {
      name: 'rfTemplateLov',
      type: 'object',
      lovCode: 'SSRC.RF_TEMPLATE',
      lovPara: {
        latestFlag: 'Y',
        sourceCategory: 'RFP',
      },
    },
    {
      name: 'templateId',
      bind: 'rfTemplateLov.templateId',
    },
  ],
});

export {
  AllDS,
  ToBeReleasedDS,
  WaitingDS,
  PendingDS,
  FinishedDS,
  SourcingTemplateDS,
  rfiTemplateDS,
  rfpTemplateDS,
};
