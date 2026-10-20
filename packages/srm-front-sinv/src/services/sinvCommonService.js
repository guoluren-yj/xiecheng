import { SRM_SPUC, SRM_MDM, SRM_PLATFORM } from '_utils/config';
import { HZERO_HWFP } from 'utils/config';
import request from 'utils/request';
import { parseParameters, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 送货单关闭操作记录列表
 * @async
 * @function fetchOperationRecordList
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.tenantId - 租户Id
 * @param {String} params.poHeaderId - 头Id
 * @returns {object} fetch Promise
 */
export async function fetchOperationRecordList(asnHeaderId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/action`, {
    method: 'GET',
    query,
  });
}

// 查询物流详情
export async function fetchLogistics(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/${params.asnHeaderId}/logistics/details`,
    {
      method: 'GET',
    }
  );
}

// 刷新物流
export async function handleRefreshLogistics(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/${params.asnHeaderId}/logistics/sync`,
    {
      method: 'GET',
    }
  );
}

// 导入类型查询
export async function fetchLeadTypeList(asnLineId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SPUC}/v1/${organizationId}/asn-lines/${asnLineId}/asnInterLineRecords`, {
    method: 'GET',
    query,
  });
}

// 导入类型查询
export async function againLeadTypeList(params) {
  const { asnLineId, ...others } = params;
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-lines/${asnLineId}/asnInterLineRecords/resend`,
    {
      method: 'POST',
      body: [others.record],
    }
  );
}

/**
 * 是否启动新版界面
 */
export async function queryNewTableEnable(params) {
  return request(
    `${SRM_SPUC}/v1/${organizationId}/asn-header/query/asnMenuType/${params.tenantNum}`,
    {
      method: 'GET',
      // query: params,
    }
  );
}

/**
 * 查询是否开启双单位配置
 * @param {moduleCode} moduleCode
 * @returns 0上下游都不开启双单位，1上下游和物流都开启双单位，2仅物流开启
 */

export async function queryDoubleUomConfig() {
  return request(`${SRM_SPUC}/v1/${organizationId}/sinv/secondary/query-cnf?moduleCode=sinv`, {
    method: 'GET',
  });
}

/**
 * 查询是否开启发货
 * @param {moduleCode} moduleCode
 * @returns true开启，false关闭
 */
export async function queryIsSlodConfig() {
  return request(`${SRM_SPUC}/v1/${organizationId}/rcv-common/delivery-enable/query`, {
    method: 'GET',
  });
}

/*
  secondaryQuantity：辅助数量
  primaryQuantity:基本数量
  businessKey：业务主键
  itemId:物料id
  doublePrimaryUomId:基本单位id
  secondaryUomId: 辅助单位id
*/
export async function queryDoubleUnitConversion(params) {
  return request(`${SRM_MDM}/v1/${organizationId}/items/uom/calculate/quantity`, {
    method: 'POST',
    body: params,
  });
}

// spfm/v1/30/cnf/do-execute?fullPathCode=SITE.SPFM.CALCULATION_METHOD
/**
 * 查询金额计算是按金额还是按单价，默认为按金额
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise
 */
export async function queryAmountCalcConfig(params) {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute?fullPathCode=SITE.SPFM.CALCULATION_METHOD`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 批量获取该工作流流程是否允许撤销
 * @param {object} params - 接口传参
 */
export async function fetchOperationFlag(params) {
  const { body, query } = params;
  return request(`${HZERO_HWFP}/v1/${organizationId}/runtime/prc/operation-flag`, {
    body,
    query,
    method: 'POST',
  });
}
