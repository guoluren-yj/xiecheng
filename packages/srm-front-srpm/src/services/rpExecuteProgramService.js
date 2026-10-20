import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_MDM, SRM_SRPM, SRM_SPRM, SRM_PLATFORM } from '_utils/config';

const SRM_IAM = '/iam';
const organizationId = getCurrentOrganizationId();

/**
 * 需求计划执行工作台-查各个tab的数量
 * */
export async function queryCount(params = {}) {
  const { ...otherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-execute/count`, {
    method: 'GET',
    query: otherParams,
  });
}
/**
 * 需求计划执行工作台-平衡处理tab列表 二级
 * */
export async function queryPendingMergeList(params = {}) {
  const { vtLineId, ...otherParams } = params;
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/pending-merge-list/${vtLineId}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * 需求计划执行工作台-平衡处理弹窗列表 二级
 * */
export async function queryBalanceMergeList(params = {}) {
  const { vtLineId, ...otherParams } = params;
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/balance-merge-list/${vtLineId}`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 需求计划执行工作台-计划平衡中-平衡处理列表
 * */

export async function queryBalanceList(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/balance-list`, {
    method: 'GET',
    query: { ...params },
  });
}

/**
 * 需求计划执行工作台-批量推送至平衡池
 * */
export async function batchPush(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan/batch-push`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 需求计划执行工作台-计划平衡中-退回
 * */
export async function batchSendBack(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-send-back`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 需求计划执行工作台-计划平衡中-合并
 * */
export async function batchMerge(params) {
  const { containerId, selectedData } = params;
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-merge?containerId=${containerId}`,
    {
      method: 'POST',
      body: selectedData,
    }
  );
}
/**
 * 需求计划执行工作台-计划平衡中-提交审批
 * */
export async function batchSubmit(params) {
  const { updateFlag, selectedData } = params;
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-submit?updateFlag=${updateFlag}`,
    {
      method: 'POST',
      body: selectedData,
    }
  );
}
/**
 * 需求计划执行工作台-计划平衡中-取消
 * */
export async function batchCancelMerge(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-cancel-merge`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 需求计划执行工作台-计划平衡中-合并确认 完成
 * */
export async function batchComplete(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-complete`, {
    method: 'POST',
    body: params,
  });
}

// 查询需求计划详情数据
export async function queryDetail(params) {
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/detail/${params.rpHeaderId}`,
    {
      method: 'GET',
      query: { customizeUnitCode: params.customizeUnitCode, ...params },
    }
  );
}

// 查询采购申请详情 头数据
export async function queryPrDetail(params) {
  const { unitCode, workFlowFlag } = params;
  return request(`${SRM_SPRM}/v1/${organizationId}/purchase-request/${params.prHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode: unitCode, workFlowFlag },
  });
}
// // 查询采购申请详情 行数据
// export async function queryPrLine(params) {
//   return request(`/spuc/v1/${organizationId}/purchase-request/${params.prHeaderId}/lines`, {
//     method: 'GET',
//   });
// }

/**
 * 需求计划执行工作台-已平衡待发放-退回
 * */
export async function batchBalanceSendBack(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/batch-send-back`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 需求计划执行工作台-已平衡待发放-计划发放
 * */
export async function batchRelease(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/batch-release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询开票方式
 * @param {Object} params
 */
export async function fetchPoLine(poLineId) {
  return request(`/spuc/v1/${organizationId}/po-line/${poLineId}`, {
    method: 'GET',
  });
}

/*
 * 查询物料自定义属性
 */
export async function customAttribute(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/purchase-requests/custom-attribute`, {
    method: 'GET',
    query: params,
  });
}

// 查询需求计划单行来源列表
export async function queryBlLineSource(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-execute/bl-line-source`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 需求计划单发放申请退回
 * */
export async function releaseSendBack(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/release-send-back`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 需求计划单发放申请提交
 * */
export async function releaseSubmit(params) {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/release-submit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询品类定义
 * @param {Object} params
 */
export async function fetchCategory(params) {
  const query = filterNullValueObject(parseParameters(params));
  const { itemId, ...otherQuery } = query;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/categories/${itemId}`, {
    method: 'GET',
    query: otherQuery,
  });
}

/**
 * 查询审批记录
 * @async
 * @returns {object} fetch Promise
 */
export async function fetchApproveHistory(blHeaderId) {
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-balance/workflow-history/${blHeaderId}`,
    {
      method: 'GET',
    }
  );
}

// 查询按钮权限信息
export async function fetchPermissions(permissionList) {
  return request(`${SRM_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: permissionList,
  });
}
/**
 * 需求计划执行工作台-计划平衡中-合并
 * */
export async function batchModify(params) {
  const { containerId, selectedData } = params;
  return request(
    `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-adjustment?containerId=${containerId}`,
    {
      method: 'POST',
      body: selectedData,
    }
  );
}

/**
 * 需求计划执行工作台-计划平衡中-拆分
 * */
export async function vtBalanceSplit(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/split`, {
    method: 'POST',
    body: selectedData[0],
    query: oherParams,
  });
}

// /**
//  * 需求计划执行工作台-平衡处理拆分弹窗列表 二级
//  * */
//  export async function queryBalanceSplitList(params = {}) {
//   const { vtLineId, ...otherParams } = params;
//   return request(
//     `${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/split-list/${vtLineId}`,
//     {
//       method: 'GET',
//       query: otherParams,
//     }
//   );
// }

/**
 * 需求计划平衡-虚拟单拆分-保存
 * */
export async function vtBalanceSplitSave(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/split-save`, {
    method: 'POST',
    body: selectedData,
    query: oherParams,
  });
}

/**
 * 需求计划平衡-虚拟单拆分-删除
 * */
export async function vtBalanceSplitDelete(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-split-delete`, {
    method: 'DELETE',
    body: selectedData,
    query: oherParams,
  });
}

/**
 * 需求计划平衡-虚拟单拆分-提交
 * */
export async function vtBalanceSplitSubmit(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-virtual/batch-split-submit`, {
    method: 'POST',
    body: selectedData,
    query: oherParams,
  });
}

/**
 * 需求计划执行工作台-计划发放中-拆分
 * */
export async function rpBalanceSplit(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/split`, {
    method: 'POST',
    body: selectedData[0],
    query: oherParams,
  });
}

/**
 * 需求计划执行工作台-计划发放中-保存
 * */
export async function rpBalanceSplitSave(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/split-save`, {
    method: 'POST',
    body: selectedData,
    query: oherParams,
  });
}

/**
 * 需求计划执行工作台-计划发放中-删除
 * */
export async function rpBalanceSplitDelete(params) {
  const { selectedData, ...oherParams } = params;
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-balance/batch-split-delete`, {
    method: 'DELETE',
    body: selectedData,
    query: oherParams,
  });
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  // const organizationId = getCurrentOrganizationId();
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

/**
 * 需求计划执行工作台-查询默认需求计划容器
 * */
export async function fetchDefaultContainer() {
  return request(`${SRM_SRPM}/v1/${organizationId}/request-plan-container/default`, {
    method: 'GET',
  });
}
