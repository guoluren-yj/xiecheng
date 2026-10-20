// import moment from 'moment';

import intl from 'utils/intl';
import {
  getCurrentOrganizationId,
  getResponse,
  getUserOrganizationId,
  getCurrentUserId,
} from 'utils/utils';
import { isEmpty, isNil, isNumber } from 'lodash';

import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';

import { getPrecision, getMaxPoLineNum } from '@/routes/components/utils/index';
import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
  SUPPLIER_DIRECTORY,
  LINE_DIRECTORY,
} from '@/routes/components/utils/constant';
import { checkInvOrganization, fetchModifyablePriceFlag } from '@/services/orderWorkspaceService';
import { amountCalculationPro, conversionUpdate, getDynamicLabel } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();
const organizationId = getUserOrganizationId();
const userId = getCurrentUserId();

// 价格库配置是否可修改
const getModifyablePriceFlag = async (ds, params) => {
  if (Object.values(params).some((i) => !i)) return;
  const res = getResponse(await fetchModifyablePriceFlag(params));
  ds.current.set({
    modifyablePriceFlag: isNumber(+res?.modifyablePriceFlag)
      ? +res?.modifyablePriceFlag
      : undefined,
  });
};
// 行字段是否配置可修改
const isDisabledFields = ({ dataSet, record }, fieldName) => {
  const changeFieldsList = dataSet.getState('changeFieldsList') || [];
  const disabledField = !changeFieldsList.includes(fieldName);
  return (
    // 分包供应商特殊处理
    (fieldName === 'subSupplierId'
      ? disabledField && !changeFieldsList.includes('subErpSupplierId')
      : disabledField) ||
    record.get('cancelledFlag') ||
    record.get('closedFlag')
  );
};
// 批量编辑是否配置可修改
const isDisabledList = ({ dataSet }, fieldName) => {
  const changeFieldsList = dataSet.getState('changeFieldsList') || [];
  return !changeFieldsList.includes(fieldName);
};

// 是否是新增行(非原行、拆分行)
const isNewLine = (record) => {
  return record.status === 'add' && !record.get('splitFromLineNum');
};

const basicInfo = ({ remote }) => ({
  autoCreate: true,
  dataToJSON: 'all',
  primaryKey: 'poHeaderId',
  fields: [
    {
      name: 'displayPoNum',
      label: intl.get('sodr.workspace.model.common.displayPoNum').d('订单编号'),
      disabled: true,
    },
    {
      name: 'releaseNum',
      label: intl.get('sodr.workspace.model.common.releaseNum').d('发放号'),
      disabled: true,
    },
    {
      name: 'versionNum',
      label: intl.get('sodr.workspace.model.common.versionNum').d('版本号'),
      disabled: true,
    },
    {
      name: 'poTypeDesc',
      label: intl.get('sodr.workspace.model.common.poTypeId').d('订单类型'),
      disabled: true,
    },
    {
      name: 'amount',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.amounts').d('总金额(不含税)'),
      disabled: true,
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'taxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.amountTaxInclude').d('总金额(含税)'),
      disabled: true,
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'paymentPlanNum',
      label: intl.get('sodr.workspace.model.common.newPaymentPlanNum').d('付款计划编号'),
    },
    {
      name: 'quantityTotal',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.quantityTotal').d('总数量'),
      disabled: true,
      dynamicProps: {
        disabled: ({ record }) => record.status !== 'add',
      },
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      disabled: true,
    },
    {
      name: 'creationDate',
      label: intl.get('sodr.workspace.model.common.creationDate').d('创建日期'),
      disabled: true,
      type: 'dateTime',
    },
    {
      name: 'poSourcePlatform',
      label: intl.get('sodr.workspace.model.common.poSourcePlatform').d('来源平台'),
      disabled: true,
    },
    {
      name: 'termsId',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
      type: 'object',
      lovCode: 'SMDM.PAYMENT.TERM',
      dynamicProps: {
        lovPara() {
          return {
            tenantId,
          };
        },
        disabled: (fieldProp) => isDisabledFields(fieldProp, 'termsId'),
      },
      transformResponse: (value) => value && { termId: value },
      transformRequest: (value) => value?.termId,
    },
    {
      name: 'termsName',
      bind: 'termsId.termName',
    },
    {
      name: 'termsCode',
      bind: 'termsId.termCode',
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'headerRemark'),
      },
      transformRequest: (value) => value || '',
    },
    // 默认隐藏字段
    {
      name: 'domesticCurrencyCode',
      label: intl.get('sodr.workspace.model.common.domesticCurrencyCode').d('本币币种'),
      disabled: true,
    },
    {
      name: 'domesticTaxIncludeAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludeAmounts').d('本币金额(含税)'),
      disabled: true,
      dynamicProps: {
        precision: ({ record }) => record.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'domesticAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticAmounts').d('本币金额(不含税)'),
      disabled: true,
      dynamicProps: {
        precision: ({ record }) => record.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'originalPoNum',
      label: intl.get('sodr.workspace.model.common.originalPoNum').d('原订单号'),
      disabled: true,
    },
    {
      name: 'sourceOfTransferOrder',
      label: intl.get('sodr.workspace.model.common.sourceOfTransferOrder').d('转单来源'),
      disabled: true,
    },
    {
      name: 'sourceBillTypeCode',
      label: intl.get('sodr.workspace.model.common.sourceBillTypeCode').d('单据来源'),
      disabled: true,
    },
    {
      name: 'supplierOrderTypeCode',
      label: intl.get('sodr.workspace.model.common.supplierOrderTypeCode').d('京东e卡-code'),
      disabled: true,
    },

    // 附件字段
    {
      name: 'purchaserInnerAttachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.attachmentUUID').d('采购方附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
    },
    {
      name: 'supplierAttachmentUuid',
      type: 'attachment',
      label: intl.get('sodr.workspace.model.common.supplierAttachmentId').d('供应商附件'),
      bucketName: BUCKET_NAME,
      bucketDirectory: SUPPLIER_DIRECTORY,
    },
    {
      name: 'createdUnitName',
      label: intl.get('sodr.workspace.model.common.createdUnitName').d('创建人部门'),
    },
    {
      name: 'pcHeaderIdLov',
      label: intl.get(`sodr.workspace.model.common.pcSubjectId`).d('关联采购协议'),
      lovCode: 'SPCM.HEADER_COMMON_PLUS',
      type: 'object',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs') || {};
          const { supplierCompanyId, supplierId } =
            organizationInfoDs.current?.get(['supplierCompanyId', 'supplierId']) || {};
          return {
            supplierCompanyId,
            supplierId,
            organizationId,
          };
        },
      },
      transformResponse: (value, object) => ({ pcHeaderId: value, pcNum: object.pcNumLov }),
      transformRequest: (value) => value?.pcHeaderId,
    },
    {
      name: 'pcNumLov',
      bind: 'pcHeaderIdLov.pcNum',
    },
    {
      // 后端需要该字段处理新增行号逻辑
      name: 'insertLineNumByPageFlag',
      transformRequest: (value, record) => Number(!isNil(record.get('maxPoLineNum'))),
    },
  ],
  queryParameter: {
    camp: 1,
    customizeUnitCode: [
      'SODR.WORKSPACE_CHANGE_DETAIL.BASICINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.ORGANIZATIONINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO',
      'SODR.WORKSPACE_CHANGE_DETAIL.ATTACHMENTINFO_EXTERNAL',
      'SODR.WORKSPACE_CHANGE_DETAIL.PAYMENTTERMINFO',
    ].toString(),
  },
  events: {
    load: ({ dataSet }) => {
      const detailInfoDs = dataSet.getState('detailInfoDs');
      detailInfoDs.setState({ fieldMap: undefined });
      detailInfoDs.unSelectAll();
      dataSet.forEach((i) => {
        i.init({
          prepayFlag: isNil(i.get('prepayFlag')) ? 0 : i.get('prepayFlag'),
        });
        // Object.assign(i, { status: 'update' });
      });
      remote.event.fireEvent('basicInfoDsLoad', { dataSet });
    },
    update: ({ name, value, dataSet, record }) => {
      const newPriceLibFields = [...(dataSet.getState('newPriceLibFields') || [])];
      const attributeFields = record.get(newPriceLibFields);

      if (name === 'termsId') {
        const { prepayFlag } = value || {};
        record.set({
          prepayFlag,
        });
      }

      if (newPriceLibFields.includes(name)) {
        getModifyablePriceFlag(dataSet, {
          ...attributeFields,
        });
      }
    },
  },
});

