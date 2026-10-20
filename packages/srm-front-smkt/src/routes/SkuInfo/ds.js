import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

export function getSkuDsProps() {
  return {
    fields: [
      {
        name: 'skuName',
        label: intl.get('smpc.product.view.skuName').d('商品名称'),
        required: true,
      },
      {
        name: 'skuCode',
        label: intl.get('smpc.product.view.skuCode').d('商品编码'),
        disabled: true,
      },
      {
        name: 'catalogLov',
        type: 'object',
        ignore: 'always',
        required: true,
        lovCode: 'SMKT.SUP_CATALOG',
        lovPara: { tenantId: organizationId },
        label: intl.get('smpc.product.view.skuCatalog').d('商品目录'),
      },
      {
        name: 'catalogId',
        bind: 'catalogLov.catalogId',
      },
      {
        name: 'catalogName',
        bind: 'catalogLov.catalogName',
      },
      {
        name: 'catalogCode',
        bind: 'catalogLov.catalogCode',
      },
      {
        name: 'tenantId',
        defaultValue: organizationId,
      },
      // {
      //   name: 'supplierLov',
      //   type: 'object',
      //   required: true,
      //   lovCode: 'SMKT.PICK_SUPPLIER',
      //   lovPara: { tenantId: organizationId },
      //   label: intl.get('smpc.product.view.supplier').d('供应商'),
      // },
      {
        name: 'proposedPrice',
        required: true,
        label: intl.get('smpc.product.view.proposedPrice').d('参考价格'),
      },
      {
        name: 'skuDetail',
      },
    ],
  };
}
