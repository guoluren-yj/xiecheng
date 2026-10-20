/*
 * deliveryCreationService -协议类型管理
 * @date: 2019/05/14 15:41
 * @author: zuoxiangyu <xaingyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { SRM_SPCM, SRM_PLATFORM } from '_utils/config';
import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * -查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/page`, {
    method: 'GET',
    query: parseParameters({ ...params, tenantId: organizationId }),
  });
}

/**
 * -详情头查询
 * @param {String} pcTypeId - 头id
 */
export async function fetchHeader(pcTypeId) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}`, {
    method: 'GET',
    query: {
      customizeUnitCode: 'SPCM.CONTRACT.TYPE.DETAIL',
    },
  });
}

/**
 * -新增采购申请头
 * @async
 * @function add
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function add(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type`, {
    method: 'POST',
    query: {
      customizeUnitCode: 'SPCM.CONTRACT.TYPE.DETAIL',
    },
    body,
  });
}
/**
 * -更新采购申请头
 * @async
 * @function update
 * @param {object} body - 头数据
 * @returns {object} fetch Promise
 */
export async function update(body) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/batch`, {
    method: 'PUT',
    query: {
      customizeUnitCode: 'SPCM.CONTRACT.TYPE.DETAIL',
    },
    body,
  });
}
/**
 * -协议阶段行不分页查询
 * @param {String} params - 参数
 */
export async function fetchStage(params) {
  const { pcTypeId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-stage/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * -合作伙伴行不分页查询
 * @param {String} params - 参数
 */
export async function fetchPartner(params) {
  const { pcTypeId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-partner/list`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}
/**
 * -业务条款不分页查询
 * @param {String} params - 参数
 */
export async function fetchTerms(params) {
  const { pcTypeId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-term/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * -附件类型
 * @param {String} params - 参数
 */
export async function fetchAttachment(params) {
  const { pcTypeId, ...otherParams } = filterNullValueObject(parseParameters(params));
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/pc-attachment/page`,
    {
      method: 'GET',
      query: otherParams,
    }
  );
}

/**
 * 查询协议类型列表下的公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/company/page`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 查询生命周期控制列表
 * @param {Object} params - 查询参数
 */
export async function fetchLifeCycle(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/new/lifeCyclesStages`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 查询覆盖生命周期列表
 * @param {Object} params - 查询参数
 */
export async function fetchCoverLifeStage(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/cover-life-stage`, {
    method: 'PUT',
    query: { ...param },
  });
}

/**
 * 查询协议类型列表下的新增公司列表
 * @param {Object} params - 查询参数
 */
export async function fetchAddCompany(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/page/increase_company`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 保存协议类型列表下的新增公司
 * @param {Object} params - 查询参数
 */
export async function saveCompany(params) {
  const { pcTypeId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/config-company`,
    {
      method: 'POST',
      body: params.companyDataSource,
    }
  );
}
/**
 * 保存协议类型列表下的生命周期
 * @param {Object} params - 查询参数
 */
export async function saveLifeCycle(params) {
  const { pcTypeId } = params;
  return request(
    `${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/${pcTypeId}/lifeCyclesStages`,
    {
      method: 'PUT',
      body: params.lifeCyclesStagesList,
    }
  );
}

/**
 * 复制协议类型
 * @param {*} params
 */
export async function copyContractType(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type/copy-pcType`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除协议类型【合作伙伴、阶段、业务条款、附件行】
 * @param {*} params
 */
export async function deleteContractType(params) {
  const { ids, delType } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/purchase-contract-type`, {
    method: 'DELETE',
    query: { delType },
    body: ids,
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