const organizationInfo = () => ({
  dataToJSON: 'all',
  autoCreate: true,
  fields: [
    {
      name: 'companyName',
      label: intl.get('sodr.workspace.model.common.company').d('公司'),
    },
    {
      name: 'supplierName',
      label: intl.get('sodr.workspace.model.common.supplier').d('供应商'),
    },
    {
      name: 'ouName',
      label: intl.get('sodr.workspace.model.common.ouId').d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get('sodr.workspace.model.common.purchaseOrgId').d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get('sodr.workspace.model.common.agentId').d('采购员'),
    },
    // 默认隐藏字段
    {
      name: 'settleCompanyName',
      label: intl.get(`sodr.common.model.common.settleCompanyName`).d('结算公司'), // H
    },
    {
      name: 'settleSupplierName',
      label: intl.get('sodr.workspace.model.common.settleSupplierId').d('结算供应商'),
    },
    {
      name: 'supplierSiteName',
      label: intl.get(`sodr.common.model.common.supplierSiteName`).d('供应商地点'),
    },
    {
      name: 'supplierContactName',
      label: intl.get('sodr.workspace.model.common.supplierContactName').d('供应商联系人名称'),
    },
    {
      name: 'supplierContactTelNum',
      label: intl.get('sodr.workspace.model.common.supplierContactTelNum').d('供应商联系人电话'),
    },
  ],
  events: {
    update: ({ record, name, dataSet }) => {
      const newPriceLibFields = [...(dataSet.getState('newPriceLibFields') || [])];
      const attributeFields = record.get(newPriceLibFields);

      if (newPriceLibFields.includes(name)) {
        getModifyablePriceFlag(dataSet.getState('basicInfoDs'), {
          ...attributeFields,
        });
      }
    },
  },
});

