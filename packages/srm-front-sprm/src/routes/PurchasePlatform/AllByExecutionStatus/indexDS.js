// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_SPRM } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject, getCurrentUser } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import { amountFormatterOptions, numberFormatterOptions } from '@/routes/utils';


const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const byExcutionDs = () => ({
  autoQuery: false,
  primaryKey: 'prLineId',
  cacheSelection: true,
  autoLocateFirst: false,
  isAllPageSelection: true,
  pageSize: 20,
  fields: [
    {
      name: 'prLineStatusCode',
      label: intl.get(`sprm.common.model.common.prLineStatusCode`).d('行状态'),
    },
    {
      name: 'budgetShowModal',
      label: intl.get(`sprm.common.model.common.budgetShowModal`).d('金额占用记录查询'),
    },
    {
      name: 'checkContectDoc',
      label: intl.get(`sprm.common.model.common.checkContectDoc`).d('执行单据'),
    },
    {
      name: 'autoAssignedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      label: intl.get(`sprm.common.model.autoAssignedFlag`).d('自动分配是否成功'),
    },
    {
      name: 'prExecutePointVOList',
      type: 'object',
      label: intl.get(`sprm.common.model.prExecutePoint`).d('执行状态'),
    },
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.common.prNumAndLine`).d('采购申请编号|行号'),
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'itemCode',
      label: intl.get(`sprm.common.model.common.itemCodeAndName`).d('物料编码|物料名称'),
    },
    {
      name: 'itemName',
      label: intl.get('entity.item.name').d('物料名称'),
      type: 'string',
    },
    {
      name: 'quantity',
      type: 'number',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseQuantity`).d('基本数量')
            : intl.get(`sprm.common.model.common.quantity`).d('数量'),
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
      name: 'sourceOccupiedQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
      name: 'orderOccupiedQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
      name: 'restSourceQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
      name: 'restPoQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'secondLevelStrategyCode',
      label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      type: 'string',
      lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
    },
    {
      name: 'orderExecuteStatus',
      lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
      label: intl.get(`${commonPrompt}.orderExecuteStatus`).d('履约链路执行状态'),
    },
    {
      name: 'sourceExecuteStatus',
      lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
      label: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源链路执行状态'),
    },
    {
      name: 'uomPrecision',
      type: 'number',
    },
    {
      name: 'prSourcePlatformMeaning',
      label: intl.get(`sprm.common.model.common.prSourcePlatform`).d('单据来源'),
    },
    {
      name: 'notExecutionQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.notExecutionQuantity`).d('未执行数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'projectStatus',
      lookupCode: 'SPRM.PR_LINE_PROJECT_EXEC_STA',
      label: intl.get(`sprm.common.model.common.projectStatus`).d('立项状态'),
    },
    {
      name: 'projectQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.projectQuantity`).d('立项数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'rfxStatus',
      lookupCode: 'SPRM.PR_LINE_RFX_EXEC_STA',
      label: intl.get(`sprm.common.model.common.rfxStatus`).d('询报价状态'),
    },
    {
      name: 'rfxQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.rfxQuantity`).d('询报价数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'bidStatus',
      lookupCode: 'SPRM.PR_LINE_BID_EXEC_STA',
      label: intl.get(`sprm.common.model.common.bidStatus`).d('招投标状态'),
    },
    {
      name: 'bidQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.bidQuantity`).d('招投标数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },

    {
      name: 'contractStatus',
      lookupCode: 'SPRM.PR_LINE_CONTRACT_EXEC_STA',
      label: intl.get(`sprm.common.model.common.contractStatus`).d('协议状态'),
    },
    {
      name: 'contractQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.contractQuantity`).d('协议数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'orderStatus',
      lookupCode: 'SPRM.PR_LINE_ORDER_EXEC_STA',
      label: intl.get(`sprm.common.model.common.orderStatus`).d('订单状态'),
    },
    {
      name: 'orderQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.orderQuantity`).d('订单数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'deliveryStatus',
      lookupCode: 'SPRM.PR_LINE_DELIVERY_EXEC_STA',
      label: intl.get(`sprm.common.model.common.deliveryStatus`).d('送货状态'),
    },
    {
      name: 'deliveryQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.deliveryQuantity`).d('送货数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'slodStatus',
      lookupCode: 'SPRM.PR_LINE_SLOD_EXEC_STA',
      label: intl.get(`sprm.common.model.common.soldStatus`).d('发货执行状态'),
    },
    {
      name: 'slodQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.slodQuantity`).d('发货执行数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'receiptStatus',
      lookupCode: 'SPRM.PR_LINE_RECEIPT_EXEC_STA',
      label: intl.get(`sprm.common.model.common.receiptStatus`).d('收货状态'),
    },
    {
      name: 'receiptQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.receiptQuantity`).d('收货数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'contractFrameworkStatus',
      lookupCode: 'SPRM.PR_LINE_CONTRACT_EXEC_STA',
      label: intl.get(`sprm.common.model.common.contractFrameworkStatus`).d('框架协议状态'),
    },
    {
      name: 'contractFrameworkQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.contractFrameworkQuantity`).d('框架协议数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'billStatus',
      lookupCode: 'SPRM.PR_LINE_BILL_EXEC_STA',
      label: intl.get(`sprm.common.model.common.billStatus`).d('开票状态'),
    },
    {
      name: 'billQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.billQuantity`).d('开票数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'paymentStatus',
      lookupCode: 'SPRM.PR_LINE_PAYMENT_EXEC_STA',
      label: intl.get(`sprm.common.model.common.paymentStatus`).d('付款执行状态'),
    },
    {
      name: 'paymentQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.paymentQuantity`).d('付款执行数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'reconciliationStatus',
      lookupCode: 'SPRM.PR_LINE_RECONCILIATION_EXEC_STA',
      label: intl.get(`sprm.common.model.common.reconciliationStatus`).d('对账执行状态'),
    },
    {
      name: 'reconciliationQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.reconciliationQuantity`).d('对账执行数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'title',
      label: intl.get(`sprm.common.model.common.title`).d('标题'),
    },
    {
      name: 'prTypeName',
      label: intl.get(`sprm.common.model.common.prTypeName`).d('申请类型'),
    },
    {
      name: 'headerPrRequestedName',
      label: intl.get(`sprm.common.model.common.prRequestedName`).d('申请人'),
    },
    {
      name: 'requestDate',
      type: 'date',
      format: DEFAULT_DATE_FORMAT,
      label: intl.get(`sprm.common.model.common.requestDate`).d('申请日期'),
    },
    {
      name: 'creatorName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`sprm.common.model.common.creationTime`).d('创建时间'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`sprm.common.model.common.ouName`).d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'headerPurchaseAgentName',
      label: intl.get(`sprm.common.model.common.headerPrRequestedName`).d('头采购员'),
    },
    {
      name: 'unitName',
      label: intl.get(`sprm.common.model.common.unitName`).d('所属部门'),
    },
    {
      name: 'originalCurrency',
      label: intl.get('sprm.common.model.common.originalCurrency').d('原币币种'),
    },
    {
      name: 'priceHiddenFlag',
    },
    {
      name: 'headerPriceHiddenFlag',
    },
    {
      name: 'localCurrency',
      label: intl.get('sprm.common.model.common.localCurrency').d('本币币种'),
    },
    {
      name: 'localCurrencyNoTaxSum',
      label: intl.get('sprm.common.model.common.localCurrencyNoTaxSum').d('本币金额(不含税)'),
      type: 'number',
      computedProps: { formatterOptions: amountFormatterOptions },
    },
    {
      name: 'headerRemark',
      label: intl.get(`sprm.common.model.common.remark`).d('备注'),
    },
    {
      name: 'prNum',
      label: intl.get(`sprm.common.model.common.prApplyNum`).d('SRM申请编号'),
    },
    {
      name: 'lotNum',
      label: intl.get(`sprm.common.model.common.lotNum`).d('批次号'),
    },
    // {
    //   name: 'headerReceiverContactName',
    //   label: intl.get(`sprm.common.model.common.headerReceiverContactName`).d('头收货联系人'),
    // },
    // {
    //   name: 'headerReceiverAddressName',
    //   label: intl.get(`sprm.common.model.headerReceiverAddressName`).d('头收货地址'),
    // },
    {
      name: 'receiverContactName',
      label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
    },
    {
      name: 'headerReceiverAddressName',
      label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
    },
    {
      name: 'headerUrgentFlag',
      label: intl.get(`sprm.common.model.common.urgentFlag`).d('是否加急'),
    },
    {
      name: 'headerUrgentDate',
      label: intl.get(`sprm.common.model.common.urgentDate`).d('加急时间'),
      type: 'dateTime',
    },
    {
      name: 'closeStatusCode',
      label: intl.get(`sprm.common.model.common.headerCloseStatusCode`).d('头关闭状态'),
    },
    {
      name: 'cancelStatusCode',
      label: intl.get(`sprm.common.model.common.cancelStatusCode`).d('头取消状态'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
    },
    {
      name: 'inventoryName',
      label: intl.get('sprm.common.model.common.interRoom').d('库房'),
    },
    { label: intl.get(`sprm.common.model.common.productNum`).d('商品编码'), name: 'productNum' },
    { label: intl.get(`sprm.common.model.common.productName`).d('商品名称'), name: 'productName' },
    {
      label: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
      name: 'thirdSkuCode',
    },
    {
      label: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
      name: 'thirdSkuName',
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
    { label: intl.get(`sprm.common.model.common.catalogName`).d('商品目录'), name: 'catalogName' },
    { label: intl.get(`sprm.common.model.common.itemModel`).d('型号'), name: 'itemModel' },
    { label: intl.get(`sprm.common.model.common.itemSpecs`).d('规格'), name: 'itemSpecs' },
    {
      label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      name: 'categoryName',
    },
    {
      name: 'uomName',
      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl.get(`sprm.common.model.common.baseUom`).d('基本单位')
            : intl.get(`sprm.common.model.common.uomName`).d('单位'),
      },
    },
    { label: intl.get(`sprm.common.model.common.baseUom`).d('基本单位'), name: 'uomCodeAndName' },
    {
      name: 'purchaseAgentName',
      label: intl.get(`sprm.common.model.common.linePurchaseAgents`).d('行采购员'),
    },
    {
      label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      format: DEFAULT_DATE_FORMAT,
      type: 'date',
    },
    {
      label: intl.get(`sprm.common.model.common.prLineMan`).d('行申请人'),
      name: 'linePrRequestedName',
    },
    {
      name: 'taxIncludedUnitPrice',
      type: 'number',
      computedProps: { formatterOptions: numberFormatterOptions },
      // 单价字段不补0
      dynamicProps: {
        //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
        //     record.get('prSourcePlatform') === 'SRM' ? record.get('defaultPrecision') : undefined
        //   ),
        label: ({ dataSet }) =>
          dataSet.getState('uomControl')
            ? intl
              .get(`sprm.common.model.common.baseTaxIncludedUnitPrice`)
              .d('预估单价(含税)-基本单位')
            : intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        //   type: ({ record }) =>
        //     record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
        //       ? 'currency'
        //       : 'number',
      },
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
      name: 'taxIncludedLineAmount',
      type: 'number',
      computedProps: {
        formatterOptions: amountFormatterOptions,
      },
    },
    {
      label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
      name: 'secondaryUomId',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      textField: 'uomCodeAndName',
      transformRequest: (value) => value?.secondaryUomId || value?.uomId,
      transformResponse(value, data) {
        if (value) {
          return {
            ...data,
            uomCodeAndName: data.secondaryUomCodeAndName || data.secondaryUomName || data.uomName,
          };
        } else {
          return null;
        }
      },
    },
    {
      label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
      name: 'secondaryQuantity',
      type: 'number',
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('secondaryUomPrecision') ?? 10;
        },
      },
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价（含税）'),
      name: 'secondaryTaxInUnitPrice',
      type: 'number',
    },
    {
      label: intl.get(`sprm.common.model.common.executionStrategyCode`).d('执行策略'),
      lookupCode: 'SPRM.EXECUTION_STRATEGY',
      type: 'string',
      name: 'executionStrategyCode',
    },
    {
      label: intl.get(`sprm.common.model.common.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
      name: 'taxIncludedBudgetUnitPrice',
      type: 'number',
      // dynamicProps: {
      //   formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //     record.get('prSourcePlatform') === 'SRM' ? record.get('defaultPrecision') : undefined
      //   ),
      //   type: ({ record }) =>
      //     record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
      //       ? 'currency'
      //       : 'number',
      // },
    },
    {
      label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
      name: 'budgetAccountName',
    },
    {
      label: intl.get(`sprm.common.model.common.budgetIoFlag`).d('预算外标识'),
      name: 'budgetIoFlag',
    },
    {
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      name: 'expBearDep',
    },
    {
      label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      name: 'costName',
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      name: 'accountSubjectName',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbsCode',
    },
    {
      label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
      name: 'projectNum',
    },
    {
      label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
      name: 'projectName',
    },
    // {
    //   name: 'closeStatusMeaning',
    //   label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.closedStatus`).d('关闭状态'),
    // },
    // {
    //   name: 'cancelStatusMeaning',
    //   label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.cancelledStatus`).d('取消状态'),
    // },
    {
      name: 'purchaseAgentName',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.purchaseAgentName`).d('采购员'),
    },
    {
      label: intl.get(`sprm.common.model.common.skuTypeMark`).d('定制品标识'),
      name: 'skuType',
    },
    {
      label: intl.get(`sprm.common.model.common.customUomName`).d('定制单位'),
      name: 'customUomName',
    },
    {
      label: intl.get(`sprm.common.model.common.customQuantity`).d('定制数量'),
      name: 'customQuantity',
      type: 'number',
    },
    {
      label: intl.get(`sprm.common.model.common.packageQuantity`).d('份数'),
      name: 'packageQuantity',
    },
    {
      label: intl.get(`sprm.common.model.common.customSpecsJson`).d('定制品属性'),
      name: 'customSpecsJson',
    },
    {
      label: intl.get(`sprm.common.model.common.productSpecsJson`).d('商品属性'),
      name: 'productSpecsJson',
    },
    {
      name: 'prExecutePointVOList',
      type: 'object',
      label: intl.get(`sprm.common.model.prExecutePoint`).d('执行状态'),
    },
    {
      name: 'prExecutePointVOListOld',
      label: intl.get(`sprm.common.model.prExecutePoint`).d('执行状态'),
    },
    {
      label: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
      name: 'priceList',
    },
    {
      label: intl.get(`sprm.common.model.common.docFlow`).d('单据流'),
      type: 'string',
      name: 'docFlow',
    },
    {
      name: 'secondLevelStrategyCode',
      label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
      type: 'string',
      lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
    },
    {
      name: 'projectTaskId',
      lovCode: 'SIEC.PROJECT_TASK_TREE',
      type: 'object',
      label: intl.get(`${commonPrompt}.projectTaskId`).d('项目任务名称'),
      optionsProps: {
        paging: 'server',
        primaryKey: 'taskId',
        idField: 'taskId',
        treeFlag: 'Y',
        parentField: 'parentTaskId',
        childrenField: 'children',
      },
      transformRequest: (value) => value?.taskId,
      transformResponse: (value, object) => {
        return object?.projectTaskId
          ? {
            taskId: object?.projectTaskId,
            taskName: object?.projectTaskName,
          }
          : null;
      },
    },
    {
      label: intl.get(`sprm.common.view.message.transferredProjectFlag`).d('是否已转项目'),
      name: 'transferredProjectFlag',
    },
    {
      name: 'closeQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.closeQuantity`).d('关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'sourceCloseQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sourceCloseQuantity`).d('寻源关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'currentCloseQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.currentCloseQuantity`).d('本次关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'currentSourceCloseQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.currentSourceCloseQuantity`).d('本次寻源关闭数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'downsStreamQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.downsStreamQuantity`).d('已转下游数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
    {
      name: 'defaultOrderingAddressId',
      label: intl.get(`${commonPrompt}.defaultOrderingAddressLov`).d('默认收货地址'),
      type: 'object',
      lovCode: 'SMCT.ADDRESS.NOT_ENCRYPT',
      transformRequest: (value) => value && value.addressId,
      transformResponse: (_, object) => {
        return object?.defaultOrderingAddressId
          ? {
            ...object,
            addressId: object?.defaultOrderingAddressId,
            fullAddress: object?.defaultOrderingAddress,
            contactName: object?.defaultContactPerson,
            mobile: object?.defaultContactPhone,
          }
          : null;
      },
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          return {
            userld: getCurrentUser()?.id,
            belongType: 1,
            tenantId: organizationId,
            companyId: dataSet.parent?.current?.get('companyId'),
          };
        },
      },
    },
    {
      name: 'defaultOrderingAddress',
      label: intl.get(`${commonPrompt}.defaultOrderingAddressLov`).d('默认收货地址'),
      bind: 'defaultOrderingAddressId.fullAddress',
    },
    {
      name: 'defaultContactPerson',
      label: intl.get(`${commonPrompt}.defaultContactPersonBind`).d('默认联系人'),
      bind: 'defaultOrderingAddressId.contactName',
    },
    {
      name: 'defaultContactPhone',
      bind: 'defaultOrderingAddressId.mobile',
      label: intl.get(`${commonPrompt}.defaultContactPhoneBind`).d('默认联系电话'),
    },
    {
      name: 'sourceDownsStreamQuantity',
      type: 'number',
      label: intl.get(`${commonPrompt}.sourceDownsStreamQuantity`).d('寻源链路已转下游数量'),
      dynamicProps: {
        precision: ({ record }) => {
          return record.get('uomPrecision') ?? 10;
        },
      },
    },
  ],
  transport: {
    read: ({ data, dataSet }) => {
      // const { prSubmittedDate = {}, approvedDate = {}, poCloseDate = {}, deliveryDate = {} } = data;
      const cuxQueryParams = dataSet.getState('cuxQueryParams') || {};
      const newParams = {
        ...data,
        ...cuxQueryParams,
        tempkey: undefined,
        supplierQueryParamStr: data.tempkey,
        customizeUnitCode:
          'SPRM.PURCHASE_PLAFORM_EXECUTION.FLATSEARCHBAR,SPRM.PURCHASE_PLAFORM_EXECUTION.LIST',
      };

      const otherSupplier = {};
      // 判断是不是老供应商的默认值查询
      if (
        newParams.supplierQueryParamStr &&
        !newParams.supplierId &&
        !newParams.supplierCompanyId
      ) {
        if (
          !newParams.supplierQueryParamStr.includes(':') &&
          newParams.supplierQueryParamStr.includes('-')
        ) {
          // eslint-disable-next-line prefer-destructuring
          otherSupplier.supplierCompanyId = newParams.supplierQueryParamStr.split('-')[1];
          // eslint-disable-next-line prefer-destructuring
          otherSupplier.supplierId = newParams.supplierQueryParamStr.split('-')[0];
        }
      }

      const queryData = filterNullValueObject({
        ...newParams,
        ...otherSupplier,
      });

      if (
        Object.keys(queryData).filter(
          (ele) =>
            !['customizeOrderField', 'customizeUnitCode', 'customizeFilterComparison'].includes(ele)
        ).length
      ) {
        queryData.purPlatformLineDetailAllTabHasParamFlag = 1;
      } else {
        queryData.purPlatformLineDetailAllTabHasParamFlag = 0;
      }

      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/execution-status-tracking-tiled/page`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
    },
  },
});

const projectDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'sourceProjectNum',
      label: intl.get(`sprm.common.model.common.projectNo`).d('寻源立项单据编号'),
    },
    {
      name: 'projectLineItemNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'sourceProjectStatusMeaning',
      label: intl.get(`sprm.common.model.common.sourceProjectStatus`).d('寻源立项单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.time`).d('寻源立项创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'sourceProjectName',
      label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'sourceMethodMeaning',
      label: intl.get(`sprm.common.model.common.rfxsourceMethod`).d('寻源方式'),
    },
    {
      name: 'purAgent',
      label: intl.get(`sprm.common.model.common.projectPurAgent`).d('采购联系人'),
    },
    {
      name: 'contactMobilephone',
      label: intl.get(`sprm.common.model.project.contactMobilephone`).d('联系人电话'),
    },
    {
      name: 'contactMail',
      label: intl.get(`sprm.common.model.project.contactMail`).d('联系人邮箱'),
    },
    {
      name: 'sourceDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.project.sourceDate`).d('寻源时间'),
    },
    {
      name: 'createdByName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'unitName',
      label: intl.get(`sprm.common.model.project.unitName`).d('需求部门'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/project-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.PROJECT_LIST',
        },
      };
    },
  },
});

const rfxDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'rfxNum',
      label: intl.get(`sprm.common.model.common.rfxNum`).d('寻源单据编号'),
    },
    {
      name: 'rfxLineItemNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'rfxStatusMeaning',
      label: intl.get(`sprm.common.model.common.rfxStatus`).d('寻源单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.rfxcreationDate`).d('寻源单据创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'rfxTitle',
      label: intl.get(`sprm.common.model.rfx.rfxTitle`).d('询价单标题'),
    },
    {
      name: 'templateName',
      label: intl.get(`sprm.common.model.rfx.templateName`).d('寻源模板'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'purchaserName',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'purName',
      label: intl.get(`sprm.common.model.common.projectPurAgent`).d('采购联系人'),
    },
    {
      name: 'purPhone',
      label: intl.get(`sprm.common.model.project.contactMobilephone`).d('联系人电话'),
    },
    {
      name: 'purEmail',
      label: intl.get(`sprm.common.model.project.contactMail`).d('联系人邮箱'),
    },
    {
      name: 'sourceMethodMeaning',
      label: intl.get(`sprm.common.model.common.rfxsourceMethod`).d('寻源方式'),
    },
    {
      name: 'createdByName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/source-rfx-execution-detail/${prLineId}`,
        method: 'GET',
        data: { customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.RFX_LIST' },
      };
    },
  },
});

const bidDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'bidNum',
      label: intl.get(`sprm.common.model.common.bidNum`).d('招标单据编号'),
    },
    {
      name: 'bidLineItemNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'bidStatusMeaning',
      label: intl.get(`sprm.common.model.common.bidStatus`).d('招标单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.bidtime`).d('招标单据创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'bidTitle',
      label: intl.get(`sprm.common.model.bid.bidTitle`).d('招标事项'),
    },
    {
      name: 'purOrganizationName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'purchaserName',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'purName',
      label: intl.get(`sprm.common.model.common.projectPurAgent`).d('采购联系人'),
    },
    {
      name: 'purPhone',
      label: intl.get(`sprm.common.model.project.contactMobilephone`).d('联系人电话'),
    },
    {
      name: 'purEmail',
      label: intl.get(`sprm.common.model.project.contactMail`).d('联系人邮箱'),
    },
    {
      name: 'quotationStartDate',
      label: intl.get(`sprm.common.model.bid.quotationStartDate`).d('投标开始时间'),
    },
    {
      name: 'quotationEndDate',
      label: intl.get(`sprm.common.model.bid.quotationEndDate`).d('投标截止时间'),
    },
    {
      name: 'bidOpenDate',
      label: intl.get(`sprm.common.model.bid.bidOpenDate`).d('开标时间'),
    },
    {
      name: 'createdByName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'sourceMethodMeaning',
      label: intl.get(`sprm.common.model.common.rfxsourceMethod`).d('寻源方式'),
    },
    {
      label: intl.get(`sprm.common.model.common.executeBillTypeNewFlag`).d('是否新招标'),
      name: 'executeBillTypeNewFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/source-bid-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          prLineId,
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.BID_LIST',
        },
      };
    },
  },
});

const contractDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'pcNum',
      label: intl.get(`sprm.common.model.common.pcNum`).d('协议单据编号'),
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'pcStatusCodeMeaning',
      label: intl.get(`sprm.common.model.common.pcStatus`).d('协议单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.contractTime`).d('协议创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'pcName',
      label: intl.get(`sprm.common.model.contract.pcName`).d('协议名称'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`sprm.common.model.common.ouName`).d('业务实体'),
    },
    {
      name: 'pcKindCodeMeaning',
      label: intl.get(`sprm.common.model.contract.pcKindCodeMeaning`).d('协议性质'),
    },
    {
      name: 'pcTypeName',
      label: intl.get(`sprm.common.model.contract.pcTypeName`).d('协议类型'),
    },
    {
      name: 'amount',
      label: intl.get(`sprm.common.model.contract.amount`).d('协议总额'),
    },
    {
      name: 'supplierName',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
    },
    {
      name: 'mainPcName',
      label: intl.get(`sprm.common.model.contract.mainPcName`).d('主协议'),
    },
    {
      name: 'contractPurposeMeaning',
      label: intl.get(`sprm.common.model.contract.contractPurposeMeaning`).d('协议用途'),
    },
    {
      name: 'startDateActive',
      label: intl.get(`sprm.common.model.contract.startDateActive`).d('协议开始时间'),
    },
    {
      name: 'endDateActive',
      label: intl.get(`sprm.common.model.contract.endDateActive`).d('协议结束时间'),
    },
    {
      name: 'signDescription',
      label: intl.get(`sprm.common.model.contract.signDescription`).d('签订理由'),
    },
    {
      name: 'signAddress',
      label: intl.get(`sprm.common.model.contract.signAddress`).d('签署地点'),
    },
    {
      name: 'unitName',
      label: intl.get(`sprm.common.model.common.unitName`).d('所属部门'),
    },
    {
      name: 'internalPostil',
      label: intl.get(`sprm.common.model.common.internalPostil`).d('内部批注'),
    },
    {
      name: 'createByRealName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/contract-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.CONTRACT_LIST',
        },
      };
    },
  },
});

const ordertDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'displayPoNum',
      label: intl.get(`sprm.common.model.common.displayPoNum`).d('订单单据编号'),
    },
    {
      name: 'displayLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'displayStatusMeaning',
      label: intl.get(`sprm.common.model.common.orderDisplayStatus`).d('订单单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.orderTime`).d('订单创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'poTypeDesc',
      label: intl.get(`sprm.common.model.order.poTypeDesc`).d('订单类型'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`sprm.common.model.common.ouName`).d('业务实体'),
    },
    {
      name: 'supplierName',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'agentName',
      label: intl.get(`sprm.purchaseRequisitionInquiry.model.common.purchaseAgentName`).d('采购员'),
    },
    {
      name: 'taxIncludeAmount',
      label: intl.get(`sprm.common.model.order.taxIncludeAmount`).d('总金额(含税)'),
    },
    {
      name: 'amount',
      label: intl.get(`sprm.common.model.order.amount`).d('总金额(不含税)'),
    },
    {
      name: 'termsName',
      label: intl.get(`sprm.common.model.order.termsName`).d('付款条款'),
    },
    {
      name: 'displayLineLocationNum',
      label: intl.get(`sprm.common.model.order.displayLineLocationNum`).d('发运号'),
    },
    {
      name: 'invOrganizationName',
      label: intl.get(`sprm.common.model.order.invOrganizationName`).d('收货组织'),
    },
    {
      name: 'projectCategoryMeaning',
      label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
    },
    {
      name: 'creationName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'promiseDeliveryDate',
      type: 'date',
      label: intl.get(`sprm.common.model.common.promiseDeliveryDate`).d('承诺交货日期'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/order-execution-detail/${prLineId}`,
        method: 'GET',
        data: { customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.ORDER_LIST' },
      };
    },
  },
});

const asnDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'asnNum',
      label: intl.get(`sprm.common.model.common.asnNum`).d('送货单据编号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'asnStatusMeaning',
      label: intl.get(`sprm.common.model.common.asnStatusMeaning`).d('送货单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.asnNumTime`).d('送货单创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'shipDate',
      label: intl.get(`sprm.common.model.rcv.shipDate`).d('发货时间'),
    },
    {
      name: 'expectedArriveDate',
      type: 'dateTime',
      format: DEFAULT_DATETIME_FORMAT,
      label: intl.get(`sprm.common.model.rcv.expectedArriveDate`).d('预计到货日期'),
    },
    {
      name: 'creationName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/delivery-execution-detail/${prLineId}`,
        method: 'GET',
        data: { customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.ASN_LINE' },
      };
    },
  },
});

