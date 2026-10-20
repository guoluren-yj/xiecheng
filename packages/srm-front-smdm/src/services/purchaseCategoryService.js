import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentTenant,
} from 'utils/utils';
import request from 'utils/request';
import { HZERO_FILE, HZERO_IAM } from 'utils/config';
import { SRM_MDM, SRM_PLATFORM } from '_utils/config';

/**
 * 查询采购品类的数据
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 */
export async function fetchPurchaseCategory(params) {
  const { organizationId, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 查询采购品类树
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 */
export async function fetchCategoryIds(params) {
  return request(`${SRM_MDM}/v1/${params.organizationId}/item-categories/parent-category-ids`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增或更新采购品类
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 * @param {String} params.ouId - 业务实体
 * @param {String} params.uomId - 计量单位
 * @param {String} params.uomId - 引入要求
 */
export async function updatePurchaseCategory(params) {
  const { organizationId, body, customizeUnitCode } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories`, {
    method: 'POST',
    query: { customizeUnitCode },
    body,
  });
}

/**
 * 启用品类
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 * @param {String} params.ouId - 业务实体
 * @param {String} params.uomId - 计量单位
 * @param {String} params.uomId - 引入要求
 */
export async function enableCategory(params) {
  return request(
    `${SRM_MDM}/v1/${params.organizationId}/item-categories/${params.categoryId}/enable`,
    {
      method: 'PUT',
      body: params.body,
    }
  );
}

/**
 * 禁用品类
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 * @param {String} params.ouId - 业务实体
 * @param {String} params.uomId - 计量单位
 * @param {String} params.uomId - 引入要求
 */
export async function disableCategory(params) {
  return request(
    `${SRM_MDM}/v1/${params.organizationId}/item-categories/${params.categoryId}/disable`,
    {
      method: 'PUT',
      body: params.body,
    }
  );
}

/**
 * 启用报价模板
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 * @param {String} params.ouId - 业务实体
 * @param {String} params.uomId - 计量单位
 * @param {String} params.uomId - 引入要求
 */
export async function enableTemplate(params) {
  const { organizationId, categoryId, ...other } = params;
  return request(
    `${SRM_MDM}/v1/${organizationId}/item-categories/${categoryId}/item-category-templates/disable`,
    {
      method: 'PUT',
      body: other,
    }
  );
}

/**
 * 禁用报价模板
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 * @param {String} params.categoryCode - 品类代码
 * @param {String} params.categoryName - 品类名称
 * @param {String} params.ouId - 业务实体
 * @param {String} params.uomId - 计量单位
 * @param {String} params.uomId - 引入要求
 */
export async function disableTemplate(params) {
  const { organizationId, categoryId, ...other } = params;
  return request(
    `${SRM_MDM}/v1/${organizationId}/item-categories/${categoryId}/item-category-templates/enable`,
    {
      method: 'PUT',
      body: other,
    }
  );
}

/**
 * 查询品类报价模板数据
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 */
export async function fetchTemplate(params) {
  return request(
    `${SRM_MDM}/v1/${params.organizationId}/item-categories/${params.categoryId}/cate-bid-template`,
    {
      method: 'GET',
    }
  );
}

/**
 * 复制品类报价模板数据
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 */
export async function CopyTemplate(params) {
  return request(
    `${SRM_MDM}/v1/${params.organizationId}/item-categories/${params.categoryId}/cate-bid-templates/${params.templateId}/duplication`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询品类报价模板行数据
 * @param {Object} params - 查询参数
 * @param {String} params.organizationId - 组织ID
 * @param {String} params.categoryId - 品类ID
 * @param {String} params.templateId - 模板ID
 */
export async function fetchTemplateList(params) {
  return request(
    `${SRM_MDM}/v1/${params.organizationId}/item-categories/${params.categoryId}/cate-bid-templates/${params.templateId}/cate-bid-options`,
    {
      method: 'GET',
      query: params.body,
    }
  );
}

/**
 * 新增报价模板
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.categoryId - 品类ID
 */
export async function createTemplate(params) {
  return request(
    `${SRM_MDM}/v1/${params.tenantId}/item-categories/${params.categoryId}/cate-bid-templates`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 编辑报价模板
 * @param {Object} params - 查询参数
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.categoryId - 品类ID
 */
export async function updateTemplate(params) {
  return request(
    `${SRM_MDM}/v1/${params.tenantId}/item-categories/${params.categoryId}/cate-bid-templates`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 查询uuid
 *
 * @export
 * @param {*} params 传递参数
 * @returns
 */
export async function queryUuid(params) {
  return request(`${HZERO_FILE}/v1/files/uuid`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 查询和品类关联的物料
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchMateriel(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assigns/category`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存和品类关联的物料
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveMateriel(params) {
  const { organizationId, categoryId, tableData } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assigns/save/${categoryId}`, {
    method: 'POST',
    body: tableData,
  });
}

/**
 * 删除和品类关联的物料
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function deleteMateriel(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assigns`, {
    method: 'DELETE',
    body: idList,
  });
}

/**
 * 查询分配采购
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function fetchAssignPurchase(params) {
  const organizationId = getCurrentOrganizationId();
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-purchasers`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 保存分配采购
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function saveAssignPurchase(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${SRM_MDM}/v1/${organizationId}/item-category-purchasers?customizeUnitCode=SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_LIST,SMDM.PURCHASE_CATEGORY_LIST.ASSIGNBUYER_SEARCH`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 删除分配采购
 *
 * @export
 * @param {Object} params
 * @returns
 */
export async function deleteAssignPurchase(params) {
  const organizationId = getCurrentOrganizationId();
  const { deleteList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-purchasers`, {
    method: 'DELETE',
    body: deleteList,
  });
}

export async function updateExcessDeliveryFlag(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/item-categories/disableExcessDelivery`, {
    method: 'PUT',
    query: params,
  });
}

export async function queryPermissions(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDateDefaultFlag(logicalDistinction) {
  const organizationId = getCurrentOrganizationId();
  const { tenantNum } = getCurrentTenant() || {};
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/spfm_tenant_logical_distinction/list-from-site`,
    {
      method: 'POST',
      body: {
        tenantNum,
        logicalDistinction,
      },
    }
  );
}