const detailInfo = ({ remote }) => ({
  dataToJSON: 'all',
  pageSize: 20,
  modifiedCheck: false,
  cacheModified: true,
  cacheSelection: true,
  primaryKey: 'poLineLocationId',
  fields: [
    {
      name: 'translate',
      label: intl.get('sodr.workspace.model.common.translate').d('拆分'),
    },
    {
      name: 'benchmarkPriceType',
      transformRequest: (value, record) => {
        const basicCurrent = record.dataSet.getState('basicInfoDs')?.current;
        const benchmarkPriceType = value ?? basicCurrent.get('benchmarkPriceType');
        return benchmarkPriceType;
      },
    },
    {
      name: 'displayStatusCode',
      label: intl.get('sodr.workspace.model.common.displayStatusCode').d('状态'),
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
      name: 'itemCode',
      label: intl.get('sodr.workspace.model.common.itemCode').d('物料编码'),
      type: 'object',
      valueField: 'itemCode',
      textField: 'itemCode',
      lovCode: 'SPUC.ITEM_PRICE_CODE',
      transformResponse: (value, object) =>
        value
          ? {
              itemCode: value,
              itemId: object.itemId,
              itemName: object.itemName,
            }
          : null,
      transformRequest: (value) => value?.itemCode,
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const basicRecord = basicInfoDs.records[0];
          const orgRecord = organizationInfoDs?.records && organizationInfoDs.records[0];
          const { returnOrderFlag, orderTypeCode } = basicRecord.get([
            'returnOrderFlag',
            'orderTypeCode',
          ]);
          const tieredPricingFlag = record.get('tieredPricingFlag');
          const returnedFlag = record.get('returnedFlag');
          const { companyId, companyCode, ouId, ouCode } =
            orgRecord.get(['companyId', 'companyCode', 'ouId', 'ouCode']) || {};
          return {
            organizationId,
            tenantId,
            supplierCompanyId: orgRecord?.get('supplierCompanyId'),
            priceShieldFlag: returnedFlag !== 1 && returnOrderFlag !== 1 ? tieredPricingFlag : null,
            companyId,
            ouId,
            ouCode,
            companyCode,
            orderTypeCode,
            invOrganizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
        disabled: ({ record, dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const { sourceBillTypeCode } = basicInfoDs?.current.get(['sourceBillTypeCode']) || {};
          return isNewLine(record)
            ? sourceBillTypeCode !== 'PURCHASE_ORDER' && record.getPristineValue('itemId')
            : false;
        },
        required: ({ record }) => isNewLine(record),
      },
    },
    {
      name: 'itemId',
      bind: 'itemCode.itemId',
    },
    {
      name: 'itemName',
      label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
      required: true,
      dynamicProps: {
        disabled: ({ record }) => record.get('itemCode')?.itemId,
      },
    },
    {
      name: 'secondaryQuantity',
      label: intl.get('sodr.workspace.model.common.quantity').d('数量'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        disabled: (fieldProp) => isDisabledFields(fieldProp, 'secondaryQuantity'),
        precision: ({ record }) => getPrecision(record.get('secondaryUomPrecision')),
      },
    },
    {
      name: 'secondaryUomId',
      label: intl.get('sodr.workspace.model.common.uomId').d('单位'),
      type: 'object',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      transformResponse: (value, object) => {
        return object?.secondaryUomId
          ? {
              uomId: object?.secondaryUomId,
              uomCode: object?.secondaryUomCode,
              uomName: object?.secondaryUomName,
              uomPrecision: object?.secondaryUomPrecision,
              uomCodeAndName: object?.secondaryUomCodeAndName,
            }
          : null;
      },
      transformRequest: (value) => value?.uomId,
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        lovPara: ({ record }) => ({
          itemId: record.get('itemId'),
          primaryUomId: record.get('uomId')?.uomId,
        }),
        disabled: (fieldProp) => {
          const { record } = fieldProp;
          return isNewLine(record) ? false : isDisabledFields(fieldProp, 'secondaryUomId');
        },
      },
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
      name: 'secondaryUomCodeAndName',
      bind: 'secondaryUomId.uomCodeAndName',
    },
    {
      name: 'secondaryUomPrecision',
      bind: 'secondaryUomId.secondaryUomPrecision',
    },

    {
      name: 'quantity',
      type: 'number',
      required: true,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        precision: ({ record }) => getPrecision(record.get('uomPrecision')),
        disabled: (fieldProp) => {
          const { dataSet, record } = fieldProp;
          const flag = dataSet.getState('doubleUnitEnabled');
          const disabled = isNewLine(record) ? false : isDisabledFields(fieldProp, 'quantity');
          return flag || disabled;
        },
      },
    },
    {
      name: 'uomId',
      type: 'object',
      lovCode: 'SMDM.UOM',
      required: true,
      transformResponse: (value, object) => {
        return object?.uomId
          ? {
              uomId: object?.uomId,
              uomCode: object?.uomCode,
              uomName: object?.uomName,
              uomPrecision: object?.uomPrecision,
              uomCodeAndName: object?.uomCodeAndName,
            }
          : null;
      },
      transformRequest: (value) => value?.uomId,
      dynamicProps: {
        label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
        disabled: (fieldProp) => {
          const { record, dataSet } = fieldProp;
          const flag = dataSet.getState('doubleUnitEnabled');
          const isDisabled = isNewLine(record) ? false : isDisabledFields(fieldProp, 'uomId');
          return flag || isDisabled;
        },
      },
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
      name: 'uomCodeAndName',
      bind: 'uomId.uomCodeAndName',
    },
    {
      name: 'uomPrecision',
      bind: 'uomId.uomPrecision',
    },
    {
      name: 'needByDate',
      label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
      type: 'date',
      required: true,
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'needByDate'),
      },
    },
    {
      name: 'unitPrice',
      label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
      type: 'number',
      dynamicProps: {
        required: ({ record, name }) => {
          return !record.getField(name).get('disabled', record);
        },
        disabled: (fieldProp) => {
          const { record, dataSet } = fieldProp;
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const priceLibraryId = record.get('priceLibraryId');
          const benchmarkPriceType = record.get('benchmarkPriceType')
            ? record.get('benchmarkPriceType')
            : basicCurrent?.get('benchmarkPriceType');
          const sourceBillTypeCode = basicCurrent?.get('sourceBillTypeCode');
          return isNewLine(record)
            ? (sourceBillTypeCode === 'CONTRACT_ORDER' ||
                (['PURCHASE_ORDER', 'PURCHASE_REQUEST'].includes(sourceBillTypeCode) &&
                  priceLibraryId)) &&
              benchmarkPriceType === 'NET_PRICE'
              ? basicCurrent?.get('modifyablePriceFlag') === 0
              : benchmarkPriceType !== 'NET_PRICE'
            : isDisabledFields(fieldProp, 'unitPrice') || benchmarkPriceType !== 'NET_PRICE';
        },
        precision: ({ record, dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const poSourcePlatform = basicInfoDs.current.get('poSourcePlatform');
          return poSourcePlatform === 'ERP'
            ? undefined
            : getPrecision(record.get('defaultPrecision'));
        },
        max: ({ record, dataSet }) => {
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const benchmarkPriceType =
            record.get('benchmarkPriceType') || basicCurrent?.get('benchmarkPriceType');
          const priceLibraryId = record.get('priceLibraryId');
          const sourceBillTypeCode = basicCurrent?.get('sourceBillTypeCode');
          return (sourceBillTypeCode === 'CONTRACT_ORDER' ||
            (['PURCHASE_ORDER', 'PURCHASE_REQUEST'].includes(sourceBillTypeCode) &&
              priceLibraryId)) &&
            isNewLine(record) &&
            benchmarkPriceType === 'NET_PRICE' &&
            basicCurrent?.get('modifyablePriceFlag') === -1
            ? record.get('originUnitPrice')
            : MAX_QUAN_NUMBER;
        },
      },
    },
    {
      name: 'lineAmount',
      label: intl.get('sodr.workspace.model.common.lineAmounts').d('行金额(不含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'enteredTaxIncludedPrice',
      label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
      type: 'number',
      dynamicProps: {
        required: ({ record, name }) => {
          return !record.getField(name).get('disabled', record);
        },
        disabled: (fieldProp) => {
          const { record, dataSet } = fieldProp;
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const priceLibraryId = record.get('priceLibraryId');
          const benchmarkPriceType = record.get('benchmarkPriceType')
            ? record.get('benchmarkPriceType')
            : basicCurrent?.get('benchmarkPriceType');
          const sourceBillTypeCode = basicCurrent?.get('sourceBillTypeCode');
          return isNewLine(record)
            ? (sourceBillTypeCode === 'CONTRACT_ORDER' ||
                (['PURCHASE_ORDER', 'PURCHASE_REQUEST'].includes(sourceBillTypeCode) &&
                  priceLibraryId)) &&
              benchmarkPriceType === 'TAX_INCLUDED_PRICE'
              ? basicCurrent?.get('modifyablePriceFlag') === 0
              : benchmarkPriceType === 'NET_PRICE'
            : isDisabledFields(fieldProp, 'enteredTaxIncludedPrice') ||
                benchmarkPriceType !== 'TAX_INCLUDED_PRICE';
        },
        precision: ({ record, dataSet }) => {
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const poSourcePlatform = basicInfoDs?.current.get('poSourcePlatform');
          return poSourcePlatform === 'ERP'
            ? undefined
            : getPrecision(record.get('defaultPrecision'));
        },
        max: ({ record, dataSet }) => {
          const basicCurrent = dataSet.getState('basicInfoDs')?.current;
          const benchmarkPriceType =
            record.get('benchmarkPriceType') || basicCurrent?.get('benchmarkPriceType');
          const priceLibraryId = record.get('priceLibraryId');
          const sourceBillTypeCode = basicCurrent?.get('sourceBillTypeCode');
          return (sourceBillTypeCode === 'CONTRACT_ORDER' ||
            (['PURCHASE_ORDER', 'PURCHASE_REQUEST'].includes(sourceBillTypeCode) &&
              priceLibraryId)) &&
            isNewLine(record) &&
            benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
            basicCurrent?.get('modifyablePriceFlag') === -1
            ? record.get('originUnitPrice')
            : MAX_QUAN_NUMBER;
        },
      },
    },
    {
      name: 'taxIncludedLineAmount',
      label: intl.get('sodr.workspace.model.common.taxIncludedLineAmounts').d('行金额(含税)'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        precision: ({ record }) => record.get('financialPrecision'),
      },
    },
    {
      name: 'taxId',
      label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
      type: 'object',
      lovCode: 'SMDM.TAX',
      textField: 'taxRate',
      lovPara: { enabledFlag: 1, tenantId },
      required: true,
      transformResponse: (value, object) => {
        return object?.taxId
          ? {
              taxId: object?.taxId,
              taxRate: object?.taxRate,
              taxCode: object?.taxCode,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.taxId;
      },
      dynamicProps: {
        disabled: (fieldProp) => {
          const { record } = fieldProp;
          return isNewLine(record)
            ? record.get('priceLibraryId')
              ? record.get('priceTaxId')
              : false
            : isDisabledFields(fieldProp, 'taxRate');
        },
      },
    },
    // {
    //   name: 'taxId',
    //   bind: 'taxLov.taxId',
    // },
    {
      name: 'taxRate',
      bind: 'taxId.taxRate',
    },
    {
      name: 'taxRateType',
      bind: 'taxId.taxRateType',
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('sodr.workspace.model.common.unitPriceBatch').d('每'),
      type: 'number',
      max: MAX_QUAN_NUMBER,
      dynamicProps: {
        disabled: (fieldProp) => {
          const { record, dataSet } = fieldProp;
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const { sourceBillTypeCode } = basicInfoDs?.current.get(['sourceBillTypeCode']) || {};
          return isNewLine(record)
            ? (record.get('priceLibraryId') && record.get('currencyCode')) ||
                (sourceBillTypeCode !== 'PURCHASE_ORDER' &&
                  record.getPristineValue('unitPriceBatch'))
            : isDisabledFields(fieldProp, 'unitPriceBatch');
        },
      },
    },
    {
      name: 'currencyCode',
      label: intl.get('sodr.workspace.model.common.currencyCode').d('币种'),
      required: true,
      type: 'object',
      lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
      transformResponse: (value, object) => {
        return object?.currencyCode
          ? {
              currencyCode: object?.currencyCode,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.currencyCode;
      },
      dynamicProps: {
        disabled: ({ record }) =>
          (record.get('priceLibraryId') && record.get('currencyCode')) ||
          record.getPristineValue('currencyCode'),
      },
    },
    {
      name: 'defaultPrecision',
      bind: 'currencyCode.defaultPrecision',
    },
    {
      name: 'referPrice',
      label: intl.get('sodr.workspace.model.common.referPrice').d('参考价格'),
    },
    {
      name: 'promiseDeliveryDate',
      label: intl.get('sodr.workspace.model.common.promiseDeliveryDate').d('承诺交货日期'),
      type: 'date',
    },
    {
      name: 'categoryId',
      label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
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
      transformResponse: (value, object) => {
        return object?.categoryId
          ? {
              categoryId: object?.categoryId,
            }
          : null;
      },

      transformRequest: (value) => {
        return value?.categoryId;
      },

      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId,
            enabledFlag: 1,
            itemId: record.get('itemId'),
            businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
          };
        },
        disabled: (fieldProp) => {
          const { record, dataSet } = fieldProp;
          const basicInfoDs = dataSet.getState('basicInfoDs');
          const { sourceBillTypeCode } = basicInfoDs?.current.get(['sourceBillTypeCode']) || {};
          return isNewLine(record)
            ? sourceBillTypeCode !== 'PURCHASE_ORDER' &&
                record.getPristineValue('categoryId') &&
                record.get('categoryId')
            : isDisabledFields(fieldProp, 'categoryId');
        },
      },
    },
    // {
    //   name: 'categoryId',
    //   bind: 'categoryLov.categoryId',
    // },
    {
      name: 'categoryName',
      bind: 'categoryId.categoryName',
    },
    {
      name: 'invOrganizationId',
      label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
      type: 'object',
      lovCode: 'SPRM.INV_ORG',
      required: true,
      transformResponse: (value, object) =>
        object?.invOrganizationId
          ? {
              organizationName: object?.invOrganizationName,
              organizationId: object?.invOrganizationId,
            }
          : null,
      transformRequest: (value) => value?.organizationId,

      dynamicProps: {
        disabled: (fieldProp) => {
          const { record } = fieldProp;
          return isNewLine(record)
            ? record.getPristineValue('invOrganizationId')
            : isDisabledFields(fieldProp, 'invOrganizationId');
        },
        lovPara: ({ record, dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          const orgCurrent = organizationInfoDs?.current;
          return {
            enabledFlag: 1,
            tenantId,
            ouId: orgCurrent ? orgCurrent.get('ouId') : undefined,
            itemId: record.get('itemId'),
          };
        },
      },
    },
    // {
    //   name: 'invOrganizationId',
    //   bind: 'invOrganizationId.organizationId',
    // },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationId.organizationName',
    },
    {
      name: 'invInventoryId',
      label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
      type: 'object',
      lovCode: 'SODR.INVENTORY',
      transformResponse: (value) => value && { inventoryId: value },
      transformRequest: (value) => value?.inventoryId,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            enabledFlag: 1,
            tenantId,
            organizationId: record.get('invOrganizationId')?.organizationId,
          };
        },
        disabled: (fieldProp) => {
          const { record } = fieldProp;
          return (
            !record.get('invOrganizationId')?.organizationId ||
            (isNewLine(record)
              ? record.getPristineValue('invInventoryId')
              : isDisabledFields(fieldProp, 'invInventoryId'))
          );
        },
      },
    },
    // {
    //   name: 'invInventoryId',
    //   bind: 'inventoryLov.inventoryId',
    // },
    {
      name: 'inventoryName',
      bind: 'invInventoryId.inventoryName',
    },
    {
      name: 'invLocationId',
      label: intl.get('sodr.workspace.model.common.invLocationId').d('收货库位'),
      type: 'object',
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
      transformResponse: (value, object) =>
        value && {
          locationId: object?.invLocationId,
        },
      transformRequest: (value) => value?.locationId,
      dynamicProps: {
        disabled: (fieldProp) => {
          const { record } = fieldProp;
          return (
            !record.get('invInventoryId')?.inventoryId ||
            !record.get('invOrganizationId')?.organizationId ||
            (isNewLine(record)
              ? record.getPristineValue('invLocationId')
              : isDisabledFields(fieldProp, 'invLocationId'))
          );
        },
        lovPara: ({ record }) => ({
          enabledFlag: 1,
          inventoryId: record.get('invInventoryId')?.inventoryId,
          tenantId,
        }),
      },
    },
    {
      name: 'locationName',
      bind: 'invLocationId.locationName',
    },
    {
      name: 'shipToThirdPartyAddress',
      label: intl.get('sodr.workspace.model.common.receivingAddress').d('收货地址'),
      maxLength: 120,
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record)
            ? false
            : isDisabledFields(fieldProp, 'shipToThirdPartyAddress'),
      },
    },
    {
      name: 'shipToThirdPartyContact',
      label: intl.get('sodr.workspace.model.common.shipToThirdPartyContact').d('联系人信息'),
      maxLength: 120,
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record)
            ? false
            : isDisabledFields(fieldProp, 'shipToThirdPartyContact'),
      },
    },
    {
      name: 'departmentName',
      label: intl.get('sodr.workspace.model.common.departmentId').d('部门'),
      type: 'object',
      lovCode: 'SPRM.USER_UNIT',
      valueField: 'unitName',
      lovPara: { tenantId },
      transformResponse: (value, object) => {
        return object?.departmentId
          ? {
              unitName: object?.departmentName,
              unitId: object?.departmentId,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.unitName;
      },
    },
    {
      name: 'departmentId',
      bind: 'departmentName.unitId',
    },
    {
      name: 'costId',
      label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
      type: 'object',
      lovCode: 'SPRM.COST_CENTER_ID',
      transformResponse: (value) => value && { costId: value },
      transformRequest: (value) => value?.costId,
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'costId'),
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          return {
            companyId: organizationInfoDs?.current.get('companyId'),
            tenantId,
            ouId: organizationInfoDs?.current.get('ouId'),
          };
        },
      },
    },
    // {
    //   name: 'costId',
    //   bind: 'costLov.costId',
    // },
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
      label: intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目'),
      type: 'object',
      lovCode: 'SPRM.ACCOUNT_SUBJECT',
      transformResponse: (value, object) => {
        return object?.accountSubjectId
          ? {
              accountSubjectId: object?.accountSubjectId,
            }
          : null;
      },
      transformRequest: (value) => {
        return value?.accountSubjectId;
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          return {
            tenantId,
            companyId: organizationInfoDs?.current.get('companyId'),
          };
        },
        disabled: (fieldProp) => {
          const organizationInfoDs = fieldProp.dataSet.getState('organizationInfoDs');
          return isNewLine(fieldProp.record)
            ? false
            : !organizationInfoDs?.current.get('companyId') ||
                isDisabledFields(fieldProp, 'accountSubjectId');
        },
      },
    },
    {
      name: 'accountSubjectNum',
      bind: 'accountSubjectId.accountSubjectNum',
    },
    // {
    //   name: 'accountSubjectId',
    //   bind: 'accountSubjectLov.accountSubjectId',
    // },
    {
      name: 'accountSubjectName',
      bind: 'accountSubjectId.accountSubjectName',
    },
    {
      name: 'wbsCode',
      label: intl.get('sodr.workspace.model.common.wbsCode').d('wbs元素'),
      type: 'object',
      lovCode: 'SPUC.WBS',
      transformResponse: (value, object) => {
        return object?.wbsCode
          ? {
              wbsCode: object?.wbsCode,
            }
          : null;
      },
      transformRequest: (value) => {
        return value ? value.wbsCode : '';
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          return {
            tenantId,
            companyId: organizationInfoDs?.current.get('companyId'),
            ouId: organizationInfoDs?.current.get('ouId'),
          };
        },
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'wbsCode'),
      },
    },
    {
      name: 'wbs',
      bind: 'wbsCode.wbsName',
      transformRequest: (value) => value || '',
    },
    {
      name: 'internationalTelCode',
      label: intl.get('sodr.workspace.model.common.internationalTelCode').d('区号'),
      lookupCode: 'HPFM.IDD',
      transformResponse: (value, object) => (object?.receiveTelNum ? value : value || '+86'),
      transformRequest: (value) => value || '',
    },
    {
      name: 'receiveTelNum',
      type: 'tel',
      regionField: 'internationalTelCode',
      label: intl.get('sodr.workspace.model.common.receiveTelNum').d('联系电话'),
      transformRequest: (value) => value || '',
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'receiveTelNum'),
        pattern: ({ record }) =>
          record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'projectCategory',
      label: intl.get('sodr.workspace.model.common.projectCategory').d('项目类别'),
      type: 'object',
      lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
      transformResponse: (value, object) =>
        value
          ? {
              value,
              meaning: object.projectCategoryMeaning,
            }
          : null,
      transformRequest: (value) => value?.value,
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record)
            ? false
            : isDisabledFields(fieldProp, 'projectCategory') ||
              fieldProp.record.get('bomModifiedFlag') !== 1,
      },
    },
    {
      name: 'projectCategoryMeaning',
      bind: 'projectCategory.meaning',
    },
    {
      name: 'bom',
      label: intl.get('sodr.workspace.model.common.bom').d('外协BOM'),
    },
    {
      name: 'remark',
      label: intl.get('sodr.workspace.model.common.remark').d('备注'),
      computedProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'remark'),
      },
      transformRequest: (value) => value || '',
    },
    {
      name: 'attachmentUuid',
      label: intl.get('sodr.workspace.model.common.lineAttachmentUuid').d('行附件'),
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: LINE_DIRECTORY,
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'lineAttachmentUuid'),
      },
    },
    // {
    //   name: 'lastPurchasePrice',
    //   label: intl.get('sodr.workspace.model.common.lastPurchasePrice').d('最近一次采购价'),
    //   type: 'number',
    // },
    {
      name: 'domesticUnitPrice',
      type: 'number',
      label: intl.get('sodr.workspace.model.common.domesticUnitPrices').d('本币单价(不含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs')?.current.get('domesticDefaultPrecision'),
      },
    },
    {
      name: 'domesticLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticLineAmounts').d('本币金额(不含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs')?.current.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'domesticTaxIncludedPrice',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.domesticTaxIncludedPrices').d('本币单价(含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs')?.current.get('domesticDefaultPrecision'),
      },
    },
    {
      name: 'domesticTaxIncludedLineAmount',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl
        .get('sodr.workspace.model.common.domesticTaxIncludedLineAmount')
        .d('本币金额(含税)'),
      dynamicProps: {
        precision: ({ dataSet }) =>
          dataSet.getState('basicInfoDs')?.current.get('domesticFinancialPrecision'),
      },
    },
    {
      name: 'exchangeRate',
      type: 'number',
      max: MAX_QUAN_NUMBER,
      label: intl.get('sodr.workspace.model.common.rate').d('汇率'),
    },
    {
      name: 'purchaseLineTypeId',
      label: intl.get(`sodr.workspace.model.common.purchaseLineTypes`).d('采购行类型'),
      lookupCode: 'SODR.PO_LINE_TYPE',
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
      transformResponse: (value) => value && { accountAssignTypeId: value },
      transformRequest: (value) => {
        return value?.accountAssignTypeId;
      },
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'accountAssignTypeId'),
      },
    },
    {
      name: 'accountAssignTypeCode',
      bind: 'accountAssignTypeId.accountAssignTypeCode',
    },
    {
      name: 'docFlow',
      label: intl.get(`sodr.workspace.model.common.docFlow`).d('单据流'),
    },
    {
      name: 'projectTaskId',
      label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
      type: 'object',
      lovCode: 'SIEC.PROJECT_TASK_TREE',
      lovPara: {
        tenantId,
      },
      transformResponse: (value, object) =>
        value && { taskId: value, taskName: object?.projectTaskName },
      transformRequest: (value) => value?.taskId,
      optionsProps: {
        idField: 'taskId',
        childrenField: 'children',
        parentIdField: 'parentTaskId',
        paging: 'server',
        record: {
          dynamicProps: {
            selectable: (record) => record.get('isCheck') !== false,
          },
        },
      },
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledList(fieldProp, 'projectTaskId'),
        lovPara: ({ record }) => {
          return {
            tenantId,
            enabledFlag: 1,
            itemId: record.get('itemId'),
            businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
          };
        },
      },
    },
    {
      name: 'specifications',
      label: intl.get('sodr.workspace.model.common.specifications').d('规格'),
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledList(fieldProp, 'specifications'),
      },
    },
    {
      name: 'model',
      label: intl.get('sodr.workspace.model.common.model').d('型号'),
      dynamicProps: {
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledList(fieldProp, 'model'),
      },
    },
    {
      label: intl.get(`sodr.common.model.common.subSupplierId`).d('分包供应商'),
      name: 'subSupplierId',
      type: 'object',
      lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
      transformRequest: (value) => value?.supplierCompanyId,
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
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const organizationInfoDs = dataSet.getState('organizationInfoDs');
          return {
            userId,
            tenantId,
            organizationId,
            companyId: organizationInfoDs?.current.get('companyId'),
          };
        },
        disabled: (fieldProp) =>
          isNewLine(fieldProp.record) ? false : isDisabledFields(fieldProp, 'subSupplierId'),
      },
    },
    {
      name: 'subSupplierCode',
      bind: 'subSupplierId.supplierCompanyNum',
    },
    {
      name: 'subSupplierName',
      bind: 'subSupplierId.supplierCompanyName',
    },
    {
      name: 'subErpSupplierId',
      bind: 'subSupplierId.supplierId',
    },
    {
      name: 'subErpSupplierCode',
      bind: 'subSupplierId.supplierNum',
    },
    {
      name: 'subErpSupplierName',
      bind: 'subSupplierId.supplierName',
    },
    {
      name: 'subSupplierTenantId',
      bind: 'subSupplierId.supplierTenantId',
    },
    {
      name: 'netReceivedQuantity',
      label: intl.get(`sodr.common.model.common.netReceivedQuantity`).d('净接收'),
    },
    {
      name: 'netDeliverQuantity',
      label: intl.get(`sodr.common.model.common.netDeliverQuantityPro`).d('净入库'),
    },
    {
      name: 'shippedQuantity',
      label: intl.get(`sodr.common.model.common.shippedQuantity`).d('已发货'),
    },
    {
      name: 'pcSubjectId',
      label: intl.get(`sodr.workspace.model.common.pcSubjectId`).d('关联采购协议'),
      lovCode: 'SPCM.SUBJECT_COMMON_PLUS',
      type: 'object',
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const itemId = record.get('itemId');
          const organizationInfoDs = dataSet.getState('organizationInfoDs') || {};
          const { supplierCompanyId, supplierId } = organizationInfoDs.current?.get([
            'supplierCompanyId',
            'supplierId',
          ]);
          return {
            supplierCompanyId,
            supplierId,
            itemId,
            organizationId,
          };
        },
      },
      // 后端因担心影响二开所以查询只会返回hold字段，所以前端给pcSubjectId、pcHeaderId赋值
      transformResponse: (_, { contractNum, holdPcLineId, holdPcHeaderId }) => ({
        pcNumAndDisplayLineNum: contractNum,
        pcSubjectId: holdPcLineId,
        pcHeaderId: holdPcHeaderId,
      }),
      transformRequest: (value) => value?.pcSubjectId,
    },
    {
      name: 'contractNum',
      bind: 'pcSubjectId.pcNumAndDisplayLineNum',
    },
    {
      name: 'pcHeaderId',
      bind: 'pcSubjectId.pcHeaderId',
    },
    {
      name: 'fundLineTermId',
      label: intl.get('sodr.workspace.model.common.termsId').d('付款条款'),
    },
  ],
  queryParameter: {
    poEntryPoint: 'PO_MAINTAIN_DETAIL',
    camp: 2,
    sortType: 0,
    customizeUnitCode:
      'SODR.WORKSPACE_CHANGE_DETAIL.DETAILINFO,SODR.WORKSPACE_CHANGE_DETAIL.SEARCH',
  },
  events: {
    load: async ({ dataSet }) => {
      const fieldMap = dataSet.getState('fieldMap');
      const fieldMapValues = dataSet.getState('fieldMapValues');
      const { invOrganizationId } = fieldMap || {};
      // 跨页批量编辑
      if (fieldMapValues) {
        let validateResult = true;
        const needValidateLines = dataSet
          .filter((i) => i.status === 'sync')
          .map((i) => i.toJSONData());
        if (invOrganizationId && !isEmpty(needValidateLines)) {
          let checkRes;
          const getValues = dataSet.getState('getValues');
          const { poHeaderDetailDTO } = getValues();
          const res = await checkInvOrganization({
            list: { poHeaderDetailDTO, poLineDetailDTOs: needValidateLines },
            invOrganizationId,
          });
          try {
            checkRes = getResponse(JSON.parse(res));
          } catch {
            checkRes = res;
          }
          if (checkRes !== 'SUCCESS') validateResult = false;
        }
        if (validateResult) {
          // 添加setTimeout处理特殊场景：个性化公式默认值翻页不生效
          setTimeout(() => {
            dataSet.forEach((i) => {
              if (i.status === 'sync') {
                fieldMapValues.forEach(([key, value]) => {
                  const field = i.getField(key);
                  const itemNameEdit = ['itemName'].includes(key) ? !i.get('itemId')?.itemId : true;
                  if (itemNameEdit && !field.disabled && !field.get('bind')) {
                    i.set({ [key]: value });
                  }
                });
              }
            });
          }, 0);
        }
      }
      dataSet.forEach((i) => {
        // 已取消 已关闭 不可勾选
        if (
          ['CANCELED', 'CLOSED', 'CLOSETOBECOMFIRMED', 'CANCELTOBECOMFIRMED'].includes(
            i.get('displayStatusCode')
          )
        ) {
          Object.assign(i, { selectable: false });
        }
        const basicInfoDs = dataSet.getState('basicInfoDs')?.current;
        const { domesticDefaultPrecision, domesticFinancialPrecision } = basicInfoDs?.get([
          'domesticDefaultPrecision',
          'domesticFinancialPrecision',
        ]);
        const {
          domesticDefaultPrecision: precision,
          domesticFinancialPrecision: financial,
        } = i.get(['domesticDefaultPrecision', 'domesticFinancialPrecision']);
        i.init({
          domesticDefaultPrecision: domesticDefaultPrecision || precision,
          domesticFinancialPrecision: domesticFinancialPrecision || financial,
        });
      });
      remote.event.fireEvent('detailInfoDsLoad', { dataSet });
    },
    update: ({ record, name, dataSet, value }) => {
      const { itemCode, priceSource } = record.get(['itemCode', 'priceSource']);
      const basicInfoDs = dataSet.getState('basicInfoDs');
      const loading = basicInfoDs?.getState('loading');
      const sodrEnabled = basicInfoDs?.getState('doubleUnitEnabled');
      const itemChangePriceFlag = basicInfoDs?.getState('itemChangePriceFlag');
      const basicCurrent = basicInfoDs?.current;
      const { benchmarkPriceType: headerBenchmarkPriceType, poSourcePlatform, sourceBillTypeCode } =
        basicCurrent?.get(['benchmarkPriceType', 'poSourcePlatform', 'sourceBillTypeCode']) || {};
      const handleIncludedPriceFcous = dataSet.getState('handleIncludedPriceFcous');
      const benchmarkPriceType = record.get('benchmarkPriceType') || headerBenchmarkPriceType;
      // 是否非协议价
      const notContractPrice = priceSource !== 'CONTRACT';
      const newLine = isNewLine(record);
      if (name === 'invOrganizationId') {
        record.set({ invInventoryId: null, invLocationId: null });
      }
      if (name === 'invInventoryId') {
        record.set({ invLocationId: null });
      }
      if (name === 'quantity' && !sodrEnabled) {
        record.set({ secondaryQuantity: value });
      }
      if (name === 'uomId' && !sodrEnabled) {
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
        if (sodrEnabled && itemCode) {
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
        if (sodrEnabled && itemCode) {
          conversionUpdate({ dataSet, record, loading, value });
        } else {
          record.set({ quantity: value });
        }
      }
      if (name === 'taxId') {
        const price = amountCalculationPro(benchmarkPriceType, record, value, dataSet);
        record.set(price);
      }
      if (name === 'itemCode') {
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
          secondaryUomCodeAndName,
          secondaryUomPrecision,
          taxId,
          taxCode,
          taxRate,
          receiveToleranceQuantity,
          receiveToleranceQuantityType,
          commonName,
          model,
          specifications,
          brand,
        } = value || {};
        // 原行清空物料无需执行关联操作
        if (newLine || value) {
          const uomObj = uomId
            ? {
                uomId,
                uomCode,
                uomName,
                uomPrecision,
                uomCodeAndName,
              }
            : null;
          const secondaryUomObj = secondaryUomId
            ? {
                uomId: secondaryUomId,
                uomCode: secondaryUomCode,
                uomName: secondaryUomName,
                uomPrecision: secondaryUomPrecision,
                uomCodeAndName: secondaryUomCodeAndName,
              }
            : uomObj;
          if (sodrEnabled) {
            record.set({ uomId: uomObj, secondaryUomId: secondaryUomObj });
            conversionUpdate({ dataSet, record, loading });
          } else {
            record.set({ secondaryUomId: uomObj, uomId: uomObj });
          }
          // 新增行
          if (newLine) {
            if (notContractPrice) record.set({ pcSubjectId: null });
            record.set({
              itemName,
              categoryId: categoryId ? { categoryId, categoryName } : undefined,
              // uomId: uomObj,
              taxId: taxId ? { taxId, taxCode, taxRate } : undefined,
              receiveToleranceQuantity,
              receiveToleranceQuantityType,
              commonName,
              model,
              specifications,
              brand,
              poItemBomList: null,
            });
            if (
              poSourcePlatform === 'SRM' &&
              ['PURCHASE_REQUEST', 'PURCHASE_ORDER'].includes(sourceBillTypeCode)
            ) {
              record.set({
                unitPrice: undefined,
                enteredTaxIncludedPrice: undefined,
                priceLibraryId: undefined,
              });
              if (
                record.status === 'add' &&
                itemChangePriceFlag === 1 &&
                !record.get('splitFromLineNum') &&
                handleIncludedPriceFcous &&
                typeof handleIncludedPriceFcous === 'function'
              ) {
                handleIncludedPriceFcous(record);
              }
            }
          } else {
            record.set({
              itemName,
              categoryId: categoryId ? { categoryId, categoryName } : undefined,
              model,
              specifications,
              poItemBomList: null,
            });
          }
        }
      }
      if (name === 'projectCategory') {
        record.set({ poItemBomList: null });
      }
      if (name === 'pcSubjectId') {
        if (notContractPrice) {
          const { pcSubjectId, pcHeaderId } = value || {};
          record.set({ holdPcLineId: pcSubjectId, holdPcHeaderId: pcHeaderId });
        }
      }
      if (remote) {
        remote.event.fireEvent('handleDetailInfoDsUpdate', {
          record,
          value,
          name,
          dataSet,
          basicInfoDs,
        });
      }
    },
    create: ({ dataSet, record }) => {
      const basicInfoDs = dataSet.getState('basicInfoDs');
      const { displayPoNum, sourceBillTypeCode } =
        basicInfoDs?.current.get(['displayPoNum', 'sourceBillTypeCode']) || {};
      const { preCallPriceLibBusinessKey, lineNum: originLineNum } = record.get([
        'preCallPriceLibBusinessKey',
        'lineNum',
      ]);
      const lineNum = getMaxPoLineNum(basicInfoDs, dataSet, record);
      if (sourceBillTypeCode === 'PURCHASE_ORDER') {
        if (!originLineNum) {
          record.init({
            displayLineNum: lineNum,
            lineNum,
          });
        }
        if (!preCallPriceLibBusinessKey) {
          record.init({
            preCallPriceLibBusinessKey: displayPoNum
              ? `${displayPoNum}-${originLineNum || lineNum}`
              : originLineNum || lineNum,
          });
        }
      } else if (lineNum) {
        record.init({
          displayLineNum: lineNum,
          lineNum,
        });
      }
      remote.event.fireEvent('detailInfoDsCreate', { basicInfoDs, dataSet, record });
    },
  },
});
/**
 * 批量编辑
 */
