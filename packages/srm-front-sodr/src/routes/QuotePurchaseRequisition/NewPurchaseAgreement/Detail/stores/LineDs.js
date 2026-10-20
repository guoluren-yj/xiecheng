import { observable, runInAction } from 'mobx';
import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import {
  c7nAmountFormatterOptions,
  getPrecision,
  getDynamicLabel,
  conversionUpdate,
} from '@/routes/components/utils';
import { getLineAttachmentUuid } from '@/services/quotePurchaseRequisitionService';
// import { crosspageBatch } from '@/routes/QuotePurchaseRequisition/utils';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';

export default ({
  internationalTelCodeDs,
  // excessOrderTypeDs,
  tenantId,
  organizationId,
  userId,
}) => {
  const responseData = observable.map();
  return {
    dataToJSON: 'all',
    modifiedCheck: false,
    cacheModified: true,
    cacheSelection: true,
    primaryKey: 'poLineLocationId',
    transport: {
      read: ({ params, data, dataSet }) => ({
        url: data.poHeaderId
          ? `${SRM_SPUC}/v1/${tenantId}/po-line/${data.poHeaderId}/detail`
          : undefined,
        method: 'GET',
        params: {
          ...params,
          camp: 2,
          sortType: 0,
          poEntryPoint: 'PO_MAINTAIN_DETAIL',
          customizeUnitCode: 'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
        },
        data: null,
        transformResponse(res) {
          const response = JSON.parse(res);
          dataSet.setState('response', response);
          if (response && !response.failed) {
            const { content } = response;
            // 个性化的默认值逻辑导致无法通过 record.getPristineValue 来判断原始值是否有值， 临时使用此方式
            runInAction(() => {
              responseData.clear();
              content.forEach((item) => {
                responseData.set(item.poLineId, item);
              });
            });
          }
          return response;
        },
      }),
      destroy: ({ data }) => {
        return {
          url: `${SRM_SPUC}/v1/${tenantId}/po-header/delete`,
          method: 'DELETE',
          data: data.map((item) => ({
            ...item,
            versionNum: item.locationVersionNumber,
            canCreateAsnFlag: 0,
            tenantId,
          })),
        };
      },
    },
    fields: [
      {
        name: 'benchmarkPriceType',
        transformRequest: (value, record) => {
          const headerDs = record.dataSet.getState('headerDs')?.current;
          const benchmarkPriceType = value ?? headerDs.get('benchmarkPriceType');
          return benchmarkPriceType;
        },
      },
      { name: 'translate', label: intl.get(`sodr.common.model.common.translate`).d('拆分') },
      {
        name: 'displayLineNum',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.displayLineNum`).d('行号'),
      },
      {
        name: 'displayLineLocationNum',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.displayNum`).d('发运号'),
      },
      {
        name: 'invOrganizationId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.organizationName`).d('收货组织'),
        required: true,
        lovCode: 'SPUC.SMDM.INV_ORG',
        transformResponse: (value) => value && { organizationId: value },
        transformRequest: (value) => value?.organizationId,
        dynamicProps: {
          lovPara: ({
            record,
            dataSet: {
              parent: { current },
            },
          }) => ({
            enabledFlag: 1,
            tenantId,
            ouId: current.get('ouId.ouId'),
            itemId: record.get('itemId.itemId'),
          }),
          disabled: ({ record }) => !!responseData.get(record.key)?.invOrganizationId,
        },
      },
      { name: 'invOrganizationName', bind: 'invOrganizationId.organizationName' },
      {
        name: 'itemId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.itemCode`).d('物料编码'),
        required: true,
        lovCode: 'SPUC.ITEM_PRICE_LIBRARY',
        valueField: 'itemId',
        textField: 'itemCode',
        transformResponse: (value) => value && { itemId: value },
        transformRequest: (value) => value?.itemId,
        dynamicProps: {
          lovPara: ({
            record,
            dataSet: {
              parent: { current },
            },
          }) => {
            const { ouId, ouCode } = current.get('ouId') || {};
            return {
              organizationId,
              tenantId,
              supplierCompanyId: current.get('supplierCompanyId'),
              priceShieldFlag:
                record.get('returnedFlag') !== 1 ? current.get('tieredPricingFlag') : null,
              companyId: current.get('companyId'),
              companyCode: current.get('companyCode'),
              ouId,
              ouCode,
              orderTypeCode: current.get('poTypeCode'),
              invOrganizationId: record.get('invOrganizationId.organizationId'),
            };
          },
          disabled: ({ record }) => !!responseData.get(record.key)?.itemId,
        },
      },
      { name: 'itemCode', bind: 'itemId.itemCode' },
      {
        name: 'itemName',
        bind: 'itemId.itemName',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.itemName`).d('物料名称'),
      },
      {
        name: 'categoryId',
        type: 'object',
        label: intl.get(`sodr.common.model.common.categoryName`).d('物料分类'),
        required: true,
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        valueField: 'categoryId',
        textField: 'categoryName',
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        transformResponse: (value) => value && { categoryId: value },
        transformRequest: (value) => value?.categoryId,
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId,
            enabledFlag: 1,
            itemId: record.get('itemId.itemId'),
            businessObjectCode: 'SRM_C_SRM_SODR_PO_HEADER',
          }),
          disabled: ({ record }) =>
            !!responseData.get(record.key)?.categoryId && !!responseData.get(record.key)?.itemId,
        },
      },
      { name: 'categoryName', bind: 'categoryId.categoryName' },
      {
        name: 'skuType',
        label: intl.get(`sprm.purchaseReqCreation.model.common.skuTypeMark`).d('定制品标识'),
      },
      {
        name: 'customUomName',
        label: intl.get(`sprm.purchaseReqCreation.model.common.customUomName`).d('定制单位'),
      },
      {
        name: 'customQuantity',
        type: 'number',
        label: intl.get(`sprm.purchaseReqCreation.model.common.customQuantity`).d('定制数量'),
      },
      {
        name: 'packageQuantity',
        type: 'number',
        label: intl.get(`sprm.purchaseReqCreation.model.common.packageQuantity`).d('份数'),
      },
      {
        name: 'customSpecsJson',
        label: intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性'),
      },
      {
        name: 'customSpecs',
        label: intl.get(`sprm.purchaseReqCreation.model.common.customSpecs`).d('定制品属性'),
      },
      {
        name: 'commonName',
        label: intl.get(`sodr.common.model.common.commonName`).d('通用名'),
      },
      {
        name: 'secondaryQuantity',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.quantity`).d('数量'),
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
          precision: ({ record }) => getPrecision(record.get('secondaryUomPrecision')),
        },
      },
      {
        name: 'secondaryUomId',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.uomName`).d('单位'),
        type: 'object',
        lovCode: 'SMDM_ITEM_ORG_UOM',
        dynamicProps: {
          lovPara: ({ record }) => ({
            itemId: record.get('itemId')?.itemId,
            primaryUomId: record.get('uomId')?.uomId,
          }),
          disabled: ({ record, dataSet }) => {
            const secondaryUomId = !!responseData.get(record.key)?.secondaryUomId;
            const flag = dataSet.getState('doubleUnitEnabled') === 2 ? false : secondaryUomId;
            return flag;
          },
        },
        transformResponse: (value, object) =>
          value && {
            uomId: object?.secondaryUomId,
            uomCode: object?.secondaryUomCode,
            uomName: object?.secondaryUomName,
            uomPrecision: object?.secondaryUomPrecision,
            uomCodeAndName: object?.secondaryUomCodeAndName,
          },
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
        name: 'secondaryUomPrecision',
        bind: 'secondaryUomId.secondaryUomPrecision',
      },
      {
        name: 'secondaryUomCodeAndName',
        bind: 'secondaryUomId.uomCodeAndName',
      },

      {
        name: 'quantity',
        required: true,
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          disabled: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
          precision: ({ record }) => getPrecision(record.get('uomPrecision')),
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        },
      },
      {
        name: 'uomId',
        label: intl.get(`sodr.common.view.message.basicUomName`).d('基本单位'),
        type: 'object',
        lovCode: 'SMDM.UOM',
        dynamicProps: {
          disabled: ({ record, dataSet }) =>
            dataSet.getState('doubleUnitEnabled') || !!responseData.get(record.key)?.uomId,
          label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
        },
        transformResponse: (value) => value && { uomId: value },
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
        name: 'uomCodeAndName',
        bind: 'uomId.uomCodeAndName',
      },
      {
        name: 'currencyCode',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.currencyCode`).d('币种'),
      },
      {
        name: 'ladderPrice',
        label: intl.get(`sodr.common.model.common.ladderPrice`).d('阶梯价格'),
      },
      {
        name: 'taxId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.taxRate`).d('税率（%）'),
        required: true,
        lovCode: 'SMDM.TAX',
        lovPara: { enabledFlag: 1, tenantId },
        transformResponse: (value) => value && { taxId: value },
        transformRequest: (value) => value?.taxId,
        dynamicProps: {
          disabled: ({ record }) => {
            const responseTaxId = !!responseData.get(record.key)?.taxId;
            const itemIdChanged = record.getState('itemIdChanged');
            const itemTaxId = record.getState('itemTaxId');
            return (!itemIdChanged && responseTaxId) || (itemIdChanged && itemTaxId);
          },
        },
      },
      { name: 'taxRate', bind: 'taxId.taxRate' },
      {
        name: 'unitPrice',
        type: 'number',
        // max: MAX_QUAN_NUMBER,
        required: true,
        label: intl.get(`sodr.common.model.common.unitPrice`).d('不含税单价'),
        dynamicProps: {
          precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
          max: ({ record, dataSet }) => {
            const basicCurrent = dataSet.getState('headerDs')?.current;
            const benchmarkPriceType =
              record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
            return benchmarkPriceType === 'NET_PRICE' &&
              basicCurrent.get('modifyablePriceFlag') === -1
              ? !math.isZero(record.get('originUnitPrice')) && record.get('originUnitPrice')
                ? record.get('originUnitPrice')
                : record.get('unitPrice')
              : MAX_QUAN_NUMBER;
          },
          disabled: ({ record, dataSet }) => {
            const basicCurrent = dataSet.getState('headerDs')?.current;
            const benchmarkPriceType =
              record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
            return (
              benchmarkPriceType !== 'NET_PRICE' ||
              (benchmarkPriceType === 'NET_PRICE' && basicCurrent.get('modifyablePriceFlag') === 0)
            );
          },
        },
      },
      {
        name: 'enteredTaxIncludedPrice',
        type: 'number',
        //  max: MAX_QUAN_NUMBER,
        required: true,
        label: intl.get(`sodr.common.model.common.taxedEnteredUnitPrice`).d('原币含税单价'),
        dynamicProps: {
          precision: ({ record }) => getPrecision(record.get('defaultPrecision')),
          max: ({ record, dataSet }) => {
            const basicCurrent = dataSet.getState('headerDs')?.current;
            const benchmarkPriceType =
              record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
            return benchmarkPriceType !== 'NET_PRICE' &&
              basicCurrent.get('modifyablePriceFlag') === -1
              ? !math.isZero(record.get('originUnitPrice')) && record.get('originUnitPrice')
                ? record.get('originUnitPrice')
                : record.get('enteredTaxIncludedPrice')
              : MAX_QUAN_NUMBER;
          },
          disabled: ({ record, dataSet }) => {
            const basicCurrent = dataSet.getState('headerDs')?.current;
            const benchmarkPriceType =
              record.get('benchmarkPriceType') || basicCurrent.get('benchmarkPriceType');
            return (
              benchmarkPriceType === 'NET_PRICE' ||
              (benchmarkPriceType === 'TAX_INCLUDED_PRICE' &&
                basicCurrent.get('modifyablePriceFlag') === 0)
            );
          },
        },
      },
      {
        name: 'unitPriceBatch',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.unitPriceBatch`).d('每'),
        dynamicProps: {
          disabled: ({ record }) => !isNil(responseData.get(record.key)?.unitPriceBatch),
        },
      },
      {
        name: 'invInventoryId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.invInventoryName`).d('收货库房'),
        lovCode: 'SODR.INVENTORY',
        transformResponse: (value) => value && { inventoryId: value },
        transformRequest: (value) => value?.inventoryId,
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('invInventoryId'),
          lovPara: ({ record }) => ({
            enabledFlag: 1,
            tenantId,
            invOrganizationId: record.get('invOrganizationId.organizationId'),
            organizationId: record.get('invOrganizationId.organizationId'),
          }),
          disabled: ({ record }) => !record.get('invOrganizationId.organizationId'),
        },
      },
      { name: 'inventoryName', bind: 'invInventoryId.inventoryName' },
      {
        name: 'invLocationName',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.locationName`).d('收货库位'),
        lovCode: 'SRPM.LOCATION_BY_ORG_INV',
        transformResponse: (value) => value && { locationName: value },
        transformRequest: (value) => value?.locationName,
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('invLocationId'),
          lovPara: ({ record }) => ({
            enabledFlag: 1,
            inventoryId: record.get('invInventoryId.inventoryId'),
            tenantId,
          }),
          disabled: ({ record }) =>
            !record.get('invInventoryId.inventoryId') ||
            !record.get('invOrganizationId.organizationId'),
        },
      },
      { name: 'invLocationId', bind: 'invLocationName.locationId' },
      { name: 'locationName', bind: 'invLocationName.locationName' },
      {
        name: 'needByDate',
        type: 'date',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.needByDate`).d('需求日期'),
        required: true,
      },
      {
        name: 'shipToThirdPartyName',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.shipToThirdPartyName`).d('送达方'),
        maxLength: 120,
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('shipToThirdPartyName'),
        },
      },
      {
        name: 'shipToThirdPartyAddress',
        label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
        maxLength: 120,
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('shipToThirdPartyAddress'),
        },
      },
      {
        name: 'shipToThirdPartyContact',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.shipPartyContact`).d('联系人信息'),
        maxLength: 120,
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('shipToThirdPartyContact'),
        },
      },
      {
        name: 'costId',
        type: 'object',
        label: intl.get(`hpfm.employee.model.employee.costCenterCode`).d('成本中心'),
        lovCode: 'SPRM.COST_CENTER',
        valueField: 'costId',
        textField: 'costName',
        transformResponse: (value) => value && { costId: value },
        transformRequest: (value) => value?.costId,
        dynamicProps: {
          required: ({ record }) => (record.get('requiredFieldNames') || []).includes('costId'),
          lovPara: ({
            dataSet: {
              parent: { current },
            },
          }) => ({
            companyId: current.get('companyId'),
            tenantId,
            ouId: current.get('ouId.ouId'),
          }),
          disabled: ({
            dataSet: {
              parent: { current },
            },
          }) => !current.get('companyId'),
        },
      },
      {
        name: 'costCode',
        bind: 'costId.costCode',
      },
      { name: 'costName', bind: 'costId.costName' },
      {
        name: 'accountSubjectId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.sumProject`).d('总账科目'),
        lovCode: 'SPRM.ACCOUNT_SUBJECT',
        valueField: 'accountSubjectId',
        textField: 'accountSubjectName',
        transformResponse: (value) => value && { accountSubjectId: value },
        transformRequest: (value) => value?.accountSubjectId,
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('accountSubjectId'),
          lovPara: ({
            dataSet: {
              parent: { current },
            },
          }) => ({
            companyId: current.get('companyId'),
            tenantId,
          }),
          disabled: ({
            dataSet: {
              parent: { current },
            },
          }) => !current.get('companyId'),
        },
      },
      { name: 'accountSubjectName', bind: 'accountSubjectId.accountSubjectName' },
      {
        name: 'wbsCode',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.wbs`).d('WBS元素'),
        lovCode: 'SMDM.WBS',
        valueField: 'wbsCode',
        transformResponse: (value, object) => value && { wbsId: value, wbsName: object.wbs },
        transformRequest: (value) => (value ? value.wbsCode : ''),
        dynamicProps: {
          required: ({ record }) => (record.get('requiredFieldNames') || []).includes('wbsCode'),
          lovPara: ({
            dataSet: {
              parent: { current },
            },
          }) => ({
            companyId: current.get('companyId'),
            ouId: current.get('ouId.ouId'),
            tenantId,
          }),
          disabled: ({
            dataSet: {
              parent: { current },
            },
          }) => !current.get('companyId'),
        },
      },
      { name: 'wbs', bind: 'wbsCode.wbsName', transformRequest: (value) => value || '' },
      {
        name: 'returnedFlag',
        type: 'boolean',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.returnedFlag`).d('是否退回'),
        trueValue: 1,
        falseValue: 0,
        dynamicProps: {
          disabled: ({
            record,
            dataSet: {
              parent: { current },
            },
          }) => (current.get('returnOrderFlag') === 1 ? 1 : record.get('returnedFlag')),
        },
      },
      { name: 'brand', label: intl.get(`sodr.quotePurchase.model.quotePurchase.brand`).d('品牌') },
      {
        name: 'specifications',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.specifications`).d('规格'),
      },
      { name: 'model', label: intl.get(`sodr.quotePurchase.model.quotePurchase.model`).d('型号') },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        label: intl.get(`sodr.orderMaintain.sourceFrom.displayPrNum`).d('采购申请号|行号'),
      },
      {
        name: 'contractNum',
        label: intl.get(`sodr.orderMaintain.sourceFrom.contractNum`).d('采购协议号|行号'),
      },
      {
        name: 'sourceNumAndLine',
        label: intl.get(`sodr.orderMaintain.sourceFrom.sourceCodeNum`).d('寻源单号|行号'),
      },
      {
        name: 'prRequestedName',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.purReqAppliedName`).d('申请人'),
      },
      {
        name: 'accountAssignTypeId',
        type: 'object',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.accountType`).d('账户分配类别'),
        lovCode: 'SPRM.ACCOUNT_ASSIGN_TYPE',
        valueField: 'accountAssignTypeId',
        textField: 'accountAssignTypeCode',
        transformResponse: (value) => value && { accountAssignTypeId: value },
        transformRequest: (value) => value?.accountAssignTypeId,
        lovPara: {
          lineType: 'PO_LINE',
          tenantId,
        },
        dynamicProps: {
          required: ({ record }) =>
            (record.get('requiredFieldNames') || []).includes('accountAssignTypeId'),
        },
      },
      { name: 'accountAssignTypeCode', bind: 'accountAssignTypeId.accountAssignTypeCode' },
      { name: 'requiredFieldNames', bind: 'accountAssignTypeId.requiredFieldNames' },
      {
        name: 'remark',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.purReqAppliedName`).d('申请人'),
        maxLength: 480,
        dynamicProps: {
          required: ({ record }) => (record.get('requiredFieldNames') || []).includes('remark'),
        },
        transformRequest: (value) => value || '',
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: LINE_DIRECTORY,
      },
      {
        name: 'domesticTaxIncludedPrice',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
        dynamicProps: {
          // currency: ({ record }) => record.get('currencyCode'),
          precision: ({
            dataSet: {
              parent: { current },
            },
          }) => getPrecision(current.get('domesticDefaultPrecision')),
          // formatterOptions: c7nAmountFormatterOptions(({ dataSet: { parent: { current } } }) =>
          //   current.get('domesticDefaultPrecision')
          // ),
        },
      },
      {
        name: 'domesticUnitPrice',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
        dynamicProps: {
          // currency: ({ record }) => record.get('currencyCode'),
          precision: ({
            dataSet: {
              parent: { current },
            },
          }) => getPrecision(current.get('domesticDefaultPrecision')),
          // formatterOptions: c7nAmountFormatterOptions(({ dataSet: { parent: { current } } }) =>
          //   current.get('domesticDefaultPrecision')
          // ),
        },
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticTaxIncludedLineAmount`).d('本币含税金额'),
        dynamicProps: {
          // currency: ({ record }) => record.get('currencyCode'),
          formatterOptions: c7nAmountFormatterOptions(({ dataSet: { parent: { current } } }) =>
            current.get('domesticFinancialPrecision')
          ),
          precision: ({
            dataSet: {
              parent: { current },
            },
          }) => getPrecision(current.get('domesticFinancialPrecision')),
        },
      },
      {
        name: 'domesticLineAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
        dynamicProps: {
          // currency: ({ record }) => record.get('currencyCode'),
          formatterOptions: c7nAmountFormatterOptions(({ dataSet: { parent: { current } } }) =>
            current.get('domesticFinancialPrecision')
          ),
          precision: ({
            dataSet: {
              parent: { current },
            },
          }) => getPrecision(current.get('domesticFinancialPrecision')),
        },
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`sodr.quotePurchase.model.quotePurchase.receiveTelNum`).d('联系人电话'),
        dynamicProps: {
          pattern: ({ record }) =>
            record.get('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
          disabled: ({
            dataSet: {
              parent: { current },
            },
          }) => current.get('poSourcePlatform') !== 'SRM',
        },
      },
      {
        name: 'internationalTelCode',
        options: internationalTelCodeDs,
        transformResponse: (value) => value || '+86',
        transformRequest: (value) => value || '+86',
        dynamicProps: {
          disabled: ({
            dataSet: {
              parent: { current },
            },
          }) => current.get('poSourcePlatform') !== 'SRM',
        },
      },
      {
        name: 'budgetAccountId',
        type: 'object',
        label: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
        lovCode: 'SMDM.BUDGET_ACCOUNT_ORDER',
        valueField: 'budgetAccountId',
        textField: 'budgetAccountName',
        transformResponse: (value) => value && { budgetAccountId: value },
        transformRequest: (value) => value?.budgetAccountId,
        lovPara: {
          tenantId,
        },
      },
      { name: 'budgetAccountName', bind: 'budgetAccountId.budgetAccountName' },
      {
        name: 'receiveToleranceQuantityType',
        label: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('接收允差类型'),
        lookupCode: 'SPFM.BUSINESS_CATEGORY',
        dynamicProps: {
          required: ({ record }) =>
            record.get('receiveToleranceQuantity') && !record.get('receiveToleranceQuantityType'),
        },
        transformRequest: (value) => value || '',
        // options: excessOrderTypeDs,
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
        name: 'subSupplierId',
        type: 'object',
        label: intl.get(`sodr.common.model.common.subSupplierId`).d('分包供应商'),
        lovCode: 'SODR.AUTH_SUPPLIER_LIFE_CYCLE',
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
        dynamicProps: {
          lovPara: ({
            dataSet: {
              parent: { current },
            },
          }) => ({
            userId,
            tenantId,
            organizationId,
            companyId: current.get('companyId'),
          }),
        },
      },
      { name: 'subSupplierCode', bind: 'subSupplierId.supplierCompanyNum' },
      { name: 'subSupplierName', bind: 'subSupplierId.supplierCompanyName' },
      { name: 'subErpSupplierName', bind: 'subSupplierId.supplierName' },
      { name: 'subErpSupplierId', bind: 'subSupplierId.supplierId' },
      { name: 'subErpSupplierCode', bind: 'subSupplierId.supplierNum' },
      { name: 'subSupplierTenantId', bind: 'subSupplierId.supplierTenantId' },
      {
        name: 'purchaseLineTypeId',
        label: intl.get(`sodr.workspace.model.common.purchaseLineTypes`).d('采购行类型'),
        lookupCode: 'SODR.PO_LINE_TYPE',
      },
      {
        name: 'docFlow',
        label: intl.get(`sodr.common.model.common.docFlow`).d('单据流'),
      },
    ],
    events: {
      load({ dataSet }) {
        // crosspageBatch({ dataSet });
        const { current } = dataSet.parent;
        const returnOrderFlag = current.get('returnOrderFlag');
        dataSet.forEach((line) => {
          line.set('returnedFlag', returnOrderFlag || line.get('returnedFlag'));
        });
      },
      update({ name, record, value, dataSet }) {
        const itemCode = record.get('itemCode');
        const loading = dataSet.getState('loading');
        const doubleUnitEnabled = dataSet.getState('doubleUnitEnabled');
        if (name === 'invOrganizationId') {
          const { receiveToleranceQuantity, receiveToleranceQuantityType } = value || {};
          record.init('invInventoryId', record.getPristineValue('invInventoryId'));
          record.set({
            invLocationId: null,
            invLocationName: null,
            receiveToleranceQuantity,
            receiveToleranceQuantityType,
          });
        }
        if (!record.isNew && name === 'attachmentUuid' && value) {
          getLineAttachmentUuid({ poLineId: record.get('poLineId'), attachmentUuid: value })
            .then(getResponse)
            .then((result) => {
              if (result) {
                record.init('attachmentUuid', value);
              }
            });
        }
        if (name === 'itemId') {
          const {
            taxId,
            taxCode,
            taxRate,
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
            taxId: taxObj,
            categoryId: categoryObj,
            uomId: uomObj,
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
        if (name === 'quantity' && !doubleUnitEnabled) {
          record.set({ secondaryQuantity: value });
        }
        if (name === 'uomId' && !doubleUnitEnabled) {
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
  };
};
