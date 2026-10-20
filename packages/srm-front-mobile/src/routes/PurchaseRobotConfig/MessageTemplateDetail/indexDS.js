import intl from 'utils/intl';
import { SRM_SMBL } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 基本信息
export const basicInfoDS = (templateId, load) => ({
  autoQuery: !!templateId,
  autoCreate: false,
  fields: [
    {
      name: 'templateName',
      label: intl
        .get('smbl.purchaseRobotConfig.model.robotMessageTemplateName')
        .d('机器人消息模板名称'),
      required: true,
      type: 'intl',
    },
    {
      name: 'templateCode',
      label: intl
        .get('smbl.purchaseRobotConfig.model.robotMessageTemplateCode')
        .d('机器人消息模板编码'),
      required: true,
      format: 'uppercase',
      dynamicProps: {
        disabled: ({ record }) => {
          return !!record.get('templateId');
        },
      },
    },
    {
      name: 'tenantId',
      label: intl.get('smbl.purchaseRobotConfig.model.skillSource').d('数据来源'),
    },
    {
      name: 'remark',
      label: intl
        .get('smbl.purchaseRobotConfig.model.messageTemplateRemark')
        .d('机器人消息模板说明'),
      type: 'intl',
    },
    {
      name: 'enabledFlag',
      label: intl.get('smbl.purchaseRobotConfig.model.enabled').d('启用'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
  ],
  events: {
    load,
  },
  transport: {
    read: ({ data }) => {
      const { templateId: id } = data;
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/${templateId || id}`,
        method: 'GET',
      };
    },
  },
});

// 行信息
export const taskLineDS = (templateId, readOnly) => ({
  primaryKey: 'taskLine',
  autoQuery: true,
  exportMode: 'client',
  pageSize: 10,
  selection: readOnly ? false : 'multiple',
  cacheSelection: true,
  cacheModified: true,
  fields: [
    {
      name: 'thirdParty',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMBL.THIRD_PARTY.VIEW',
      label: intl.get('smbl.purchaseRobotConfig.model.thirdParty').d('适用三方平台'),
      textField: 'thirdPartyDesc',
      valueField: 'thirdPartyCode',
      required: true,
    },
    {
      name: 'thirdPartyCode',
      bind: 'thirdParty.thirdPartyCode',
    },
    {
      name: 'thirdPartyDesc',
      bind: 'thirdParty.thirdPartyDesc',
    },
    {
      name: 'executeJs',
      label: intl.get('smbl.purchaseRobotConfig.model.condition').d('卡片条件'),
    },
    {
      name: 'msgTmpLineUuid',
      label: intl.get('smbl.purchaseRobotConfig.model.condition').d('卡片条件'),
    },
    {
      name: 'msgMarmotCode',
      label: intl.get('smbl.purchaseRobotConfig.model.msgMarmotCode').d('卡片条件脚本编码'),
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.remark').d('备注'),
      type: 'intl',
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('smbl.purchaseRobotConfig.model.record').d('调用记录'),
    },
    {
      name: 'operation',
      label: intl.get('smbl.purchaseRobotConfig.model.operator').d('操作'),
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      const templateID = dataSet.getQueryParameter('templateId');
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/line`,
        method: 'GET',
        data: {
          ...data,
          templateId: templateId || templateID,
        },
      };
    },
    submit: ({ data, dataSet }) => {
      const templateID = dataSet.getQueryParameter('templateId');
      const params = data.map(item => ({
        ...item,
        tenantId: organizationId,
        templateId: templateId || templateID,
      }));

      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/line/save`,
        method: 'POST',
        data: params,
      };
    },
    destroy: () => ({
      url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/line/delete`,
      method: 'delete',
    }),
  },
});

// 卡片自定义字段DS
export const cardEditDS = () => ({
  primaryKey: 'cardEdit',
  autoQuery: false,
  pageSize: 10,
  cacheSelection: true,
  cacheModified: true,
  fields: [
    {
      name: 'title',
      label: intl.get('smbl.purchaseRobotConfig.model.messageCardTitle').d('标题'),
      maxLength: 36,
      required: true,
      type: 'intl',
    },
    {
      name: 'desc',
      label: intl.get('smbl.purchaseRobotConfig.model.messageCardSubTitle').d('标题辅助信息'),
      maxLength: 44,
      required: true,
      type: 'intl',
    },
    {
      name: 'cardImag',
      // label: intl.get('smbl.purchaseRobotConfig.model.cardImag').d('卡片配图'),
      defaultValue: '-',
    },
    {
      name: 'cardLink',
      label: intl.get('smbl.purchaseRobotConfig.model.cardLink').d('卡片链接'),
    },
  ],
});

