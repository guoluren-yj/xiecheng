import { SRM_SMBL } from '@/utils/config.js';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

function cardMappingDS() {
  return {
    primaryKey: 'cardId',
    autoQuery: true,
    selection: false,
    autoQueryAfterSubmit: true,
    pageSize: 6,

    // table表单显示的字段
    fields: [
      {
        name: 'tenantId',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.tenantId').d('租户id'),
        defaultValue: organizationId,
      },
      {
        name: 'tenantName',
        type: 'string',
        disabled: true,
        label: intl.get('smbl.cardMapping.model.mapping.tenantName').d('租户'),
      },
      {
        name: 'cardCode',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.cardCode').d('卡片编码'),
      },
      {
        name: 'cardTitle',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.cardTitle').d('卡片标题'),
      },
      {
        name: 'cardDesc',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.cardDesc').d('卡片描述'),
      },
      {
        name: 'cardLogo',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.cardLogo').d('卡片logo'),
      },
      {
        name: 'cardUrl',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.cardUrl').d('供应商-移动端卡片跳转地址'),
      },
      {
        name: 'pcCardUrl',
        type: 'string',
        required: true,
        label: intl.get('smbl.cardMapping.model.mapping.pcCardUrl').d('供应商-PC端卡片跳转地址'),
      },

      {
        name: 'purchaseMobileCardUrl',
        type: 'string',
        required: true,
        label: intl
          .get('smbl.cardMapping.model.mapping.purchaseMobileCardUrl')
          .d('采购方-移动端卡片跳转地址'),
      },
      {
        name: 'purchasePcCardUrl',
        type: 'string',
        required: true,
        label: intl
          .get('smbl.cardMapping.model.mapping.purchasePcCardUrl')
          .d('采购方-PC端卡片跳转地址'),
      },
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hzero.common.status.enabled').d('启用标识'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hzero.common.model.remark').d('备注'),
      },
      {
        name: 'source',
        type: 'string',
        label: intl.get('hzero.common.source').d('来源'),
      },
    ],
    // 查询表单字段
    queryFields: [
      {
        name: 'cardCode',
        type: 'string',
        label: intl.get('smbl.cardMapping.model.mapping.cardCode').d('卡片编码'),
      },
      {
        name: 'cardTitle',
        type: 'string',
        label: intl.get('smbl.cardMapping.model.mapping.cardTitle').d('卡片标题'),
      },
      {
        name: 'cardDesc',
        type: 'string',
        label: intl.get('smbl.cardMapping.model.mapping.cardDesc').d('卡片描述'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMBL}/v1/${organizationId}/card/mappings/list`,
        method: 'get',
      },
      create: ({ data }) => {
        return {
          data: data[0],
          url: `${SRM_SMBL}/v1/${organizationId}/card/mappings/createOrUpdate`,
          method: 'post',
          autoQuery: true,
        };
      },
      update: ({ data }) => {
        return {
          data: data[0],
          url: `${SRM_SMBL}/v1/${organizationId}/card/mappings/createOrUpdate`,
          method: 'post',
          autoQuery: true,
        };
      },
      destroy: {
        url: `${SRM_SMBL}/v1/${organizationId}/card/mappings/delete`,
        method: 'post',
      },
    },
  };
}
export { cardMappingDS };
