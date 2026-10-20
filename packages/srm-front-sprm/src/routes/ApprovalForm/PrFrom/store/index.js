import intl from 'utils/intl';
import { c7nAmountFormatterOptions } from '@/routes/utils';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

const basic = ({ prHeaderId, extraDs, attachmentInfoDs, otherDs }) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'displayPrNum',
        label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
      },
      {
        name: 'amount',
        numberGrouping: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            record?.get('prSourcePlatform') === 'SRM'
              ? record?.get('financialPrecision')
              : undefined
          ),
          type: ({ record }) =>
            record?.get('prSourcePlatform') === 'SRM' && record?.get('currencyCode')
              ? 'currency'
              : 'number',
        },
        label: intl.get(`${commonPrompt}.amount`).d('申请总额'),
      },
      {
        name: 'createByName',
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
      },
    ],
    queryParameter: {
      workFlowFlag: '1',
    },
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/${prHeaderId}`,
          method: 'GET',
          data: filterNullValueObject({
            ...data,
          }),
        };
      },
    },
    feedback: {
      loadSuccess(resp) {
        otherDs.loadData([resp]);
        extraDs.loadData([resp]);
        attachmentInfoDs.loadData([resp]);
      },
    },
  };
};

const extra = () => {
  return {
    fields: [
      {
        name: 'unitName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.unitName`).d('需求部门'),
      },
      {
        name: 'prRequestedName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        type: 'date',
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
      },
      {
        name: 'remark',
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
      },
    ],
  };
};

