import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentUser, getUserOrganizationId } from 'utils/utils';
import { fetchDefaultSupplier } from '@/services/product/shelfApply';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();
const { realName } = getCurrentUser();

function baseInfoDs({ applyHeaderId }) {
  return {
    // autoQuery: true,
    autoCreate: true,
    fields: [
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'applyCode',
        label: intl.get('smpc.ShelfApply.model.applyNum').d('申请编号'),
        disabled: true,
      },
      {
        name: 'applyHeaderId',
      },
      {
        name: 'attachmentUuid',
        label: intl.get('hzero.common.view.title.attachmentList').d('内部附件'),
        type: 'attachment',
        computedProps: {
          required: ({ record }) =>
            record.get('applyType') === 'UNSHELF' && record.get('applyHeaderId'),
        },
        help: intl
          .get('hzero.common.view.title.enableFile')
          .d('支持文件类型： .rar .zip .doc .docx .pdf image/*'),
      },
      {
        name: 'applyType',
        label: intl.get('smpc.ShelfApply.model.applyType').d('申请类型'),
        lookupCode: 'SMPC.SKU_SHELVE_APPLY_TYPE',
        required: true,
        computedProps: {
          // disabled: ({ record }) => record.get('applyHeaderId'),
        },
      },
      {
        name: 'applyStatus',
        label: intl.get('smpc.ShelfApply.model.applyStatus').d('申请状态'),
        lookupCode: 'SMPC.SKU_SHELVE_APPLY_STATUS',
        defaultValue: 'NEW',
        disabled: true,
      },
      {
        name: 'supplier',
        label: intl.get('smpc.ShelfApply.model.supplier').d('供应商'),
        type: 'object',
        required: true,
        lovCode: 'SMAL.SUPPLIER_BY_PUR',
        ignore: 'always',
        textField: 'supplierName',
        valueField: 'supplierId',
        lovPara: {
          tenantId: organizationId,
          supplierTenantId: userOrganizationId,
        },
        computedProps: {
          // disabled: ({ record }) => record.get('applyHeaderId'),
        },
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplier.supplierId',
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplier.supplierName',
      },
      {
        name: 'applyUserName',
        label: intl.get('smpc.ShelfApply.model.applyUserName').d('申请人'),
        required: true,
        disabled: true,
        defaultValue: realName,
      },
      {
        name: 'creationDate',
        label: intl.get('smpc.ShelfApply.model.creationDate').d('创建时间'),
        disabled: true,
      },
      {
        name: 'remark',
        label: intl.get('smpc.ShelfApply.model.remark').d('备注'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `/smpc/v1/${organizationId}/sku-shelve-apply-headers/${applyHeaderId}`,
          method: 'GET',
          data: { ...data },
        };
      },
      destroy({ data }) {
        return {
          url: `/smpc/v1/${organizationId}/sku-shelve-apply-headers`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      load({ dataSet }) {
        dataSet.forEach((f) => {
          Object.assign(f, { status: 'update' });
        });
      },
      create({ record }) {
        fetchDefaultSupplier({
          tenantId: getCurrentOrganizationId(),
        }).then((res) => {
          if (res) {
            record.set('supplier', res);
          }
        });
      },
    },
  };
}

function lineDs(lineSearchCode) {
  return {
    // autoQuery: true,
    fields: [
      {
        name: 'num',
        label: intl.get('smpc.ShelfApply.model.num').d('序号'),
      },
      {
        name: 'purSkuStatusMeaning',
        label: intl.get('smpc.ShelfApply.model.purSkuStatusMeaning').d('商品状态'),
      },
      {
        name: 'skuCode',
        label: intl.get('smpc.ShelfApply.model.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smpc.ShelfApply.model.skuName').d('商品名称'),
      },
      {
        name: 'supplier',
        label: intl.get('smpc.ShelfApply.model.supplier').d('供应商'),
        type: 'object',
        required: true,
        lovCode: 'SMPC.TENANT_SUPPLIER_ALL',
        ignore: 'always',
        textField: 'supplierCompanyName',
        valueField: 'supplierCompanyId',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplier.supplierCompanyId',
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplier.supplierCompanyName',
      },
      {
        name: 'categoryName',
        label: intl.get('smpc.ShelfApply.model.categoryName').d('平台分类'),
      },
      {
        name: 'catalogName',
        label: intl.get('smpc.ShelfApply.model.catalogName').d('目录'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `/smpc/v1/${organizationId}/sku-shelve-apply-lines`,
          method: 'GET',
          data: { ...data, customizeUnitCode: lineSearchCode },
        };
      },
    },
  };
}

function attachmentDs(required) {
  return {
    fields: [
      {
        name: 'attachment',
        label: intl.get('hzero.common.view.title.attachmentList').d('内部附件'),
        type: 'attachment',
        required,
        help: intl
          .get('hzero.common.view.title.enableFile')
          .d('支持文件类型： .rar .zip .doc .docx .pdf image/*'),
      },
    ],
  };
}

function productDs(applyHeaderId, applyType, supplierCompanyId) {
  return {
    autoQuery: true,
    cacheSelection: true,
    primaryKey: 'skuId',
    fields: [
      {
        name: 'purSkuStatusMeaning',
        label: intl.get('smpc.ShelfApply.model.purSkuStatusMeaning').d('商品状态'),
      },
      {
        name: 'skuCode',
        label: intl.get('smpc.ShelfApply.model.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('smpc.ShelfApply.model.skuName').d('商品名称'),
      },
      {
        name: 'supplier',
        label: intl.get('smpc.ShelfApply.model.supplier').d('供应商'),
        type: 'object',
        required: true,
        lovCode: 'SMPC.TENANT_SUPPLIER_ALL',
        ignore: 'always',
        textField: 'supplierCompanyName',
        valueField: 'supplierCompanyId',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplier.supplierCompanyId',
      },
      {
        name: 'supplierCompanyName',
        bind: 'supplier.supplierCompanyName',
      },
      {
        name: 'categoryName',
        label: intl.get('smpc.ShelfApply.model.categoryName').d('平台分类'),
      },
      {
        name: 'catalogName',
        label: intl.get('smpc.ShelfApply.model.catalogName').d('目录'),
      },
    ],
    transport: {
      read({ data }) {
        const _suffix = applyType === 'SHELF' ? '' : '/new';
        return {
          url: `/smpc/v1/${organizationId}/sup-skus${_suffix}`,
          method: 'GET',
          data: {
            supplierCompanyId,
            ...data,
            skuType: 'CATA',
            filterType: 'SKU_SHELVE_APPLY',
            filterBizId: applyHeaderId,
            // 上架
            shelfFlags: applyType === 'SHELF' ? '0,2,3' : '',
            shelfFlag: applyType === 'SHELF' ? '' : '1',
            customizeUnitCode: 'SMPC.SHELF_APPLY.SKU.SEARCH_BAR',
          },
        };
      },
    },
  };
}

export { baseInfoDs, lineDs, productDs, attachmentDs };
