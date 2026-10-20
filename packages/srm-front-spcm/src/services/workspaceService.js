import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  // getResponse,
} from 'utils/utils';
import { HZERO_HWFP } from 'utils/config';
import { SRM_SPCM, SRM_SSRC, SRM_SSLM, SRM_ADAPTOR, SRM_SPUC } from '_utils/config';

import { HZERO_PLATFORM } from 'utils/config';

const organizationId = getCurrentOrganizationId();

/**
 * 删除协议拟制
 * @async
 * @function deleteHeader
 * @param {object} params - 头数据
 * @returns {object} fetch Promise
 */
export async function deleteHeader(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract`, {
    method: 'DELETE',
    body: params,
  });
}
// 补充协议删除接口-废弃（统一用上面的deleteHeader）
export async function deleteHeaderControl(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control`, {
    method: 'DELETE',
    body: params,
  });
}

// 复制协议单据
export async function copyContract({ customizeUnitCode, ...body }) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${body.pcHeaderId}/contract-copy`,
    {
      method: 'POST',
      responseType: 'text',
      query: { customizeUnitCode },
      // 后端要求 body 不要传值，在 url 有 id 即可
    }
  );
}

/**
 * 协议退回
 * @param {Object} body
 */
export async function rollbackContract(body) {
  const { pcHeaderIds, backReason } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/stamped-back`, {
    method: 'POST',
    body: pcHeaderIds,
    query: { backReason },
  });
}

/**
 * 协议退回至供应商
 * @param {Object} body
 */
export async function rollbackToSupplier(body) {
  const { pcHeaderIds, backReason } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/supplier/stamped-back`, {
    method: 'POST',
    body: pcHeaderIds,
    query: { backReason },
  });
}

/**
 * 协议拟制详情头查询
 * @param {String} pcHeaderId - 头id
 */
export async function fetchHeader({ pcHeaderId, customizeUnitCode }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}

/**
 * 变更
 * @param {*} params
 */
export async function changeContract(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/alter-approval`, {
    method: 'POST',
    body: filterNullValueObject(body),
  });
}

/**
 * 协议终止是否受下游控制
 * @param {Array} pcHeaderIds 协议ID
 * @returns
 */
export async function terminateContractValid(pcHeaderIds) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/terminationCheck`, {
    method: 'POST',
    body: pcHeaderIds,
  });
}

/**
 * 终止
 * @param {*} params
 */
export async function terminateContract(params) {
  const { pcHeaderStatus, pcHeaderDetailDtos } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/change-status`, {
    method: 'PUT',
    query: { pcHeaderStatus },
    body: pcHeaderDetailDtos,
  });
}

/**
 * 归档
 * @param {*} params
 */
export async function archiveContract(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/archive-contract?customizeUnitCode=SPCM.WORKSPACE_COMMON.ARCHIVE`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 解约
 * @param {object} body 入参
 * @returns
 */
export async function breakOffContract(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/start-terminate-sign`, {
    method: 'POST',
    body,
  });
}

/**
 * 查询印章图片
 * @param {Object} body
 */
export async function querySealPictures(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询签署套餐类型（E签宝|法大大)
 * @param {Object} body
 */
export async function querySealType(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/sign/get-sign-type`, {
    method: 'GET',
    query: params,
  });
}

/**
 * -提交采购协议
 * @async
 * @function submit
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function submitContract({ pcHeaderList }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-submit`, {
    method: 'POST',
    query: {
      customizeUnitCode:
        'SPCM.WORKSPACE_DETAIL.HEADER,SPCM.WORKSPACE_DETAIL.SUBJECT,SPCM.WORKSPACE_DETAIL.STAGE,SPCM.WORKSPACE_DETAIL.PARTNER,SPCM.WORKSPACE_DETAIL.BUSINESSTERMS,SPCM.WORKSPACE_DETAIL.ATTACHMENT_FORM,SPCM.WORKSPACE_DETAIL.REBATE',
    },
    body: pcHeaderList,
  });
}

/**
 * 引用寻源结果创建
 */
export async function sourceCreate({ query, body }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/source-results/check-merge`, {
    method: 'POST',
    query,
    body,
  });
}

/**
 * 查询查看存证证明Url
 * @param params
 */
export function queryViewCertificateDeposit(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/sign/get-proof-link`, {
    responseType: 'text',
    query: params,
  });
}

/**
 * 作废
 * @param {*} params
 */
