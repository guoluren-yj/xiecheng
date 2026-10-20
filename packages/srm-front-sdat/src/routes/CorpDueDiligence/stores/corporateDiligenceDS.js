/**
 * 企业尽职调查报告 DS
 */
import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { getEnvConfig } from 'utils/iocUtils';

import { SRM_DATA_SDAT } from '@/utils/config';

const { HZERO_HFLE } = getEnvConfig();

/**
 * 调查报告头列表 DS
 * @returns
 */
const DiligenceListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/report-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'recordId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.corporateDiligence.model.directoryGroup`).d('查询时间'),
      name: 'creationDate', // creationDate
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.companyName`).d('公司名称'),
      name: 'recordId', // companyName
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.reportType`).d('报告类型'),
      name: 'dataType',
      type: 'string',
      // lookupCode: 'SDAT.DUE_REPORT_TYPE',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskLevel`).d('风险等级'),
      name: 'riskLevel',
      type: 'string',
      // lookupCode: 'SDAT.RISK_LEVEL_TYPE',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.source`).d('来源'),
      name: 'resource',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.dueScore`).d('尽调评分'),
      name: 'reportScore',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskTitle`).d('风险标题'),
      name: 'title',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskDescription`).d('风险描述'),
      name: 'description',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskDetail`).d('报告预览'),
      name: 'operation',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 调查报告列表 DS
 * @returns
 */
const ListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/report-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'recordId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.corporateDiligence.model.directoryGroup`).d('查询时间'),
      name: 'creationDate', // creationDate
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.companyName`).d('公司名称'),
      name: 'recordId', // companyName
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.reportType`).d('报告类型'),
      name: 'dataType',
      type: 'string',
      // lookupCode: 'SDAT.DUE_REPORT_TYPE',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskLevel`).d('风险等级'),
      name: 'riskLevel',
      type: 'string',
      // lookupCode: 'SDAT.RISK_LEVEL_TYPE',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.source`).d('来源'),
      name: 'resource',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.dueScore`).d('尽调评分'),
      name: 'reportScore',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskTitle`).d('风险标题'),
      name: 'title',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.riskDescription`).d('风险描述'),
      name: 'description',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 调查报告列表 DS
 * @returns
 */
const MiningListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/report-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'recordId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.corporateDiligence.model.businessName`).d('公司名称'),
      name: 'companyName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.relatedName`).d('关联企业'),
      name: 'relatedName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.relatedType`).d('关联关系'),
      name: 'description',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * 调查报告列表 DS
 * @returns
 */
const MiningOneManyListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/report-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  // primaryKey: 'recordId',
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.corporateDiligence.model.relatedName`).d('关联企业'),
      name: 'title',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.businessName`).d('公司名称'),
      name: 'relatedName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.corporateDiligence.model.relatedType`).d('关联关系'),
      name: 'description',
      type: 'string',
    },
  ],
  events: {},
});

/**
 * fetchExportPdf: 导出PDF
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchExportPdf(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/file-download-url`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchGetPdfUrl: 获取文件链接
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchGetPdfUrl(params) {
  return request(`${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/file-url`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchPreview: 预览文件
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchPreview(params) {
  return request(`${HZERO_HFLE}/v1/${getCurrentOrganizationId()}/file/preview-with-token`, {
    method: 'GET',
    query: params,
  });
}

/**
 * fetchCompanyList: 查询公司列表
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchCompanyList(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/report-company`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询动态展示的列表
 * @param {*} params
 * @returns
 */
export async function fetchDynamicType(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/diligence-report/tenant-report-control`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * fetchGetMapData: 查询关系路径图数据
 * @param {Object} params 查询参数对象
 * @returns 请求Promise对象
 */
export async function fetchGetMapData(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/relation-mining-record/record-detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

export { DiligenceListDS, ListDS, MiningListDS, MiningOneManyListDS };
