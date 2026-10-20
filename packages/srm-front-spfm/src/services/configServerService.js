/*
 * configServerService - 配置中心
 * @date: 2018/10/13 11:39:25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import {
  getUserOrganizationId,
  getCurrentOrganizationId,
  getCurrentTenant,
  parseParameters,
  filterNullValueObject,
} from 'utils/utils';
import request from 'utils/request';
import {
  SRM_PLATFORM,
  SRM_SPUC,
  SRM_SSLM,
  SRM_SPCM,
  SRM_SQAM,
  SRM_MALL,
  SRM_SSRC,
  SRM_SPRM,
  SRM_FINANCE,
} from '_utils/config';

const organizationId = getUserOrganizationId();
const currentOrganizationId = getCurrentOrganizationId();

export async function fetchNewImport(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/import-erp-configs/noPage`, {
    method: 'GET',
    query: params,
  });
}

// 查询导入erp默认配置页面数据
export async function fetchImportErpDefault(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/import-erp-configs`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询配置
 */
export async function fetchSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'GET',
    body: params,
  });
}
/**
 * 保存配置
 */
export async function saveSettings(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 重置配置
 */
export async function resetSettings() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/settings/init`, {
    method: 'GET',
  });
}
/**
 * 保存外部屏蔽头行
 */
export async function saveOuterPriceShieldHeader(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/outer`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 查询内部控制
 */
export async function searchInnerList(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/inner`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 查询内部控制屏蔽组织
 */
export async function searchInnerShieldOrg({ shieldId }) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/inner/org`, {
    method: 'GET',
    query: {
      shieldId,
    },
  });
}
/**
 * 查询内部控制屏蔽品类
 */
export async function searchInnerShieldCategory({ shieldId }) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/inner/category`, {
    method: 'GET',
    query: {
      shieldId,
    },
  });
}
/**
 * 删除外部控制行
 */
export async function deleteInnerLines(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/inner`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 查询外部控制头
 */
export async function searchHeader(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/outer`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 查询外部控制行
 */
export async function searchLines(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/outer/sup`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 删除外部控制行
 */
export async function deleteLines(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/outer/sup`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 保存内部控制信息
 */
export async function saveInnerShieldInner(params) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/price-shield/inner`, {
    method: 'POST',
    body: params.newInnerControlList,
  });
}

export async function fetchOrderConfigList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-configs/paging`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

export async function saveOrderConfigList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-configs`, {
    method: 'POST',
    body: params,
  });
}

export async function deleteOrderConfigList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-change-configs`, {
    method: 'DELETE',
    body: params,
  });
}

export async function getMeaningCodes() {
  return request(`/hpfm/v1/${organizationId}/lovs/data?lovCode=SODR.PO_TABLE`, {
    method: 'GET',
  });
}

// 查询业务规则定义是否开启订单自动转协议
export async function getAutoSignEnable() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-header-signs/enable/po-to-pc`, {
    method: 'GET',
  });
}

export async function getConfigTypes() {
  return request(`/hpfm/v1/${organizationId}/lovs/data?lovCode=SODR.PO_CHANGE_CONFIG_TYPE`, {
    method: 'GET',
  });
}

/**
 * 查询对账及开票并单规则
 */
export async function queryDocMergeRulesList(params) {
  return request(`${SRM_FINANCE}/v1/${params.organizationId}/doc-merge-rules`, {
    method: 'GET',
    query: params,
  });
}

export async function saveDocMergeRule(params) {
  return request(`${SRM_FINANCE}/v1/${params.organizationId}/doc-merge-rules`, {
    method: 'PUT',
    body: params.editList,
  });
}

// 查询并单规则列表
export async function fetchAsnMergeRules(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-merge-rules`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

// 删除并单规则
export async function deleteAsnMergeRules(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-merge-rules`, {
    method: 'DELETE',
    body: params,
  });
}