export async function invalidContract(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-control/invalid-approval`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 是否允许撤销
 * @param {*} params
 */
export async function operationRevoke(params) {
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag?revokeFlag=1`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 撤销审批
 * @param {*} params
 */
export async function revokeWorkflow(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-workflow/revoke-workflow`, {
    method: 'GET',
    query: params,
  });
}

/** 查询协议用章|协议签署时验证手机号
 * @param {*} params
 */
export async function fetchVerifyPhoneNum(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/query-phoneNum`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 无手机验证 签章
 * @param {Object} body
 */
export async function confirmChapter(body) {
  const { pcHeaderId } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/purchase-sign`, {
    method: 'POST',
    body,
  });
}

/**
 * 手机验证 签章
 * @param {Object} body
 */
export async function confirmMobileChapter(body) {
  const { pcHeaderId } = body;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/purchase-verified-sign`,
    {
      method: 'POST',
      body,
    }
  );
}

/**
 * 获取手机验证码
 * @param {Object} body
 */
export async function getVerifyCode(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/send-verified-code`, {
    method: 'POST',
    body,
  });
}

// -获取列表数据
export async function purchaseNeedVerified(params) {
  const { body } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/createPcOrder-verified`, {
    method: 'POST',
    body,
  });
}

/**
 * 查询采购订单
 * @param {*} params
 */
export async function checkCreatePo(params) {
  const { body } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/checkPo`, {
    method: 'POST',
    body,
  });
}

/**
 * 阶梯报价
 */
export async function fetchLadderOffer(quotationLineId) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/rfx/supplier/${quotationLineId}/ladder-quotation`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取所有的数量
 */
export async function workbenchCount() {
  return request(`${SRM_SPCM}/v1/${organizationId}/workbench/count`, {
    method: 'GET',
  });
}

/**
 * 历史版本列表
 */
export async function queryHistoryVersion(data) {
  const { pcHeaderId, ...otherData } = data;
  return request(`${SRM_SPCM}/v1/${organizationId}/workbench/${pcHeaderId}/version`, {
    method: 'GET',
    query: otherData,
  });
}

/**
 * 获取补充协议
 */
export async function querySupplements(data) {
  const { pcHeaderId, ...otherData } = data;
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-supplements/${pcHeaderId}/page`, {
    method: 'GET',
    query: {
      page: -1,
      ...otherData,
    },
  });
}

/**
 * 协议阶段行查询
 * @param {String} params - 参数
 */
export async function fetchStage(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/page`, {
    method: 'GET',
    query: otherParams,
  });
}

/**
 * 返利信息查询
 * @param {*} params
 */
