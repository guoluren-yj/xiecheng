/**
 * service - 报价模板
 * @date: 2019-08-15
 * @version: 0.0.1
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { SRM_SSRC } from '_utils/config';
import { parseParameters, getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询报价模板
 */
export async function queryQuotationTemplate(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-templates`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询报价明细头
 */
export async function queryDetailHeader(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-templates/${params.templateId}`, {
    method: 'GET',
  });
}

/**
 * 保存报价模板
 */
export async function saveQuotationTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-templates`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 发布报价模板
 */
export async function releaseQuotationTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-templates/release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 解锁报价模板
 */
export async function unlockQuotationTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-templates/unlock`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询报价模板明细
 */
export async function queryTemplateDetail(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 自定义报价明细列
 */
export async function queryTemplateDetailRow(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-column/${param.templateId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 自定义报价明细项
 */
export async function fetchDetailElement(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-column/${param.templateId}/line`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 自定义报价明细项
 */
export async function fetchTwoDetails(params) {
  const param = parseParameters(params);
  return request(
    `${SRM_SSRC}/v1/${organizationId}/quotation-column/${param.templateId}/line/${param.templateDetailId}`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 查询自定义报价明细项
 */
export async function queryDetaliItem(params) {
  const param = parseParameters(params);
  const { templateId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-column/${param.templateId}/next`, {
    method: 'POST',
    body: otherParams.quotationColumns,
  });
}

/**
 * 保存报价模板明细
 */
export async function saveTemplateDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 保存自定义明细列
 */
export async function saveQuoRowDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl/column-save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存自定义明细列
 */
export async function saveQuoElementDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl/line-save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存自定义报价明细列
 */
export async function saveRowDetail(params) {
  const { templateId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-column/${templateId}/save`, {
    method: 'POST',
    body: otherParams.quotationColumns,
  });
}
/**
 * 保存自定义报价明细项
 */
export async function saveElementDetail(params) {
  const { templateId, ...otherParams } = params;
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl/${templateId}/save`, {
    method: 'POST',
    body: otherParams.quotationColumns,
  });
}

/**
 * 删除报价模板明细
 */
export async function deleteTemplateDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-column`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 删除报价模板明细
 */
export async function deleteElementDetail(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 改变启用
 */
export async function changeEnabledFlag(params) {
  return request(
    `${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl/${params.templateId}/enabled`,
    {
      method: 'POST',
      body: params.record,
    }
  );
}

/**
 * 查询品类树形结构
 */
export async function queryAssignCategory(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-dimensions/tempalteCategory`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询未分配物料
 */
export async function queryUndistributedMaterial(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-dimensions/assignableOfItem`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询已分配物料
 */
export async function queryAssignedMaterial(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-dimensions/assignedOfItem`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 删除当前物料
 */
export async function deleteMaterial(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-dimensions`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 新增当前物料
 */
export async function addMaterial(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-dimensions`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询可复制品类／物料列表
 */
export async function queryCopyData(params) {
  const param = parseParameters(params);
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-dimensions`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 复制模板
 */
export async function copyTemplate(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-templates/clone`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 调查模板明细组件属性列表
 */
export async function queryInvestigateConfigComponents(params) {
  return request(
    `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quotation-column-cmpts/${
      params.quotationColumnId
    }`,
    {
      method: 'GET',
    }
  );
}

/**
 * 修改调查模板明细组件属性
 */
export async function saveInvestigateConfigComponents(params) {
  return request(`${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quotation-column-cmpts/update`, {
    method: 'PUT',
    body: params.data,
  });
}

/**
 * 查询指定范围数据
 */
export async function fetchSummaryItems(params) {
  return request(`${SRM_SSRC}/v1/${organizationId}/quotation-tpl-dtl/lov/summary-items`, {
    method: 'GET',
    query: params,
  });
}