// 保存并单规则
export async function saveAsnMergeRules(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-merge-rules`, {
    method: 'POST',
    body: params,
  });
}

// 查询租户级配置中心_接收事务类型数据
export async function fetchRcvTrxTypeList(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/receive-trx-type/bill-dimension`, {
    method: 'GET',
    query: param,
  });
}
// 采购事务类型配置-查看
export async function fetchRcvTrxTypeListPurchase(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPUC}/v1/${organizationId}/receive-trx-type`, {
    method: 'GET',
    query: param,
  });
}
// 查询租户级配置中心_接收事务类型数据
export async function fetchAccoutCheckList(params) {
  const param = parseParameters(params);
  return request(`${SRM_FINANCE}/v1/${organizationId}/validate-rules`, {
    method: 'GET',
    query: param,
  });
}

// 保存租户级配置中心_接收事务类型
export async function saveRcvTrxType(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/receive-trx-type/bill-dimension`, {
    method: 'POST',
    body: params,
  });
}
// 查询租户级配置中心_接收采购事务类型配置查看
export async function saveRcvTrxTypePurchase(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/receive-trx-type`, {
    method: 'POST',
    body: params,
  });
}
export async function saveAccountCheckList(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/validate-rules `, {
    method: 'PUT',
    body: params,
  });
}
export async function deleteAccountCheckList(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/validate-rules `, {
    method: 'DELETE',
    body: params,
  });
}

// 查询采购申请审批列表
export async function fetchPurchaseRequisitionApprovalList() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/approve-rules`, {
    method: 'GET',
  });
}

// 查询需求自动提交配置的默认采购员
export async function fetchDemandAutoSubmit(params) {
  const param = parseParameters(params);
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-submit-configs/list`, {
    method: 'GET',
    query: param,
  });
}

// 保存采购申请审批列表
export async function savePurchaseRequisitionApproval(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/approve-rules`, {
    method: 'POST',
    body: params,
  });
}

// 保存需求自动提交配置的默认采购员
export async function saveDemandAutoSubmit(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-submit-configs/batch-create-update`, {
    method: 'POST',
    body: params,
  });
}

// 删除采购申请审批列表
export async function deletePurchaseRequisitionApproval(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/approve-rules`, {
    method: 'DELETE',
    body: params,
  });
}

// 删除需求自动提交配置的默认采购员
export async function removeDemandAutoSubmit(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-submit-configs/batch-remove`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询采购申请回传列表
export async function fetchPurchaseRequisitionSendBackPurchaseRequest() {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/sync-configs/list`, {
    method: 'GET',
    // query: parseParameters(params),
  });
}

// 保存采购申请回传列表
export async function savefetchPurchaseRequisitionSendBackPurchaseRequest(params) {
  return request(
    `${SRM_SPRM}/v1/${organizationId}/purchase-request/sync-configs/batch-create-update`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 删除采购申请回传列表
export async function deletefetchPurchaseRequisitionSendBackPurchaseRequest(params) {
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/sync-configs/batch`, {
    method: 'DELETE',
    body: params,
  });
}

// 查询订单并单规则列表
export async function fetchOrderMergeRuleList() {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-merge-rule`, {
    method: 'GET',
  });
}

// 订单保存并单规则列表
export async function saveOrderMergeRule(body) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-merge-rule`, {
    method: 'POST',
    body,
  });
}

// 订单保存并单规则列表
export async function fetchSplitOrderRules(params) {
  const param = parseParameters(params);
  return request(`${SRM_MALL}/v1/${organizationId}/pur-req-merge-rules`, {
    method: 'GET',
    query: param,
  });
}

// 保存拆单规则列表
export async function saveSplitOrderRules(body) {
  return request(`${SRM_MALL}/v1/${organizationId}/pur-req-merge-rules`, {
    method: 'POST',
    body,
  });
}

// 查询供应商加入监控
export async function fetchSupplierAddMonitor(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-function`, {
    method: 'GET',
    query: params,
  });
}

