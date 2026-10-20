/**
 * service - 报表平台/报表定义
 * @date: 2018-11-22
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_RPT } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

// 打印模板预览
export async function printPreview(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/preview`
      : `${HZERO_RPT}/v1/print/preview`,
    {
      method: 'POST',
      body: params,
    },
    { encryptBody: true },
  );
}

// 查询报表详情
export async function fetchPrintReportDetail(reportId) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-reports/${reportId}`
      : `${HZERO_RPT}/v1/print-reports/${reportId}`,
    {
      method: 'GET',
    }
  );
}

// 新建报表
export async function createPrintReport(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-reports`
      : `${HZERO_RPT}/v1/print-reports`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 修改报表
export async function updatePrintReport(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-reports`
      : `${HZERO_RPT}/v1/print-reports`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 新建报表模板
export async function createPrintReportTemplate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates`
      : `${HZERO_RPT}/v1/print-templates`,
    {
      method: 'POST',
      body: params,
    },
    { encryptBody: true },
  );
}

// 新建报表模板
export async function updatePrintReportTemplate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/update`
      : `${HZERO_RPT}/v1/print-templates/update`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

// 查询模板详情
export async function fetchPrintTemplateDetail(templateId) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/${templateId}`
      : `${HZERO_RPT}/v1/print-templates/${templateId}`,
    {
      method: 'GET',
    }
  );
}

// 保存模板设计
export async function savePrintTemplateContent(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/save`
      : `${HZERO_RPT}/v1/print-templates/save`,
    {
      method: 'PUT',
      body: params,
    },
    { encryptBody: true },
  );
}

// 批量保存模板
export async function savePrintReportTemplate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/batch-edit`
      : `${HZERO_RPT}/v1/print-templates/batch-edit`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 查询目录树
export async function queryPrintDirectory() {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-directorys/tree`
      : `${HZERO_RPT}/v1/print-directorys/tree`,
    {
      method: 'GET',
    }
  );
}

// 创建目录
export async function createPrintDirectory(param) {
  return request(`${HZERO_RPT}/v1/print-directorys`, {
    method: 'POST',
    body: param,
  });
}

// 更新目录
export async function updatePrintDirectory(param) {
  return request(`${HZERO_RPT}/v1/print-directorys`, {
    method: 'PUT',
    body: param,
  });
}

// 创建单据
export async function createPrintDocument(param) {
  return request(`${HZERO_RPT}/v1/print-documents`, {
    method: 'POST',
    body: param,
  });
}

// 更新单据
export async function updatePrintDocument(param) {
  return request(`${HZERO_RPT}/v1/print-documents`, {
    method: 'PUT',
    body: param,
  });
}

export async function updatePrintDocumentTenant(param, { docId }) {
  return request(`${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-documents/${docId}/tenant`, {
    method: 'POST',
    body: param,
  });
}

export async function queryPrintDocumentsTenant({ docId }) {
  return request(`${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-documents/${docId}/tenant`, {
    method: 'GET',
  });
}

// 查询可添加模型字段
export async function queryCanAddModelField(docId) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-doc-condition-params/${docId}/can-be-add`
      : `${HZERO_RPT}/v1/print-doc-condition-params/${docId}/can-be-add`,
    {
      method: 'GET',
    }
  );
}

export async function saveDocumentParam(param) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-doc-condition-params`
      : `${HZERO_RPT}/v1/print-doc-condition-params`,
    {
      method: 'POST',
      body: param,
    }
  );
}

export async function deleteDocumentParam(param) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-doc-condition-params`
      : `${HZERO_RPT}/v1/print-doc-condition-params`,
    {
      method: 'DELETE',
      body: param,
    }
  );
}

export async function exportReportDataToJson(param) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/data-migrate/export`
      : `${HZERO_RPT}/v1/data-migrate/export`,
    {
      method: 'POST',
      responseType: 'text',
      body: param,
    }
  );
}

export async function queryReportDirectory(param) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/data-migrate/export-directory`
      : `${HZERO_RPT}/v1/data-migrate/export-directory`,
    {
      method: 'POST',
    }
  );
}

export async function importReportDataJson(param) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/data-migrate/import`
      : `${HZERO_RPT}/v1/data-migrate/import`,
    {
      method: 'POST',
      body: param,
      responseType: 'text',
    }
  );
}

export async function queryExportDataHistory() {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/data-migrate/log`
      : `${HZERO_RPT}/v1/data-migrate/log`,
    {
      method: 'POST',
    }
  );
}

export async function copyPrintReport(data) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-config/copy`
      : `${HZERO_RPT}/v1/print-config/copy`,
    {
      method: 'POST',
      body: data,
    }
  );
}

export async function queryPrintDocConditionParams(docId) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-doc-condition-params/${docId}`
      : `${HZERO_RPT}/v1/print-doc-condition-params/${docId}`,
    {
      method: 'GET',
    }
  );
}

export async function queryPrintTenantConfigs() {
  return request(`${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-tenant-configs`, {
    method: 'GET',
  });
}

export async function previewWordEditorTemplate(query) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print/word-editor-preview`
      : `${HZERO_RPT}/v1/print/word-editor-preview`,
    {
      method: 'POST',
      query,
      responseType: 'text',
    }
  ); 
}

export async function saveWordTemplate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/save-word`
      : `${HZERO_RPT}/v1/print-templates/save-word`,
    {
      method: 'PUT',
      body: params,
    },
    { encryptBody: true },
  ); 
}

export async function saveWordUploadTemplate({ params }) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-edit-templates/${params.templateId}/upload`
      : `${HZERO_RPT}/v1/print-edit-templates/${params.templateId}/upload`,
    {
      method: 'POST',
      query: params,
    }
  );
}

export async function resetWordPrintTemplate(params) {
  return request(
    isTenantRoleLevel()
      ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-templates/reset-word`
      : `${HZERO_RPT}/v1/print-templates/reset-word`,
    {
      method: 'PUT',
      body: params,
    }
  );
}