const rcvDs = (prLineId, uomPrecision, financialPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'displayTrxNum',
      label: intl.get(`sprm.common.model.common.displayTrxNum`).d('收货单据编号'),
    },
    {
      name: 'displayTrxLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'rcvStatusCodeMeaning',
      label: intl.get(`sprm.common.model.common.rcvStatusCodeMeaning`).d('收货单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.trxLineTime`).d('收货单创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'executeAmount',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeAmount`).d('执行金额'),
      dynamicProps: {
        precision: () => {
          return financialPrecision ?? 10;
        },
      },
    },
    {
      name: 'rcvTypeName',
      label: intl.get(`sprm.common.model.rcv.rcvTypeName`).d('事务类型'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.common.companyName`).d('公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`entity.supplier.tag`).d('供应商'),
    },
    {
      name: 'creationName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/receipt-execution-detail/${prLineId}`,
        method: 'GET',
        data: { customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.REC_LINE' },
      };
    },
  },
});

const settleDs = (prLineId, uomPrecision) => ({
  pageSize: 20,
  autoQuery: true,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'settleHeaderNum',
      label: intl.get(`sprm.common.model.common.settleHeaderNum`).d('开票单据编号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'settleStatusMeaning',
      label: intl.get(`sprm.common.model.common.settleStatusMeaning`).d('开票单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.settleTime`).d('开票单创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'netAmount',
      label: intl.get(`sprm.common.model.settle.netAmount`).d('结算总金额(不含税)'),
    },
    {
      name: 'settleTaxAmount',
      label: intl.get(`sprm.common.model.settle.settleTaxAmount`).d('结算总金额'),
    },
    {
      name: 'settleTaxIncludedAmount',
      label: intl.get(`sprm.common.model.settle.settleTaxIncludedAmount`).d('结算总金额(含税)'),
    },
    {
      name: 'invoicedNetAmount',
      label: intl.get(`sprm.common.model.settle.invoicedNetAmount`).d('已开票总金额(不含税)'),
    },
    {
      name: 'invoicedTaxAmount',
      label: intl.get(`sprm.common.model.settle.invoicedTaxAmount`).d('已开票税额'),
    },
    {
      name: 'invoicedTaxIncludedAmount',
      label: intl.get(`sprm.common.model.settle.invoicedTaxIncludedAmount`).d('开票金额(含税)'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`sprm.common.model.settle.currencyCode`).d('币种'),
    },
    {
      name: 'createdUserName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/bill-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.SETTLE_LIST',
        },
      };
    },
  },
});