// 保存供应商加入监控
export async function saveSupplierAddMonitor(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/monitor-function`, {
    method: 'POST',
    body: params.adds,
  });
}

// 查询风险扫描
export async function fetchRiskScan(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan`, {
    method: 'GET',
    query: params,
  });
}

// 保存导入erp默认 POST /v1/{organizationId}/import-erp-configs
export async function saveImportErpDefault(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/import-erp-configs`, {
    method: 'POST',
    body: params,
  });
}

// 保存风险扫描
export async function saveRiskScan(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/risk-scan`, {
    method: 'POST',
    body: params.adds,
  });
}

/**
 * 查询未分配供应商列表
 * @param {Object} params 修改参数
 */
export async function fetchNotPermitList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/electronic-sign/online-confirm-supplier/not-permit/pageSuppliers`,
    {
      method: 'GET',
      query: { ...query, tenantId: organizationId },
    }
  );
}

/**
 * 查询已分配供应商列表
 * @param {Object} params 修改参数
 */
export async function fetchPermitList(params) {
  const query = parseParameters(params);
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/electronic-sign/online-confirm-supplier/permit/page`,
    {
      method: 'GET',
      query: { ...query, tenantId: organizationId },
    }
  );
}

/**
 * 允许供应商在线确认
 * @param {Object} body 修改参数
 */
export async function handleAssign(body) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/electronic-sign/online-confirm-supplier/assign`,
    {
      body,
      method: 'POST',
    }
  );
}

/**
 * 取消供应商在线确认
 * @param {Object} body 修改参数
 */
export async function handleCancelAssign(body) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/electronic-sign/online-confirm-supplier/assign`,
    {
      body,
      method: 'DELETE',
    }
  );
}
/**
 * 查询是否开通电子签章/发票查验
 */
export async function fetchOpenResult({ applicationCode }) {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/application-market-client/open-result`, {
    method: 'GET',
    query: {
      applicationCode,
    },
  });
}
/**
 * 查询是否开通电子签章
 */
export async function inviteCompany() {
  return request(`${SRM_PLATFORM}/v1/${organizationId}/electronic-sign/invite-company`, {
    method: 'PUT',
  });
}
/**
 * 查询直连开票规则
 */
export async function directInvoiceRules(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-rule`, {
    method: 'GET',
    query,
  });
}
/**
 * 保存直连开票规则
 * @param {Object} body 修改参数
 */
export async function saveDirectInvoiceRules(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-rule`, {
    body,
    method: 'POST',
  });
}
/**
 * 删除直连开票规则
 * @param {Object} body 删除参数
 */
export async function deleteDirectInvoiceRules(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-rule`, {
    body,
    method: 'DELETE',
  });
}
/**
 * 直连开票规则明细查询
 */
export async function directInvoiceRulesDetails(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-rule/detail`, {
    query,
    method: 'GET',
  });
}
/**
 * 直连开票规则明细保存
 */
export async function saveDirectInvoiceRulesDetails(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-rule/detail`, {
    body,
    method: 'POST',
  });
}

/**
 * 直连开票基本信息
 */
export async function directInvoiceInfo(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-basics`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存直连开票基本信息
 * @param {Object} body 修改参数
 */
export async function saveDirectInvoiceInfo(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-basics`, {
    body,
    method: 'POST',
  });
}
/**
 * 删除直连开票基本信息
 * @param {Object} body 删除参数
 */
export async function deleteDirectInvoiceInfo(body) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/direct-invoice-basics`, {
    body,
    method: 'DELETE',
  });
}
/**
 * 采购协议数据来源
 */
export async function queryAgreementDataSource() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-sources`, {
    method: 'GET',
  });
}
/**
 * 订单评价配置查询
 * @param {Object} body 删除参数
 */
