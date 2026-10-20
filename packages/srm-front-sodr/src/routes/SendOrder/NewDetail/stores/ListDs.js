import { SRM_SPUC } from '_utils/config';
import intl from 'utils/intl';
import { BUCKET_NAME, MAX_QUAN_NUMBER, LINE_DIRECTORY } from '@/routes/components/utils/constant';
import { getCurrentOrganizationId } from 'utils/utils';
import { getDynamicLabel } from '@/routes/components/utils';

// 设置sodr国际化前缀 - common - model
const modelPrompt = 'sodr.sendOrder.model.common';
// 设置sodr国际化前缀 - common - message
const titlePrompt = 'sodr.sendOrder.view.title';
// 设置sodr国际化前缀 - common - model
const modelCommonPrompt = 'sodr.common.model.common';

const tenantId = getCurrentOrganizationId();

export default ({
  organizationId,
  poHeaderId,
  sourceFromCancel,
  type = 'basic',
  dscDs,
  asnDs,
  rcvDs,
  billDs,
  invoiceDs,
}) => {
  const children = type === 'associate' && {
    children: {
      $dsc: dscDs,
      $asn: asnDs,
      $rcv: rcvDs,
      $bill: billDs,
      $invoice: invoiceDs,
    },
  };
  const customizeUnitCode = sourceFromCancel
    ? 'SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE,SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER,SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE'
    : 'SODR.SEND_ORDER_DETAIL.BASIC,SODR.SEND_ORDER_DETAIL.OTHER,SODR.SEND_ORDER_DETAIL.INVOICE';
  return {
    primaryKey: 'poLineLocationId',
    dataToJSON: type === 'basic' ? 'all-self' : 'dirty-field-self', // 保存时不带关联单据数据
    autoLocateFirst: false, // 默认不级联查询关联单据，当标签页切换到关联单据时定位第一条来查询
    transport: {
      read: {
        url: `${SRM_SPUC}/v1/${organizationId}/po-line/${poHeaderId}/detail`,
        data: {
          camp: 1,
          sortType: 0,
          customizeUnitCode,
        },
        method: 'GET',
      },
    },
    fields: [
      {
        name: 'displayStatusMeaning',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'displayLineNum',
        label: intl.get(`${modelPrompt}.lineNum`).d('行号'),
      },
      {
        name: 'displayLineLocationNum',
        label: intl.get(`${modelPrompt}.shipmentNum`).d('发运号'),
      },
      {
        name: 'projectCategoryMeaning',
        label: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
      },
      {
        name: 'itemCode',
        label: intl.get(`sodr.sendOrder.model.sendOrder.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get(`sodr.sendOrder.model.sendOrder.itemDescription`).d('物料名称'),
      },

      // basic
      {
        name: 'secondaryQuantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.quantity`).d('数量'),
      },
      {
        name: 'secondaryUomName',
        label: intl.get(`${modelPrompt}.uomName`).d('单位'),
      },
      {
        name: 'quantity',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        dynamicProps: {
          label: ({ dataSet }) =>
            getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'quantity'),
        },
      },
      {
        name: 'uomName',
        dynamicProps: {
          label: ({ dataSet }) => getDynamicLabel(dataSet.getState('doubleUnitEnabled'), 'uom'),
        },
      },
      {
        name: 'needByDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.needByDate`).d('需求日期'),
      },
      {
        name: 'promiseDeliveryDate',
        type: 'date',
        label: intl.get(`${modelPrompt}.promiseDeliveryDate`).d('承诺交货日期'),
      },
      {
        name: 'lastPurchasePrice',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.currentPurchasePrice`).d('最近一次采购价'),
      },
      {
        name: 'unitPrice',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.afterTaxunitPrice`).d('不含税单价'),
      },
      {
        name: 'enteredTaxIncludedPrice',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.enteredTaxIncludedPrice`).d('原币含税单价'),
      },
      {
        name: 'unitPriceBatch',
        type: 'number',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.unitPriceBatch`).d('每'),
      },
      {
        name: 'lineAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`${modelPrompt}.afterTaxlineAmount`).d('不含税行金额'),
      },
      {
        name: 'taxIncludedLineAmount',
        type: 'currency',
        label: intl.get(`${modelPrompt}.taxIncludedLineAmount`).d('含税行金额'),
      },
      {
        name: 'taxRate',
        label: `${intl.get(`${modelPrompt}.taxRate`).d('税率')}(%)`,
      },
      {
        name: 'currencyCode',
        label: intl.get(`${modelPrompt}.currencyCode`).d('币种'),
      },
      {
        name: 'departmentName',
        label: intl.get('sodr.common.model.common.department').d('部门'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get(`sodr.common.model.common.organizationName`).d('收货组织'),
      },
      {
        name: 'inventoryName',
        label: intl.get(`${modelPrompt}.inventoryName`).d('收货库房'),
      },
      {
        name: 'locationName',
        label: intl.get(`${modelPrompt}.locationName`).d('收货库位'),
      },
      {
        name: 'costName',
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      },
      {
        name: 'accountSubjectName',
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      },
      {
        name: 'wbs',
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      },
      {
        name: 'specifications',
        label: intl.get(`${modelPrompt}.specifications`).d('规格'),
      },
      {
        name: 'model',
        label: intl.get(`${modelPrompt}.modelNum`).d('型号'),
      },
      {
        name: 'customSpecsJson',
        label: intl.get(`sprm.purchaseReqCreation.model.common.customSpecsJson`).d('定制品属性'),
      },
      {
        name: 'customSpecs',
        label: intl.get(`sprm.purchaseReqCreation.model.common.customSpecs`).d('定制品属性'),
        disabled: true,
      },
      {
        name: 'productSpecsJson',
        label: intl.get(`sprm.purchaseReqCreation.model.common.productSpecsJson`).d('商品属性'),
      },
      {
        name: 'productSpecs',
        label: intl.get(`sprm.purchaseReqCreation.model.common.productSpecs`).d('商品属性'),
        disabled: true,
      },
      {
        name: 'productBrand',
        label: intl.get(`${modelCommonPrompt}.productBrand`).d('商品品牌'),
      },
      {
        name: 'productModel',
        label: intl.get(`${modelCommonPrompt}.productModel`).d('商品规格'),
      },
      {
        name: 'packingList',
        label: intl.get(`${modelCommonPrompt}.packingList`).d('商品型号'),
      },
      {
        name: 'brand',
        label: intl.get(`${modelPrompt}.brand`).d('品牌'),
      },
      {
        name: 'remark',
        label: intl.get(`${modelPrompt}.purchaserRemark`).d('采购方行备注'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get(`sodr.common.model.common.lineAttachmentUuid`).d('行附件'),
        bucketName: BUCKET_NAME,
        bucketDirectory: LINE_DIRECTORY,
        readOnly: true,
      },
      {
        name: 'domesticTaxIncludedPrice',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticTaxIncludedPrice`).d('本币含税单价'),
      },
      {
        name: 'domesticUnitPrice',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticUnitPrice`).d('本币不含税单价'),
      },
      {
        name: 'domesticTaxIncludedLineAmount',
        type: 'currency',
        label: intl.get(`sodr.common.model.common.domesticTaxIncludedLineAmount`).d('本币含税金额'),
      },
      {
        name: 'domesticLineAmount',
        type: 'currency',
        max: MAX_QUAN_NUMBER,
        label: intl.get(`sodr.common.model.common.domesticLineAmount`).d('本币不含税金额'),
      },
      {
        name: 'budgetAccountId',
        label: intl.get(`sodr.common.model.common.budgetAccount`).d('预算科目'),
      },
      {
        name: 'receiveToleranceQuantityType',
        label: intl.get(`sodr.common.model.common.receiveToleranceQuantityType`).d('允差类型'),
      },
      {
        name: 'purchaseLineTypeId',
        lookupCode: ' SODR.PO_LINE_TYPE ',
        label: intl.get(`sodr.common.model.common.purchaseLineTypes`).d('采购行类型'),
      },
      {
        name: 'deliveryStrategyId',
        type: 'object',
        lovCode: 'SLOD.DELIVERY_STRATEGY',
        label: intl.get(`sodr.common.model.common.strategyName`).d('发货策略'),
        transformResponse: (value, object) =>
          object?.deliveryStrategyId
            ? {
                strategyHeaderId: object?.deliveryStrategyId,
                strategyName: object?.deliveryStrategyIdMeaning,
              }
            : null,
        transformRequest: (value) => {
          return value?.strategyHeaderId;
        },
        lovPara: {
          tenantId,
        },
      },
      {
        name: 'strategyHeaderId',
        type: 'object',
        lovCode: 'SINV.STRATEGY_LINE_CODE_AND_NAME_PO',
        label: intl.get(`sodr.common.modle.common.receivingStrategy`).d('收货策略'),
        transformResponse: (value, object) =>
          object?.strategyHeaderId
            ? {
                strategyHeaderId: object?.strategyHeaderId,
                strategyGroupName: object?.strategyHeaderIdMeaning,
              }
            : null,
        transformRequest: (value) => {
          return value?.strategyHeaderId;
        },
        lovPara: {
          tenantId,
        },
      },
      // other
      {
        name: 'categoryName',
        label: intl.get(`${modelPrompt}.itemTypeDesc`).d('物品类型'),
      },
      {
        name: 'exchangeRate',
        label: intl.get(`${modelPrompt}.exchangeRate`).d('汇率'),
      },
      {
        name: 'consignedFlag',
        label: intl.get(`${modelPrompt}.consignedFlag`).d('是否寄售'),
      },
      {
        name: 'returnedFlag',
        label: intl.get(`${modelPrompt}.returnedFlag`).d('是否退回'),
      },
      {
        name: 'freeFlag',
        label: intl.get(`${modelPrompt}.freeFlag`).d('是否免费'),
      },
      {
        name: 'immedShippedFlag',
        label: intl.get(`${modelPrompt}.immedShippedFlag`).d('是否直发'),
      },
      {
        name: 'bom',
        label: intl.get(`${titlePrompt}.titleBom`).d('外协BOM'),
      },
      {
        name: 'displayPrNumAndDisplayPrLineNum',
        label: intl.get(`sodr.common.model.common.purReqLineNum`).d('采购申请号|行号'),
      },
      {
        name: 'contractNum',
        label: intl.get(`${modelPrompt}.quotePurchase.number`).d('采购协议号|行号'),
      },
      {
        name: 'sourceNumAndLine',
        label: intl.get(`sodr.common.model.common.sourceLineNum`).d('寻源单号|行号'),
      },
      {
        name: 'prRequestedName',
        label: intl.get(`entity.roles.proposer`).d('申请人'),
      },
      {
        name: 'productNum',
        label: intl.get(`${modelPrompt}.productNum`).d('商品编码'),
      },
      {
        name: 'productName',
        label: intl.get(`${modelPrompt}.productName`).d('商品名称'),
      },
      {
        name: 'catalogName',
        label: intl.get(`${modelPrompt}.commodityDirectory`).d('商品目录'),
      },
      {
        name: 'shipToThirdPartyName',
        label: intl.get(`${modelPrompt}.shipToThirdPartyName`).d('送达方'),
      },
      {
        name: 'shipToThirdPartyAddress',
        label: intl.get(`sodr.common.model.common.shipToThirdPartyAddress`).d('送货地址'),
      },
      {
        name: 'shipToThirdPartyContact',
        label: intl.get(`${modelPrompt}.contactPersonInfo`).d('联系人信息'),
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`${modelPrompt}.receiveTelNum`).d('联系人电话'),
      },
      {
        name: 'priceUomName',
        label: intl.get(`sodr.common.model.common.priceUomName`).d('订单价格单位'),
      },
      {
        name: 'priceUomConversion',
        label: intl.get(`${modelPrompt}.unitConversionRelation`).d('单位转换关系'),
      },
    ],
    // 关联单据
    ...children,
  };
};