const batchMaintenance = () => {
  return {
    dataToJSON: 'normal',
    autoCreate: true,
    fields: [
      {
        name: 'invOrganizationId',
        label: intl.get('sodr.workspace.model.common.invOrganizationId').d('库存组织'),
        type: 'object',
        lovCode: 'SPRM.INV_ORG',
        // lovPara: { enabledFlag: 1, tenantId },
        transformResponse: (value, object) =>
          object?.invOrganizationId
            ? {
                organizationName: object?.invOrganizationName,
                organizationId: object?.invOrganizationId,
              }
            : null,
        transformRequest: (value) => value?.organizationId,
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'invOrganizationId'),
          lovPara: ({ dataSet }) => {
            const organizationInfoDs = dataSet.getState('organizationInfoDs');
            const currentRecord = organizationInfoDs?.records[0];
            return {
              enabledFlag: 1,
              tenantId,
              ouId: currentRecord?.get('ouId'),
              itemId: currentRecord?.get('itemId'),
            };
          },
        },
      },
      // {
      //   name: 'invOrganizationId',
      //   bind: 'invOrganizationLov.organizationId',
      // },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        name: 'needByDate',
        label: intl.get('sodr.workspace.model.common.needByDate').d('需求日期'),
        type: 'date',
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'needByDate'),
        },
      },
      {
        name: 'taxId',
        label: intl.get('sodr.workspace.model.common.taxId').d('税率'),
        type: 'object',
        lovCode: 'SMDM.TAX',
        lovPara: { enabledFlag: 1, tenantId },
        transformResponse: (value, object) => {
          return object?.taxId
            ? {
                taxId: object?.taxId,
              }
            : null;
        },

        transformRequest: (value) => {
          return value?.taxId;
        },
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'taxRate'),
        },
      },
      {
        name: 'taxRate',
        bind: 'taxId.taxRate',
      },
      {
        name: 'taxRateType',
        bind: 'taxId.taxRateType',
      },
      {
        name: 'costId',
        label: intl.get('sodr.workspace.model.common.costId').d('成本中心'),
        type: 'object',
        lovCode: 'SPRM.COST_CENTER_ID',
        transformResponse: (value) => value && { costId: value },
        transformRequest: (value) => value?.costId,
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'costId'),
          lovPara: ({ dataSet }) => {
            const para = { tenantId };
            const organizationInfoDs = dataSet.getState('organizationInfoDs');
            if (organizationInfoDs && organizationInfoDs.current) {
              const currentRecord = organizationInfoDs.current;
              para.companyId = currentRecord.get('companyId');
              para.ouId = currentRecord.get('ouId');
            }
            return para;
          },
        },
      },
      // {
      //   name: 'costId',
      //   bind: 'costLov.costId',
      // },
      {
        name: 'costCode',
        bind: 'costId.costCode',
      },
      {
        name: 'costName',
        bind: 'costId.costName',
      },
      {
        name: 'invInventoryId',
        label: intl.get('sodr.workspace.model.common.invInventoryId').d('收货库房'),
        type: 'object',
        lovCode: 'SODR.INVENTORY',
        transformResponse: (value) => value && { inventoryId: value },
        transformRequest: (value) => value?.inventoryId,
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'invInventoryId'),
          lovPara: ({ record }) => {
            return {
              enabledFlag: 1,
              tenantId,
              organizationId: record.get('invOrganizationId')?.organizationId,
            };
          },
        },
      },
      // {
      //   name: 'invInventoryId',
      //   bind: 'inventoryLov.inventoryId',
      // },
      {
        name: 'inventoryName',
        bind: 'invInventoryId.inventoryName',
      },
      {
        name: 'unitPrice',
        label: intl.get('sodr.workspace.model.common.unitPrices').d('单价(不含税)'),
        type: 'number',
        min: 0,
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'unitPrice'),
          precision: ({ dataSet }) => {
            const basicInfoDs = dataSet.getState('basicInfoDs');
            const currentRecord = basicInfoDs.records[0];
            const poSourcePlatform = currentRecord.get('poSourcePlatform');
            return poSourcePlatform === 'ERP'
              ? undefined
              : getPrecision(currentRecord.get('defaultPrecision'));
          },
        },
      },
      {
        name: 'enteredTaxIncludedPrice',
        label: intl.get('sodr.workspace.model.common.enteredTaxIncludedPrices').d('单价(含税)'),
        type: 'number',
        max: MAX_QUAN_NUMBER,
        min: 0,
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'enteredTaxIncludedPrice'),
          precision: ({ dataSet }) => {
            const basicInfoDs = dataSet.getState('basicInfoDs');
            const currentRecord = basicInfoDs.records[0];
            const poSourcePlatform = currentRecord.get('poSourcePlatform');
            return poSourcePlatform === 'ERP'
              ? undefined
              : getPrecision(currentRecord.get('defaultPrecision'));
          },
        },
      },
      {
        name: 'wbsCode',
        label: intl.get('sodr.workspace.model.common.wbsCode').d('wbs元素'),
        type: 'object',
        lovCode: 'SPUC.WBS',
        transformResponse: (value, object) => {
          return object?.wbsCode
            ? {
                wbsCode: object?.wbsCode,
                wbsName: object?.wbs,
              }
            : null;
        },
        transformRequest: (value) => {
          return value ? value.wbsCode : '';
        },
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'wbsCode'),
          lovPara: ({ dataSet }) => {
            const organizationInfoDs = dataSet.getState('organizationInfoDs');
            const orgRecord = organizationInfoDs?.current;
            return {
              tenantId,
              companyId: orgRecord?.get('companyId')?.companyId ?? orgRecord?.get('companyId'),
              ouId: orgRecord?.get('ouId')?.ouId ?? orgRecord?.get('ouId'),
            };
          },
        },
      },
      {
        name: 'wbs',
        bind: 'wbsCode.wbsName',
        transformRequest: (value) => value || '',
      },
      {
        name: 'purchaseLineTypeId',
        label: intl.get(`sodr.workspace.model.common.purchaseLineTypes`).d('采购行类型'),
        lookupCode: 'SODR.PO_LINE_TYPE',
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'purchaseLineTypeId'),
        },
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
        transformResponse: (value) => value && { accountAssignTypeId: value },
        transformRequest: (value) => {
          return value?.accountAssignTypeId;
        },
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'accountAssignTypeId'),
        },
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
        name: 'itemName',
        label: intl.get('sodr.workspace.model.common.itemName').d('物料名称'),
        // required: true,
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'itemName'),
        },
      },
      {
        name: 'categoryId',
        label: intl.get('sodr.workspace.model.common.categoryId').d('物料分类'),
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        // required: true,
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformResponse: (value, object) => {
          return object?.categoryId
            ? {
                categoryId: object?.categoryId,
              }
            : null;
        },

        transformRequest: (value) => {
          return value?.categoryId;
        },
        dynamicProps: {
          disabled: (fieldProp) => isDisabledList(fieldProp, 'categoryId'),
          lovPara: ({ record }) => {
            return {
              tenantId,
              enabledFlag: 1,
              itemId: record.get('itemId'),
              businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
            };
          },
        },
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
      },
      {
        name: 'accountSubjectId',
        label: intl.get('sodr.workspace.model.common.accountSubjectId').d('总账科目'),
        type: 'object',
        lovCode: 'SPRM.ACCOUNT_SUBJECT',
        transformResponse: (value, object) => {
          return object?.accountSubjectId
            ? {
                accountSubjectId: object?.accountSubjectId,
              }
            : null;
        },
        transformRequest: (value) => {
          return value?.accountSubjectId;
        },
        dynamicProps: {
          lovPara: ({ dataSet }) => {
            const organizationInfoDs = dataSet.getState('organizationInfoDs');
            return {
              tenantId,
              companyId: organizationInfoDs?.current.get('companyId'),
            };
          },
          disabled: (fieldProp) => {
            return isDisabledList(fieldProp, 'accountSubjectId');
          },
        },
      },
      {
        name: 'accountSubjectNum',
        bind: 'accountSubjectId.accountSubjectNum',
      },
      // {
      //   name: 'accountSubjectId',
      //   bind: 'accountSubjectLov.accountSubjectId',
      // },
      {
        name: 'accountSubjectName',
        bind: 'accountSubjectId.accountSubjectName',
      },
      {
        name: 'projectTaskId',
        label: intl.get(`sodr.workspace.model.common.projectTaskId`).d('项目任务名称'),
        type: 'object',
        lovCode: 'SIEC.PROJECT_TASK_TREE',
        lovPara: {
          tenantId,
        },
        transformResponse: (value, object) =>
          value && { taskId: value, taskName: object?.projectTaskName },
        transformRequest: (value) => value?.taskId,
        optionsProps: {
          idField: 'taskId',
          childrenField: 'children',
          parentIdField: 'parentTaskId',
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        dynamicProps: {
          disabled: (fieldProp) => {
            return isDisabledList(fieldProp, 'projectTaskId');
          },
          lovPara: ({ record }) => {
            return {
              tenantId,
              enabledFlag: 1,
              itemId: record.get('itemId'),
              businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
            };
          },
        },
      },
      {
        name: 'remark',
        label: intl.get('sodr.workspace.model.common.remark').d('备注'),
        maxLength: 480,
      },
    ],
  };
};

export { basicInfo, organizationInfo, detailInfo, batchMaintenance, isNewLine, isDisabledFields };