const line = ({ prHeaderId, uomControl }) => {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'prLineStatusCodeMeaning',
        label: intl.get(`sprm.common.model.common.prLineStatusCode`).d('行状态'),
      },
      {
        name: 'changeInsertFlag',
        label: intl.get('sodr.approvalForm.model.common.changeType').d('变更类型'),
      },
      {
        name: 'displayLineNum',
        label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
      },
      {
        name: 'invOrganizationId',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'invOrganizationName',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'itemCode',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sodr.approvalForm.model.common.itemName').d('物料名称'),
      },
      {
        name: 'categoryId',
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        name: 'categoryName',
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        name: 'quantity',
        type: 'number',
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
      },
      {
        name: 'secondaryQuantity',
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('数量'),
        type: 'number',
      },
      {
        name: 'uomCodeAndName',
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
      },
      {
        name: 'secondaryUomCodeAndName',
        label: intl.get('sodr.approvalForm.model.common.uomCodeAndName').d('单位'),
      },
      {
        name: 'uomId',
        label:
          uomControl === 1
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.secondaryUomId`).d('单位'),
      },
      {
        name: 'secondaryUomId',
        label: intl.get('sodr.approvalForm.model.common.uomCodeAndName').d('单位'),
      },
      {
        name: 'neededDate',
        type: 'date',
        label: intl.get('sodr.approvalForm.model.common.needByDate').d('需求日期'),
      },
      {
        name: 'taxIncludedUnitPrice',
        type: 'number',
        numberGrouping: true,
        label:
          uomControl === 1
            ? intl
                .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
                .d('预估单价(含税)-基本单位')
            : intl.get(`${commonPrompt}.secondaryTaxInUnitPrice`).d('预估单价(含税)'),
      },
      {
        name: 'secondaryTaxInUnitPrice',
        label: intl.get(`${commonPrompt}.secondaryTaxInUnitPrice`).d('预估单价(含税)'),
        type: 'number',
        numberGrouping: true,
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
        name: 'taxIncludedLineAmount',
        disabled: true,
        numberGrouping: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' && record.get('currencyCode')
              ? record.get('financialPrecision')
              : undefined;
          }),
          type: ({ record }) =>
            record?.get('prSourcePlatform') === 'SRM' && record?.get('currencyCode')
              ? 'currency'
              : 'number',
        },
      },
      {
        label: intl.get(`sprm.common.model.common.productNum`).d('商品编码'),
        name: 'productNum',
      },
      {
        label: intl.get(`sprm.common.model.common.productName`).d('商品名称'),
        name: 'productName',
      },
      {
        name: 'primaryUrl',
        label: intl.get(`${commonPrompt}.primaryUrl`).d('商品主图'),
      },
      {
        label: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制'),
        name: 'customMadeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`${commonPrompt}.customAttributeList`).d('物料定制属性'),
        name: 'customAttributeList',
      },
      {
        label: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
        name: 'thirdSkuCode',
      },
      {
        label: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
        name: 'thirdSkuName',
      },
      {
        name: 'skuType',
        label: intl.get(`${commonPrompt}.skuTypeMark`).d('定制品标示'),
      },
      {
        label: intl.get(`${commonPrompt}.customUomName`).d('定制单位'),
        name: 'customUomName',
      },
      {
        label: intl.get(`${commonPrompt}.customQuantity`).d('定制数量'),
        name: 'customQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.packageQuantity`).d('份数'),
        name: 'packageQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性'),
        name: 'customSpecsJson',
      },
      {
        label: intl.get(`sprm.common.model.common.catalogName`).d('商品目录'),
        name: 'catalogName',
      },
      {
        label: intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性'),
        name: 'productSpecsJson',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
        name: 'productBrand',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
        name: 'productModel',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
        name: 'packingList',
      },
      {
        label: intl.get(`sprm.common.model.common.itemModel`).d('型号'),
        name: 'itemModel',
      },
      {
        label: intl.get(`sprm.common.model.common.itemSpecs`).d('规格'),
        name: 'itemSpecs',
      },
      {
        label: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        type: 'number',
        name: 'occupiedQuantity',
      },
      {
        label: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        type: 'number',
        name: 'changeQuantity',
      },
      {
        name: 'sourceExcessRuleCode',
        type: 'string',
        lookupCode: 'SPRM.PR_EXCESS_RULE',
        label: intl.get(`${commonPrompt}.sourceExcessRuleCode`).d('寻源超量规则'),
      },
      {
        name: 'contractExcessRuleCode',
        type: 'string',
        lookupCode: 'SPRM.PR_EXCESS_RULE',
        label: intl.get(`${commonPrompt}.contractExcessRuleCode`).d('协议超量规则'),
      },
      {
        name: 'orderExcessRuleCode',
        type: 'string',
        lookupCode: 'SPRM.PR_EXCESS_RULE',
        label: intl.get(`${commonPrompt}.orderExcessRuleCode`).d('订单超量规则'),
      },
      {
        name: 'secondLevelStrategyCode',
        label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
        type: 'string',
        lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
      },
      {
        name: 'sourceDisposableExcessFlag',
        type: 'string',
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`${commonPrompt}.sourceDisposableExcessFlag`).d('寻源新链路一次性超量标识'),
      },
      {
        name: 'orderExecuteStatus',
        lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
        label: intl.get(`${commonPrompt}.orderExecuteStatus`).d('履约链路执行状态'),
      },
      {
        label: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
        name: 'orderOccupiedQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
        name: 'restPoQuantity',
        type: 'number',
      },
      {
        name: 'sourceExecuteStatus',
        lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
        label: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源链路执行状态'),
      },
      {
        label: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
        name: 'sourceOccupiedQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
        name: 'restSourceQuantity',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.lastPurPrice`).d('上次采购单价'),
        name: 'lastPurchasePrice',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.unitPriceBatch`).d('每'),
        type: 'number',
        numberGrouping: true,
        name: 'unitPriceBatch',
      },
      {
        name: 'currencyCode',
        label: intl.get('sprm.common.model.common.currency').d('币种'),
      },
      {
        name: 'localCurrencyNoTaxSum',
        disabled: true,
        numberGrouping: true,
        label: intl.get('sprm.common.model.common.localCurrencyNoTaxSum').d('本币金额(不含税)'),
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' && record.get('localCurrency')
              ? record.get('localFinancialPrecision') || 0
              : undefined;
          }),
          type: ({ record }) =>
            record?.get('prSourcePlatform') === 'SRM' && record?.get('currencyCode')
              ? 'currency'
              : 'number',
        },
      },
      {
        name: 'localCurrencyNoTaxUnit',
        disabled: true,
        numberGrouping: true,
        label: intl.get('sprm.common.model.common.localCurrencyNoTaxUnit').d('本币单价(不含税)'),
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localDefaultPrecision') || record.get('localDefaultPrecision') === 0)
              ? record.get('localDefaultPrecision')
              : undefined;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.localCurrencyTaxSum`).d('本币金额(含税)'),
        name: 'localCurrencyTaxSum',
        disabled: true,
        numberGrouping: true,
        type: 'number',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' && record.get('localCurrency')
              ? record.get('localFinancialPrecision') || 0
              : undefined;
          }),
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localCurrency')
              ? 'currency'
              : 'number',
        },
      },
      {
        label: intl.get(`sprm.common.model.common.localCurrencyTaxUnit`).d('本币单价(含税)'),
        name: 'localCurrencyTaxUnit',
        type: 'number',
        numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localDefaultPrecision') || record.get('localDefaultPrecision') === 0)
              ? record.get('localDefaultPrecision')
              : undefined;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商（多选）'),
        name: 'supplierList',
        type: 'object',
        multiple: true,
        lovCode: 'SPRM.SUPPLIER',
      },
      {
        name: 'supplierCompanyId',
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        type: 'string',
      },
      {
        name: 'displaySupplierName',
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        type: 'string',
      },
      {
        name: 'prRequestedName',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'purchaseAgentId',
        label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      },
      {
        name: 'purchaseAgentName',
        label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      },
      {
        label: intl.get(`sprm.common.model.common.handlePerson`).d('需求执行人'),
        name: 'executorName',
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        name: 'accountSubjectId',
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        name: 'accountSubjectName',
      },
      {
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        name: 'costId',
      },
      {
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        name: 'costName',
      },
      {
        name: 'expBearDep',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      },
      {
        label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
        name: 'projectNum',
      },
      {
        label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
        name: 'projectName',
      },
      {
        name: 'projectCategory',
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      },
      {
        name: 'projectCategoryMeaning',
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbs',
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        name: 'taxIncludedBudgetUnitPrice',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.budgetIoFlag`).d('预算外标识'),
        name: 'budgetIoFlag',
        type: 'boolean',
        trueValue: '1',
        falseValue: '0',
        transformResponse(data) {
          const value = data ? data.toString() : '0';
          return value;
        },
      },
      {
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountId',
      },
      {
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountName',
      },
      {
        name: 'receiveAddress',
        label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
      },
      {
        name: 'receiveContactName',
        label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
        type: 'string',
      },
      {
        label: intl.get(`sprm.common.model.common.lineFreight`).d('行运费'),
        name: 'lineFreight',
        numberGrouping: true,
        type: 'number',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('financialPrecision') || 0
              : undefined;
          }),
          type: ({ record }) => (record.get('prSourcePlatform') === 'SRM' ? 'currency' : 'number'),
        },
      },
      {
        name: 'rpSourceNum',
        label: intl.get(`${commonPrompt}.rpSourceNum`).d('来源需求计划行'),
      },
      {
        name: 'rpNumAndLineNums',
        label: intl.get(`${commonPrompt}.rpNumAndLineNums`).d('需求计划提报单号'),
      },
      {
        name: 'remark',
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
      },
      {
        name: 'mallLineNum',
        label: intl.get(`sprm.common.model.common.mallLineNum`).d('商城行号'),
      },
      {
        name: 'budgetOccupyFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetOccupyFlag`).d('预算占用标识'),
        lookupCode: 'SPUC.PR.LINE_BUDGET_OCCUPY_FLAG',
      },
      {
        label: intl.get('entity.attachment.tag').d('附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
      },
      {
        label: intl.get('sprm.common.view.attachment.changeAttachmentUuid').d('变更说明附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'changeAttachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
      },
      {
        label: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
        name: 'priceList',
      },
      {
        label: intl.get(`${commonPrompt}.executionBillDetail`).d('执行单据详情'),
        name: 'executionBillDetail',
      },
      {
        label: intl.get(`${commonPrompt}.changeOrderFailCount`).d('自动转单失败次数'),
        type: 'number',
        name: 'changeOrderFailCount',
      },
    ],
    transport: {
      read: ({ data, dataSet }) => {
        const url =
          dataSet.getState('changeEditFlag') === 1
            ? `${SRM_SPRM}/v1/${organizationId}/purchase-request/query-changeing-line/${prHeaderId}`
            : `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/lines`;
        return {
          url,
          data: filterNullValueObject({
            ...data,
          }),
          method: 'GET',
        };
      },
    },
    events: {
      query: ({ params, data }) => {
        const queryData = { ...params, data };
        if (queryData.customizeUnitCode) {
          return true;
        } else {
          return false;
        }
      },
    },
  };
};

