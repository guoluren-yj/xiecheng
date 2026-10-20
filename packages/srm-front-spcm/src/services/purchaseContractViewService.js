/*
 * contractMaintainService - 我发起的协议
 * @date: 2019-05-23
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  //   getResponse,
} from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// -获取列表数据
export async function queryList(params) {
  // const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/purchase-view/page`, {
    // query,
    query: parseParameters(params),
  });
}

/**
 * 归档
 * @param {*} params
 */
export async function archiveContract(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/archive-contract?customizeUnitCode=SPCM.PURCHASE_CONTRACT_VIEW.ARCHIVE`,
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

export async function uploads(params) {
  const { pcHeaderId, archiveAttachmentUuid } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/archive-uuid?archiveAttachmentUuid=${archiveAttachmentUuid}`,
    {
      method: 'PUT',
      // body: params,
    }
  );
}

/**
 * 查询协议阶段
 * @param {*} params
 */
export async function fetchStage(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/stage-accept/detail`, {
    query,
  });
}

/**
 * 查询执行单据
 * @param {*} params
 */
export async function fetchDocument(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/execute-bills/detail`,
    {
      query,
    }
  );
}

/**
 * 查询验收单据
 * @param {*} params
 */
export async function fetchAcceptDocument(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/subject-accept/detail`,
    {
      query,
    }
  );
}

/**
 * 查询执行单据
 * @param {*} params
 */
export async function fetchDetailList(params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-report/receiving/details`, {
    query,
  });
}

/**
 * 协议接口重推（该功能为权限性功能）
 * @param {*} params
 */
export async function reExportContract(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/gpp/interface-export`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 协议接口重推佣金系统（该功能为权限性功能）
 * @param {*} params
 */
export async function reExportCommission(params) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract/gpp/interface-export/commission`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 协议接口重推（该功能为权限性功能）
 * @param {*} params
 */
export async function reExportContractLock(params) {
  const { pcHeaderId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/pc-header/contract/lock/${pcHeaderId}/heavy-push`,
    {
      method: 'POST',
    }
  );
}

/**
 * 触发推送
 * @param {*} params
 */
export async function triggerPush(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/sync/pc-header-joint`, {
    method: 'POST',
    body: params,
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
 * 签署盖章
 * @param {*} params
 */
export async function signAndSeal(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract/sync/custom-function`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取同步列表Spa
 * @param {*} params
 */
export async function queryPushExternalSystemData(pcHeaderId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/inter-records/pcHeader/${pcHeaderId}`, {
    method: 'GET',
    query: {
      size: 100,
    },
  });
}
/**
 * 对于某一个定向重新推送
 * @param {*} params
 */
export async function againPushExternalSystemData(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/inter-records/retry`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 推送Sap失败数据
 * @param {*} params
 */
export async function contractPushExternalSystemData(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/inter-records/pcHeader/retry`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 下载附件，同步附件
 * @param {*} params
 */
export async function syncAttachment({ pcHeaderId, ...params }) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/meyer/purchase-contract/${pcHeaderId}/download-attachment`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 协议报告
 * @param {*} params
 */
export async function contractReport(pcHeaderId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/contract-report/execute/summary/${pcHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 技术报告下载
 * @param {*} params
 */
export async function downloadTechnicalReport(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/${pcHeaderId}/technology-report`,
    {
      method: 'POST',
    }
  );
}

/**
 * 公证处报告下载
 * @param {*} params
 */
export async function downloadNotaryOfficeReport(pcHeaderId) {
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/${pcHeaderId}/evidence-report`,
    {
      method: 'POST',
    }
  );
}