export async function queryOrderEvaluate(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-evaluation/config`, {
    query,
    method: 'GET',
  });
}
/**
 * 订单维护价格修改配置
 * @param {Object} query 查询参数
 */
export async function queryOrderPriceModifiable(param) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-price-change`, {
    query: param,
    method: 'GET',
  });
}
/**
 * 采购协议数据来源保存
 */
export async function saveAgreementDataSource(parmas) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-sources`, {
    body: parmas,
    method: 'POST',
  });
}
/**
 * 采购协议并单规则查询
 */
export async function queryAgreementMergeRule() {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-merge-rules`, {
    method: 'GET',
  });
}
/**
 * 采购协议并单规则查询
 */
export async function saveAgreementMergeRule(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-merge-rules`, {
    body: params,
    method: 'POST',
  });
}
/**
 * 订单评价配置保存
 * @param {Object} body 保存参数
 */
export async function saveOrderEvaluate(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-evaluation/config`, {
    body: params,
    method: 'POST',
  });
}
/**
 * 订单维护价格配置保存
 * @param {Object} query 保存参数
 */
export async function saveOrderPriceModifiable(param) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-price-change`, {
    body: param,
    method: 'POST',
  });
}

/**
 * 查询租户隐藏供应商角色表列表
 */
export async function fetchShieldNeedsInfList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1//${organizationId}/supplier-hide-roles`, {
    query,
    method: 'GET',
  });
}
/**
 * 删除供应商角色
 * @param {Object} body 删除参数
 */
export async function deleteShieldNeedsInf(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/supplier-hide-roles`, {
    body,
    method: 'DELETE',
  });
}

/**
 * 保存供应商角色
 * @param {Object} query 保存参数
 */
export async function saveShieldNeedsInf(param) {
  return request(`${SRM_SPRM}/v1/${organizationId}/supplier-hide-roles`, {
    body: param,
    method: 'POST',
  });
}

// 订单确认、反馈审核及回传ERP规则
export async function fetchoOrderConfirmRuleList(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-approve-rules`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
// 订单确认、反馈审核及回传ERP规则
export async function saveOrderConfirmRule(body) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-approve-rules/save`, {
    method: 'POST',
    body,
  });
}
/**
 * 查询扣款单默认值定义
 */
export async function fetchAutoDeductNote(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-payment-configs`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询扣款单默认值定义
 * @param {Object} body 修改参数
 */
export async function saveAutoDeductNote(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-payment-configs`, {
    body,
    method: 'POST',
  });
}

/**
 * 查询扣款单默认值定义
 * @param {Object} body 删除参数
 */
export async function deleteAutoDeductNote(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-payment-configs`, {
    body,
    method: 'DELETE',
  });
}

// 保存索赔单审批配置项
export async function fetchPointAndMethod() {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-approval-config/list`);
}

// 保存索赔单审批配置项
export async function savePointAndMethod(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-approval-config/save`, {
    body,
    method: 'POST',
  });
}

// 删除索赔单审批配置项
export async function deletePointAndMethod(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/claim-approval-config/delete`, {
    body,
    method: 'DELETE',
  });
}

// 保存整改报告审批配置项
export async function fetchProblemPointAndMethod() {
  return request(`${SRM_SQAM}/v1/${organizationId}/problem-approval-configs/list`);
}

// 保存整改报告审批配置项
export async function saveProblemPointAndMethod(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/problem-approval-configs/save`, {
    body,
    method: 'POST',
  });
}

// 删除整改报告审批配置项
export async function deleteProblemPointAndMethod(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/problem-approval-configs/delete`, {
    body,
    method: 'DELETE',
  });
}

/**
 * 查询最小下单金额定义列表
 */
export async function queryMinimumOrderAmountList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MALL}/v1/${organizationId}/min-purchase-configs`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询供应商列表
 */
export async function fetchSupplierList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MALL}/v1/${organizationId}/min-purchase-configs/tenant-supplier`, {
    method: 'GET',
    query,
  });
}

/**
 * 新增最小下单金额定义列表
 */
export async function addMinimumOrderAmount(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/min-purchase-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除最小下单金额定义列表
 */
export async function delMinimumOrderAmount(params) {
  return request(`${SRM_MALL}/v1/${organizationId}/min-purchase-configs`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询申请转寻源并单规则
 */
export async function fetchMergeSourceSet(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/turn-pr-merge-rule`, {
    method: 'GET',
    query,
  });
}