export async function fetchContractRebate(params) {
  const { pcHeaderId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-rebate-informations/${pcHeaderId}/pc-rebate/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 查询在线编辑共享配置
 * @param {*} params
 */
export async function queryShareEditConfig() {
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/queryShareEditConfig`, {
    method: 'GET',
  });
}

/**
 * 生成预文本
 * @param {*} params
 */
export async function generatorPreFile(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/generatorFile`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询当前协议共享状态信息
 * @param {*} params
 */
export async function queryEditShare(params) {
  const { pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/${pcHeaderId}/queryEditShare`, {
    method: 'GET',
  });
}

/**
 * 更新协同信息
 * @param {*} params
 */
export async function updateEditShare(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/update`, {
    method: 'POST',
    body,
  });
}

/**
 * 查询对比信息
 * @param {*} params
 */
export async function queryBackContrast(params, body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/back-contrast`, {
    method: 'POST',
    query: params,
    body,
  });
}

/**
 * 查询对比信息 新
 * @param {*} params
 * @param {*} body
 * @returns
 */
export async function contractCompare(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/contract-compare`, {
    method: 'POST',
    body,
  });
}

/**
 * 更新选定文本区域
 * @param {*} params
 */
export async function updateEditText(body) {
  const { pcHeaderId } = body;
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/${pcHeaderId}/updateEditText`, {
    method: 'POST',
    body,
  });
}

/**
 * 可选对比文本列表
 * @param {*} params
 * @returns
 */
export async function getCompareList(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/compare-list`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 预文本退回
 * @param {*} params
 */
export async function preTextBack(params) {
  const { pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/${pcHeaderId}/preTextBack`, {
    method: 'POST',
  });
}

/**
 * 查询当前文本编辑状态
 * @param {*} params
 */
export async function queryPreTextFlag(params) {
  const { pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/edit-share/${pcHeaderId}/queryPreTextFlag`, {
    method: 'GET',
  });
}

/**
 * 查询工作流我的抄送流程信息
 * @param {*} params
 */
export async function queryCarbonCopyInfo(params) {
  const { processInstanceId } = params;
  return request(`/hwfp/v1/${organizationId}/instance/carbonCopy/${processInstanceId}`, {
    method: 'GET',
    query: {
      type: 'carbonCopy',
    },
  });
}

/**
 *查询采购/财务表单信息
 *FIXME: 接口待调整
 * @param {Object} params 查询参数
 */

export async function fetchPurchaseFormList(param = {}) {
  const params = {
    ...param,
    tenantId: organizationId,
    customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_HEADER',
  };
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync/selectSync`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询协议历史版本对比数据
 * @param {*} params
 */
export async function queryChangeInfo({ url, ...query }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/${url}`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询历史版本对比合同信息
 * @param {object} params pcHeaderId
 * @returns
 */
export async function queryCompareContract(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc-compare/get-compare-headers`, {
    method: 'GET',
    query: params,
  });
}

/**
 * rejectContract - 协议拒绝
 * @param {array} pcHeaderList
 * @returns
 */
export async function rejectContract(pcHeaderList) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/batch-supplier-sign-reject`, {
    method: 'POST',
    body: pcHeaderList,
  });
}

/**
 * 查询公司拓展信息
 * @export
 * @param {*} params
 */
export async function fetchPurchaseExtended(params) {
  const { companyId, pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/for-adaptor-change-partner`, {
    method: 'POST',
    body: { companyId, pcHeaderId },
  });
}

/**
 * 判断阶段原/本币币种是否和标的的一致
 * @param {string} pcHeaderId 协议头ID
 * @returns
 */
export async function checkStageCurrency(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/check-stage-currency`,
    {
      method: 'GET',
    }
  );
}

// 查询协议新功能白名单配置表
export async function queryNewFunctionWhiteList(params) {
  return request(
    `${SRM_ADAPTOR}/v1/${organizationId}/rel-table-records/spcm_new_function_white_list/page`,
    {
      method: 'POST',
      body: params,
      query: {
        page: 0,
        size: 10,
      },
    }
  );
}

/**
 * 获取配置表是否开启【智能合同提取控制】、是否在【附件合同在线编辑黑名单】
 * @returns
 */
export async function getExtractConfig() {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/open`, {
    method: 'GET',
  });
}

/**
 * 查询最新的智能提取任务状态
 * @param {*} params
 * @returns
 */
export async function queryLatestTask(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/query/latest-task`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 合同要素提取结果轮询获取
 * @param {*} body
 * @returns
 */
export async function extractPollResult(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/poll/result`, {
    method: 'POST',
    body,
  });
}

/**
 * 智能提取任务取消
 * @param {*} body
 * @returns
 */
export async function smartContractTaskCancel(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/cancel`, {
    method: 'POST',
    body,
  });
}

/**
 * 智能合同和引用数据对比接口
 * @param {*} body
 * @returns
 */
export async function extractCompareHeader(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/compare/header`, {
    method: 'POST',
    body,
  });
}

/**
 * getSmartContractTaskId - 获取智能摘要任务id
 * @param {array} pcHeaderList
 * @returns
 */
export async function getSmartContractTaskId(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/fetch-abstract`, {
    method: 'POST',
    body: params,
  });
}

/**
 * getSmartContractByTaskId - 获取智能摘要内容
 * @param {array} pcHeaderList
 * @returns
 */
export async function getSmartContractByTaskId(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/poll/abstract`, {
    method: 'GET',
    query: params,
  });
}

/**
 * saveSmartContract - 保存智能摘要
 * @param {array} pcHeaderList
 * @returns
 */
export async function saveSmartContract(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/smart-contract-task/update-abstract`, {
    method: 'POST',
    body: params,
  });
}

// 获取推荐供应商
export async function fetchRecommendSupplier(params) {
  return request(`${SRM_SPUC}/v1/${organizationId}/po-workbench/from-pr/default-supplier`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 创建签署任务
 * @export
 * @param {*} params
 */
export async function createSignTask(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/source-results/sync-lib`, {
    method: 'POST',
    body: params,
    query: { type: 7 },
  });
}

/**
 * 通过协议头id查询伙伴行信息
 */
export async function fetPartnerInfoByPcHeaderId(params) {
  const { pcHeaderId } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/integration-sign-nodes/${pcHeaderId}/partner`, {
    method: 'GET',
    query: params,
  });
}

/**
 * invalidSignedTask - 作废签署任务
 * @param {array} pcHeaderList
 * @returns
 */
export async function invalidSignedTask(params) {
  return request(`${SRM_SPCM}/v1/purchase-contract-fdd/${organizationId}/invalid`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 提交预校验
 */
export async function preSmartSubmitValid({ customizeUnitCode, pcHeaderList }) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/valid-submit`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: pcHeaderList,
  });
}

// ai审查
export async function executeAiApprove(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc/ai-approve-result/submit-task`, {
    method: 'POST',
    body: params,
  });
}

// ai审查
export async function queryAiApproveResult(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/pc/ai-approve-result/query-result`, {
    method: 'POST',
    body: params,
  });
}
