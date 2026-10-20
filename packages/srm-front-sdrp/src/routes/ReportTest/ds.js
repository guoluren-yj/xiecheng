import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_DATA_SDRP } from '@/utils/config';

const tenantId = getCurrentOrganizationId();

export default function ReportDs() {
  return {
    autoQuery: false,
    pageSize: 20,
    fields: [
      {
        label: intl.get('sdrp.fullLink.model.purchaseAgentName').d('采购员'),
        name: 'purchaseAgentName',
      },
      {
        label: intl.get('sdrp.fullLink.model.requestedName').d('申请人'),
        name: 'requestedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.prStatusMeaning').d('申请行状态'),
        name: 'prStatusMeaning',
        lovCode: 'SPRM.PR_STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.itemCode').d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.itemName').d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get('sdrp.fullLink.model.projectNum').d('项目号'),
        name: 'projectNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.uomName').d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get('sdrp.fullLink.model.quantity').d('申请数量'),
        name: 'quantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.currencyCode').d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.unitPrice').d('不含税单价'),
        name: 'unitPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.taxIncludedUnitPrice').d('含税单价'),
        name: 'taxIncludedUnitPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.lineAmount').d('不含税行金额'),
        name: 'lineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.taxIncludedLineAmount').d('含税行金额'),
        name: 'taxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.neededDate').d('需求日期'),
        name: 'neededDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.executedName').d('执行人'),
        name: 'executedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.creationDate').d('申请创建日期'),
        name: 'creationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.urgentFlagMeaning').d('是否加急(行)'),
        name: 'urgentFlagMeaning',
        lovCode: 'HPFM.FLAG',
      },
      {
        label: intl.get('sdrp.fullLink.model.costName').d('成本中心'),
        name: 'costName',
      },
      {
        label: intl.get('sdrp.fullLink.model.itemSpecs').d('规格'),
        name: 'itemSpecs',
      },
      {
        label: intl.get('sdrp.fullLink.model.wbsCode').d('wbs编码'),
        name: 'wbsCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.wbsName').d('wbs名称'),
        name: 'wbsName',
      },
      {
        label: intl.get('sdrp.fullLink.model.executionStrategyCode').d('执行策略'),
        name: 'executionStrategyCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.localCurrencyTaxUnit').d('本币含税单价'),
        name: 'localCurrencyTaxUnit',
      },
      {
        label: intl.get('sdrp.fullLink.model.localCurrencyNoTaxUnit').d('本币不含税单价'),
        name: 'localCurrencyNoTaxUnit',
      },
      {
        label: intl.get('sdrp.fullLink.model.localCurrencyTaxSum').d('本币含税金额'),
        name: 'localCurrencyTaxSum',
      },
      {
        label: intl.get('sdrp.fullLink.model.localCurrencyNoTaxSum').d('本币不含税金额'),
        name: 'localCurrencyNoTaxSum',
      },
      {
        label: intl.get('sdrp.fullLink.model.categoryCode').d('品类编码'),
        name: 'categoryCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.categoryName').d('品类名称'),
        name: 'categoryName',
      },
      {
        label: intl.get('sdrp.fullLink.model.prNumAndLineNum').d('申请编号'),
        name: 'prNumAndLineNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.displayPrNumAndDisplayLineNum').d('展示申请编号'),
        name: 'displayPrNumAndDisplayLineNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.title').d('申请标题'),
        name: 'title',
      },
      {
        label: intl.get('sdrp.fullLink.model.requestDate').d('申请日期'),
        name: 'requestDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.unitCode').d('所属部门编码'),
        name: 'unitCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.unitName').d('所属部门名称'),
        name: 'unitName',
      },
      {
        label: intl.get('sdrp.fullLink.model.ouCode').d('业务实体编码'),
        name: 'ouCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.ouName').d('业务实体名称'),
        name: 'ouName',
      },
      {
        label: intl.get('sdrp.fullLink.model.purchaseOrgCode').d('采购组织编码'),
        name: 'purchaseOrgCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.purchaseOrgName').d('采购组织名称'),
        name: 'purchaseOrgName',
      },
      {
        label: intl.get('sdrp.fullLink.model.sourcePlatformMeaning').d('来源平台'),
        name: 'sourcePlatformMeaning',
        lovCode: 'SPRM.SRC_PLATFORM',
      },
      {
        label: intl.get('sdrp.fullLink.model.createdName').d('申请创建人'),
        name: 'createdName',
      },
      {
        label: intl.get('sdrp.fullLink.model.headerUrgentFlagMeaning').d('是否加急(头)'),
        name: 'headerUrgentFlagMeaning',
        lovCode: 'HPFM.FLAG',
      },
      {
        label: intl.get('sdrp.fullLink.model.prTypeName').d('采购申请类型'),
        name: 'prTypeName',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastApprovedProcessDate').d('终次申请审核通过时间'),
        name: 'lastApprovedProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.quotedDate').d('报价时间'),
        name: 'quotedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.validExpiryDateFrom').d('报价有效期从'),
        name: 'validExpiryDateFrom',
      },
      {
        label: intl.get('sdrp.fullLink.model.validExpiryDateTo').d('报价有效期至'),
        name: 'validExpiryDateTo',
      },
      {
        label: intl.get('sdrp.fullLink.model.validQuotationPrice').d('有效报价含税单价'),
        name: 'validQuotationPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.suggestedFlagMeaning').d('是否中标'),
        name: 'suggestedFlagMeaning',
        lovCode: 'HPFM.FLAG',
      },
      {
        label: intl.get('sdrp.fullLink.model.allottedQuantity').d('分配数量'),
        name: 'allottedQuantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxTaxRate').d('税率'),
        name: 'rfxTaxRate',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentTypeName').d('付款方式'),
        name: 'paymentTypeName',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxItemCode').d('物料编码'),
        name: 'rfxItemCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxItemName').d('物料名称'),
        name: 'rfxItemName',
      },
      {
        label: intl.get('sdrp.fullLink.model.itemCategoryCode').d('品类编码'),
        name: 'itemCategoryCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.itemCategoryName').d('品类名称'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get('sdrp.fullLink.model.sourceTypeMeaning').d('寻源类型'),
        name: 'sourceTypeMeaning',
        lovCode: 'SSRC.SOURCE_TYPE',
      },
      {
        label: intl.get('sdrp.fullLink.model.sourceFromMeaning').d('询价来源'),
        name: 'sourceFromMeaning',
        lovCode: 'SSRC.SOURCE_FROM',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxSupplierCompanyNum').d('供应商公司编码'),
        name: 'rfxSupplierCompanyNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxSupplierCompanyName').d('供应商公司名称'),
        name: 'rfxSupplierCompanyName',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxNum').d('询价单单号'),
        name: 'rfxNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxStatusMeaning').d('询价单状态'),
        name: 'rfxStatusMeaning',
        lovCode: 'SSRC.RFX_STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxTitle').d('寻源标题'),
        name: 'rfxTitle',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxTemplateName').d('寻源模板'),
        name: 'rfxTemplateName',
      },
      {
        label: intl.get('sdrp.fullLink.model.sourceCategoryMeaning').d('寻源类别'),
        name: 'sourceCategoryMeaning',
        lovCode: 'SSRC.SOURCE_CATEGORY',
      },
      {
        label: intl.get('sdrp.fullLink.model.sourceMethodMeaning').d('询价方式'),
        name: 'sourceMethodMeaning',
        lovCode: 'SSRC.SOURCE_METHOD',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxPurchaseOrgCode').d('采购组织编码'),
        name: 'rfxPurchaseOrgCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxPurchaseOrgName').d('采购组织名称'),
        name: 'rfxPurchaseOrgName',
      },
      {
        label: intl.get('sdrp.fullLink.model.srhSourceTypeMeaning').d('寻源类型'),
        name: 'srhSourceTypeMeaning',
        lovCode: 'SSRC.SOURCE_TYPE',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentTermName').d('付款条款'),
        name: 'paymentTermName',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxReleaseDate').d('询价单发布日期'),
        name: 'rfxReleaseDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.srhSourceFromMeaning').d('询价单据来源'),
        name: 'srhSourceFromMeaning',
        lovCode: 'SSRC.SOURCE_FROM',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxCreationDate').d('询价单创建时间'),
        name: 'rfxCreationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxCreatedName').d('询价单创建人'),
        name: 'rfxCreatedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.quotationTypeMeaning').d('报价方式'),
        name: 'quotationTypeMeaning',
        lovCode: 'SSRC.QUOTATION_TYPE',
      },
      {
        label: intl.get('sdrp.fullLink.model.checkFinishedDate').d('核价完成日期'),
        name: 'checkFinishedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.quotationLineAmount').d('中标金额'),
        name: 'quotationLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxPurchaseAgentName').d('采购员'),
        name: 'rfxPurchaseAgentName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcItemCode').d('物料编码'),
        name: 'pcItemCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxLastSubmitProcessDate').d('核价提交时间'),
        name: 'rfxLastSubmitProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.rfxByUserName').d('询价员'),
        name: 'rfxByUserName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcItemName').d('物料名称'),
        name: 'pcItemName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcQuantity').d('协议行数量'),
        name: 'pcQuantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.taxRate').d('税率'),
        name: 'taxRate',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcUnitPrice').d('不含税单价'),
        name: 'pcUnitPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcTaxIncludedUnitPrice').d('含税单价'),
        name: 'pcTaxIncludedUnitPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcLineAmount').d('行金额'),
        name: 'pcLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcTaxIncludedLineAmount').d('含税行金额'),
        name: 'pcTaxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.deliverDate').d('交付日期'),
        name: 'deliverDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.enteredTaxIncludedPrice').d('原币含税单价'),
        name: 'enteredTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcName').d('协议名称'),
        name: 'pcName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcNum').d('协议编号'),
        name: 'pcNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcStatusCodeMeaning').d('采购协议状态'),
        name: 'pcStatusCodeMeaning',
        lovCode: 'SPCM.CONTRACT.STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcCompanyNum').d('公司编码'),
        name: 'pcCompanyNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcCompanyName').d('公司名称'),
        name: 'pcCompanyName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcKindCode').d('协议性质'),
        name: 'pcKindCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.supplierCompanyNum').d('供应商公司编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.supplierCompanyName').d('供应商公司名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get('sdrp.fullLink.model.confirmedDate').d('协议确认时间'),
        name: 'confirmedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcCreationDate').d('协议创建时间'),
        name: 'pcCreationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcCreatedName').d('协议创建人'),
        name: 'pcCreatedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcOuName').d('业务实体'),
        name: 'pcOuName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcPurchaseOrgCode').d('采购组织编码'),
        name: 'pcPurchaseOrgCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcPurchaseOrgName').d('采购组织名称'),
        name: 'pcPurchaseOrgName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcPurchaseAgentName').d('采购员'),
        name: 'pcPurchaseAgentName',
      },
      {
        label: intl.get('sdrp.fullLink.model.pcSourceCodeMeaning').d('协议来源'),
        name: 'pcSourceCodeMeaning',
        lovCode: 'SPCM.CONTRACT.SOURCE',
      },
      {
        label: intl.get('sdrp.fullLink.model.signDate').d('签订日期'),
        name: 'signDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.approvalMethodMeaning').d('协议变更审批方式'),
        name: 'approvalMethodMeaning',
        lovCode: 'SPCM.CONFIG.PC_APPROVAL_METHOD',
      },
      {
        label: intl.get('sdrp.fullLink.model.supplementFlagMeaning').d('是否是补充协议'),
        name: 'supplementFlagMeaning',
        lovCode: 'HPFM.FLAG',
      },
      {
        label: intl.get('sdrp.fullLink.model.releaseDate').d('协议发布日期'),
        name: 'releaseDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.archiveDate').d('协议归档日期'),
        name: 'archiveDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastConfirmedProcessDate').d('终次确认协议日期'),
        name: 'lastConfirmedProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastPublishedProcessDate').d('终次协议审批通过日期'),
        name: 'lastPublishedProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastSubmittedProcessDate').d('终次协议提交日期'),
        name: 'lastSubmittedProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastConfirmedReleaseDateDiff').d('协议审批耗时'),
        name: 'lastConfirmedReleaseDateDiff',
      },
      {
        label: intl.get('sdrp.fullLink.model.poStatusMeaning').d('订单行状态'),
        name: 'poStatusMeaning',
        lovCode: 'SODR.PO_STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.promiseDeliveryDate').d('承诺交货日期'),
        name: 'promiseDeliveryDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.poItemCode').d('物料编码'),
        name: 'poItemCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.poItemName').d('物料名称'),
        name: 'poItemName',
      },
      {
        label: intl.get('sdrp.fullLink.model.poUomName').d('单位'),
        name: 'poUomName',
      },
      {
        label: intl.get('sdrp.fullLink.model.poQuantity').d('订单行数量'),
        name: 'poQuantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.poUnitPrice').d('原币不含税单价'),
        name: 'poUnitPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.poEnteredTaxIncludedPrice').d('原币含税单价'),
        name: 'poEnteredTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.poLineAmount').d('不含税行金额'),
        name: 'poLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.poTaxIncludedLineAmount').d('含税行金额'),
        name: 'poTaxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.poTaxRate').d('税率'),
        name: 'poTaxRate',
      },
      {
        label: intl.get('sdrp.fullLink.model.poCurrencyCode').d('币种'),
        name: 'poCurrencyCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.poCostName').d('成本中心'),
        name: 'poCostName',
      },
      {
        label: intl.get('sdrp.fullLink.model.domesticTaxIncludedPrice').d('本币含税单价'),
        name: 'domesticTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.domesticUnitPrice').d('本币不含税单价'),
        name: 'domesticUnitPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.domesticTaxIncludedLineAmount').d('本币含税金额'),
        name: 'domesticTaxIncludedLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.domesticLineAmount').d('本币不含税金额'),
        name: 'domesticLineAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.poNumAndLineNum').d('订单编号'),
        name: 'poNumAndLineNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.orderTypeName').d('订单类型'),
        name: 'orderTypeName',
      },
      {
        label: intl.get('sdrp.fullLink.model.displayPoNumAndDisplayLineNum').d('展示订单编号'),
        name: 'displayPoNumAndDisplayLineNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.supplierCode').d('供应商编码'),
        name: 'supplierCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.supplierName').d('供应商名称'),
        name: 'supplierName',
      },
      {
        label: intl.get('sdrp.fullLink.model.termName').d('付款条款'),
        name: 'termName',
      },
      {
        label: intl.get('sdrp.fullLink.model.releasedDate').d('订单发布日期'),
        name: 'releasedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.poConfirmedDate').d('订单确认日期'),
        name: 'poConfirmedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.poCreationDate').d('订单创建日期'),
        name: 'poCreationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.poCreatedName').d('订单创建人'),
        name: 'poCreatedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.approvedReleasedDate').d('订单审核发布时间'),
        name: 'approvedReleasedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.taxAmount').d('订单行税额'),
        name: 'taxAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.poPurchaseAgentName').d('采购员'),
        name: 'poPurchaseAgentName',
      },
      {
        label: intl.get('sdrp.fullLink.model.trxDate').d('事务日期'),
        name: 'trxDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.taxIncludedAmount').d('含税行金额'),
        name: 'taxIncludedAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.trxUomName').d('单位'),
        name: 'trxUomName',
      },
      {
        label: intl.get('sdrp.fullLink.model.trxCreatedName').d('收货单创建人'),
        name: 'trxCreatedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.netAmount').d('不含税行金额'),
        name: 'netAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.trxQuantity').d('事务数量'),
        name: 'trxQuantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.trxNum').d('收货单号'),
        name: 'trxNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.displayTrxNum').d('展示收货单号'),
        name: 'displayTrxNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.settleNum').d('结算事务编号'),
        name: 'settleNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.billQuantity').d('本次对账数量'),
        name: 'billQuantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.netPrice').d('不含税单价'),
        name: 'netPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.taxIncludedPrice').d('含税单价'),
        name: 'taxIncludedPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.billNetAmount').d('不含税金额'),
        name: 'billNetAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.billTaxIncludedAmount').d('含税金额'),
        name: 'billTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.billNum').d('对账单编码'),
        name: 'billNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.billStatusMeaning').d('对账单状态'),
        name: 'billStatusMeaning',
        lovCode: 'SDRP.AUTO_BILL_PROCESS_STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.billCreationDate').d('对账单创建时间'),
        name: 'billCreationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastSubmitProcessDate').d('对账单终次提交操作时间'),
        name: 'lastSubmitProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastConfirmProcessDate').d('对账单终次确认操作时间'),
        name: 'lastConfirmProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceQuantity').d('本次开票数量'),
        name: 'invoiceQuantity',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceNetPrice').d('不含税单价'),
        name: 'invoiceNetPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceTaxIncludedPrice').d('含税单价'),
        name: 'invoiceTaxIncludedPrice',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceNetAmount').d('不含税金额'),
        name: 'invoiceNetAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceTaxIncludedAmount').d('含税金额'),
        name: 'invoiceTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceTaxRate').d('税率'),
        name: 'invoiceTaxRate',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceTaxAmount').d('税额'),
        name: 'invoiceTaxAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceSettleNum').d('发票结算单编号'),
        name: 'invoiceSettleNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.settleStatusMeaning').d('发票结算单状态'),
        name: 'settleStatusMeaning',
        lovCode: 'SSTA.SETTLE_STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceCreationDate').d('发票创建时间'),
        name: 'invoiceCreationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceCreatedName').d('发票创建人'),
        name: 'invoiceCreatedName',
      },
      {
        label: intl.get('sdrp.fullLink.model.submittedDate').d('发票提交日期'),
        name: 'submittedDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceLastSubmitProcessDate').d('发票终次提交时间'),
        name: 'invoiceLastSubmitProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.invoiceLastConfirmProcessDate').d('发票终次确认时间'),
        name: 'invoiceLastConfirmProcessDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentNetAmount').d('不含税金额'),
        name: 'paymentNetAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentTaxIncludedAmount').d('含税金额'),
        name: 'paymentTaxIncludedAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentAmount').d('本次付款金额'),
        name: 'paymentAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.paidAmount').d('已付款金额'),
        name: 'paidAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.remainingPaymentAmount').d('剩余付款金额'),
        name: 'remainingPaymentAmount',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentSettleNum').d('付款结算单编号'),
        name: 'paymentSettleNum',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentSettleStatusMeaning').d('付款结算单状态'),
        name: 'paymentSettleStatusMeaning',
        lovCode: 'SSTA.SETTLE_STATUS',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentCurrencyCode').d('币种'),
        name: 'paymentCurrencyCode',
      },
      {
        label: intl.get('sdrp.fullLink.model.paymentCreationDate').d('付款创建时间'),
        name: 'paymentCreationDate',
      },
      {
        label: intl.get('sdrp.fullLink.model.lastApproveProcessDate').d('付款终次审核通过时间'),
        name: 'lastApproveProcessDate',
      },
    ],
    transport: {
      read: ({ params }) => {
        return {
          url: `${SRM_DATA_SDRP}/v1/${tenantId}/full-link/report/full-link`,
          method: 'POST',
          params: {
            ...params,
          },
        };
      },
    },
  };
}