/**
 * 需求变更列表
 * @param {Object} query
 */
export async function fetchPurchaserUpdateFields(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-change-configs`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存申请转寻源并单规则
 * @param {Object} body 修改参数
 */
export async function saveMergeSourceSet(body) {
  return request(`${SRM_SSRC}/v1/${organizationId}/turn-pr-merge-rule`, {
    body,
    method: 'POST',
  });
}

/**
 * 需求变更列表保存
 */
export async function fetchPurchaserUpdateSave(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-change-configs`, {
    body,
    method: 'POST',
  });
}

// 查询质量对账数据来源
export async function fetchReconciliationSource(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/data-source-configs`, {
    method: 'GET',
    query: params,
  });
}

// 保存质量对账数据来源
export async function saveReconciliationSource(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/data-source-configs`, {
    method: 'POST',
    body: params,
  });
}

// 查询业务类别配置
export async function fetchBusinessType(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/business-type-configs`, {
    method: 'GET',
    query: params,
  });
}

// 保存业务类别配置
export async function saveBusinessType(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/business-type-configs`, {
    method: 'POST',
    body: params,
  });
}

// 删除质量对账数据来源
export async function deleteReconciliationSource(params) {
  return request(`${SRM_FINANCE}/v1/${organizationId}/data-source-configs`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 查询自动创建订单
 * @param {Object} query
 */
export async function queryModalList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/po-create-rules`, {
    method: 'GET',
    query,
  });
}

/**
 * 模态框保存修改
 * @async
 * @function update
 * @param {object}  body - 头数据
 * @returns {object} fetch Promise
 */
export async function updateSave(body) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-create-rules`, {
    method: 'POST',
    body: body.lines,
  });
}

/**
 * -模态框删除功能
 */
export async function deletes(params) {
  const { body } = params;
  return request(`${SRM_SPUC}/v1/${organizationId}/po-create-rules`, {
    method: 'DELETE',
    body,
  });
}

// 保存引用质检单创建定义查询条件
export async function fetchIncomingSearch() {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-search-configs/list`);
}

// 保存引用质检单创建定义查询条件
export async function saveIncomingSearch(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-search-configs/save`, {
    body,
    method: 'POST',
  });
}

// 删除引用质检单创建定义查询条件
export async function deleteIncomingSearch(body) {
  return request(`${SRM_SQAM}/v1/${organizationId}/incoming-search-configs/delete`, {
    body,
    method: 'DELETE',
  });
}

// 查询送货单数据来源
export async function fetchDeliverySource(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/auto-close-configs`, {
    method: 'GET',
    query: params,
  });
}

// 保存送货单数据来源
export async function saveDeliverySource(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/auto-close-configs/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询寻源事项
 */
export async function fetchSourceMatter(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSRC}/v1/${organizationId}/source-matter-conf`, {
    method: 'GET',
    query,
  });
}

/**
 * 保存寻源事项
 * @param {Object} body 修改参数
 */
export async function saveSourceMatter(body) {
  return request(`${SRM_SSRC}/v1/${organizationId}/source-matter-conf`, {
    body,
    method: 'POST',
  });
}

/**
 *需求变更同步
 */
export async function fetchPurchaserUpdateSync() {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-change-configs/sync`, {
    method: 'POST',
  });
}

/**
 * 查询送货单审批规则
 * @param {Object} body 修改参数
 */
export async function fetchDeliveryApprovalRules() {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-approve-config-header`, {
    method: 'GET',
  });
}

