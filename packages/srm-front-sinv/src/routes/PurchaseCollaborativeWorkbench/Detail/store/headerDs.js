import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

const HeaderDataSet = ({ processFactory, sureSupplier, activeKey }) => ({
  autoQuery: false,
  cacheSelection: true,
  forceValidate: true,
  autoCreate: true,
  fields: [
    {
      name: 'displayInvNum',
      label: intl.get(`sinv.inventoryBench.model.view.displayInvNums`).d('单据编号'),
    },
    {
      name: 'strategyName',
      label: intl.get(`sinv.inventoryBench.model.view.strategyName`).d('单据类别'),
    },
    {
      name: 'invStatus',
      label: intl.get(`sinv.inventoryBench.model.view.invStatus`).d('状态'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_STATUS',
    },
    {
      name: 'creationName',
      label: intl.get(`sinv.inventoryBench.model.view.creationName`).d('创建人'),
    },
    {
      name: 'creationDate',
      label: intl.get(`sinv.inventoryBench.model.view.creationDate`).d('创建时间'),
      type: 'dateTime',
    },
    {
      name: 'sourceCode',
      label: intl.get(`sinv.inventoryBench.model.view.sourceCode`).d('单据来源'),
      lookupCode: 'SPUC.SINV_STOCK_OUT_SOURCE_CODE',
    },
    {
      name: 'companyIdLov',
      ignore: 'always',
      label: intl.get(`sinv.inventoryBench.model.view.companyName`).d('公司'),
      lovCode: sureSupplier ? 'SINV.ASN_CUSTOMER' : 'SPFM.USER_AUTH.COMPANY',
      type: 'object',
      valueField: 'companyId',
      textField: 'companyName',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
        required: ({ record }) => record.get('sourceCode') === 'SRM',
        disabled: ({ record }) => record.get('sourceCode') === 'EXTERNAL_SYSTEM',
      },
    },
    {
      name: 'companyId',
      type: 'string',
      bind: 'companyIdLov.companyId',
    },
    {
      name: 'companyName',
      type: 'string',
      bind: 'companyIdLov.companyName',
    },
    sureSupplier && activeKey === 'submit'
      ? {
          name: 'supplierIdLov',
          type: 'object',
          label:
            processFactory !== '0'
              ? intl.get(`sinv.inventoryBench.model.view.supplierId`).d('供应商')
              : intl.get(`sinv.inventoryBench.model.view.supplierIdLov`).d('调出供应商'),
          ignore: 'always',
          textField: 'companyName',
          lovCode: 'SPUC.SINV_STOCK_OUT_AUTH_COMPANY',
          dynamicProps: {
            lovPara: () => {
              return {
                tenantId: organizationId,
              };
            },
            required: ({ record }) => record.get('sourceCode') === 'SRM',
            disabled: ({ record }) => record.get('sourceCode') === 'EXTERNAL_SYSTEM',
          },
          transformResponse: (value, object) =>
            object?.supplierId || object?.companyId
              ? {
                  supplierCompanyId: object?.companyId,
                  supplierCompanyName: object?.companyName,
                  companyName: object?.displaySupplierName,
                }
              : null,
          transformRequest: (value) => value?.companyId,
        }
      : {
          name: 'supplierIdLov',
          type: 'object',
          label:
            processFactory !== '0'
              ? intl.get(`sinv.inventoryBench.model.view.supplierId`).d('供应商')
              : intl.get(`sinv.inventoryBench.model.view.supplierIdLov`).d('调出供应商'),
          ignore: 'always',
          textField: 'supplierName',
          lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
          dynamicProps: {
            lovPara: () => {
              return {
                tenantId: organizationId,
              };
            },
            required: ({ record }) => record.get('sourceCode') === 'SRM',
            disabled: ({ record }) => record.get('sourceCode') === 'EXTERNAL_SYSTEM',
          },
          transformResponse: (value, object) =>
            object?.supplierId || object?.supplierCompanyId
              ? {
                  supplierCompanyId: object?.supplierCompanyId,
                  supplierCompanyName: object?.supplierCompanyName,
                  supplierId: object?.supplierId,
                  supplierName:
                    object?.supplierName ||
                    object?.supplierCompanyName ||
                    object?.displaySupplierName,
                  supplierTenantId: object?.supplierTenantId,
                }
              : null,
          transformRequest: (value) => value?.supplierId,
        },
    {
      name: 'supplierCompanyName',
      type: 'string',
      bind: sureSupplier ? 'supplierIdLov.companyName' : 'supplierIdLov.supplierCompanyName',
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: sureSupplier ? 'supplierIdLov.companyId' : 'supplierIdLov.supplierCompanyId',
    },
    // sureSupplier && {
    //   name: 'supplierTenantId',
    //   type: 'string',
    //   bind: 'supplierIdLov.supplierTenantId',
    // },
    {
      name: 'supplierName',
      type: 'string',
      bind: 'supplierIdLov.supplierName',
    },
    {
      name: 'supplierId',
      type: 'string',
      bind: 'supplierIdLov.supplierId',
    },
    processFactory === '0' && {
      name: 'inSupplierIdLov',
      label: intl.get(`sinv.inventoryBench.model.view.inSupplierIdLov`).d('调入供应商'),
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      textField: 'supplierName',
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
      dynamicProps: {
        required: ({ record }) => record.get('sourceCode') === 'SRM',
      },
      transformResponse: (value, object) =>
        object?.supplierId || object?.supplierCompanyId
          ? {
              inSupplierCompanyId: object?.inSupplierCompanyId,
              inSupplierCompanyName: object?.inSupplierCompanyName,
              inSupplierId: object?.inSupplierId,
              inSupplierName:
                object?.inSupplierName ||
                object?.inSupplierCompanyName ||
                object?.inDisplaySupplierName,
              supplierName:
                object?.inSupplierName ||
                object?.inSupplierCompanyName ||
                object?.inDisplaySupplierName, // 来源外部系统或者事务没有本地供应商只有平台供应商
              inSupplierTenantId: object?.inSupplierTenantId,
            }
          : null,
      transformRequest: (value) => value?.supplierId,
    },
    {
      name: 'inSupplierCompanyName',
      type: 'string',
      bind: 'inSupplierIdLov.supplierCompanyName',
    },
    {
      name: 'inSupplierCompanyId',
      type: 'string',
      bind: 'inSupplierIdLov.supplierCompanyId',
    },
    {
      name: 'inSupplierTenantId',
      type: 'string',
      bind: 'inSupplierIdLov.supplierTenantId',
    },
    {
      name: 'inSupplierName',
      type: 'string',
      bind: 'inSupplierIdLov.supplierName',
    },
    {
      name: 'inSupplierId',
      type: 'string',
      bind: 'inSupplierIdLov.supplierId',
    },

    {
      name: 'deliverAddress',
      label: intl.get(`sinv.inventoryBench.model.view.deliverAddress`).d('发货地址'),
    },
    {
      name: 'shipAddress',
      label: intl.get(`sinv.inventoryBench.model.view.shipAddressDate`).d('收货地址'),
    },
    {
      name: 'invDateLov',
      ignore: 'always',
      type: 'dateTime',
      range: ['start', 'end'],
      label: intl.get(`sinv.inventoryBench.model.view.invDate`).d('时间范围'),
    },
    {
      name: 'invDateFrom',
      type: 'dateTime',
      bind: 'invDateLov.start',
      label: intl.get('sinv.inventoryBench.model.view.dateFrom').d('时间范围从'),
    },

    {
      name: 'invDateTo',
      type: 'dateTime',
      bind: 'invDateLov.end',
      label: intl.get('sinv.inventoryBench.model.view.dateFrom').d('时间范围至'),
    },
    {
      label: intl.get(`sinv.inventoryBench.model.view.purchaseAgentId`).d('采购员'),
      name: 'purchaseAgentId',
      type: 'object',
      lovCode: sureSupplier ? 'SPUC.SINV_STOCK_OUT_AGENT' : 'SPFM.USER_AUTH.PURCHASE_AGENT',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: sureSupplier ? organizationId : undefined,
          };
        },
      },
      transformRequest: (value) => {
        return value && value.purchaseAgentId;
      },
      transformResponse: (value) => {
        return value
          ? {
              purchaseAgentId: value,
            }
          : undefined;
      },
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      bind: 'purchaseAgentId.purchaseAgentName',
    },
    // {
    //   name: 'purchaseAgentId',
    //   type: 'string',
    //   bind: 'purchaseAgentIdLov.purchaseAgentId',
    // },
  ],
  events: {
    update: ({ record, name, value }) => {
      if (name === 'supplierIdLov') {
        const { supplierName, supplierCompanyName, supplierTenantId } = value || {};
        const ids = sureSupplier ? record?.get('supplierTenantId') : supplierTenantId;
        record.set({ supplierTenantId: ids });
        if (!supplierName) {
          record.set({
            supplierName: supplierCompanyName,
          });
        }
      }
      if (name === 'inSupplierIdLov') {
        const { supplierName, supplierCompanyName } = value || {};
        if (!supplierName) {
          record.set({
            inSupplierName: supplierCompanyName,
          });
        }
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { invHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/stockout/inv/header/${invHeaderId}`,
        method: 'GET',
        data: other,
      };
    },
  },
});

export default HeaderDataSet;
