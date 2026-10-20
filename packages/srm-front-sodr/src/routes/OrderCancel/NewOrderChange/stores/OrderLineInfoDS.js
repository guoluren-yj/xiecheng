import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getPrecision } from '@/routes/components/utils/index';
import {
  getCurrentOrganizationId,
  getResponse,
  getCurrentUserId,
  getUserOrganizationId,
} from 'utils/utils';
import {
  BUCKET_NAME,
  MAX_QUAN_NUMBER,
  LINE_DIRECTORY,
  PURCHASER_EXTERNAL_DIRECTORY,
  PURCHASER_INTERNAL_DIRECTORY,
} from '@/routes/components/utils/constant';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { batchMaintenance } from '@/routes/QuotePurchaseRequisition/utils';
import { conversionUpdate, getDynamicLabel } from '@/routes/components/utils';
import { saveAttachmentUUID } from '@/services/orderCancel';

const organizationId = getCurrentOrganizationId();
const userId = getCurrentUserId();
const tenantId = getUserOrganizationId();

const isDisabledFields = (record, item) => {
  const changeFields = record.dataSet.getState('changeFields') || [];
  const isDisabled = !changeFields.includes(item);
  if (item === 'subSupplierId') {
    return isDisabled && !changeFields.includes('subErpSupplierId');
  }
  return record.get('cancelledFlag') || record.get('closedFlag') || isDisabled;
};