// 查询审批规则定义
export async function fetchApprovalRule() {
  return request(`${SRM_SPCM}/v1/${currentOrganizationId}/pc-approve-rules/list`, {
    method: 'GET',
  });
}

/**
 * 保存送货单审批规则
 * @param {Object} body 修改参数
 */
export async function saveDeliveryApprovalRules(body) {
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-approve-config-header/save`, {
    body,
    method: 'POST',
  });
}

/**
 * 保存审批规则定义
 * @param {*} parmas
 */
export async function saveApprovalRuleList(parmas) {
  return request(`${SRM_SPCM}/v1/${currentOrganizationId}/pc-approve-rules/save`, {
    body: parmas,
    method: 'POST',
  });
}

/**
 * 查看对账和开票参考价来源
 * @param {*} parmas
 */
export async function fetchSourcePrice(parmas) {
  return request(`${SRM_FINANCE}/v1/${parmas.tenantId}/reference-prices`);
}

/**
 * 保存对账和开票参考价来源
 * @param {*} parmas
 */
export async function saveSourcePrice(parmas) {
  const { tenantId, body } = parmas;
  return request(`${SRM_FINANCE}/v1/${tenantId}/reference-prices `, {
    method: 'PUT',
    body,
  });
}

// 获取新旧配置显示隐藏列表
export async function fetchNewOldConfigList(parmas) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/${parmas.tableCode}/list-from-site`,
    {
      method: 'POST',
      body: {
        tenant: parmas.tenant,
      },
    }
  );
}

/**
 * 查看协同模式定义
 * @param {*} parmas
 */
export async function fetchCollaboarationMode(params) {
  return request(`${SRM_FINANCE}/v1/${params.tenantId}/invoice-rules/query-rules`);
}

/**
 * 查看协同模式供应商列表
 * @param {*} parmas
 */
export async function fetchCollModeSupplier(params) {
  const { tenantId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-rule-details`, {
    method: 'GET',
    query,
  });
}

/**
 * 查看协同模式可添加供应商
 * @param {*} parmas
 */
export async function fetchRuleDetail(params) {
  const { tenantId, invoiceRuleId } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-rules/${invoiceRuleId}`);
}

/**
 * 查看协同模式可添加供应商
 * @param {*} parmas
 */
export async function fetchSupplierMulti(params) {
  const { tenantId, ...query } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-rule-details/add-supplier`, {
    method: 'GET',
    query,
  });
}

/**
 * 协同模式添加全部供应商
 * @param {*} parmas
 */
export async function includeSupplierAll(params) {
  const { tenantId, ...body } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-rules/include-all`, {
    method: 'POST',
    body,
  });
}

/**
 * 协同模式添加供应商
 * @param {*} parmas
 */
export async function saveCollModeSupplier(params) {
  const { tenantId, body } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-rule-details`, {
    method: 'POST',
    body,
  });
}

/**
 * 协同模式删除供应商
 * @param {*} parmas
 */
export async function delCollModeSupplier(params) {
  const { tenantId, body } = params;
  return request(`${SRM_FINANCE}/v1/${tenantId}/invoice-rule-details`, {
    method: 'DELETE',
    body,
  });
}

/**
 * 配置中心隐藏配置
 * @param {*} parmas
 */
export async function configHide(body = {}) {
  return request(
    `${SRM_PLATFORM}/v1/0/rel-table-records/spfm_config_center_hide/pageLogin?page=0&size=1000000`,
    {
      method: 'POST',
      body: {
        ...body,
        tenantNum: getCurrentTenant().tenantNum,
      },
    }
  );
}

/**
 * 需求变更删除字段
 * @param {*} parmas
 */
export async function deleteFields(body) {
  return request(`${SRM_SPRM}/v1/${organizationId}/pr-change-configs`, {
    method: 'DELETE',
    body,
  });
}
