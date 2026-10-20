/**
 * service - 物料定义
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { SRM_MDM, SRM_PLATFORM } from '_utils/config';
import { parseParameters, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

const SRM_IAM = '/iam';
const tenantId = getCurrentOrganizationId();
/**
 * 查询物料列表
 * @async
 * @function queryMateriel
 * @param {String} params.itemCode - 物料编码
 * @param {String} params.itemName - 物料名称
 * @param {String} params.commonName - 通用名
 * @param {Number} params.enabledFlag - 是否显示失效物料
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function fetchMaterielApplicationList(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-headers`, {
    method: 'GET',
    query: param,
  });
}
/**
 *查询物料明细
 * @async
 * @function queryDetail
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @returns fetch Promise
 */
export async function queryDetail(params) {
  const { organizationId, itemReqHeaderId, ...otherParams } = params;
  const param = filterNullValueObject(parseParameters(otherParams));
  return request(`${SRM_MDM}/v1/${organizationId}/item-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 *查询自定义物品属性
 * @async
 * @function queryAttribute
 * @function queryDetail
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @returns fetch Promise
 */
export async function queryAttribute(params) {
  const { organizationId, itemReqHeaderId, page, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-attribute-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: {
      ...param,
      customizeUnitCode:
        'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.EDITFORM,SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.TABLE',
    },
  });
}
/**
 * 删除自定义物品属性数据
 * @async
 * @function deleteAttributeTableData
 * @param {Array} params.idList - 属性主键
 * @returns fetch Promise
 */
export async function deleteAttributeTableData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-attribute-reqs`, {
    method: 'DELETE',
    body: [...idList],
  });
}
/**
 * 删除客户物料
 * @async
 * @function deletePartnerTableData
 * @param {Array} params.idList - 客户物料主键
 * @returns fetch Promise
 */
export async function deletePartnerTableData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-partner-rel-reqs`, {
    method: 'DELETE',
    body: [...idList],
  });
}
/**
 * 删除自定义品类分配定义
 * @async
 * @function deleteCategoryTableData
 * @param {Array} params.idList - 自定义品类分配定义主键
 * @returns fetch Promise
 */
export async function deleteCategoryTableData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assign-reqs`, {
    method: 'DELETE',
    body: [...idList],
  });
}
/**
 * 删除所属组织
 * @async
 * @function deleteAffiatedTableData
 * @param {Array} params.idList - 所属组织主键
 * @returns fetch Promise
 */
export async function deleteAffiatedTableData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-rel-reqs`, {
    method: 'DELETE',
    body: [...idList],
  });
}
/**
 * 删除附件
 * @async
 * @function deleteEnclosureTableData
 * @param {Array} params.idList - 附件主键
 * @returns fetch Promise
 */
export async function deleteEnclosureTableData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-attachment-reqs`, {
    method: 'DELETE',
    body: [...idList],
  });
}

/**
 * 保存所有数据
 * @async
 * @function saveAll
 * @param {object} params - 所有数据
 * @returns fetch Promise
 */
export async function saveAll(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-headers`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: { ...other },
  });
}

/**
 * 提交所有数据
 * @async
 * @function fetchSubmit
 * @param {object} params - 所有数据
 * @returns fetch Promise
 */
export async function fetchSubmit(params) {
  const { organizationId, customizeUnitCode, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-headers/submit`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: other,
  });
}

/**
 * 批量提交
 * @async
 * @function batchSubmit
 * @param {object} params - 所有数据
 * @returns fetch Promise
 */
export async function batchSubmit(params) {
  const { organizationId, customizeUnitCode, selectedRows } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-headers/batch-submit`, {
    method: 'PUT',
    query: { customizeUnitCode },
    body: selectedRows,
  });
}

/**
 * 批量删除
 * @async
 * @function batchDelete
 * @param {object} params - 所有数据
 * @returns fetch Promise
 */
export async function batchDelete(params) {
  const { organizationId, selectedRows } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-headers/batch/delete`, {
    method: 'POST',
    body: selectedRows,
  });
}

/**
 * 大删除
 * @async
 * @function saveAll
 * @param {object} params - 所有数据
 * @returns fetch Promise
 */
export async function fetchDelete(params) {
  const { itemReqHeaderId } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-req-headers/${itemReqHeaderId}`, {
    method: 'DELETE',
  });
}

/**
 * 启用作废
 * @async
 * @function enabledFlag
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @param {String} params.interfaceName - 接口名
 * @param {Number} params.objectVersionNumber - 版本号
 * @returns fetch Promise
 */
export async function enabledFlag(params) {
  const { organizationId, itemReqHeaderId, interfaceName, objectVersionNumber } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/items/${interfaceName}/${itemReqHeaderId}`, {
    method: 'POST',
    query: { objectVersionNumber },
  });
}
/**
 * 查询客户物品表数据
 * @async
 * @function queryPartner
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function queryPartner(params) {
  const { organizationId, itemReqHeaderId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-partner-rel-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询自主品类分配物品
 * @async
 * @function queryCategory
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function queryCategory(params) {
  const { organizationId, itemReqHeaderId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assign-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询所属组织
 * @async
 * @function queryAffliated
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function queryAffliated(params) {
  const { organizationId, itemReqHeaderId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-rel-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: {
      ...param,
      customizeUnitCode: 'SMDM_MATERIELAPPLICATION_ORG.EDITFORM,SMDM_MATERIELAPPLICATION_ORG.TABLE',
    },
  });
}
/**
 * 查询附件
 * @async
 * @function queryEnclosure
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @returns fetch Promise
 */