const invoiceDs = (prLineId, uomPrecision) => ({
  pageSize: 20,
  autoQuery: true,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'invoiceNum',
      label: intl.get(`sprm.common.model.common.invoiceHeaderNum`).d('开票单据编号'),
    },
    {
      name: 'invoiceLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'invoiceStatusMeaning',
      label: intl.get(`sprm.common.model.common.invoiceStatusMeaning`).d('开票单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.invoiceTime`).d('开票单创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'taxInvoiceNum',
      label: intl.get(`sprm.common.model.invoice.taxInvoiceNum`).d('税务发票号'),
    },
    {
      name: 'taxWithoutAmount',
      label: intl.get(`sprm.common.model.invoice.taxWithoutAmount`).d('未税总额(系统)'),
    },
    {
      name: 'taxIncludedAmount',
      label: intl.get(`sprm.common.model.invoice.taxIncludedAmount`).d('发票总额'),
    },
    {
      name: 'supplierName',
      label: intl.get(`sprm.common.model.invoice.supplierName`).d('供应商名称'),
    },
    {
      name: 'taxIncludedAmountSystemMeaning',
      label: intl
        .get(`sprm.common.model.invoice.taxIncludedAmountSystemMeaning`)
        .d('含税总额(系统)'),
    },
    {
      name: 'taxAmount',
      label: intl.get(`sprm.common.model.invoice.taxAmount`).d('发票税额'),
    },
    {
      name: 'taxAmountSystemMeaning',
      label: intl.get(`sprm.common.model.invoice.taxAmountSystemMeaning`).d('税额(系统)'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`sprm.common.model.settle.currencyCode`).d('币种'),
    },
    {
      name: 'createName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'invoiceTitle',
      label: intl.get('sprm.common.model.common.kpBody').d('开票主体'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/old-bill-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.INVOICE_LIST',
        },
      };
    },
  },
});
const reconciliationDs = (prLineId, uomPrecision) => ({
  pageSize: 20,
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'settleNum',
      label: intl.get(`sprm.common.model.reconciliation.settleNum`).d('对账单编码-行号'),
    },
    {
      name: 'lineNum',
      label: intl.get(`sprm.common.model.common.docLineNum`).d('行号'),
    },
    {
      name: 'billStatusMeaning',
      label: intl.get(`sprm.common.model.reconciliation.billStatusMeaning`).d('对账单状态'),
    },
    {
      name: 'billHeaderCreationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.docCreateTime`).d('创建时间'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sprm.common.model.reconciliation.quantity`).d('本次对账数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'companyNum',
      label: intl.get(`sprm.common.model.payment.companyNum`).d('结算公司编码'),
    },
    {
      name: 'campMeaning',
      label: intl.get(`sprm.common.model.payment.campMeaning`).d('创建方阵营'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`sprm.common.model.settle.currencyCode`).d('币种'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.payment.companyName`).d('结算公司'),
    },
    {
      name: 'sourceSettleNum',
      label: intl.get(`sprm.common.model.payment.sourceSettleNum`).d('结算事务来源编号'),
    },
    {
      name: 'sourceSettleLineNum',
      label: intl.get(`sprm.common.model.payment.sourceSettleLineNum`).d('结算事务来源行号'),
    },
    {
      name: 'itemCode',
      label: intl.get(`sprm.common.model.payment.itemCode`).d('结算商品编码'),
    },
    {
      name: 'netPrice',
      label: intl.get(`sprm.common.model.payment.itemCode`).d('结算商品编码'),
    },
    {
      name: 'itemName',
      label: intl.get(`sprm.common.model.payment.itemName`).d('结算商品名称'),
    },
    {
      name: 'createdUserName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'netPrice',
      label: intl.get('sprm.common.model.payment.netPrice').d('单价（不含税）'),
    },
    {
      name: 'unitPriceBatch',
      label: intl.get('sprm.common.model.common.unitPriceBatch').d('每'),
    },
    {
      name: 'taxIncludedAmount',
      label: intl.get('sprm.common.model.reconciliation.taxIncludedAmount').d('金额（含税）'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/reconciliation-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.RECONCILIATION',
        },
      };
    },
  },
});
const paymentDs = (prLineId, uomPrecision) => ({
  pageSize: 20,
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'settleHeaderNum',
      label: intl.get(`sprm.common.model.payment.settleHeaderNum`).d('结算单编码-行号'),
    },
    {
      name: 'linenum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'settleStatusMeaning',
      label: intl.get(`sprm.common.model.common.docStatus`).d('单据状态'),
    },
    {
      name: 'settleHeaderCreationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.docCreateTime`).d('创建时间'),
    },
    {
      name: 'currencyCode',
      label: intl.get(`sprm.common.model.settle.currencyCode`).d('币种'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sprm.common.model.payment.paymentQuantity`).d('数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'createdUserName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'companyNum',
      label: intl.get(`sprm.common.model.payment.companyNum`).d('结算公司编码'),
    },
    {
      name: 'companyName',
      label: intl.get(`sprm.common.model.payment.companyName`).d('结算公司'),
    },
    {
      name: 'supplierCompanyName',
      label: intl.get(`sprm.common.model.payment.supplierCompanyName`).d('供应商'),
    },
    {
      name: 'campMeaning',
      label: intl.get(`sprm.common.model.payment.campMeaning`).d('创建方阵营'),
    },
    {
      name: 'settleHeaderPaymentAmount',
      label: intl.get(`sprm.common.model.payment.settleHeaderPaymentAmount`).d('付款总金额'),
    },
    {
      name: 'settleNum',
      label: intl.get(`sprm.common.model.payment.settleNum`).d('结算事务编号'),
    },
    {
      name: 'sourceSettleNum',
      label: intl.get(`sprm.common.model.payment.sourceSettleNum`).d('结算事务来源编号'),
    },
    {
      name: 'itemCode',
      label: intl.get(`sprm.common.model.payment.itemCode`).d('结算商品编码'),
    },
    {
      name: 'itemName',
      label: intl.get(`sprm.common.model.payment.itemName`).d('结算商品名称'),
    },
    {
      name: 'sourceSettleHeaderNum',
      label: intl.get(`sprm.common.model.payment.sourceSettleHeaderNum`).d('来源结算单编码'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/payment-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.PAYMENT_LIST',
        },
      };
    },
  },
});

const soldDs = (prLineId, uomPrecision) => ({
  pageSize: 20,
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'displayAsnNum',
      label: intl.get(`sprm.common.model.contectDoc.displayAsnNum`).d('发货单据编号'),
    },
    {
      name: 'displayAsnLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'creationName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.docCreateTime`).d('创建时间'),
    },
    {
      name: 'asnTypeCode',
      label: intl.get(`sprm.common.model.contectDoc.asnTypeCode`).d('发货单类型'),
    },
    {
      name: 'shipDate',
      type: 'date',
      label: intl.get(`sprm.common.model.contectDoc.shipDate`).d('发货时间'),
    },
    {
      name: 'expectedArriveDate',
      type: 'date',
      label: intl.get(`sprm.common.model.contectDoc.expectedArriveDate`).d('预计到货时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'expressNum',
      label: intl.get(`sprm.common.model.contectDoc.expressNum`).d('快递单号'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/slod-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.SOLD.LIST',
        },
      };
    },
  },
});

