import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const nodePolicyListDS = () => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  selection: false,
  pageSize: 20,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-str-headers`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'strategyStatusCode',
      type: 'string',
      disabled: true,
      lookupCode: 'SMDM_ITEM_AUTH_STR_STATUS_CODE',
      label: intl.get(`hzero.common.button.status`).d('状态'),
    },
    {
      name: 'strategyNum',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.strategyNum`).d('策略编号'),
    },
    {
      name: 'strategyName',
      type: 'string',
      label: intl.get(`${commonPrompt}.strategyName`).d('策略名称'),
      disabled: true,
    },
    {
      name: 'itemAuthStrLineList',
      label: intl.get(`${commonPrompt}.executionPhase`).d('执行阶段'),
    },
    {
      name: 'versionNumber',
      type: 'number',
      label: intl.get(`${commonPrompt}.versionNumber`).d('版本号'),
    },
    {
      name: 'createdByName',
      type: 'string',
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.lastUpdateDate`).d('最后更新时间'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get(`hzero.common.buttom.action`).d('操作'),
    },
  ],
});

const headerInfoDs = ({ strategyHeaderId, isHistory = false }) => ({
  autoQuery: false,
  autoCreate: false,
  dataToJSON: 'all',
  selection: false,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/${
        isHistory ? 'item-auth-str-header-hiss' : 'item-auth-str-headers'
      }/${strategyHeaderId}`,
      method: 'GET',
    },
  },
  fields: [
    {
      name: 'strategyStatusCode',
      type: 'string',
      lookupCode: 'SMDM_ITEM_AUTH_STR_STATUS_CODE',
      label: intl.get(`hzero.common.button.status`).d('状态'),
      disabled: true,
    },
    {
      name: 'strategyNum',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.strategyNum`).d('策略编号'),
      validator: (value) => {
        if (value) {
          const reg = /[\u4E00-\u9FA5]/;
          if (reg.test(value)) {
            return intl.get(`${commonPrompt}.strategyNumVaildator`).d('策略编号不能输入中文');
          } else {
            return true;
          }
        } else {
          return true;
        }
      },
      dynamicProps: {
        disabled: ({ record }) => {
          return !!record.get('strategyHeaderId');
        },
      },
    },
    {
      name: 'strategyName',
      type: 'string',
      required: true,
      label: intl.get(`${commonPrompt}.strategyName`).d('策略名称'),
    },
    {
      name: 'versionNumber',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.versionNumber`).d('版本号'),
    },
    {
      name: 'createdByName',
      type: 'string',
      disabled: true,
      label: intl.get(`${commonPrompt}.createdByName`).d('创建人'),
    },
    {
      name: 'strategyDimension',
      type: 'string',
      required: true,
      lookupCode: 'SMDM_ITEM_AUTH_STR_DIMENSION',
      label: intl.get(`${commonPrompt}.strategyDimension`).d('认证维度'),
    },
    {
      name: 'lastUpdateDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.lastUpdateDate`).d('最后更新时间'),
    },
    {
      name: 'action',
      type: 'string',
      label: intl.get(`hzero.common.buttom.action`).d('操作'),
    },
  ],
});

