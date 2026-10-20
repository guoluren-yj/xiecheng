/**
 * 供应商模型定义 DataSet
 * @Author: chendengji <dengji.chen@hand-china.com>
 * @Date: 2020-08-20 13:37:15
 * @LastEditTime: 2022-11-21 17:35:52
 * @Copyright: Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SSLM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

export default () => ({
  selection: false,
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/model-settings`,
        method: 'GET',
        params,
        data,
      };
    },
  },
  primaryKey: 'modelSettingId',
  fields: [
    {
      label: intl.get('hzero.common.view.serialNumber').d('序号'),
      name: 'orderField',
      type: 'number',
      required: true,
      min: 1,
      step: 1,
      computedProps: {
        disabled: ({ record }) => !!(record.get('modelSettingId') && record.get('enabledFlag')),
      },
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.tableCode`).d('配置表'),
      name: 'tableCodeLov',
      type: 'object',
      lovCode: 'SPFM_REL_TABLE_DEFINITION',
      required: true,
      lovPara: {
        tenantId: organizationId,
      },
      noCache: true,
      computedProps: {
        disabled: ({ record }) => !!record.get('modelSettingId'),
      },
      ignore: 'always',
    },
    {
      name: 'tableCode',
      bind: 'tableCodeLov.tableCode',
      required: true,
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.tableCode`).d('配置表'),
      name: 'tableName',
      bind: 'tableCodeLov.description',
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.targetPage`).d('目标页面'),
      name: 'targetPage',
      lookupCode: 'SSLM_MODEL_TARGET_PAGE',
      required: true,
      computedProps: {
        disabled: ({ record }) => !!(record.get('modelSettingId') && record.get('enabledFlag')),
      },
    },
    {
      label: intl.get('sslm.supplierModelDefine.model.define.relationField').d('关联字段'),
      name: 'pageRelationField',
      computedProps: {
        disabled: ({ record }) => !!(record.get('modelSettingId') && record.get('enabledFlag')),
      },
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.dataSources`).d('数据来源'),
      name: 'dataSource',
      lookupCode: 'SSLM_MODEL_DATA_SOURCE',
      computedProps: {
        disabled: ({ record }) => !!(record.get('modelSettingId') && record.get('enabledFlag')),
      },
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.writeBack`).d('数据回写'),
      name: 'target',
      lookupCode: 'SSLM_MODEL_DATA_TARGET',
      computedProps: {
        disabled: ({ record }) => !!(record.get('modelSettingId') && record.get('enabledFlag')),
      },
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.fieldMapping`).d('字段映射'),
      name: 'fieldMapping',
      ignore: 'always',
    },
    {
      label: intl.get(`hzero.common.status.enableFlag`).d('启用'),
      name: 'enabledFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      label: intl.get('sslm.supplierModelDefine.model.define.cuzTabCode').d('个性化标签页编码'),
      type: 'string',
      name: 'cuzTabCode',
      computedProps: {
        disabled: ({ record }) => !!(record.get('modelSettingId') && record.get('enabledFlag')),
      },
      help: intl
        .get(`sslm.supplierModelDefine.model.define.codeExplain`)
        .d('该编码需和页面个性化新增拓展标签页编码一致。'),
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.pageEditor`).d('页面可编辑'),
      name: 'editorFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.addButtonFlag`).d('是否展示新增按钮'),
      name: 'addButtonFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.saveButtonFlag`).d('是否展示保存按钮'),
      name: 'saveButtonFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl
        .get(`sslm.supplierModelDefine.model.define.deleteButtonFlag`)
        .d('是否展示删除按钮'),
      name: 'deleteButtonFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'operate',
    },
  ],
  queryFields: [
    {
      label: intl.get(`sslm.supplierModelDefine.model.define.tableCode`).d('配置表'),
      name: 'tableCode',
      type: 'object',
      lovCode: 'SPFM_REL_TABLE_DEFINITION',
      lovPara: {
        tenantId: organizationId,
      },
      noCache: true,
      transformRequest: value => value && value.tableCode,
    },
  ],
});