export async function queryEnclosure(params) {
  const { organizationId, itemReqHeaderId, page, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-attachment-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: {
      ...other,
      customizeUnitCode:
        'SMDM_MATERIELAPPLICATION_ATTACHMENT.LIST,SMDM_MATERIELAPPLICATION_ATTACHMENT.EDIT_FROM',
    },
  });
}

/**
 * 删除文件服务器中的文件
 * @async
 * @function onDraggerUploadRemove
 * @param {String} params.bucketName - 文件夹名
 * @param {Array} params.urls - 文件url
 * @returns fetch Promise
 */
export async function onDraggerUploadRemove(params) {
  const { organizationId, bucketName, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-url`, {
    method: 'POST',
    query: { bucketName },
    body: urls,
  });
}
/**
 * 检验字段是否唯一
 * @async
 * @function checkValid
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @param {String} params.key - 校验的key
 * @param {String} params.value - 校验的Value
 * @param {String} params.key1 - 校验的第二个key
 * @param {String} params.value1 - 校验的第二个Value
 * @returns fetch Promise
 */
export async function checkValid(params) {
  const { organizationId, itemReqHeaderId, key, value, key1, value1 } = params;
  const obj = { [key]: value, [key1]: value1 };
  let interfaceName = '';
  switch (key) {
    case 'itemCode':
      interfaceName = 'items/valid';
      break;
    case 'partnerCompanyId':
      interfaceName = `item-partner-rels/${itemReqHeaderId}/valid`;
      break;
    // case 'partneritemReqHeaderId':
    //   interfaceName = `item-partner-rels/${itemReqHeaderId}/valid`;
    //   break;
    case 'categoryId':
      interfaceName = `item-category-assign-reqs/${itemReqHeaderId}/valid`;
      break;
    case 'relOrganizationId':
      interfaceName = `item-org-rel-reqs/${itemReqHeaderId}/valid`;
      break;
    default:
      break;
  }
  return request(`${SRM_MDM}/v1/${organizationId}/${interfaceName}`, {
    method: 'POST',
    query: { ...obj },
  });
}

// 税收树形菜单查询
export async function queryTreeData(params) {
  const { organizationId, ...rest } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/tax-items`, {
    method: 'GET',
    query: rest,
  });
}

// 税收列表菜单查询
export async function queryTaxationData(params) {
  const { organizationId, ...rest } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/tax-items/contents`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters(rest)),
  });
}

/**
 * 查询所有组织
 * @async
 * @function queryAffliated
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function querAllOrg(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/inv-organizations`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 查询物料关联关系
 * @async
 * @function queryEnclosure
 * @param {Number} params.itemReqHeaderId - 物料Id
 * @returns fetch Promise
 */
export async function queryItemOrgUom(params) {
  const { organizationId, itemReqHeaderId } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-uom-reqs/${itemReqHeaderId}`, {
    method: 'GET',
    query: { customizeUnitCode: 'SMDM_MATERIELAPPLICATION_EDIT.UOM_LIST_NEW' },
  });
}

/**
 * 单位转换关系校验
 * @async
 * @function saveAll
 * @param {object} params - 所有数据
 * @returns fetch Promise
 */
export async function uomValid(params) {
  const { organizationId, itemReqHeaderId, value } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-uoms/${itemReqHeaderId}/valid`, {
    method: 'POST',
    body: { ...value },
  });
}

/**
 * 创建变更申请单
 * @param {object} params
 */
export async function fetchCreateMaterielApplication(params) {
  const { itemId } = params;
  return request(`${SRM_MDM}/v1/${tenantId}/item-req-headers/create-change/item/${itemId}`, {
    method: 'PUT',
    body: params,
  });
}

export async function fetchDataCategories(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/item-categories/lov`, {
    method: 'GET',
    query: {
      enabledFlag: 1,
      ...param,
      customizeUnitCode: 'SMDM_MATERIELAPPLICATION_CATEGORY.LIST',
    },
  });
}

export async function fetchDataComponent(params) {
  const { itemReqHeaderId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(
    `${SRM_MDM}/v1/${getCurrentOrganizationId()}/item-component-reqs/page/${itemReqHeaderId}`,
    {
      method: 'GET',
      query: {
        ...param,
        customizeUnitCode:
          'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.EDITFORM,SMDM_MATERIELAPPLICATION_COMPONENTTABLE.TABLE',
      },
    }
  );
}

/**
 * 删除组件列表数据
 * @async
 * @function deleteComponentData
 * @param {Array} params.idList - 属性主键
 * @returns fetch Promise
 */
export async function deleteComponentData(params) {
  const { organizationId, idList } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-component-reqs`, {
    method: 'DELETE',
    body: [...idList],
  });
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${tenantId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

/**
 * 查询品类关联模板
 */
export async function getCategoryTemplate(categoryId) {
  return request(`${SRM_MDM}/v1/${tenantId}/category-attr-templates/assign/${categoryId}`, {
    method: 'GET',
  });
}

// 查询按钮权限信息
export async function fetchPermissions(permissionList) {
  return request(`${SRM_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: permissionList,
  });
}