const siecProjectDs = (prLineId, uomPrecision) => ({
  autoQuery: false,
  selection: false,
  autoLocateFirst: false,
  pageSize: 20,
  fields: [
    {
      name: 'displayPrNum',
      label: intl.get(`sprm.common.model.prNum`).d('采购申请单号'),
    },
    {
      name: 'displayPrLineNum',
      label: intl.get(`sprm.common.model.displayLineNum`).d('采购申请行号'),
    },
    {
      name: 'projectNum',
      label: intl.get(`sprm.common.model.projectCode`).d('项目单据编号'),
    },
    {
      name: 'projectName',
      label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
    },
    { name: 'projectStatusMeaning' },
    {
      name: 'projectLineNum',
      label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
    },
    {
      name: 'projectStatus',
      label: intl.get(`sprm.common.model.common.projectInfoStatus`).d('项目单据状态'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`sprm.common.model.common.projectInfocreationTime`).d('项目创建时间'),
    },
    {
      name: 'executeQuantity',
      type: 'number',
      label: intl.get(`sprm.common.model.common.executeQuantity`).d('执行数量'),
      dynamicProps: {
        precision: () => {
          return uomPrecision ?? 10;
        },
      },
    },
    {
      name: 'createdByName',
      label: intl.get('entity.roles.creator').d('创建人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/purchase-platform/project-info-execution-detail/${prLineId}`,
        method: 'GET',
        data: {
          customizeUnitCode: 'SPRM.PURCHASE_PLAFORM_EXECUTION.SIECPRO.LIST',
        },
      };
    },
  },
});

export {
  byExcutionDs,
  projectDs,
  contractDs,
  ordertDs,
  asnDs,
  rcvDs,
  settleDs,
  bidDs,
  rfxDs,
  invoiceDs,
  reconciliationDs,
  paymentDs,
  soldDs,
  siecProjectDs,
};