const orderLineInfoDS = ({ orderHeaderInfoDs }) => {
  return {
    dataToJSON: 'all',
    autoQuery: false,
    cacheModified: true,
    cacheSelection: true,
    modifiedCheck: false,
    primaryKey: 'poLineLocationId',
    fields: [
      {
        label: intl.get(`sodr.common.model.common.translate`).d('拆分'),
        name: 'translate',
      },
      {
        label: intl.get(`sodr.common.model.common.displayAsnLineNum`).d('行号'),
        name: 'displayLineNum',
      },
      {
        label: intl.get(`sodr.common.model.common.displayLineLocationNum`).d('发运号'),
        name: 'displayLineLocationNum',
      },
      {
        label: intl.get(`entity.item.code`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`entity.item.name`).d('物料名称'),
        name: 'itemName',
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
        transformResponse(value) {
          return {
            categoryId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.categoryId === null || value.categoryId === undefined ? null : value.categoryId)
          );
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              itemId: record.get('itemId'),
              businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
            };
          },
          disabled({ record }) {
            return isDisabledFields(record, 'categoryId');
          },
        },
      },
      // {
      //   name: 'categoryId',
      //   bind: 'categoryId.categoryId',
      // },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
      },
      {
        label: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
        name: 'commonName',
      },
      {
        label: intl.get(`sodr.common.model.number`).d('数量'),
        name: 'secondaryQuantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        numberGrouping: true,
        dynamicProps: {
          required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
          precision({ record }) {
            return getPrecision(record.get('secondaryUomPrecision'), 'number');
          },
          disabled({ record }) {
            return isDisabledFields(record, 'secondaryQuantity');
          },
        },
      },
      {
        name: 'secondaryUomId',
        label: intl.get(`sodr.common.model.common.uomNames`).d('单位'),
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
          disabled: ({ record }) => {
            return isDisabledFields(record, 'secondaryUomId');
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
        required: true,
        type: 'number',
        max: MAX_QUAN_NUMBER,
        numberGrouping: true,
        dynamicProps: {
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
          precision({ record }) {
            return record.get('uomPrecision');
          },
          disabled({ record, dataSet }) {
            const flag = dataSet.getState('doubleUnitEnabled');
            return flag || isDisabledFields(record, 'quantity');
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
          disabled: ({ record, dataSet }) => {
            const flag = dataSet.getState('doubleUnitEnabled');
            return flag || isDisabledFields(record, 'uomId');
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
        label: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
        name: 'needByDate',
        type: 'date',
        required: true,
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'needByDate');
          },
          // 新版UI提交时会对disabled的逻辑校验，暂时去除
          // min() {
          //   return new Date();
          // },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxrate`).d('税率（%）'),
        name: 'taxId',
        type: 'object',
        lovCode: 'SMDM.TAX',
        required: true,
        lovPara: {
          enabledFlag: 1,
          tenantId: organizationId,
        },
        transformResponse(value) {
          return {
            taxId: value,
          };
        },
        transformRequest(value) {
          return value && (value.taxId === null || value.taxId === undefined ? null : value.taxId);
        },
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'taxRate');
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
        label: intl.get(`sodr.common.model.common.lastPurchasePrice`).d('最近一次采购价'),
        name: 'lastPurchasePrice',
        max: MAX_QUAN_NUMBER,
      },
      {
        label: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        name: 'unitPrice',
        required: true,
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'unitPrice');
          },
          precision({ record }) {
            return orderHeaderInfoDs?.current?.get('poSourcePlatform') === 'ERP'
              ? null
              : getPrecision(record.get('defaultPrecision'));
          },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
        name: 'enteredTaxIncludedPrice',
        required: true,
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'enteredTaxIncludedPrice');
          },
          precision({ record }) {
            return orderHeaderInfoDs?.current?.get('poSourcePlatform') === 'ERP'
              ? null
              : getPrecision(record.get('defaultPrecision'));
          },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
        name: 'unitPriceBatch',
        required: true,
        numberGrouping: true,
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          precision({ record }) {
            return getPrecision(record.get('uomPrecision'));
          },
          disabled({ record }) {
            return isDisabledFields(record, 'unitPriceBatch');
          },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.linePrice`).d('不含税行金额'),
        name: 'lineAmount',
        max: MAX_QUAN_NUMBER,
      },
      {
        label: intl.get(`sodr.common.model.common.taxIncludedLinePrice`).d('含税行金额'),
        name: 'taxIncludedLineAmount',
        max: MAX_QUAN_NUMBER,
      },
      {
        label: intl.get(`sodr.common.model.common.department`).d('部门'),
        name: 'departmentName',
      },
      {
        label: intl.get(`sodr.common.model.common.financialOrganization`).d('结算财务组织'),
        name: 'clearOrganizationName',
      },
      {
        label: intl.get(`sodr.common.model.common.payableOrganization`).d('应付组织'),
        name: 'copeOrganizationName',
      },
      {
        label: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPRM.INV_ORG',
        required: true,
        transformResponse(value) {
          return {
            organizationId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.organizationId === null || value.organizationId === undefined
              ? null
              : value.organizationId)
          );
        },
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'invOrganizationId');
          },
          lovPara: ({ record }) => {
            return {
              enabledFlag: 1,
              tenantId: organizationId,
              ouId: record.get('ouId'),
              itemId: record.get('itemId'),
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
        label: intl.get(`sodr.common.model.common.inventoryName`).d('收货库房'),
        name: 'invInventoryId',
        type: 'object',
        lovCode: 'SODR.INVENTORY',
        transformResponse(value) {
          return {
            inventoryId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.inventoryId === null || value.inventoryId === undefined
              ? null
              : value.inventoryId)
          );
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              enabledFlag: 1,
              tenantId: organizationId,
              organizationId: record.get('invOrganizationId')?.organizationId,
            };
          },
          disabled({ record }) {
            return (
              !record?.get('invOrganizationId')?.organizationId ||
              isDisabledFields(record, 'invOrganizationId')
            );
          },
        },
      },
      // {
      //   name: 'invInventoryId',
      //   bind: 'invInventoryLov.inventoryId',
      // },
      {
        name: 'inventoryName',
        bind: 'invInventoryId.inventoryName',
      },
      {
        label: intl.get(`sodr.common.model.common.locationName`).d('收货库位'),
        name: 'invLocationId',
        type: 'object',
        lovCode: 'SRPM.LOCATION_BY_ORG_INV',
        transformResponse(value) {
          return {
            locationId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.locationId === null || value.locationId === undefined ? null : value.locationId)
          );
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              enabledFlag: 1,
              tenantId: organizationId,
              inventoryId: record.get('invInventoryId')?.inventoryId,
            };
          },
          disabled({ record }) {
            return (
              !record?.get('invOrganizationId')?.organizationId ||
              !record?.get('invInventoryId')?.inventoryId ||
              isDisabledFields(record, 'invOrganizationId')
            );
          },
        },
      },
      // {
      //   name: 'invLocationId',
      //   bind: 'locationLov.locationId',
      // },
      {
        name: 'locationName',
        bind: 'invLocationId.locationName',
      },
      {
        label: intl.get(`sodr.common.view.message.title.bom`).d('外协BOM'),
        name: 'bom',
      },
      {
        label: intl.get(`sodr.common.model.common.shipToThirdPartyName`).d('送达方'),
        name: 'shipToThirdPartyName',
      },
      {
        label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
        name: 'shipToThirdPartyAddress',
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'shipToThirdPartyContact');
          },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.shipToThirdPartyContact`).d('联系人信息'),
        name: 'shipToThirdPartyContact',
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'shipToThirdPartyContact');
          },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.brand`).d('品牌'),
        name: 'brand',
      },
      {
        label: intl.get(`sodr.common.model.common.specifications`).d('规格'),
        name: 'specifications',
      },
      {
        label: intl.get(`sodr.common.model.common.model`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`sodr.common.model.common.chartCode`).d('图号'),
        name: 'chartCode',
      },
      {
        label: intl.get(`sodr.common.model.common.surfaceTreatFlag`).d('表面处理'),
        name: 'surfaceTreatFlag',
      },
      {
        label: intl.get(`sodr.common.model.common.pcNum`).d('协议编号'),
        name: 'pcNum',
      },
      {
        label: intl.get(`sodr.common.model.common.accountAssignment`).d('科目分配'),
        name: 'accountAssignment',
      },
      {
        label: intl.get(`sodr.common.model.common.displayPrNumOrLineNum`).d('采购申请号|行号'),
        name: 'displayPrNum',
      },
      {
        label: intl.get(`sodr.common.model.quotePurchase.number`).d('采购协议号|行号'),
        name: 'contractNum',
      },
      {
        label: intl.get(`sodr.common.model.common.sourceNumAndLine`).d('寻源单号|行号'),
        name: 'sourceNumAndLine',
      },
      {
        label: intl.get(`sodr.common.model.common.requestBy`).d('申请人'),
        name: 'prRequestedName',
      },
      {
        label: intl.get(`sodr.orderType.model.orderType.accountAssignTypeName`).d('账户分配类别'),
        name: 'accountAssignTypeId',
        type: 'object',
        lovCode: 'SPRM.ACCOUNT_ASSIGN_TYPE',
        lovPara: {
          lineType: 'PO_LINE',
          tenantId: organizationId,
        },
        transformResponse(value) {
          return {
            accountAssignTypeId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.accountAssignTypeId === null || value.accountAssignTypeId === undefined
              ? null
              : value.accountAssignTypeId)
          );
        },
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'accountAssignTypeId');
          },
        },
      },
      // {
      //   name: 'accountAssignTypeId',
      //   bind: 'accountAssignTypeLov.accountAssignTypeId',
      // },
      {
        name: 'accountAssignTypeCode',
        bind: 'accountAssignTypeId.accountAssignTypeCode',
      },
      {
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        name: 'projectCategory',
        type: 'object',
        lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
        transformResponse: (value) =>
          value && {
            value,
          },
        transformRequest: (value) => value?.value,
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'projectCategory');
          },
        },
      },
      {
        name: 'projectCategoryMeaning',
        bind: 'projectCategory.meaning',
      },
      {
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        name: 'costId',
        type: 'object',
        lovCode: 'SPRM.COST_CENTER',
        transformResponse(value) {
          return {
            costId: value,
          };
        },
        transformRequest(value) {
          return (
            value && (value.costId === null || value.costId === undefined ? null : value.costId)
          );
        },
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'costId');
          },
          lovPara() {
            return {
              ouId: orderHeaderInfoDs?.current?.get('ouId'),
              companyId: orderHeaderInfoDs?.current?.get('companyId'),
              tenantId: organizationId,
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
        ignore: 'always',
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        name: 'accountSubjectId',
        type: 'object',
        lovCode: 'SPRM.ACCOUNT_SUBJECT',
        transformResponse(value) {
          return {
            accountSubjectId: value,
          };
        },
        transformRequest(value) {
          return (
            value &&
            (value.accountSubjectId === null || value.accountSubjectId === undefined
              ? null
              : value.accountSubjectId)
          );
        },
        dynamicProps: {
          disabled({ record }) {
            return (
              !orderHeaderInfoDs?.current?.get('companyId') &&
              isDisabledFields(record, 'accountSubjectId')
            );
          },
          lovPara() {
            return {
              companyId: orderHeaderInfoDs?.current?.get('companyId'),
              tenantId: organizationId,
            };
          },
        },
      },
      // {
      //   name: 'accountSubjectId',
      //   bind: 'accountSubjectLov.accountSubjectId',
      // },
      {
        name: 'accountSubjectNum',
        bind: 'accountSubjectId.accountSubjectNum',
      },
      {
        name: 'accountSubjectName',
        bind: 'accountSubjectId.accountSubjectName',
        ignore: 'always',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbsCode',
        type: 'object',
        lovCode: 'SMDM.WBS',
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
        // transformRequest(value) {
        //   return (
        //     value && (value.wbsCode === null || value.wbsCode === undefined ? null : value.wbsCode)
        //   );
        // },
        dynamicProps: {
          lovPara() {
            return {
              ouId: orderHeaderInfoDs?.current?.get('ouId'),
              companyId: orderHeaderInfoDs?.current?.get('companyId'),
              tenantId: organizationId,
            };
          },
        },
      },
      // {
      //   name: 'wbsCode',
      //   bind: 'wbsCodeLov.wbsCode',
      // },
      {
        name: 'wbs',
        bind: 'wbsCode.wbsName',
        transformRequest: (value) => value || '',
      },
      {
        label: intl.get(`sodr.receivedOrder.model.common.wbs.isFreeFlag`).d('是否免费'),
        name: 'freeFlag',
        lookupCode: 'HPFM.FLAG',
      },
      {
        label: intl.get(`hzero.common.remark`).d('备注'),
        name: 'remark',
        transformRequest: (value) => value || '',
      },
      {
        label: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
        name: 'budgetAccountId',
      },
      {
        name: 'purchaseLineTypeId',
        label: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
        lookupCode: ' SODR.PO_LINE_TYPE ',
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
          disabled: ({ record }) => isDisabledFields(record, 'receiveTelNum'),
          pattern: ({ record }) =>
            record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
        },
      },
      {
        label: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
        name: 'attachmentUuid',
        type: 'attachment',
        bucketName: BUCKET_NAME,
        bucketDirectory: LINE_DIRECTORY,
        dynamicProps: {
          disabled({ record }) {
            return isDisabledFields(record, 'lineAttachmentUuid');
          },
        },
      },
      {
        label: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
        name: 'domesticTaxIncludedPrice',
        max: MAX_QUAN_NUMBER,
      },
      {
        label: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
        name: 'domesticUnitPrice',
        max: MAX_QUAN_NUMBER,
      },
      {
        label: intl.get(`sodr.common.model.common.domesticTaxIncludedLineAmount`).d('本币含税金额'),
        name: 'domesticTaxIncludedLineAmount',
      },
      {
        label: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
        name: 'domesticLineAmount',
        max: MAX_QUAN_NUMBER,
      },
      {
        name: 'docFlow',
        label: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
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
          lovPara: () => {
            return {
              userId,
              tenantId,
              organizationId,
              companyId: orderHeaderInfoDs?.current?.get('companyId'),
            };
          },
          disabled: ({ record }) => isDisabledFields(record, 'subSupplierId'),
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
    ],
    transport: {
      read: ({ data, params }) => {
        const { poHeaderId, ...others } = data;
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/change-detail`,
          method: 'GET',
          data: {
            customizeUnitCode: 'SODR.ORDER_CANCEL_CHANGE.LIST',
            ...others,
          },
          params,
        };
      },
    },
    events: {
      // load: ({ dataSet }) => {
      //   dataSet.forEach((i) => Object.assign(i, { selectable: false }));
      // },
      update: ({ record, name, dataSet, value }) => {
        const { itemCode, secondaryReceiptsOrderQuantity } = record.get([
          'itemCode',
          'secondaryReceiptsOrderQuantity',
        ]);
        const loading = dataSet.getState('loading');
        const sodrEnabled = Boolean(dataSet.getState('doubleUnitEnabled'));
        if (['invOrganizationId', 'invInventoryId'].includes(name)) {
          if (name === 'invOrganizationId') {
            if (record?.get('invInventoryId')) {
              record.set('invInventoryId', null);
            }
            if (record?.get('invLocationId')) {
              record.set('invLocationId', null);
            }
          } else if (record.get('invLocationId')) {
            record.set('invLocationId', null);
          }
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
            conversionUpdate({ dataSet, record, loading, source: 'order-change' });
          } else {
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
          if (sodrEnabled && itemCode && value !== secondaryReceiptsOrderQuantity) {
            conversionUpdate({ dataSet, record, loading, value });
          } else {
            record.set({ quantity: value });
          }
        }
      },
    },
  };
};

