import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export const getInvoiceDs = () => ({
  selection: 'multiple',
  paging: false,
  pageSize: 20,
  fields: [
    {
      name: 'membelLabelLov',
      lovCode: 'SAGM.MEMBER_LABEL',
      ignore: 'always',
      type: 'object',
      required: true,
      textField: 'labelName',
      valueField: 'labelId',
      label: intl.get('sagm.common.view.memberLabel').d('会员标签'),
    },
    { name: 'labelId', bind: 'membelLabelLov.labelId' },
    { name: 'labelName', bind: 'membelLabelLov.labelName' },
    {
      name: 'invoiceEntityLov',
      ignore: 'always',
      required: true,
      type: 'object',
      lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
      lovPara: { tenantId: organizationId },
      label: intl.get('sagm.common.view.invoiceEntity').d('开票主体'),
      textField: 'companyName',
      valueField: 'companyId',
    },
    { name: 'companyName', bind: 'invoiceEntityLov.companyName' },
    { name: 'companyId', bind: 'invoiceEntityLov.companyId' },
    {
      name: 'inventoryLov',
      ignore: 'always',
      required: true,
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
      dynamicProps: {
        lovPara: ({ record }) => ({ companyId: record.get('companyId') }),
      },
      label: intl.get('sagm.common.model.inventory.organization').d('库存组织'),
    },
    {
      name: 'invOrganizationId',
      bind: 'inventoryLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'inventoryLov.organizationName',
    },
    {
      name: 'purchaseLov',
      ignore: 'always',
      type: 'object',
      required: true,
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      valueField: 'purchaseOrgId',
      textField: 'organizationName',
      label: intl.get('sagm.common.model.purchase.organization').d('采购组织'),
    },
    {
      name: 'purOrganizationId',
      bind: 'purchaseLov.purchaseOrgId',
    },
    {
      name: 'purOrganizationName',
      bind: 'purchaseLov.organizationName',
    },
    { name: 'action', label: intl.get('hzero.common.action').d('操作') },
  ],
  events: {
    update: ({ record, name, value, oldValue }) => {
      // 公司变更
      if (name === 'invoiceEntityLov' && record.get('inventoryLov')) {
        if ((value && oldValue && value.companyId !== oldValue.companyId) || !value) {
          record.set('inventoryLov', null);
        }
      }
      // 库存组织变更
      if (name === 'inventoryLov' && value && !record.get('invoiceEntityLov')) {
        record.set('companyId', value.companyId);
        record.set('companyId', value.companyName);
      }
    },
  },
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-invoicing-ruless`,
      method: 'GET',
    },
    destroy: () => ({
      url: `/sagm/v1/${organizationId}/sale-invoicing-ruless/batch`,
      method: 'DELETE',
    }),
  },
});

export const getOrderLimitDs = () => ({
  selection: false,
  paging: false,
  pageSize: 20,
  fields: [
    {
      label: intl.get('sagm.common.model.labelId').d('会员标签'),
      name: 'labelIdObj',
      type: 'object',
      lovCode: 'SAGM.POINTS_MEMBER_LABEL',
      textField: 'labelName',
      valueField: 'labelId',
      ignore: 'always',
      required: true,
    },
    {
      name: 'pointsTypeObj',
      label: intl.get('sagm.common.model.pointsType').d('积分类型'),
      required: true,
      type: 'object',
      textField: 'pointsTypeName',
      valueField: 'pointsTypeId',
      noCache: true,
      lookupUrl: `/sigl/v1/${organizationId}/points-types/list-no-cache`,
      ignore: 'always',
    },
    {
      name: 'pointsTypeId',
      bind: 'pointsTypeObj.pointsTypeId',
    },
    {
      name: 'pointsTypeName',
      bind: 'pointsTypeObj.pointsTypeName',
    },
    {
      name: 'labelId',
      bind: 'labelIdObj.labelId',
    },
    {
      name: 'labelName',
      bind: 'labelIdObj.labelName',
    },
    {
      label: intl.get('sagm.common.model.pointsLimit').d('额度（积分/人）'),
      name: 'pointsLimit',
      type: 'number',
      min: 0,
      max: 10000000000000000000,
      required: true,
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: {
      url: `/sagm/v1/${organizationId}/sale-points-limits`,
      method: 'GET',
    },
    destroy: () => ({
      url: `/sagm/v1/${organizationId}/sale-points-limits/batch`,
      method: 'DELETE',
    }),
  },
});
