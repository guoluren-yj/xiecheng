import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPRM } from '_utils/config';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const tableDs = () => ({
  selection: false,
  fields: [
    {
      name: 'prLineStatusCodeMeaning',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
      fixed: 'left',
    },
    {
      label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
      name: 'displayPrNum',
      type: 'string',
      fixed: 'left',
    },
    {
      label: intl.get(`${commonPrompt}.title`).d('标题'),
      name: 'title',
      fixed: 'left',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
      width: 100,
      name: 'displayLineNum',
      fixed: 'left',
      type: 'string',
    },
    // {
    //   label: intl.get('sprm.purchaseReqCreation.model.common.accountAssignType').d('账户分配类别'),
    //   name: 'accountAssignTypeCode',
    //   type: 'string',
    // },
    {
      label: intl.get('entity.item.code').d('物料编码'),
      name: 'itemCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
      name: 'prTypeName',
      type: 'string',
    },
    {
      label: intl.get('entity.item.name').d('物料名称'),
      name: 'itemName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.categoryName`).d('物料分类'),
      name: 'categoryName',
      type: 'string',
    },
    // {
    //   label: intl.get(`${commonPrompt}.itemAbcClass`).d('物料ABC属性'),
    //   name: 'itemAbcClass',
    //   type: 'string',
    // },
    {
      label: intl.get(`${commonPrompt}.quantity`).d('数量'),
      name: 'quantity',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.uomName`).d('单位'),
      name: 'uomName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
      name: 'currencyCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
      name: 'taxIncludedUnitPrice',
      align: 'right',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.unitPriceBatch`).d('每'),
      name: 'unitPriceBatch',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
      name: 'taxIncludedLineAmount',
      align: 'right',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.executionStrategyCode`).d('执行策略'),
      name: 'executionStrategyMeaning',
      type: 'string',
    },
    {
      name: 'changeOrderCode',
      type: 'string',
      label: intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态'),
    },
    {
      label: intl.get(`${commonPrompt}.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
      name: 'taxIncludedBudgetUnitPrice',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.referPrice`).d('参考价格'),
      name: 'referencePriceDisplayFlag',
      type: 'number',
    },
    {
      label: intl.get(`${commonPrompt}.budgetIoFlag`).d('预算内外标识'),
      name: 'budgetIoFlag',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
      name: 'requestDate',
      type: 'date',
    },
    {
      label: intl.get('entity.company.tag').d('公司'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get('entity.business.tag').d('业务实体'),
      name: 'ouName',
      type: 'string',
    },
    {
      label: intl.get('entity.organization.class.purchase').d('采购组织'),
      name: 'purchaseOrgName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
      name: 'purchaseAgentName',
      type: 'string',
    },
    {
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
      name: 'invOrganizationName',
      type: 'string',
    },
    // {
    //   label: intl.get(`${commonPrompt}.inventoryName`).d('库房'),
    //   name: 'inventoryName',
    //   type: 'string',
    // },
    {
      label: intl.get('entity.roles.proposer').d('申请人'),
      name: 'prRequestedName',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
      name: 'erpEditStatus',
      type: 'string',
      lookupCode: 'SPUC.PR_ERP_STATUS',
    },
    {
      label: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
      name: 'executionStatusMeaning',
      type: 'string',
    },
    {
      label: intl
        .get(`sprm.purchaseRequisitionAssign.model.common.executionBillNum`)
        .d('执行单据编号'),
      name: 'executionHeaderBillNum',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.handlePerson`).d('需求执行人'),
      name: 'executorName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
      name: 'creationDate',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      name: 'unitName',
      type: 'string',
    },
    {
      label: intl.get('entity.roles.creator').d('创建人'),
      name: 'creatorName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
      name: 'assignedDate',
      type: 'date',
    },
    {
      label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
      name: 'prSourcePlatformMeaning',
      type: 'string',
    },
    {
      label: intl.get('entity.attachment.tag').d('附件'),
      name: 'enclosure',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.projectCategory`).d('项目类别'),
      name: 'projectCategoryMeaning',
      type: 'string',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbs',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.projectNum`).d('项目号'),
      name: 'projectNum',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.projectName`).d('项目名称'),
      name: 'projectName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.supplierItemNum`).d('供应商料号'),
      name: 'supplierItemCode',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.supplierItemName`).d('供应商料号描述'),
      name: 'supplierItemName',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.itemModel`).d('型号'),
      name: 'itemModel',
      type: 'string',
    },
    {
      label: intl.get(`${commonPrompt}.itemSpecs`).d('规格'),
      name: 'itemSpecs',

      type: 'string',
    },
    {
      label: intl.get('hzero.common.button.operating').d('操作记录'),
      width: 100,
      name: 'operatorRecord',
      type: 'string',
    },
  ],
  // queryFields: [
  //   {
  //     name: 'displayPrNum',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.prNum`).d('申请编号'),
  //   },
  //   {
  //     name: 'companyId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.companyName`).d('公司'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.COMPANY',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.companyId,
  //   },
  //   {
  //     name: 'ouId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.entity`).d('业务实体'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.OU',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.ouId,
  //   },
  //   {
  //     name: 'purchaseOrgId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseOrgName`).d('采购组织'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.PURORG_CODE',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.purchaseOrgId,
  //   },
  //   {
  //     name: 'purchaseAgentId',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.purchaseAgent`).d('采购员'),
  //     type: 'object',
  //     lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
  //     lovPara: { organizationId },
  //     transformRequest: (value) => value && value.purchaseAgentId,
  //   },
  //   {
  //     name: 'createdDateStart',
  //     type: 'dateTime',
  //     label: intl.get(`sodr.orderMaintenanceEntry.model.common.creation.from`).d('创建时间从'),
  //     max: 'createdDateEnd',
  //     transformRequest: (value) => value && moment(value).format(DATETIME_MIN),
  //   },
  //   {
  //     name: 'createdDateEnd',
  //     type: 'dateTime',
  //     label: intl.get('hzero.common.creation.to').d('创建时间至'),
  //     min: 'createdDateStart',
  //     transformRequest: (value) => value && moment(value).format(DATETIME_MAX),
  //   },
  //   {
  //     name: 'prSourcePlatform',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.orderSource`).d('来源平台'),
  //     lookupCode: 'SPRM.SRC_PLATFORM',
  //     lovPara: { tenantId: organizationId },
  //   },
  //   {
  //     name: 'sourceBillTypeCode',
  //     type: 'string',
  //     label: intl.get(`sodr.orderMaintenanceEntry.model.common.sourceDoc`).d('单据来源'),
  //     lookupCode: 'SODR.DOC_SOURCE',
  //     lovPara: { tenantId: organizationId },
  //   },
  //   {
  //     name: 'displayLineNum',
  //     type: 'string',
  //     label: intl.get(`sodr.quotePurchaseRequisition.view.message.lineNumAndLine`).d('申请行号'),
  //   },
  //   {
  //     name: 'changeOrderCode',
  //     type: 'string',
  //     label: intl.get('sprm.common.model.autoOrderStatus').d('自动创建PO状态'),
  //     lookupCode: 'SPRM.PR_APPROVE.CHANGE_ORDER_STATUS',
  //     lovPara: { tenantId: organizationId },
  //   },
  // ],
  transport: {
    read: (values) => {
      const { data = {}, params = {} } = values;
      const newParams = {
        ...params,
        ...data,
      };
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-request/line/can-assign/page`,
        method: 'GET',
        data: {
          ...newParams,
          prLineStatusCode: 'ASSIGNED',
          erpControlFlag: 1,
          sort: 'displayLineNum,desc',
          customizeUnitCode:
            'SPRM.PURCHASE_REQUISITION_POLL.ALL_LIST,SPRM.PURCHASE_REQUISITION_POLL.SEARCH_BAR',
        },
      };
    },
  },
});

export { tableDs };