const searchDS = () => ({
  paging: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`entity.item.name`).d('物料名称'),
      name: 'itemName',
    },
  ],
});

const BOMTableDS = () => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      label: intl.get('sodr.sendOrder.model.common.serialNum').d('序号'),
      name: 'orderSeq',
    },
    {
      label: intl.get(`entity.item.code`).d('物料编码'),
      name: 'itemCode',
    },
    {
      label: intl.get(`entity.item.name`).d('物料名称'),
      name: 'itemName',
    },
    {
      label: intl.get(`entity.item.type`).d('物料类型'),
      name: 'categoryName',
    },
    {
      label: intl.get(`sodr.common.model.common.needQuantity`).d('需求数量'),
      name: 'quantity',
      max: MAX_QUAN_NUMBER,
    },
    {
      label: intl.get(`sodr.sendOrder.model.common.uomName`).d('单位'),
      name: 'uomName',
    },
    {
      label: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
      name: 'invOrganizationName',
    },
    {
      label: intl.get(`sodr.common.model.common.needByDate`).d('需求日期'),
      name: 'needByDate',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-item-boms`,
        method: 'GET',
        data: {
          ...data,
          customizeUnitCode: 'SODR.SEND_ORDER_DETAIL.BOM_MODAL',
        },
      };
    },
  },
});

const batchEditDS = ({ companyId, ouId }) => ({
  autoCreate: true,
  fields: [
    {
      name: 'selectOptionKey',
      type: 'string',
      defaultValue: 'needByDate',
    },
    {
      name: 'taxId',
      type: 'object',
      lovCode: 'SMDM.TAX',
      lovPara: {
        enabledFlag: 1,
        tenantId: organizationId,
      },
      transformResponse(value) {
        return {
          taxId: value,
        };
      },
      transformRequest(value) {
        return value && (value.taxId === null || value.taxId === undefined ? null : value.taxId);
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
      name: 'invInventoryId',
      type: 'object',
      lovCode: 'SODR.INVENTORY',
      transformResponse(value) {
        return {
          inventoryId: value,
        };
      },
      transformRequest(value) {
        return (
          value &&
          (value.inventoryId === null || value.inventoryId === undefined ? null : value.inventoryId)
        );
      },
    },
    // {
    //   name: 'invInventoryId',
    //   bind: 'invInventoryLov.inventoryId',
    // },
    {
      name: 'inventoryName',
      bind: 'invInventoryId.inventoryName',
    },
    {
      name: 'costId',
      type: 'object',
      lovCode: 'SPRM.COST_CENTER',
      transformResponse(value) {
        return {
          costId: value,
        };
      },
      transformRequest(value) {
        return value && (value.costId === null || value.costId === undefined ? null : value.costId);
      },
      lovPara: {
        companyId,
        tenantId: organizationId,
        ouId,
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
      name: 'needByDate',
      type: 'date',
    },
    {
      name: 'lineRemark',
    },
    {
      name: 'invOrganizationId',
      type: 'object',
      lovCode: 'SPRM.INV_ORG',
      lovPara: {
        enabledFlag: 1,
        tenantId: organizationId,
        ouId,
      },
      transformResponse(value) {
        return {
          organizationId: value,
        };
      },
      transformRequest(value) {
        return (
          value &&
          (value.organizationId === null || value.organizationId === undefined
            ? null
            : value.organizationId)
        );
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
      name: 'unitPrice',
      max: MAX_QUAN_NUMBER,
      computedProps: {
        precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
      },
    },
    {
      name: 'enteredTaxIncludedPrice',
      max: MAX_QUAN_NUMBER,
      computedProps: {
        precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
      },
    },
  ],
});

const orderHeaderInfoDS = ({ changeFields }) => ({
  autoQuery: false,
  fields: [
    {
      label: intl.get(`sodr.common.model.common.poTypeCode`).d('订单类型'),
      name: 'poTypeDesc',
    },
    {
      label: intl.get(`sodr.common.model.common.poNum`).d('订单号'),
      name: 'displayPoNum',
    },
    {
      label: intl.get(`sodr.common.model.common.createTime`).d('创建时间'),
      name: 'creationDate',
    },
    {
      label: intl.get(`entity.company.tag`).d('公司'),
      name: 'companyName',
    },
    {
      label: intl.get(`entity.organization.class.ouFlag`).d('业务实体'),
      name: 'ouName',
    },
    {
      label: intl.get(`entity.supplier.tag`).d('供应商'),
      name: 'supplierName',
    },
    {
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      name: 'purchaseOrgName',
    },
    {
      label: intl.get(`entity.purchaser.tag`).d('采购员'),
      name: 'agentName',
    },
    {
      label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
      name: 'currencyCode',
    },
    {
      label: intl.get(`sodr.common.model.common.totalAmountIncludingTax`).d('含税总金额'),
      name: 'taxIncludeAmount',
      max: MAX_QUAN_NUMBER,
    },
    {
      label: intl.get(`sodr.common.model.common.totalAmountExcludingTax`).d('不含税总金额'),
      name: 'amount',
    },
    {
      name: 'termsId',
      label: intl.get(`sodr.common.model.common.termsName`).d('付款条款'),
      type: 'object',
      lovCode: 'SMDM.PAYMENT.TERM',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
          };
        },
        disabled() {
          return !changeFields.includes('termsId');
        },
      },
      transformResponse: (value) => value && { termId: value },
      transformRequest: (value) => value?.termId,
    },
    {
      name: 'termsName',
      bind: 'termsId.termName',
    },
    {
      label: intl.get(`sodr.common.model.common.totalQuantity`).d('总数量'),
      name: 'quantityTotal',
    },
    {
      label: intl.get(`sodr.common.model.common.sourcePlatform`).d('来源平台'),
      name: 'poSourcePlatform',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.originalPoNum`).d('原订单号'),
      name: 'originalPoNum',
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.domesticCurrencyCode`).d('本币币种'),
      name: 'domesticCurrencyCode',
    },
    {
      label: intl
        .get(`sodr.quotePurchase.model.quotePurchase.domesticTaxIncludeAmount`)
        .d('本币含税金额'),
      name: 'domesticTaxIncludeAmount',
      max: MAX_QUAN_NUMBER,
    },
    {
      label: intl.get(`sodr.quotePurchase.model.quotePurchase.domesticAmount`).d('本币不含税金额'),
      name: 'domesticAmount',
    },
    {
      label: intl
        .get(`sodr.quotePurchase.model.quotePurchase.supplierOrderTypeCode`)
        .d('京东e卡-code'),
      name: 'supplierOrderTypeCode',
    },
    {
      label: intl.get(`sodr.common.model.common.orderRemark`).d('订单摘要'),
      name: 'remark',
      maxLength: 480,
      dynamicProps: {
        disabled({ record }) {
          return (
            record?.get('cancelledFlag') ||
            record?.get('closedFlag') ||
            !changeFields.includes('headerRemark')
          );
        },
      },
      transformRequest: (value) => value || '',
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_EXTERNAL_DIRECTORY,
    },
    {
      name: 'purchaserInnerAttachmentUuid',
      type: 'attachment',
      bucketName: BUCKET_NAME,
      bucketDirectory: PURCHASER_INTERNAL_DIRECTORY,
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { poHeaderId } = data;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/po-header/${poHeaderId}/change-detail`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SODR.ORDER_CANCEL_CHANGE.HEADER',
        },
        params,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      const lineInfoDs = dataSet.getState('orderLineInfoDs');
      lineInfoDs.setState({
        fieldMap: undefined,
        fieldMapValues: undefined,
        batchRecordKeys: undefined,
      });
      lineInfoDs.unSelectAll();
      lineInfoDs.clearCachedRecords();
    },
    update: ({ record, name, value }) => {
      if (value && ['purchaserInnerAttachmentUuid', 'attachmentUuid'].includes(name)) {
        const uuidType = name === 'attachmentUuid' ? 1 : 3;
        if (record.get('poHeaderId') && value) {
          saveAttachmentUUID({ poHeaderId: record.get('poHeaderId'), uuid: value, uuidType }).then(
            (res) => {
              if (getResponse(res)) {
                record.set({ objectVersionNumber: res });
              }
            }
          );
        }
      }
    },
  },
});

