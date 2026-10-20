/**
 * 风s事件报告
 * @date: 2024-02-06
 * @author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Zhenyun
 */
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 查询列表
 * @async
 * @function fetchRiskDetail
 * @param {Object} params - 查询风险事件报告详情
 */
export async function fetchRiskDetail(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/manual-plan-execute/basic-info`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 查询基础信息及动态卡片
 * @async
 * @function fetchRiskBasicInfo
 * @param {Object} params - 查询风险事件报告详情
 */
export async function fetchRiskBasicInfo(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/manual-plan-execute/execute-plan`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 征信风险信息
 * @param {*} params
 * @returns
 */
export async function fetchCreditRisk(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/manual-plan-execute/credit-risk-message`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 自然灾害风险信息
 * @param {*} params
 * @returns
 */
export async function fetchDisasterRisk(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/manual-plan-execute/disaster-risk-message`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 业务风险信息
 * @param {*} params
 * @returns
 */
export async function fetchBusinessRisk(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/manual-plan-execute/business-risk-message`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 动态卡片信息
 * @param {*} params
 * @returns
 */
export async function fetchDynamicCard(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/manual-plan-execute/overview`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 获取报告下载列表
 * @async
 * @function getDownLoadUrl
 * @param {Object} params - 查询参数
 */
export async function getDownLoadUrl(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/credit-qcc/download-url`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 添加企业
 * @async
 * @function fetchAddBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/monitor-company/add-monitor`,
    {
      method: 'POST',
      body: {
        ...params,
      },
    }
  );
}

/**
 * 监控管理 人员tab页 添加企业
 * @async
 * @function fetchAddBusiness2
 * @param {Object} params - 查询参数
 */
export async function fetchAddBusiness2(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/monitor-company/add-monitor`,
    {
      method: 'POST',
      body: {
        ...params,
      },
    }
  );
}

/**
 * 查询匹配到的企业
 * @async
 * @function fetchMatchBusiness
 * @param {Object} params - 查询参数
 */
export async function fetchMatchBusiness(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/monitor-enterprise/batch-fuzzy-search`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 查询租户添加的剩余额度
 * @async
 * @function fetchAddedCount
 * @param {Object} params - 查询参数
 */
export async function fetchAddedCount(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/monitor-enterprise/query-monitor-quota`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

/**
 * 查询动态展示的接口
 * @async
 * @function fetchDynamicUrl
 * @param {Object} params - 查询参数
 */
export async function fetchDynamicUrl(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/risk-scan/scan-scope`,
    {
      method: 'GET',
    }
  );
}

/**
 * 报表导出
 * @returns
 */
export async function fetchExportReport(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/risk-scan/export-pdf`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 报表导出
 * @returns
 */
export async function fetchExportReport2(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/manual-plan-execute/report-url`,
    {
      method: 'GET',
      query: params,
      responseType: 'text',
    }
  );
}

/**
 * 获取企业等级页面连接
 * @async
 * @function getBusinessLevelUrl
 * @param {Object} params - 查询参数
 */
export async function getBusinessLevelUrl(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId ||
      getCurrentOrganizationId()}/credit-qcc/risk-level-setting-url`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}

export async function queryIdpValue(params) {
  const { tenantId = '', lovCode = '' } = params;
  return request(
    `/hpfm/v1/${tenantId || getCurrentOrganizationId()}/lovs/value?lovCode=${lovCode}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 获取扫描报告相关信息
 * @param {*} params
 * @returns
 */
export async function fetchScanMessage(params) {
  const { tenantId = '' } = params;
  return request(
    `${SRM_DATA_SDAT}/v1/${tenantId || getCurrentOrganizationId()}/manual-plan-execute/scan-message
`,
    {
      method: 'GET',
      query: {
        ...params,
      },
    }
  );
}
