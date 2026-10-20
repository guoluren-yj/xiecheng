import intl from 'utils/intl';
// import { SRM_SSLM } from '_utils/config';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getCurrentOrganizationId, getUserOrganizationId, getCurrentUserId } from 'utils/utils';

import { BUCKET_NAME, LINE_DIRECTORY, MAX_QUAN_NUMBER } from '@/routes/components/utils/constant';
import { getLineAttachmentUuid } from '@/services/orderWorkspaceService';
// import { crosspageBatch } from '@/routes/QuotePurchaseRequisition/utils';
// import { validataOrg } from '@/services/orderWorkspaceService';
import {
  formatUom,
  getPrecision,
  conversionUpdate,
  getDynamicLabel,
} from '@/routes/components/utils';
import { isNil } from 'lodash';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const userId = getCurrentUserId();

const lineInfo = () => ({
  // H标识默认隐藏
  dataToJSON: 'all',
  cacheModified: true,
  cacheSelection: true,
  modifiedCheck: false,
  primaryKey: 'poLineLocationId',
  fields: [
    {
      name: 'benchmarkPriceType',
      transformRequest: (value, record) => {
        const headerInfoDs = record.dataSet.getState('headerInfoDs')?.current;
        const benchmarkPriceType = value ?? headerInfoDs?.get('benchmarkPriceType');
        return benchmarkPriceType;
      },
    },
    {
      name: 'translate',
      label: intl.get('sodr.workspace.model.common.translate').d('拆分'), // H
    },
    {
      name: 'displayLineNum',
      label: intl.get('sodr.workspace.model.common.displayLineNum').d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get('sodr.workspace.model.common.displayLineLocationNum').d('发运号'),
    },
    {
      name: 'invOrganizationId',
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.organizationName`).d('收货组织'),
      type: 'object',
      lovCode: 'SPUC.SMDM.INV_ORG',
      required: true,
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const headerInfoDs = dataSet.getState('headerInfoDs');
          const currentRecord = headerInfoDs?.records[0];
          return {
            enabledFlag: 1,
            tenantId,
            ouId: currentRecord?.get('ouId')?.ouId,
            itemId: record.get('itemId')?.itemId,
            // itemId: record.toJSONData().itemId,
          };
        },
        disabled: ({ record, dataSet }) =>
          record.getPristineValue('invOrganizationId')?.organizationId &&
          !dataSet.getState('ouIdChanged'),
      },
      transformResponse: (value, object) =>
        object?.invOrganizationId
          ? {
              organizationName: object?.invOrganizationName,
              organizationId: object?.invOrganizationId,
            }
          : null,
      transformRequest: (value) => value?.organizationId,
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationId.organizationName',
    },
    {
      name: 'itemId',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
      type: 'object',
      lovCode: 'SPUC.ITEM_PRICE_CODE',
      textField: 'itemCode',
      required: true,
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const headerInfoDs = dataSet.getState('headerInfoDs');
          const basicRecord = headerInfoDs?.records[0];
          const returnOrderFlag = basicRecord?.get('returnOrderFlag');
          const tieredPricingFlag = record.get('tieredPricingFlag');
          const returnedFlag = record.get('returnedFlag');
          const { companyId, companyNum } = basicRecord?.get('companyId') || {};
          const { ouId, ouCode } = basicRecord?.get('ouId') || {};
          const { orderTypeCode } = basicRecord?.get('poTypeId') || {};
          return {
            organizationId,
            tenantId,
            supplierCompanyId: basicRecord?.get('supplierCompanyId'),
            priceShieldFlag: returnedFlag !== 1 && returnOrderFlag !== 1 ? tieredPricingFlag : null,
            companyId,
            ouId,
            ouCode,
            companyCode: companyNum,
            orderTypeCode,
            invOrganizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
        disabled: ({ record }) => record.getPristineValue('itemId')?.itemId,
      },
      // tableProps: { mode: 'tree' },
      // optionsProps: {
      //   treeFlag: true,
      //   idField: 'id',
      //   parentIdField: 'id',
      // },
      transformResponse: (value, object) =>
        object?.itemId
          ? {
              itemCode: object?.itemCode,
              itemId: object?.itemId,
              itemName: object?.itemName,
            }
          : null,
      transformRequest: (value) => value?.itemId,
    },
    { name: 'itemCode', bind: 'itemId.itemCode' },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('priceLibraryId') || record.get('itemId')?.itemId,
      },
    },
    {
      label: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryId',
      type: 'object',
      lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
      required: true,
      optionsProps: {
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId,
            enabledFlag: 1,
            itemId: record.get('itemId')?.itemId,
            businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
          };
        },
        disabled: ({ record }) =>
          record.getPristineValue('categoryId')?.categoryId &&
          record.getPristineValue('itemId')?.itemId,
      },
      transformResponse: (value, object) =>
        object?.categoryId
          ? {
              categoryId: object?.categoryId,
              categoryName: object.categoryName,
            }
          : null,
      transformRequest: (value) => value?.categoryId,
    },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    // {
    //   name: 'skuType',
    //   label: intl.get('sodr.workspace.model.common.skuType').d('定制品标识'), // H
    // },
    // {
    //   name: 'customUomName',
    //   label: intl.get('sodr.workspace.model.common.customUomName').d('定制单位'), // H
    // },
    // {
    //   name: 'customQuantity',
    //   type: 'number',
    //   label: intl.get('sodr.workspace.model.common.skuType').d('定制数量'), // H
    // },
    // {
    //   name: 'packageQuantity',
    //   type: 'number',
    //   label: intl.get('sodr.workspace.model.common.packageQuantity').d('份数'), // H
    // },
    // {
    //   name: 'customSpecsJson',
    //   label: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'), // H
    // },
    // {
    //   name: 'customSpecs',
    //   label: intl.get('sodr.workspace.model.common.customSpecsJson').d('定制品属性'), // H
    // },
    {
      name: 'commonName',
      label: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
    },
    {
      name: 'secondaryQuantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      min: 0,
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        precision: ({ record }) => getPrecision(record.get('secondaryUomPrecision')),
      },
    },
    {
      name: 'secondaryUomId',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
      type: 'object',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        lovPara: ({ record }) => ({
          itemId: record.get('itemId')?.itemId,
          primaryUomId: record.get('uomId')?.uomId,
        }),
        disabled: ({ record, dataSet }) => {
          const poLineId = record.get('poLineId');
          const secondaryUomId = dataSet.getState('responseMap')?.get(poLineId)?.secondaryUomId;
          const flag = dataSet?.getState('doubleUnitEnabled') === 2 ? false : secondaryUomId;
          return flag;
        },
      },
      transformResponse: (value, object) =>
        object?.secondaryUomId
          ? {
              uomId: object?.secondaryUomId,
              uomCode: object?.secondaryUomCode,
              uomName: object?.secondaryUomName,
              uomPrecision: object?.secondaryUomPrecision,
              // uomCodeAndName: formatUom(object?.uomCode, object?.uomName),
              uomCodeAndName: object?.secondaryUomCodeAndName,
            }
          : null,
      transformRequest: (value) => value?.uomId,
    },
    {
      name: 'secondaryUomName',
      bind: 'secondaryUomId.uomName',
    },
    {
      name: 'secondaryUomCode',
      bind: 'secondaryUomId.uomCode',
    },
    {
      name: 'uomPrecision',
      bind: 'secondaryUomId.secondaryUomPrecision',
    },
    {
      name: 'secondaryUomCodeAndName',
      bind: 'secondaryUomId.uomCodeAndName',
    },

    {
      name: 'quantity',
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      required: true,
      dynamicProps: {
        disabled: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        precision: ({ record }) => record.get('uomPrecision'),
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
      },
    },
    {
      name: 'uomId',
      label: intl.get(`sodr.common.view.message.basicUomName`).d('基本单位'),
      type: 'object',
      lovCode: 'SMDM.UOM',
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('uomId')?.uomId,
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
      },
      transformResponse: (value, object) =>
        value && {
          uomId: object?.uomId,
          uomCode: object?.uomCode,
          uomName: object?.uomName,
          uomPrecision: object?.uomPrecision,
          // uomCodeAndName: formatUom(object?.uomCode, object?.uomName),
          uomCodeAndName: object?.uomCodeAndName,
        },
      transformRequest: (value) => value?.uomId,
    },
    {
      name: 'uomName',
      bind: 'uomId.uomName',
    },
    {
      name: 'uomCode',
      bind: 'uomId.uomCode',
    },
    {
      name: 'uomPrecision',
      bind: 'uomId.uomPrecision',
    },
    {
      name: 'uomPrecision',
      bind: 'uomId.uomPrecision',
    },
    {
      name: 'uomCodeAndName',
      bind: 'uomId.uomCodeAndName',
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      transformResponse: (value, object) =>
        value && {
          currencyCode: object?.currencyCode || object?.headerCurrencyCode,
          currencyName: object?.currencyName,
          defaultPrecision: object?.defaultPrecision,
        },
      transformRequest: (value) => value?.currencyCode,
    },
    {
      name: 'currencyName',
      bind: 'currencyCode.currencyName',
    },
    {
      name: 'defaultPrecision',
      bind: 'currencyCode.defaultPrecision',
    },
    {
      name: 'taxId',
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
      type: 'object',
      lovCode: 'SMDM.TAX',
      textField: 'taxRate',
      required: true,
      lovPara: {
        enabledFlag: 1,
        tenantId,
      },
      dynamicProps: {
        disabled: ({ dataSet, record }) => {
          const poLineId = record.get('poLineId');
          const itemTaxId = record.getState('itemTaxId');
          const itemIdChanged = record.getState('itemIdChanged');
          const responseTaxId = dataSet.getState('responseMap')?.get(poLineId)?.taxId;
          return (!itemIdChanged && responseTaxId) || (itemIdChanged && itemTaxId);
        },
      },
      transformResponse: (value, object) =>
        object?.taxId
          ? {
              taxId: object?.taxId,
              taxRate: object?.taxRate,
              taxCode: object?.taxCode,
            }
          : null,
      transformRequest: (value) => value?.taxId,
    },
    {
      name: 'taxRate',
      bind: 'taxId.taxRate',
    },
    {
      name: 'taxCode',
      bind: 'taxId.taxCode',
    },
    // {
    //   name: 'lastPurchasePrice',
    //   label: intl.get('sodr.workspace.model.common.lastPurchasePrice').d('最近一次采购价'),
    //   type: 'number',
    // },
    // {
    //   // name: 'referPrice',
    //   name: 'priceLibraryId',
    //   label: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
    // },
    // {
    //   name: 'canHoldPrQuantity',
    //   type: 'number',
    //   label: intl.get('sodr.workspace.model.common.canHoldPrQuantity').d('申请可占用数量'), // H
    // },
    // {
    //   name: 'canHoldPcQuantity',
    //   type: 'number',
    //   label: intl.get('sodr.workspace.model.common.canHoldPcQuantity').d('协议可占用数量'), // H
    // },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrice').d('不含税单价'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      required: true,
      dynamicProps: {
        precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
        disabled: ({ dataSet, record }) => {
          const poLineId = record.get('poLineId');
          return !isNil(dataSet.getState('responseMap')?.get(poLineId)?.unitPrice);
        },
      },
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrice').d('含税单价'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      required: true,
      dynamicProps: {
        precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
        disabled: ({ dataSet, record }) => {
          const poLineId = record.get('poLineId');
          return (
            record.get('priceLibraryId') ||
            record.get('referPrice') === 1 ||
            !isNil(dataSet.getState('responseMap')?.get(poLineId)?.unitPrice)
          );
        },
      },
    },

    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
      type: 'number',
      min: 0,
      max: MAX_QUAN_NUMBER,
      pattern: /^([1-9]\d*(\.\d*[1-9])?)|(0\.\d*[1-9])$/,
      dynamicProps: {
        disabled: ({ record, dataSet }) => {
          const poLineId = record.get('poLineId');
          const priceDisabled =
            record.get('priceLibraryId') && record.get('currencyCode')?.currencyCode;
          const existed = !isNil(dataSet.getState('responseMap')?.get(poLineId)?.unitPriceBatch);
          return existed || priceDisabled;
        },
        required: ({ record }) =>
          (record.get('requiredFieldNames') || []).includes('unitPriceBatch'),
      },
    },
    {
      name: 'invInventoryId',
      label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
      type: 'object',
      lovCode: 'SODR.INVENTORY',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            tenantId,
            organizationId:
              record.get('invOrganizationId')?.organizationId || record.get('tmpOrganizationId'),
          };
        },
        disabled: ({ record }) => !record.get('invOrganizationId')?.organizationId,
        required: ({ record }) =>
          (record.get('requiredFieldNames') || []).includes('invInventoryId'),
      },
      transformResponse: (value) => value && { inventoryId: value },
      transformRequest: (value) => value?.inventoryId,
    },
    {
      name: 'inventoryName',
      bind: 'invInventoryId.inventoryName',
    },
    {
      name: 'invLocationName',
      label: intl.get('sodr.workspace.model.common.invLocationId').d('收货库位'),
      type: 'object',
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            inventoryId: record.get('invInventoryId')?.inventoryId,
            tenantId,
          };
        },
        disabled: ({ record }) =>
          !record.get('invInventoryId')?.inventoryId ||
          !record.get('invOrganizationId')?.organizationId,
      },
      transformResponse: (value, object) =>
        value && {
          locationName: object?.invLocationName,
          locationId: object?.invLocationId,
        },
      transformRequest: (value) => value?.locationName,
    },
    {
      name: 'invLocationId',
      bind: 'invLocationName.locationId',
    },
    {
      name: 'locationName',
      bind: 'invLocationName.locationName',
    },
    {
      name: 'needByDate',
      label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
      type: 'date',
      required: true,
    },
    {
      name: 'shipToThirdPartyName',
      label: intl.get('sodr.quotePurchase.model.quotePurchase.shipToThirdPartyName').d('送达方'),
      maxLength: 120,
      dynamicProps: {
        required: ({ record }) =>
          (record.get('requiredFieldNames') || []).includes('shipToThirdPartyName'),
      },
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('sodr.workspace.model.common.receivingAddress').d('收货地址'),
      maxLength: 120,
      dynamicProps: {
        required: ({ record }) =>
          (record.get('requiredFieldNames') || []).includes('shipToThirdPartyAddress'),
      },
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
      maxLength: 120,
      dynamicProps: {
        required: ({ record }) =>
          (record.get('requiredFieldNames') || []).includes('shipToThirdPartyContact'),
      },
    },
    {
      name: 'costId',
      label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
      type: 'object',
      lovCode: 'SPRM.COST_CENTER',
      valueField: 'costId',
      dynamicProps: {
        disabled: ({ dataSet }) =>
          !dataSet.getState('headerInfoDs')?.getState('response')?.companyId,
        required: ({ record }) => (record.get('requiredFieldNames') || []).includes('costId'),
        lovPara: ({ dataSet }) => {
          const headerInfoDs = dataSet.getState('headerInfoDs');
          const orgRecord = headerInfoDs?.records[0];
          return {
            companyId: orgRecord?.get('companyId')?.companyId,
            tenantId,
            ouId: orgRecord?.get('ouId')?.ouId,
          };
        },
      },
      transformResponse: (value, object) =>
        value && {
          costId: object?.costId,
          costCode: object?.costCode,
          costName: object?.costName,
        },
      transformRequest: (value) => value?.costId,
    },
    {
      name: 'costCode',
      bind: 'costId.costCode',
    },
    {
      name: 'costName',
      bind: 'costId.costName',
    },
    {
      name: 'accountSubjectId',
      label: intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目'), // H
      type: 'object',
      lovCode: 'SPRM.ACCOUNT_SUBJECT',
      dynamicProps: {
        disabled: ({ dataSet }) =>
          !dataSet.getState('headerInfoDs')?.current?.get('companyId')?.companyId,
        required: ({ record }) =>
          (record.get('requiredFieldNames') || []).includes('accountSubjectId'),
        lovPara: ({ dataSet }) => {
          const orgRecord = dataSet.getState('headerInfoDs')?.records[0];
          return {
            companyId: orgRecord?.get('companyId')?.companyId,
            tenantId,
          };
        },
      },
      transformResponse: (value, object) =>
        value && {
          accountSubjectId: object?.accountSubjectId,
          accountSubjectName: object?.accountSubjectName,
        },
      transformRequest: (value) => value?.accountSubjectId,
    },
    {
      name: 'accountSubjectName',
      bind: 'accountSubjectId.accountSubjectName',
    },
    {
      name: 'wbsCode',
      label: intl.get('sodr.workspace.model.common.wbsCode').d('wbs元素'),
      type: 'object',
      lovCode: 'SMDM.WBS',
      textField: 'wbsCode',
      dynamicProps: {
        required: ({ record }) => (record.get('requiredFieldNames') || []).includes('wbsCode'),
        lovPara: ({ dataSet }) => {
          const headerInfoDs = dataSet.getState('headerInfoDs');
          const orgRecord = headerInfoDs?.current;
          return {
            tenantId,
            companyId: orgRecord?.get('companyId')?.companyId,
            ouId: orgRecord?.get('ouId')?.ouId,
          };
        },
      },
      transformResponse: (value, object) =>
        value && { wbsCode: object?.wbsCode, wbsName: object?.wbs },
      transformRequest: (value) => (value ? value.wbsCode : ''),
    },
    {
      name: 'wbs',
      bind: 'wbsCode.wbsName',
      transformRequest: (value) => value || '',
    },
    // {
    //   name: 'freeFlag',
    //   label: intl.get('sodr.workspace.model.common.freeFlag').d('是否免费'),
    //   type: 'boolean',
    //   trueValue: 1,
    //   falseValue: 0,
    // },
    {
      name: 'returnedFlag',
      label: intl.get('sodr.workspace.model.common.returnedFlag').d('是否退回'),
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled: ({ dataSet, record }) =>
          dataSet.getState('headerInfoDs')?.current?.get('returnOrderFlag') === 1 ||
          record.getPristineValue('returnedFlag') === 1,
      },
    },
    {
      name: 'receiveTelNum',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'), // H
      dynamicProps: {
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'internationalTelCode',
      lookupCode: 'HPFM.IDD',
      transformResponse: (value) => value || '+86',
      transformRequest: (value) => value || '+86',
      dynamicProps: {
        disabled: ({ record }) => record.getField('receiveTelNum').disabled,
        required: ({ record }) => record.getField('receiveTelNum').required,
      },
    },
    {
      name: 'brand',
      //  disabled: true,
      label: intl.get('sodr.workspace.model.common.brand').d('品牌'),
    },
    {
      name: 'specifications',
      //  disabled: true,
      label: intl.get('sodr.workspace.model.common.specifications').d('规格'),
    },
    {
      name: 'model',
      // disabled: true,
      label: intl.get('sodr.workspace.model.common.model').d('型号'),
    },
    {
      name: 'displayPrNumAndDisplayPrLineNum',
      label: intl.get('sodr.workspace.model.common.prNumAndPrLineNum').d('采购申请号|行号'),
    },
    {
      name: 'contractNum',
      label: intl.get('sodr.workspace.model.common.contractNum').d('采购协议号|行号'),
      type: 'object',
      lovCode: 'SPUC.PO_HOLD_PR',
      textField: 'contractNum',
      valueField: 'contractNum',
      disabled: true,
      dynamicProps: {
        lovPara: ({ record, dataSet }) => {
          const headerInfoDs = dataSet.getState('headerInfoDs');
          const orgRecord = headerInfoDs?.current;
          return {
            tenantId,
            supplierCompanyId: orgRecord?.get('supplierCompanyId'),
            companyId: orgRecord?.get('companyId')?.companyId,
            ouId: orgRecord?.get('ouId')?.ouId,
            itemId: record.get('itemId')?.itemId,
            holdPcLineId: record.get('holdPcLineId'),
          };
        },
        // disabled: ({ record }) => record.get('priceContractFlag') === 1,
      },
      transformResponse: (value, object) => value && { contractNum: object?.contractNum },
      transformRequest: (value) => value?.contractNum,
    },
    // {
    //   name: 'holdPcHeaderId',
    //   bind: 'contractNum.holdPcHeaderId',
    // },
    // {
    //   name: 'holdPcLineId',
    //   bind: 'contractNum.holdPcLineId',
    // },
    // {
    //   name: 'holdPcNum',
    //   bind: 'contractNum.holdPcNum',
    // },
    // {
    //   name: 'holdPcLineNum',
    //   bind: 'contractNum.holdPcLineNum',
    // },
    // {
    //   name: 'canHoldPcQuantity',
    //   bind: 'contractNum.canHoldPcQuantity',
    // },
    {
      name: 'sourceNumAndLine',
      label: intl.get('sodr.workspace.model.common.sourceNumAndLine').d('寻源单号|行号'),
    },
    {
      name: 'prRequestedName',
      label: intl.get('sodr.workspace.model.common.prRequestedName').d('申请人'),
    },
    {
      name: 'accountAssignTypeId',
      type: 'object',
      lovCode: 'SPRM.ACCOUNT_ASSIGN_TYPE',
      label: intl.get('sodr.workspace.model.common.accountAssignTypeCode').d('账户分配类别'),
      lovPara: {
        lineType: 'PO_LINE',
        tenantId,
      },
      transformResponse: (value, object) =>
        value && {
          requiredFieldNames: object?.requiredFieldNames || [],
          accountAssignTypeId: object?.accountAssignTypeId,
          accountAssignTypeCode: object?.accountAssignTypeCode,
        },
      transformRequest: (value) => value?.accountAssignTypeId,
    },
    {
      name: 'accountAssignTypeCode',
      bind: 'accountAssignTypeId.accountAssignTypeCode',
    },
    {
      name: 'requiredFieldNames',
      bind: 'accountAssignTypeId.requiredFieldNames',
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      maxLength: 480,
      transformRequest: (value) => value || '',
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.lineAttachmentUuid').d('行附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: LINE_DIRECTORY,
    },
    {
      name: 'receiveToleranceQuantityType',
      lookupCode: 'SPFM.BUSINESS_CATEGORY',
      label: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('接收允差类型'), // H
      dynamicProps: {
        required: ({ record }) =>
          record.get('receiveToleranceQuantity') && !record.get('receiveToleranceQuantityType'),
      },
      transformRequest: (value) => value || '',
    },
    {
      name: 'receiveToleranceQuantity',
      label: intl.get('sodr.workspace.model.common.receiveToleranceQuantity').d('接收允差（%）'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        required: ({ record }) =>
          record.get('receiveToleranceQuantityType') && !record.get('receiveToleranceQuantity'),
      },
    },
    {
      name: 'purchaseLineTypeId',
      lookupCode: ' SODR.PO_LINE_TYPE ',
      label: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
    },
    {
      name: 'domesticTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludedPrice').d('本币含税单价'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          getPrecision(dataSet.getState('headerInfoDs')?.current?.get('domesticDefaultPrecision')),
      },
    },
    {
      name: 'domesticUnitPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticUnitPrice').d('本币不含税单价'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          getPrecision(dataSet.getState('headerInfoDs')?.current?.get('domesticDefaultPrecision')),
      },
    },
    {
      name: 'domesticTaxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl
        .get('sodr.workspace.model.common.domesticTaxIncludedLineAmount')
        .d('本币含税金额'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          getPrecision(
            dataSet.getState('headerInfoDs')?.current?.get('domesticFinancialPrecision')
          ),
      },
    },
    {
      name: 'domesticLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticLineAmount').d('本币不含税金额'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          getPrecision(
            dataSet.getState('headerInfoDs')?.current?.get('domesticFinancialPrecision')
          ),
      },
    },
    {
      name: 'budgetAccountId',
      type: 'object',
      lovCode: 'SMDM.BUDGET_ACCOUNT_ORDER',
      label: intl.get('sodr.common.model.common.budgetAccount').d('预算科目'),
      lovPara: {
        tenantId,
      },
      transformResponse: (value, object) =>
        value && {
          budgetAccountId: object.budgetAccountId,
          budgetAccountName: object.budgetAccountName,
        },
      transformRequest: (value) => value?.budgetAccountId,
    },
    {
      name: 'budgetAccountName',
      bind: 'budgetAccountId.budgetAccountName',
    },
    // {
    //   name: 'sourceBillTypeCode',
    //   lookupCode: 'SPFM.BUSINESS_CATEGORY',
    //   label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('来源单据'), // H
    //   disabled: true,
    // },
    {
      name: 'subSupplierId',
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      label: intl.get('sodr.common.model.common.subSupplierId').d('分包供应商'), // H
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const headerInfoDs = dataSet.getState('headerInfoDs');
          const basicRecord = headerInfoDs?.records[0];
          const companyId = basicRecord?.get('companyId')?.companyId;
          return {
            userId,
            tenantId,
            companyId,
            organizationId,
          };
        },
        // disabled: ({ record }) => record.get('prLineItemId'),
        disabled: ({ dataSet }) =>
          dataSet.getState('headerInfoDs')?.current?.get('unSaveEnable') === 2,
      },
      transformResponse: (value, object) => {
        const {
          subSupplierId,
          subErpSupplierName,
          subSupplierName,
          subSupplierCode,
          subErpSupplierId,
          subErpSupplierCode,
          subSupplierTenantId,
        } = object;
        return {
          supplierCompanyId: subSupplierId,
          supplierCompanyNum: subSupplierCode,
          supplierCompanyName: subSupplierName,
          supplierId: subErpSupplierId,
          supplierNum: subErpSupplierCode,
          supplierName: subErpSupplierName,
          supplierTenantId: subSupplierTenantId,
          displaySupplierName: subErpSupplierName || subSupplierName,
        };
      },
      transformRequest: (value) => value?.supplierCompanyId,
    },
    { name: 'subSupplierCode', bind: 'subSupplierId.supplierCompanyNum' },
    { name: 'subSupplierName', bind: 'subSupplierId.supplierCompanyName' },
    { name: 'subErpSupplierName', bind: 'subSupplierId.supplierName' },
    { name: 'subErpSupplierId', bind: 'subSupplierId.supplierId' },
    { name: 'subErpSupplierCode', bind: 'subSupplierId.supplierNum' },
    { name: 'subSupplierTenantId', bind: 'subSupplierId.supplierTenantId' },
    {
      name: 'docFlow',
      label: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
    },
    // W
    // 默认隐藏字段
    // {
    //   name: 'priceSource',
    //   label: intl.get('sodr.workspace.model.common.priceSource').d('价格来源'),
    // },
    // {
    //   name: 'priceSourceNum',
    //   label: intl.get('sodr.workspace.model.common.priceSourceNum').d('价格来源单据号'),
    // },
    // {
    //   name: 'priceSourceLineNum',
    //   label: intl.get('sodr.workspace.model.common.priceSourceLineNum').d('价格来源单据行号'),
    // },
  ],
  queryParameter: {
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    camp: 2,
    sortType: 0,
    customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
  },
  events: {
    load: ({ dataSet }) => {
      // crosspageBatch({ dataSet });
      dataSet.forEach((i) => {
        i.init({
          uomCodeAndName: formatUom(i.get('uomCode'), i.get('uomName')),
          tmpOrganizationId: i.get('invOrganizationId')?.organizationId,
          saveBomItemId: i.get('itemId')?.itemId,
          returnedFlag:
            dataSet.getState('headerInfoDs')?.current?.get('returnOrderFlag') ||
            i.get('returnedFlag'),
        });
        Object.assign(i, { status: 'update' });
      });
    },
    update: ({ name, record, value, dataSet }) => {
      const headerInfoDs = dataSet.getState('headerInfoDs');
      const loading = headerInfoDs?.getState('loading');
      const itemCode = record.get('itemCode');
      const doubleUnitEnabled = headerInfoDs?.getState('doubleUnitEnabled');
      if (name === 'invOrganizationId') {
        const { receiveToleranceQuantity, receiveToleranceQuantityType } = value || {};
        record.set({
          invInventoryId: null,
          invLocationId: null,
          invLocationName: null,
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
        });
      }
      if (name === 'itemId') {
        const {
          itemName,
          categoryId,
          categoryName,
          uomId,
          uomName,
          uomCode,
          uomCodeAndName,
          uomPrecision,
          secondaryUomId,
          secondaryUomName,
          secondaryUomCode,
          secondaryUomPrecision,
          secondaryUomCodeAndName,
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
          taxId,
          taxCode,
          taxRate,
          commonName,
          model,
          specifications,
          brand,
        } = value || {};
        const taxObj = taxId && { taxId, taxCode, taxRate };
        const categoryObj = categoryId && { categoryId, categoryName };
        const uomObj = uomId && { uomId, uomName, uomCode, uomPrecision, uomCodeAndName };
        const secondaryUomObj = secondaryUomId
          ? {
              uomId: secondaryUomId,
              uomCode: secondaryUomCode,
              uomName: secondaryUomName,
              uomPrecision: secondaryUomPrecision,
              uomCodeAndName: secondaryUomCodeAndName,
            }
          : uomObj;
        if (doubleUnitEnabled) {
          record.set({ uomId: uomObj, secondaryUomId: secondaryUomObj });
          conversionUpdate({ dataSet, record, loading });
        } else {
          record.set({ secondaryUomId: uomObj, uomId: uomObj });
        }
        record.set({
          itemName,
          categoryId: categoryObj,
          uomId: uomObj,
          taxId: taxObj,
          priceLibraryId: undefined,
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
          commonName,
          model,
          specifications,
          brand,
        });
        record.setState({ itemIdChanged: true, itemTaxId: taxId });
      }
      if (name === 'invInventoryId') {
        record.set({
          invLocationName: null,
          invLocationId: null,
        });
      }
      if (name === 'attachmentUuid') {
        if (record.get('poLineId')) {
          getLineAttachmentUuid({ poLineId: record.get('poLineId'), attachmentUuid: value }).then(
            (res) => {
              if (res && !res.failed) {
                record.init({ lineVersionNumber: res.objectVersionNumber });
              }
            }
          );
        }
      }
      if (name === 'quantity' && !doubleUnitEnabled) {
        record.set({ secondaryQuantity: value });
      }
      if (name === 'uomId' && !doubleUnitEnabled) {
        // 不开双单位,修改后联动覆盖到基本单位
        const { uomId, uomName, uomCode, uomCodeAndName, uomPrecision } = value || {};
        const uomObj = uomId && {
          uomId,
          uomName,
          uomCode,
          uomCodeAndName,
          uomPrecision,
        };
        record.set({ secondaryUomId: uomObj });
      }
      if (name === 'secondaryUomId') {
        // 开启双单位 并且有 必备参数 换算出基本数量
        // const itemIdChanged = record.getField('itemId')?.isDirty(record);
        if (doubleUnitEnabled && itemCode) {
          // if (itemIdChanged) return;
          conversionUpdate({ dataSet, record, loading });
        } else {
          // 不开双单位,修改后联动覆盖到基本单位
          const { uomId, uomName, uomCode, uomCodeAndName, uomPrecision } = value || {};
          const uomObj = uomId && {
            uomId,
            uomName,
            uomCode,
            uomCodeAndName,
            uomPrecision,
          };
          record.set({ uomId: uomObj });
        }
      }
      if (name === 'secondaryQuantity') {
        // 有物料编码 并且开启双单位换算出基本数量
        if (doubleUnitEnabled && itemCode) {
          conversionUpdate({ dataSet, record, loading, value });
        } else {
          record.set({ quantity: value });
        }
      }
    },
  },
});

export default lineInfo;