const policyListDS = ({ strategyHeaderId, isHistory = false, multiple = true }) => ({
  autoQuery: false,
  cacheSelection: true,
  cacheModified: true,
  dataToJSON: 'all',
  primaryKey: 'strategyLineId',
  pageSize: 20,
  selection: multiple ? 'multiple' : false,
  transport: {
    read: {
      url: `${SRM_MDM}/v1/${tenantId}/${
        isHistory ? 'item-auth-str-line-hiss' : 'item-auth-str-lines'
      }/${strategyHeaderId}`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_MDM}/v1/${tenantId}/item-auth-str-lines`,
      method: 'DELETE',
    },
  },
  fields: [
    {
      name: 'orderSeq',
      type: 'number',
      disabled: true,
      step: 1,
      min: 0,
      label: intl.get(`${commonPrompt}.NodeorderSeq`).d('阶段顺序'),
      validator: (value, _, record) => {
        if (Number(record.get('orderSeq')) <= 0) {
          return intl.get(`${commonPrompt}.orderSeqMustExceedZero`).d('阶段顺序必须大于零');
        }
        return true;
      },
    },
    {
      name: 'nodeCode',
      type: 'string',
      required: true,
      lookupCode: 'SMDM.ITEM_AUTH_STA_NODE',
      label: intl.get(`${commonPrompt}.nodeName`).d('阶段名称'),
      dynamicProps: {
        disabled: ({ record }) => {
          return !!record.get('strategyLineId');
        },
      },
    },
    {
      name: 'operateRoleList',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_ROLE',
      multiple: true,
      label: intl.get(`${commonPrompt}.operateRoleList`).d('操作权限角色'),
    },
    {
      name: 'operateRoleIdList',
      bind: 'operateRoleList.roleId',
    },
    {
      name: 'queryRoleList',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_ROLE',
      multiple: true,
      label: intl.get(`${commonPrompt}.queryRoleList`).d('查询权限角色'),
    },
    {
      name: 'queryRoleIdList',
      bind: 'queryRoleList.roleId',
    },
    {
      name: 'operateRoleHisList',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_ROLE',
      multiple: true,
      label: intl.get(`${commonPrompt}.operateRoleList`).d('操作权限角色'),
    },
    {
      name: 'queryRoleHisList',
      type: 'object',
      lovCode: 'SMDM.ITEM_AUTH_ROLE',
      multiple: true,
      label: intl.get(`${commonPrompt}.queryRoleList`).d('查询权限角色'),
    },
    {
      name: 'skipFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      help: intl
        .get(`${commonPrompt}.skipFlagHelp`)
        .d(
          '配置该策略的当前阶段是否可跳过，如果可跳过，在执行下一阶段时，会展示跳过按钮，点击跳过执行下一阶段流程'
        ),
      label: intl.get(`${commonPrompt}.skipFlag`).d('阶段是否可跳过'),
    },
    {
      name: 'releaseRule',
      type: 'sting',
      defaultValue: 'NONE',
      lookupCode: 'SMDM_ITEM_AUTH_STA_RELEASE_RULE',
      required: true,
      label: intl.get(`${commonPrompt}.releaseRule`).d('阶段发布审批规则'),
    },
    {
      name: 'feedbackFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.feedbackFlag`).d('阶段是否反馈'),
    },
    {
      name: 'testingResultEnterFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.testingResultEnterFlag`).d('反馈后是否录入检测结果'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('feedbackFlag'),
      },
    },
    {
      name: 'preapprovalFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.preapprovalFlag`).d('反馈后是否预审'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('feedbackFlag'),
      },
    },
    {
      name: 'earlyTerminationFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.earlyTerminationFlag`).d('阶段是否可提前完成'),
    },
    {
      name: 'closedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
      required: true,
      label: intl.get(`${commonPrompt}.closedFlag`).d('阶段可关闭'),
    },
    {
      name: 'closedRule',
      type: 'string',
      required: true,
      defaultValue: 'NONE',
      lookupCode: 'SMDM_ITEM_AUTH_STA_CLOSED_RULE',
      label: intl.get(`${commonPrompt}.closedRule`).d('阶段关闭审批规则'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('closedFlag'),
        required: ({ record }) => !!record.get('closedFlag'),
      },
    },
    {
      name: 'feedbackRule',
      type: 'sting',
      lookupCode: 'SMDM_ITEM_AUTH_STA_FEEDBACK_RULE',
      required: true,
      defaultValue: 'NONE',
      label: intl.get(`${commonPrompt}.feedbackRule`).d('阶段反馈审批规则'),
      dynamicProps: {
        disabled: ({ record }) => !record.get('feedbackFlag'),
        required: ({ record }) => !!record.get('feedbackFlag'),
      },
    },
    {
      name: 'feedbackRejectReturnRule',
      type: 'sting',
      lookupCode: 'SMDM.ITEM.AUTH_FEE_REJECT_RETURN_RULE',
      label: intl.get(`${commonPrompt}.feedbackRejectReturnRule`).d('反馈审批拒绝退回规则'),
      dynamicProps: {
        disabled: ({ record }) =>
          record.get('feedbackRule') === 'NONE' || !record.get('feedbackFlag'),
        required: ({ record }) => record.get('feedbackRule') !== 'NONE',
      },
    },
  ],
  events: {
    update: ({ name, record, value }) => {
      if (name === 'nodeCode') {
        if (value) {
          const data = record.getField('nodeCode').getLookupData(value, record);
          record.set({
            orderSeq: data?.orderSeq,
            nodeId: data?.nodeId,
          });
        } else {
          record.set({
            orderSeq: null,
            nodeId: null,
          });
        }
      }

      if (name === 'feedbackFlag') {
        record.set({ feedbackRule: 'NONE', feedbackRejectReturnRule: null });
        if (value === 0) {
          record.set({ preapprovalFlag: 0, testingResultEnterFlag: 0 });
        }
      }

      if (name === 'closedFlag') {
        record.set({ closedRule: 'NONE' });
      }
      if (name === 'feedbackRule') {
        record.set({ feedbackRejectReturnRule: null });
      }
    },
  },
});

export { nodePolicyListDS, headerInfoDs, policyListDS };
