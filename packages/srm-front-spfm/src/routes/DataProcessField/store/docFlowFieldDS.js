/*
 * @Description:
 * @Version: 2.0
 * @Autor: lhl
 * @Date: 2021-08-26 16:49:30
 * @LastEditors: yanglin
 * @LastEditTime: 2023-09-08 11:25:28
 */

import intl from 'utils/intl';
import { SRM_DATA_PROCESS } from '_utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag
  ? `${SRM_DATA_PROCESS}/v1/${organizationId}`
  : `${SRM_DATA_PROCESS}/v1`;

// 获取当前用户的租户ID

// ds配置，、
function getTableDocFlowFieldDs() {
  return {
    // 指定 DataSet 初始化后自动查询  请求transport中的指定接口的数据
    autoQuery: true,
    // 初始化时，如果没有记录且 autoQuery 为 false，则自动创建记录
    autoCreate: true,
    selection: false,
    queryFields: [
      {
        name: 'fieldCode',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.fieldCode').d('字段名'),
      },
      {
        name: 'tableCode',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.tableCode').d('表名'),
      },
      {
        name: 'fieldName',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.fieldName').d('字段描述'),
      },
    ],

    fields: [
      {
        name: 'tableCode',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.tableCode').d('表名'),
        required: true,
      },
      {
        name: 'fieldCode',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.fieldCode').d('字段名'),
      },
      {
        name: 'fieldName',
        type: 'intl',
        label: intl.get('spfm.dataProcessField.model.table.fieldName').d('字段描述'),
      },
      {
        name: 'fieldType',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.fieldType').d('字段类型'),
        lookupCode: 'SRM_FRONT_SPFM_FIELD_TYPE01',
        required: true,
      },
      {
        name: 'displayFormat',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.displayFormat').d('格式'),
      },
      {
        name: 'fieldLov',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.fieldLov').d('字段值集编码'),
      },
      {
        name: 'pkFlag',
        type: 'number',
        label: intl.get('spfm.dataProcessField.model.table.pkFlag').d('是否是主键'),
        required: true,
      },
      {
        name: 'enabledFlag',
        type: 'number',
        defaultValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.enabledFlag').d('是否启用'),
        required: true,
      },
      {
        name: 'attachmentFlag',
        type: 'boolean',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('spfm.dataProcessField.model.field.attachmentFlag').d('是否附件类型'),
      },
      {
        name: 'bucketCode',
        type: 'string',
        dynamicProps: {
          required: ({ record }) => record.get('attachmentFlag'),
          disabled: ({ record }) => record.get('attachmentFlag') !== 1,
        },
        lookupCode: 'HPFM.CUST.WIDGET.BUCKET',
        label: intl.get('spfm.dataProcessField.model.field.bucketName').d('附件桶名'),
      },
      {
        name: 'lovTypeCode',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.lovTypeCode').d('值集类型'),
        lookupCode: 'SRM_FRONT_SPFM_LOV_TYPE_CODE01',
      },
      {
        name: 'tenantId',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.tenantId').d('租户ID'),
        lookupCode: 'SRM.FRONT.SPFM.DOC.FLOW.TENANT-01',
      },
      {
        name: 'action',
        type: 'string',
        label: intl.get(`hzero.common.table.column.option`).d('操作'),
      },
      {
        name: 'standardFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.standardFlag').d('是否标准字段'),
      },
      {
        name: 'translationSql',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.translationSql').d('子查询SQL'),
      },
      {
        name: 'amountFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.amountFlag').d('是否隐藏'),
        help: intl
          .get('spfm.dataProcessField.model.amountFlag.help')
          .d(
            '该功能目前仅在从商城前台订单页面触发单据流且该笔商城订单协议类型为销售协议场景下生效'
          ),
      },
      {
        name: 'uomFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.uomFlag').d('是否单位字段'),
      },
    ],

    transport: {
      read: {
        url: `${requestUrlPre}/table-field-configs`,
        method: 'GET',
      },
      update: ({ data }) => {
        return {
          url: `${requestUrlPre}/table-field-configs`,
          method: 'PUT',
          data: data[0],
        };
      },
      create: ({ data }) => {
        return {
          url: `${requestUrlPre}/table-field-configs`,
          method: 'POST',
          data: data[0],
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${requestUrlPre}/table-field-configs`,
          method: 'DELETE',
          data: data[0],
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

function getTenantFieldDs() {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: false,
    fields: [
      {
        name: 'id',
        type: 'string',
      },
      {
        name: 'fieldLov',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.fieldLov').d('字段值集编码'),
      },
      {
        name: 'fieldAliasName',
        type: 'intl',
        label: intl.get('spfm.dataProcessField.model.table.fieldAliasName').d('字段别名'),
      },
      {
        name: 'amountFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.amountFlag').d('是否隐藏'),
        help: intl
          .get('spfm.dataProcessField.model.amountFlag.help')
          .d(
            '该功能目前仅在从商城前台订单页面触发单据流且该笔商城订单协议类型为销售协议场景下生效'
          ),
      },
      {
        name: 'uomFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.uomFlag').d('是否单位字段'),
      },
      {
        name: 'enabledFlag',
        type: 'number',
        defaultValue: 0,
        label: intl.get('spfm.dataProcessField.model.table.enabledFlag').d('是否启用'),
        required: true,
      },
      {
        name: 'attachmentFlag',
        type: 'boolean',
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('spfm.dataProcessField.model.field.attachmentFlag').d('是否附件类型'),
      },
      {
        name: 'bucketCode',
        type: 'string',
        dynamicProps: {
          required: ({ record }) => record.get('attachmentFlag'),
          disabled: ({ record }) => record.get('attachmentFlag') !== 1,
        },
        lookupCode: 'HPFM.CUST.WIDGET.BUCKET',
        label: intl.get('spfm.dataProcessField.model.field.bucketName').d('附件桶名'),
      },
      {
        name: 'translationSql',
        type: 'string',
        label: intl.get('spfm.dataProcessField.model.table.translationSql').d('子查询SQL'),
      },
    ],
    transport: {
      read: ({ data: { id } }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/table-field-configs/${id}`,
          method: 'GET',
        };
      },
      update: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/table-field-configs`,
          method: 'PUT',
          data: data[0],
        };
      },
      create: ({ data }) => {
        return {
          url: `${SRM_DATA_PROCESS}/v1/${organizationId}/table-field-configs`,
          method: 'POST',
          data: data[0],
        };
      },
      tls: ({ record, name }) => {
        if (name === 'fieldAliasName') {
          return {
            url: `${SRM_DATA_PROCESS}/v1/${organizationId}/table-field-configs/cusz/multi-language`,
            method: 'GET',
            data: { fieldCuszId: record?.get('fieldCuszId') },
          };
        }
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

export { getTableDocFlowFieldDs, getTenantFieldDs };
