import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { PHONE } from 'utils/regExp';

const organizationId = getCurrentOrganizationId();

// 意向单信息dsProps
export function getIntentLetterDsProps(letterId) {
  return {
    fields: [
      {
        name: 'sendCompanyLov',
        type: 'object',
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        required: true,
        ignore: 'always',
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: organizationId,
            supplierId: record.get('receiveCompanyId'),
          }),
        },
        label: intl.get('smkt.supplierManage.view.sendCompanyName').d('发起意向方公司名称'),
      },
      {
        name: 'sendCompanyId',
        bind: 'sendCompanyLov.companyId',
      },
      {
        name: 'sendCompanyName',
        bind: 'sendCompanyLov.companyName',
        label: intl.get('smkt.supplierManage.view.sendCompanyName').d('发起意向方公司名称'),
      },
      {
        name: 'sendCompanyNum',
        disabled: true,
        bind: 'sendCompanyLov.companyNum',
        label: intl.get('smkt.supplierManage.view.sendCompanyCode').d('发起意向方公司编码'),
      },
      {
        name: 'receiveCompanyName',
        disabled: true,
        bind: 'receiveCompanyInfosVO.companyName',
        label: intl.get('smkt.supplierManage.view.receiveCompanyName').d('接收意向方公司名称'),
      },
      {
        name: 'receiveCompanyNum',
        disabled: true,
        bind: 'receiveCompanyInfosVO.companyNum',
        label: intl.get('smkt.supplierManage.view.receiveCompanyCode').d('接收意向方公司编码'),
      },
      {
        name: 'receiveCompanyInfosVO',
        ignore: 'always',
        type: 'object',
      },
      {
        name: 'sender',
        required: true,
        label: intl.get('smkt.supplierManage.view.contacts').d('联系人'),
      },
      {
        name: 'senderPhone',
        required: true,
        pattern: PHONE,
        defaultValidationMessages: {
          patternMismatch: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
        },
        label: intl.get('smkt.supplierManage.view.contactTel').d('联系电话'),
      },
      {
        name: 'senderEmail',
        type: 'email',
        label: intl.get('smkt.supplierManage.view.contactEmail').d('联系邮箱'),
      },
      {
        name: 'intentCatalogs',
        type: 'object',
        lovCode: 'SMKT.SUP_CATALOG',
        multiple: true,
        label: intl.get('smkt.supplierManage.view.intentCatalog').d('意向目录'),
        dynamicProps: {
          lovPara: ({ record }) => ({ tenantId: record.get('receiveTenantId') }),
        },
        transformRequest: (value) =>
          value?.map((m) => ({
            intentCatalogCode: m.catalogCode,
            intentCatalogName: m.catalogName,
          })),
        transformResponse: (value) => {
          return value?.map((m) => ({
            catalogCode: m.intentCatalogCode,
            catalogName: m.intentCatalogName,
          }));
        },
      },
      {
        name: 'intentSkus',
        type: 'object',
        lovCode: 'SMKT.SKU',
        multiple: true,
        dynamicProps: {
          lovPara: ({ record }) => ({
            skuStatus: 1,
            tenantId: organizationId,
            supplierId: record.get('receiveCompanyId'),
          }),
        },
        label: intl.get('smkt.supplierManage.view.intentSku').d('意向商品'),
        transformRequest: (value) =>
          value?.map((m) => ({
            intentSkuCode: m.skuCode,
            intentSkuName: m.skuName,
            thirdSkuCode: m.thirdSkuCode,
            skuImageUrl: m.thumbnailPath || m.primaryPath,
            skuPrice: m.proposedPrice,
          })),
      },
      {
        name: 'intentSkuTable',
        label: intl.get('smkt.supplierManage.view.intentSku').d('意向商品'),
      },
      {
        name: 'letterRemark',
        maxLength: 300,
        label: intl.get('smkt.supplierManage.view.intentRemark').d('意向说明'),
      },
    ],
    transport: {
      read: {
        url: `/smkt/v1/${organizationId}/intent-letters/${letterId}`,
        method: 'GET',
      },
    },
  };
}

// 商品信息dsProps
export function getIntentSkuDsProps() {
  return {
    selection: false,
    fields: [
      { name: 'skuImageUrl', label: intl.get('smpc.product.view.skuImage').d('商品图片') },
      { name: 'intentSkuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
      { name: 'intentSkuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
      { name: 'skuPrice', label: intl.get('smpc.product.view.proposedPrice').d('参考价格') },
    ],
    transport: {
      read: {
        url: `/smkt/v1/${organizationId}/intent-skus`,
        method: 'GET',
      },
    },
  };
}
