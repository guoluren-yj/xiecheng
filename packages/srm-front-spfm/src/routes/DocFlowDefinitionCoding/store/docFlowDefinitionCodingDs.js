/**
 * docFlowDefinitionCodingDs.js
 * 节点详情定义 Dataset
 * @date: 2021-08-30
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;
function getOverviewOfNodesDs() {
  return {
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    pageSize: 20,
    selection: 'multiple',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'id',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.view.number').d('编号'),
      },
      {
        name: 'displayField',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        textField: 'fieldName',
        valueField: 'fieldId',
        dynamicProps: {
          lovPara: ({ dataSet, record }) => ({
            tenantId: organizationId,
            // nodeDefCode: dataSet?.getState('nodeDefinitionCode'),
            nodeDefCode: record?.get('nodeDefinitionCode') || dataSet?.getState('nodeDefinitionCode'),
          }),
        },
        label: intl.get('spfm.docFlowDefinitionCoding.model.display.field').d('展示字段'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('spfm.docFlowDefinitionCoding.model.display.field').d('展示字段'),
        bind: 'displayField.fieldName',
      },
      {
        name: 'fieldId',
        bind: 'displayField.fieldId',
      },
      {
        name: 'nodeDefinitionCode',
        type: 'string',
        label: intl.get('spfm.progressDefinition.modal.node.code').d('节点code'),
      },
      {
        name: 'fieldSequence',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.field.order').d('字段顺序'),
        placeholder: intl.get('hzero.common.validation.requireNumber').d('请输入数字'),
        required: true,
      },
      {
        name: 'tenantId',
        type: 'string',
        label: intl.get('spfm.docFlowDefinitionCoding.model.view.tenantId').d('租户ID'),
      },
      {
        name: 'headerFlag',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.information.select').d('头/行信息'),
        placeholder: intl.get('spfm.docFlowDefinitionCoding.model.view.select').d('请选择'),
        required: true,
      },
      // {
      //   name: 'attachmentFlag',
      //   type: 'boolean',
      //   defaultValue: 0,
      //   trueValue: 1,
      //   falseValue: 0,
      //   label: intl
      //     .get('spfm.docFlowDefinitionCoding.model.field.attachmentFlag')
      //     .d('是否附件类型'),
      // },
      // {
      //   name: 'bucketCode',
      //   type: 'string',
      //   dynamicProps: {
      //     required: ({ record }) => record.get('attachmentFlag'),
      //     disabled: ({ record }) => record.get('attachmentFlag') !== 1,
      //   },
      //   lookupCode: 'HPFM.CUST.WIDGET.BUCKET',
      //   label: intl.get('spfm.docFlowDefinitionCoding.model.field.bucketName').d('附件桶名'),
      // },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-details`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/node-details`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      update: ({ name, value, record }) => {
        if (name === 'attachmentFlag' && !value) {
          record.set({ bucketCode: null });
        }
      },
    },
  };
}

function getProgressDefinition() {
  return {
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    pageSize: 20,
    selection: 'multiple',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'id',
        type: 'number',
      },
      {
        name: 'nodeDefinitionCode',
        type: 'string',
        label: intl.get('spfm.progressDefinition.modal.node.code').d('节点code'),
      },
      {
        name: 'operateField',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        dynamicProps: {
          lovPara: ({ dataSet }) => ({
            tenantId: organizationId,
            nodeDefCode: dataSet.getState('nodeDefinitionCode'),
            // nodeDefCode: record?.get('nodeDefinitionCode'),
          }),
        },
        label: intl.get('spfm.statusPhaseMapping.modal.view.operateFieldName').d('操作字段名称'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'operateFieldId',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldConfiguration').d('表字段配置Id'),
        bind: 'operateField.fieldId',
      },
      {
        name: 'operateFieldName',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.operateFieldName').d('操作人字段'),
        bind: 'operateField.fieldName',
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'field',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        dynamicProps: {
          lovPara: ({ dataSet }) => ({
            tenantId: organizationId,
            nodeDefCode: dataSet.getState('nodeDefinitionCode'),
            // nodeDefCode: record.get('nodeDefinitionCode'),
          }),
        },
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldName').d('变更展示字段名称'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'fieldId',
        type: 'string',
        bind: 'field.fieldId',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldName').d('变更展示字段名称'),
        bind: 'field.fieldName',
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-progress-defs`,
          method: 'get',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/node-progress-defs`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
}

function getStatusPhaseMapping() {
  return {
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    pageSize: 20,
    selection: 'multiple',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'id',
        type: 'number',
        label: 'ID',
      },
      {
        name: 'fieldValue',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.fieldValue').d('字段值'),
        required: true,
      },
      {
        name: 'actionDescription',
        type: 'intl',
        label: intl.get('spfm.statusPhaseMapping.modal.action.description').d('动作描述'),
        required: true,
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'progressDefId',
        type: 'string',
      },
      {
        name: 'stage',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.stage').d('对应阶段'),
        required: true,
      },
      {
        name: 'icon',
        type: 'string',
        label: intl.get('spfm.statusPhaseMapping.modal.view.icon').d('节点图标'),
      },
      {
        name: 'iconColor',
        type: 'color',
        label: intl.get('spfm.statusPhaseMapping.modal.view.iconColor').d('图标颜色'),
      },
      {
        name: 'actionSummary',
        type: 'intl',
        label: intl.get('spfm.statusPhaseMapping.modal.view.actionSummary').d('动作摘要'),
        required: true,
      },
      {
        name: 'documentName',
        type: 'intl',
        label: intl.get('spfm.statusPhaseMapping.modal.view.documentName').d('展示单据名称'),
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-prog-def-maps`,
          method: 'get',
        };
      },
    },
  };
}

function getJumpDetailLink() {
  return {
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    pageSize: 20,
    selection: 'multiple',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'id',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.view.number').d('编号'),
      },
      {
        name: 'link',
        type: 'string',
        required: true,
        label: intl.get('spfm.statusPhaseMapping.modal.view.linkCode').d('节点链接'),
      },
      {
        name: 'linkTitle',
        type: 'string',
        required: true,
        label: intl.get('spfm.statusPhaseMapping.modal.view.linkTitle').d('跳转明细标题'),
      },
      {
        name: 'paramsDefine',
        type: 'object',
        label: intl.get('spfm.statusPhaseMapping.modal.view.paramsDefine').d('参数定义'),
      },
      {
        name: 'priority',
        type: 'number',
        required: true,
        label: intl.get('hzero.common.priority').d('优先级'),
        placeholder: intl.get('hzero.common.validation.requireNumber').d('请输入数字'),
      },
      {
        name: 'enabledParams',
        type: 'object',
        label: intl.get('spfm.statusPhaseMapping.modal.view.enabledParams').d('启用条件'),
      },
      {
        name: 'tenantId',
        type: 'string',
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-links`, // /${organizationId}
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/node-links`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
}

function getPerformDocumentsDs() {
  return {
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    pageSize: 20,
    selection: 'multiple',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'id',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.view.number').d('编号'),
      },
      {
        name: 'displayField',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        textField: 'fieldName',
        valueField: 'fieldId',
        // lovPara: { tenantId: organizationId },
        dynamicProps: {
          lovPara: ({ dataSet }) => ({
            tenantId: organizationId,
            nodeDefCode: dataSet.getState('nodeDefinitionCode'),
          }),
        },
        label: intl.get('spfm.docFlowDefinitionCoding.model.display.field').d('展示字段'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('spfm.docFlowDefinitionCoding.model.display.field').d('展示字段'),
        bind: 'displayField.fieldName',
      },
      {
        name: 'fieldId',
        bind: 'displayField.fieldId',
      },
      {
        name: 'nodeDefinitionCode',
        type: 'string',
        label: intl.get('spfm.progressDefinition.modal.node.code').d('节点code'),
      },
      {
        name: 'fieldSequence',
        type: 'number',
        label: intl.get('spfm.docFlowDefinitionCoding.model.field.order').d('字段顺序'),
        placeholder: intl.get('hzero.common.validation.requireNumber').d('请输入数字'),
        required: true,
      },
      {
        name: 'tenantId',
        type: 'string',
        label: intl.get('spfm.docFlowDefinitionCoding.model.view.tenantId').d('租户ID'),
      },
      {
        name: 'statusFlag',
        type: 'number',
        defaultValue: 0,
        label: intl.get('spfm.docFlowDefinitionCoding.model.statusFlag.select').d('是否状态字段'),
        placeholder: intl.get('spfm.docFlowDefinitionCoding.model.view.select').d('请选择'),
        required: true,
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-rel-doc-configs`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/node-rel-doc-configs`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
}

function getActionConfigurationDs() {
  return {
    dataToJSON: 'all',
    primaryKey: "id",
    autoQuery: false,
    pageSize: 20,
    selection: 'multiple',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    fields: [
      {
        name: 'id',
        type: 'number',
      },
      {
        name: 'displayField',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        textField: 'fieldName',
        valueField: 'fieldId',
        lovPara: { tenantId: organizationId },
        label: intl.get('spfm.actionConfiguration.model.display.field').d('对比字段'),
        required: true,
        ignore: 'always',
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('spfm.actionConfiguration.model.display.field').d('对比字段'),
        bind: 'displayField.fieldName',
      },
      {
        name: 'fieldId',
        bind: 'displayField.fieldId',
      },
      {
        name: 'nodeDefinitionCode',
        type: 'string',
        label: intl.get('spfm.progressDefinition.modal.node.code').d('节点code'),
      },
      {
        name: 'statusFlag',
        type: 'boolean',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('spfm.docFlowDefinitionCoding.model.statusFlag.select').d('是否状态字段'),
        required: true,
      },
      {
        name: 'tenantId',
        type: 'string',
        label: intl.get('spfm.docFlowDefinitionCoding.model.view.tenantId').d('租户ID'),
      },
      {
        name: 'operateField',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        lovPara: { tenantId: organizationId },
        label: intl.get('spfm.statusPhaseMapping.modal.view.operateFieldName').d('操作人字段'),
        dynamicProps: {
          required: ({ record }) => record.get('statusFlag') === 1,
        },
        ignore: 'always',
      },
      {
        name: 'operateFieldId',
        type: 'string',
        bind: 'operateField.fieldId',
      },
      {
        name: 'operateFieldName',
        type: 'string',
        bind: 'operateField.fieldName',
      },
      {
        name: 'commentField',
        type: 'object',
        lovCode: 'SDPS.DOCF.FIELD_DEFINITION',
        lovPara: { tenantId: organizationId },
        label: intl.get('spfm.actionConfiguration.modal.view.comment').d('结果字段'),
        ignore: 'always',
      },
      {
        name: 'resultFieldId',
        type: 'string',
        bind: 'commentField.fieldId',
      },
      {
        name: 'resultFieldName',
        type: 'string',
        bind: 'commentField.fieldName',
      },
      {
        name: 'operation',
        label: intl.get('hzero.common.view.sstaHandle').d('操作'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${requestUrlPre}/node-operation-details`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/node-operation-details`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
}

export {
  getOverviewOfNodesDs,
  getProgressDefinition,
  getStatusPhaseMapping,
  getJumpDetailLink,
  getPerformDocumentsDs,
  getActionConfigurationDs,
};
