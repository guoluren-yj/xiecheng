import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { SRM_SPC } from '_utils/config';
import { getPriceEditField } from '@/routes/ssrc/PriceLibraryNew/util';
import { calculationRender } from '@/utils/renderer';

const organizationId = getCurrentOrganizationId();

const renderAccuracy = (record, field) => {
  let accuracy = 0; // 精度
  if (record?.getField(field)?.get('step')) {
    accuracy = Math.log10(record.getField(field).get('step')) * -1;
  } else if (record?.getField(field)?.get('step') === 0) {
    accuracy = 0;
  }
  return record.getState('currency_precision') ?? accuracy;
};
const getBasicInfoDs = (priceAdjustmentHeaderId, isEdit) => {
  return {
    forceValidate: true,
    autoCreate: true,
    paging: false,
    fields: [
      {
        name: 'priceAdjustmentStatus',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentStatus').d('状态'),
        lookupCode: 'SPC.PRICE.ADJUSTMENT_STATUS',
        disabled: true,
      },
      {
        name: 'priceAdjustmentID',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentID').d('调价单ID'),
      },
      {
        name: 'priceAdjustmentCode',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentCode')
          .d('调价单编码'),
        disabled: true,
      },
      {
        name: 'priceAdjustmentName',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentName')
          .d('调价单名称'),
        required: true,
      },
      {
        name: 'createdBy',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.createdBy').d('创建人'),
        type: 'object',
        lovCode: 'HIAM.USER_ACCOUNT_ID',
        disabled: true,
        transformRequest: (value = {}) => value && value?.id,
        transformResponse: (value, data) => {
          return value ? { loginName: data?.loginName, realName: data?.createdByName } : null;
        },
      },
      {
        name: 'createdByName',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.creationDate').d('创建时间'),
        type: 'date',
        disabled: true,
      },
      {
        name: 'priceAdjustmentType',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentType')
          .d('调价单类型'),
        lookupCode: 'SPC.PRICE.ADJUSTMENT_TYPE',
        defaultValue: 'SAVE_PRICE',
        disabled: true,
      },
      {
        name: 'sourceFrom',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentSource')
          .d('调价单来源'),
        lookupCode: 'SPC.PRICE.ADJUSTMENT_SOURCE_FROM',
        defaultValue: 'MANUAL',
        disabled: true,
      },
      {
        name: 'remark',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.remarks').d('说明'),
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-adjustment/${priceAdjustmentHeaderId}/detail`,
          method: 'GET',
          params: {
            priceAdjustmentHeaderId,
            customizeUnitCode: isEdit
              ? 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM'
              : 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.HEADER_FORM_READONLY',
            ...params,
          },
        };
      },
    },
  };
};

const getLineDs = (priceAdjustmentHeaderId, isEdit) => {
  return {
    forceValidate: true,
    selection: isEdit && 'multiple',
    pageSize: 20,
    primaryKey: 'priceAdjustmentLineId',
    fields: [
      {
        name: 'priceAdjustmentLineID',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentLineID')
          .d('调价单行ID'),
      },
      {
        name: 'priceAdjustmentLineNum',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceAdjustmentLineNum')
          .d('调价单行号'),
      },
      {
        name: 'sourceFromNum',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.sourceFromNum').d('来源单据编码'),
      },
      {
        name: 'sourceFromLineNum',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.sourceFromLineNum')
          .d('来源单据行号'),
      },
      {
        name: 'applicationScope',
        label: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      },
      {
        name: 'itemCategoryId',
        type: 'object',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.itemCategoryId').d('物料品类'),
        lovCode: 'SMDM.ITEM_CATEGORY_PAGE',
        transformRequest: (value = {}) => value && value?.categoryId,
        transformResponse: (value, data) => {
          return value
            ? {
                categoryCode: data?.itemCategoryCode,
                categoryId: data.itemCategoryId,
                categoryName: data?.itemCategoryName,
              }
            : null;
        },
      },
      {
        name: 'supplierCompanyId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.supplierCompanyId').d('供应商ID'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.SUPPLIER',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaserCompanyId: record?.get('companyId')?.companyId,
            };
          },
        },
        transformRequest: (value = {}) => value && value?.supplierCompanyId,
        transformResponse: (value, data) => {
          return value
            ? { supplierCompanyId: value, supplierCompanyName: data?.supplierCompanyName }
            : null;
        },
      },
      {
        name: 'validDateFrom',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.validDateFrom').d('有效期从'),
        type: 'date',
        max: 'validDateTo',
      },
      {
        name: 'validDateTo',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.validDateTo').d('有效期至'),
        type: 'date',
        min: 'validDateFrom',
      },
      {
        name: 'ouId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.ouId').d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        type: 'object',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record?.get('companyId')?.companyId,
            };
          },
        },
        transformRequest: (value = {}) => value && value?.ouId,
        transformResponse: (value, data) => {
          return value ? { ouId: value, ouName: data?.ouName } : null;
        },
      },
      {
        name: 'invOrganizationId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.invOrganizationId').d('库存组织'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
        type: 'object',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record?.get('companyId')?.companyId,
              ouId: record?.get('ouId')?.ouId,
            };
          },
        },
        transformRequest: (value = {}) => value && value?.organizationId,
        transformResponse: (value, data) => {
          return value
            ? {
                organizationId: value,
                organizationName: data?.invOrganizationName,
                organizationCode: data.invOrganizationCode,
              }
            : null;
        },
      },
      {
        name: 'purOrganizationId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.purOrganizationId').d('采购组织'),
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        type: 'object',
        transformRequest: (value = {}) => value && value?.purchaseOrgId,
        transformResponse: (value, data) => {
          return value
            ? {
                purchaseOrgId: value,
                organizationName: data?.purOrganizationName,
                organizationCode: data.purOrganizationCode,
              }
            : null;
        },
      },
      {
        name: 'purchaseAgentId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.purchaseAgentId').d('采购员'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
        transformRequest: (value = {}) => value && value?.purchaseAgentId,
        transformResponse: (value, data) => {
          return value
            ? { purchaseAgentId: value, purchaseAgentName: data?.purchaseAgentName }
            : null;
        },
      },
      {
        name: 'uomId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.uomId').d('单位'),
        lovCode: 'SSRC.UOM',
        type: 'object',
        required: true,
        transformRequest: (value = {}) => value && value?.uomId,
        transformResponse: (value, data) => {
          return value
            ? {
                uomCode: data?.uomCode,
                uomCodeAndName: data?.uomCodeAndName,
                uomId: data?.uomId,
                uomName: data?.uomName,
              }
            : null;
        },
      },
      {
        name: 'sourceFrom',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.sourceFrom').d('数据来源'),
        lookupCode: 'SPC.PRICE.ADJUSTMENT_SOURCE_FROM',
        disabled: true,
      },
      {
        name: 'benchmarkPriceType',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.benchmarkPriceType')
          .d('基准价类型'),
        lookupCode: 'SFIN.BENCHMARK_PRICE',
        disabled: true,
      },
      {
        name: 'taxIncludedPrice',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.taxIncludedPrice')
          .d('单价（含税）'),
        type: 'currency',
        required: true,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const ruleDefinition = dataSet.getState('ruleDefinition');
            const benchmarkPriceType = record.get('benchmarkPriceType');
            const editField = benchmarkPriceType || getPriceEditField(record, ruleDefinition);
            return editField !== 'TAX_INCLUDED_PRICE';
          },
        },
      },
      {
        name: 'netPrice',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.netPrice').d('单价（不含税）'),
        type: 'currency',
        required: true,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const ruleDefinition = dataSet.getState('ruleDefinition');
            const benchmarkPriceType = record.get('benchmarkPriceType');
            const editField = benchmarkPriceType || getPriceEditField(record, ruleDefinition);
            return editField !== 'NET_PRICE';
          },
        },
      },
      {
        name: 'ladderQuotation',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.ladderQuotation').d('阶梯报价'),
      },
      {
        name: 'itemId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.itemId').d('物料ID'),
        lovCode: 'SSRC.PRICE_LIB_ITEM_CODE',
        type: 'object',
        transformRequest: (value = {}) => value && value?.itemId,
        transformResponse: (value, data) => {
          return value
            ? { itemId: value, itemName: data?.itemName, itemCode: data?.itemCode }
            : null;
        },
        required: true,
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        bind: 'itemId.itemName',
      },
      {
        name: 'companyId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.companyId').d('公司ID'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        type: 'object',
        transformRequest: (value = {}) => value && value?.companyId,
        transformResponse: (value, data) => {
          return value ? { companyId: value, companyName: data?.companyName } : null;
        },
      },
      {
        name: 'currencyCode',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.currencyCode').d('币种'),
        lovCode: 'SSRC.CURRENCY',
        type: 'object',
        required: true,
        transformRequest: (value = {}) => value && value?.currencyCode,
        transformResponse: (value, data) => {
          return value
            ? {
                currencyCode: value,
                currencyName: data?.currencyName,
                currencyId: data.currencyId,
              }
            : null;
        },
      },
      {
        name: 'taxId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.taxId').d('税率ID'),
        lovCode: 'SMDM.TAX_ANOTHER',
        type: 'object',
        textField: 'taxRate',
        transformRequest: (value = {}) => value && value?.taxId,
        transformResponse: (value, data) => {
          return value
            ? {
                taxId: value,
                taxName: data?.taxName,
                taxRate: data?.taxRate,
                taxCode: data?.taxCode,
              }
            : null;
        },
      },
      {
        name: 'exchangeRate',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.exchangeRateId').d('汇率'),
        type: 'number',
        min: 0.0000001,
        precision: 10,
      },
      {
        name: 'exchangeRateType',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.exchangeRateType').d('汇率类型'),
        lovCode: 'SMDM.EXCHANGE_RATE_TYPE',
        type: 'object',
        transformRequest: (value = {}) => value && value?.exchangeRateId,
        transformResponse: (value, data) => {
          return value ? { exchangeRateId: value, exchangeRateName: data?.exchangeRateName } : null;
        },
      },
      {
        name: 'exchangeRateDate',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.exchangeRateDate').d('汇率日期'),
        type: 'dateTime',
      },
      {
        name: 'supplierTenantId',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.supplierTenantId')
          .d('供应商租户'),
        type: 'number',
      },
      {
        name: 'creationDate',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.creationDate').d('创建日期'),
        disabled: true,
      },
      {
        name: 'priceBatchQuantity',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.priceBatchQuantity')
          .d('价格批量'),
        type: 'number',
        min: 1,
      },
      {
        name: 'supplierId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.supplierId').d('本地供应商'),
        type: 'object',
        lovCode: 'SPC.ADJUSTMENT_EXTERNAL_SUPPLIER',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              companyId: record?.get('companyId')?.companyId,
              supplierCompanyId: record?.get('supplierCompanyId')?.supplierCompanyId,
            };
          },
        },
        transformRequest: (value = {}) => value && value?.supplierId,
        transformResponse: (value, data) => {
          return value ? { supplierId: value, supplierName: data?.supplierName } : null;
        },
      },
      {
        name: 'batchNum',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.batchNum').d('批次号'),
      },
      {
        name: 'batchSyncStatusMeaning',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.batchSyncStatusMeaning')
          .d('同步价格库状态'),
      },
      {
        name: 'syncPriceErrorMsg',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.syncPriceErrorMsg').d('失败原因'),
      },
      {
        name: 'processDate',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.processUserName')
          .d('导入价格库操作时间'),
      },
      {
        name: 'processUserName',
        label: intl
          .get('ssrc.priceAdjustmentWorkBench.view.title.processDate')
          .d('导入价格库操作人'),
      },
    ],
    events: {
      update: ({ name, record, value, dataSet }) => {
        const ruleDefinition = dataSet.getState('ruleDefinition');
        const editField = getPriceEditField(record, ruleDefinition);
        if (name === 'taxIncludedPrice') {
          if (editField === 'TAX_INCLUDED_PRICE') {
            const taxRate = record.get('taxRate') ? math.div(record.get('taxRate'), 100) : 0;
            record.set(
              'netPrice',
              calculationRender(
                value,
                math.plus(1, taxRate),
                '/',
                renderAccuracy(record, 'netPrice')
              )
            );
          }
        }
        if (name === 'taxId') {
          const { taxRate } = value || {};
          record.set('taxRate', taxRate);
          const calcTaxRate = taxRate ? math.div(taxRate, 100) : 0;
          const taxIncludedPrice = record.get('taxIncludedPrice');
          const netPrice = record.get('netPrice');
          if (editField === 'TAX_INCLUDED_PRICE') {
            if (taxIncludedPrice || taxIncludedPrice === 0) {
              record.set(
                'netPrice',
                calculationRender(
                  record.get('taxIncludedPrice'),
                  math.plus(1, calcTaxRate),
                  '/',
                  renderAccuracy(record, 'netPrice')
                )
              );
            }
          } else if (editField === 'NET_PRICE') {
            if (netPrice || netPrice === 0) {
              record.set(
                'taxIncludedPrice',
                calculationRender(
                  record.get('netPrice'),
                  math.plus(1, calcTaxRate),
                  '*',
                  renderAccuracy(record, 'taxIncludedPrice')
                )
              );
            }
          }
        }
        if (name === 'netPrice') {
          if (editField === 'NET_PRICE') {
            const taxRate = record.get('taxRate') ? math.div(record.get('taxRate'), 100) : 0;
            record.set(
              'taxIncludedPrice',
              calculationRender(
                value,
                math.plus(1, taxRate),
                '*',
                renderAccuracy(record, 'taxIncludedPrice')
              )
            );
          }
        }
        if (name === 'currencyCode') {
          record.set('currencyId', value?.currencyId);
        }
        // 维护平台供应商后，带出本地供应商
        if (name === 'supplierCompanyId') {
          const { supplierId, erpSupplierName } = value || {};
          record.set('supplierId', { supplierId, supplierName: erpSupplierName });
        }
        // 维护公司后，清空平台供应商和本地供应商，业务实体和库存组织
        if (name === 'companyId') {
          record.set({
            ouId: null,
            supplierId: null,
            supplierCompanyId: null,
            invOrganizationId: null,
          });
        }
        // 维护业务实体后，清空库存组织
        if (name === 'ouId') {
          record.set({
            invOrganizationId: null,
          });
        }
      },
    },
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-adjustment/${priceAdjustmentHeaderId}/line/page`,
          method: 'GET',
          params: {
            priceAdjustmentHeaderId,
            customizeUnitCode: isEdit
              ? 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_EDIT_TABLE'
              : 'SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_SEARCH,SPC.PRICEADJUSTMENTWORKBENCH.DETAIL.LINE_TABLE_READONLY',
            ...params,
          },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPC}/v1/${organizationId}/price-adjustment/line/delete`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 阶梯价格
const ladderQuoteDS = (props) => {
  const { isEdit, editField, parentTaxRate, currencyCode = {} } = props;
  return {
    paging: false,
    selection: isEdit && 'multiple',
    primaryKey: 'lineId',
    forceValidate: true,
    // table显示的字段
    fields: [
      {
        name: 'ladderLineNum',
        type: 'string',
        label: intl.get('spcm.common.model.common.orderSeq').d('序号'),
      },
      {
        name: 'ladderFrom',
        type: 'number',
        label: intl.get('spcm.common.model.quantityStart').d('数量从（>=）'),
        required: true,
        dynamicProps: {
          max: ({ record }) => record.get('ladderTo'),
        },
      },
      {
        name: 'ladderTo',
        type: 'number',
        label: intl.get('spcm.common.model.quantityEnd').d('数量至（<）'),
        required: true,
        dynamicProps: {
          min: ({ record }) => record.get('ladderFrom'),
        },
      },
      {
        name: 'ladderPrice',
        type: 'currency',
        required: true,
        label: intl.get('ssrc.priceAdjustmentWorkBench.modal.ladderPrice').d('单价(含税)'),
        disabled: editField !== 'TAX_INCLUDED_PRICE',
      },
      {
        name: 'ladderNetPrice',
        type: 'currency',
        required: true,
        label: intl.get('ssrc.priceAdjustmentWorkBench.modal.ladderNetPrice').d('单价(不含税)'),
        disabled: editField !== 'NET_PRICE',
      },
      {
        name: 'currencyCode',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.currencyCode').d('币种'),
        lovCode: 'SSRC.CURRENCY',
        type: 'object',
        disabled: true,
        transformRequest: (value = {}) => value && value?.currencyCode,
        transformResponse: (value, data) => {
          return value
            ? {
                currencyCode: value,
                currencyName: data?.currencyName,
                currencyId: data.currencyId,
              }
            : null;
        },
        defaultValue: currencyCode,
      },
      {
        name: 'ladderPriceRemark',
        label: intl.get('ssrc.priceAdjustmentWorkBench.modal.ladderPriceRemark').d('备注'),
      },
    ],
    events: {
      update: ({ name, record, value }) => {
        if (name === 'ladderPrice') {
          if (editField === 'TAX_INCLUDED_PRICE') {
            const taxRate = parentTaxRate ? math.div(parentTaxRate, 100) : 0;
            record.set(
              'ladderNetPrice',
              calculationRender(
                value,
                math.plus(1, taxRate),
                '/',
                renderAccuracy(record, 'ladderNetPrice')
              )
            );
          }
        }
        if (name === 'ladderNetPrice') {
          if (editField === 'NET_PRICE') {
            const taxRate = parentTaxRate ? math.div(parentTaxRate, 100) : 0;
            record.set(
              'ladderPrice',
              calculationRender(
                value,
                math.plus(1, taxRate),
                '*',
                renderAccuracy(record, 'ladderPrice')
              )
            );
          }
        }
      },
    },
  };
};

const batchPriceDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    selection: false,
    paging: false,
    fields: [
      {
        name: 'itemId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.itemId').d('物料ID'),
        lovCode: 'SSRC.CUSTOMER_ITEM',
        type: 'object',
      },
      {
        name: 'itemName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        bind: 'itemId.itemName',
      },
      {
        name: 'itemCategoryId',
        type: 'object',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.itemCategoryId').d('物料品类'),
        lovCode: 'SMDM.ITEM_CATEGORY_PAGE',
      },
      {
        name: 'companyId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.companyId').d('公司ID'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        type: 'object',
      },
      {
        name: 'supplierCompanyId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.supplierCompanyId').d('供应商ID'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.SUPPLIER',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaserCompanyId: record?.get('companyId')?.companyId,
            };
          },
        },
      },
      {
        name: 'purOrganizationId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.purOrganizationId').d('采购组织'),
        lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
        type: 'object',
      },
      {
        name: 'purchaseAgentId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.purchaseAgentId').d('采购员'),
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
      },
      {
        name: 'uomId',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.uomId').d('单位'),
        lovCode: 'SSRC.UOM',
        type: 'object',
      },
      {
        name: 'currencyCode',
        label: intl.get('ssrc.priceAdjustmentWorkBench.view.title.currencyCode').d('币种'),
        lovCode: 'SSRC.CURRENCY',
        type: 'object',
      },
    ],
  };
};

export { getBasicInfoDs, getLineDs, ladderQuoteDS, batchPriceDS };