// 卡片自定义按钮DS
export const cardButtonEditDS = () => ({
  primaryKey: 'cardButtonEdit',
  autoQuery: false,
  pageSize: 10,
  fields: [
    {
      name: 'buttonName',
      label: intl.get('smbl.purchaseRobotConfig.model.card.buttonName').d('按钮名称'),
      type: 'intl',
      maxLength: 10,
      required: true,
    },
    {
      name: 'buttonType',
      label: intl.get('smbl.purchaseRobotConfig.model.card.buttonType').d('按钮类型'),
      type: 'string',
      lookupCode: 'SMBL.SKILL_MSG_BUTTON_TYPE',
    },
    {
      name: 'buttonStyle',
      type: 'string',
      required: true,
      lookupCode: 'SMBL.SKILL_MSG_BUTTON_COLOR',
      label: intl.get('smbl.purchaseRobotConfig.model.card.buttonStyle').d('按钮样式'),
    },
    {
      name: 'buttonUrl',
      type: 'string',
      required: true,
      lookupCode: 'SMBL.SKILL_MSG_BUTTON_URL',
      label: intl.get('smbl.purchaseRobotConfig.model.card.buttonUrl').d('url'),
    },
    {
      name: 'eventKey',
      label: intl.get('smbl.purchaseRobotConfig.model.card.eventKey').d('eventKey'),
      required: true,
      type: 'object',
      ignore: 'always',
      lovCode: 'SMBL.SKILL_MSG_BUTTON_LIST',
    },
    {
      name: 'buttonKey',
      bind: 'eventKey.eventKey',
    },
  ],
});

// 卡片自定义-二级垂直内容
export const cardVerticalContentEditDS = () => ({
  primaryKey: 'cardVerticalContentEdit',
  autoQuery: false,
  pageSize: 10,
  cacheSelection: true,
  cacheModified: true,
  fields: [
    {
      name: 'title',
      label: intl.get('smbl.purchaseRobotConfig.model.messageCardTitle').d('标题'),
      maxLength: 36,
      required: true,
      defaultValue: '-',
      type: 'intl',
    },
    {
      name: 'desc',
      label: intl.get('smbl.purchaseRobotConfig.model.messageCardSubTitle').d('标题辅助信息'),
      defaultValue: '-',
      required: true,
      type: 'intl',
    },
  ],
});

// 卡片列表
export const editFormDS = templateLineId => ({
  primaryKey: 'editForm',
  autoQuery: false,
  pageSize: 100,
  autoQueryAfterSubmit: false, // 提交后自动查询
  autoLocateFirst: false, // 加载后自动定位到第一条
  autoLocateAfterRemove: false,
  fields: [
    {
      name: 'cardName',
      label: intl.get('smbl.purchaseRobotConfig.model.cardName').d('卡片名称'),
      required: true,
      type: 'intl',
    },
    {
      name: 'cardCode',
      label: intl.get('smbl.purchaseRobotConfig.model.cardCode').d('卡片编码'),
      required: true,
      format: 'uppercase',
    },
    {
      name: 'remark',
      label: intl.get('smbl.purchaseRobotConfig.model.remarks').d('备注'),
      type: 'intl',
    },
    {
      name: 'covertJs',
      label: intl.get('smbl.purchaseRobotConfig.model.covertJs').d('卡片构成'),
    },
    {
      name: 'cardUuid',
      label: intl.get('smbl.purchaseRobotConfig.model.covertJs').d('卡片构成'),
    },
    {
      name: 'cardMarmotCode',
      label: intl.get('smbl.purchaseRobotConfig.model.cardMarmotCode').d('卡片构成脚本编码'),
    },
    {
      name: 'sourceJson',
      label: intl.get('smbl.purchaseRobotConfig.model.sourceJson').d('卡片字段'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/list`,
        method: 'GET',
        data: {
          ...data,
          templateLineId,
        },
      };
    },
    destroy: () => {
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/delete`,
        method: 'DELETE',
      };
    },
    submit: ({ data }) => {
      const newData = data.map(item => ({
        ...item,
        templateLineId,
        tenantId: getCurrentOrganizationId(),
      }));
      return {
        url: `${SRM_SMBL}/v1/${organizationId}/robot/msg/template/content/save`,
        method: 'POST',
        data: newData,
      };
    },
  },
});

// 卡片自定义下拉框DS
export const cardSelectEditDS = () => ({
  primaryKey: '_uuid',
  autoQuery: false,
  pageSize: 10,
  fields: [
    {
      name: 'fieldCode',
      label: intl.get('smbl.purchaseRobotConfig.model.card.fieldCode').d('字段编码'),
      type: 'string',
      required: true,
    },
    {
      name: 'fieldName',
      label: intl.get('smbl.purchaseRobotConfig.model.card.selectFieldName').d('字段名'),
      type: 'intl',
      maxLength: 10,
      required: true,
    },
    {
      name: 'selectObj',
      label: intl.get('smbl.purchaseRobotConfig.model.card.selectLov').d('选择值集'),
      type: 'object',
      lovCode: 'SMBL.VALUE_SET_ALL_LIST',
      noCache: true,
      required: true,
      lovQueryAxiosConfig: () => {
        return {
          url: `/hpfm/v1/0/lov-headers?enabledFlag=1`,
          method: 'GET',
        };
      },
    },
    {
      name: 'lookupCode',
      bind: 'selectObj.lookupCode',
    },
    {
      name: 'displayField',
      label: intl.get('smbl.purchaseRobotConfig.model.card.displayField').d('显示字段名'),
      type: 'string',
      required: true,
    },
    {
      name: 'dataIndex',
      label: intl.get('smbl.purchaseRobotConfig.model.card.keyField').d('值字段名'),
      type: 'string',
      required: true,
    },
  ],
});