const other = () => {
  return {
    fields: [
      {
        name: 'prSourcePlatform',
        label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        lookupCode: 'SPRM.SRC_PLATFORM',
      },
      {
        name: 'originalCurrency',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
      },
      {
        name: 'localCurrencyTaxSum',
        numberGrouping: true,
        label: intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)'),
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return (
              record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
            );
          }),
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localFinancialPrecision') || record.get('localFinancialPrecision') === 0)
              ? Number(record.get('localFinancialPrecision'))
              : undefined;
          },
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('currencyCode')
              ? 'currency'
              : 'number',
        },
        disabled: true,
      },
      {
        name: 'localCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)'),
        numberGrouping: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return (
              record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
            );
          }),
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localFinancialPrecision') || record.get('localFinancialPrecision') === 0)
              ? Number(record.get('localFinancialPrecision'))
              : undefined;
          },
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('currencyCode')
              ? 'currency'
              : 'number',
        },
        disabled: true,
      },
      {
        name: 'paymentMethodName',
        label: intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式'),
        type: 'string',
      },
      {
        name: 'lotNum',
        label: intl.get(`${commonPrompt}.lotNum`).d('批次号'),
      },
      {
        name: 'rpSourceFlag',
        label: intl.get(`${commonPrompt}.rpSourceFlag`).d('需求计划来源标识'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouName',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'purchaseAgentName',
        label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
      },
      {
        name: 'invoiceTitle',
        label: intl.get(`${commonPrompt}.invoiceTitle`).d('发票抬头'),
      },
      {
        name: 'taxRegisterNum',
        label: intl.get(`${commonPrompt}.taxRegisterNum`).d('税务登记号'),
      },
      {
        name: 'taxRegisterAddress',
        label: intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址'),
      },
      {
        name: 'taxRegisterTel',
        label: intl.get(`${commonPrompt}.taxRegisterTel`).d('公司电话'),
      },
      {
        name: 'taxRegisterBank',
        label: intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行'),
      },
      {
        name: 'taxRegisterBankAccount',
        label: intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号'),
      },
      {
        name: 'invoiceMethodName',
        label: intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式'),
      },
      {
        name: 'invoiceTitleTypeName',
        label: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
      },
      {
        name: 'invoiceDetailTypeName',
        label: intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细'),
      },
      {
        name: 'receiverContactName',
        label: intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人'),
      },
      {
        name: 'receiverTelNum',
        label: intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话'),
      },
      {
        name: 'receiverAddressName',
        label: intl.get(`${commonPrompt}.receiverAddress`).d('收货方地址'),
      },
      {
        name: 'invoiceAddress',
        label: intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址'),
      },
      {
        name: 'invoiceContactName',
        label: intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人'),
      },
      {
        name: 'invoiceTelNum',
        label: intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话'),
      },
      {
        name: 'receiverEmailAddress',
        label: intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱'),
      },
      {
        name: 'purchaseUnitName',
        label: intl.get(`${commonPrompt}.purchaseUnitName`).d('收货方组织'),
      },
    ],
  };
};

const attachmentInfo = () => {
  return {
    fields: [
      {
        name: 'attachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.common.model.common.enterEnclosure').d('内部附件'),
      },
      {
        name: 'externalAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件'),
      },
      {
        name: 'changeAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.common.view.attachment.changeAttachmentUuid').d('变更说明附件'),
      },
    ],
  };
};

const replenish = () => {
  return {
    fields: [],
  };
};

export { basic, extra, line, attachmentInfo, other, replenish };