const operationRecordDS = ({ poHeaderId }) => ({
  autoQuery: false,
  selection: false,
  transport: {
    read: ({ params }) => ({
      url: `${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}`,
      method: 'get',
      params: {
        ...params,
        tenantId: organizationId,
      },
    }),
  },
  queryFields: [
    {
      name: 'versionNum',
      type: 'number',
      min: '1',
      max: '999999999',
      label: intl.get(`sodr.sendOrder.model.common.versionNum`).d('版本号'),
    },
    { name: 'processedDateStart', type: 'dateTime', bind: 'processedDate.start' },
    { name: 'processedDateEnd', type: 'dateTime', bind: 'processedDate.end' },
    {
      name: 'processedDate',
      type: 'dateTime',
      range: ['start', 'end'],
      ignore: 'always',
      label: intl.get(`sodr.sendOrder.model.common.operationTime`).d('操作时间'),
    },
  ],
  fields: [
    {
      name: 'processUserName',
      label: intl.get(`sodr.common.model.common.operatedByName`).d('操作人'),
    },
    {
      name: 'processedDate',
      type: 'dateTime',
      label: intl.get(`sodr.sendOrder.model.common.operationTime`).d('操作时间'),
    },
    {
      name: 'processTypeMeaning',
      label: intl.get(`sodr.sendOrder.model.common.action`).d('动作'),
    },
    {
      name: 'processRemark',
      label: intl.get(`sodr.common.model.common.operationReason`).d('说明'),
    },
    {
      name: 'versionNum',
      label: intl.get(`sodr.sendOrder.model.common.versionNum`).d('版本号'),
    },
    {
      name: 'changeTypeMeaning',
      label: intl.get(`sodr.sendOrder.model.common.changeAction`).d('变更动作'),
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sodr.sendOrder.model.common.lineNum`).d('行号'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get(`sodr.sendOrder.model.common.shipmentNum`).d('发运号'),
    },
    {
      name: 'changeFieldNameMeaning',
      label: intl.get(`sodr.sendOrder.model.common.changeContent`).d('修改内容'),
    },
    {
      name: 'oldValue',
      label: intl.get(`sodr.sendOrder.model.common.beforeModification`).d('修改前'),
      // dynamicProps: {
      //   type({ record }) {
      //     if (
      //       [
      //         'unit_price',
      //         'entered_tax_included_price',
      //         'unit_price_batch',
      //         'line_amount',
      //         'tax_included_line_amount',
      //       ].includes(record.get('changeFieldName'))
      //     ) {
      //       return 'currency';
      //     }
      //     return 'auto';
      //   },
      // },
    },
    {
      name: 'newValue',
      label: intl.get(`sodr.sendOrder.model.common.afterModification`).d('修改后'),
      // dynamicProps: {
      //   type({ record }) {
      //     if (
      //       [
      //         'unit_price',
      //         'entered_tax_included_price',
      //         'unit_price_batch',
      //         'line_amount',
      //         'tax_included_line_amount',
      //       ].includes(record.get('changeFieldName'))
      //     ) {
      //       return 'currency';
      //     }
      //     return 'auto';
      //   },
      // },
    },
  ],
});

export {
  orderLineInfoDS,
  searchDS,
  BOMTableDS,
  batchEditDS,
  orderHeaderInfoDS,
  operationRecordDS,
  batchMaintenance,
  isDisabledFields,
};
