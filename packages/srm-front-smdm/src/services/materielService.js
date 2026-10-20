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
export async function queryMateriel(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/items`, {
    method: 'GET',
    query: param,
  });
}

export async function queryOrgList(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/items/query-org-list`, {
    method: 'GET',
    query: param,
  });
}
/**
 *查询物料明细
 * @async
 * @function queryDetail
 * @param {Number} params.itemId - 物料Id
 * @returns fetch Promise
 */
export async function queryDetail(params) {
  const { organizationId, itemId, customizeUnitCode } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/items/detail/${itemId}`, {
    method: 'GET',
    query: { customizeUnitCode },
  });
}
/**
 *查询自定义物品属性
 * @async
 * @function queryAttribute
 * @function queryDetail
 * @param {Number} params.itemId - 物料Id
 * @returns fetch Promise
 */
export async function queryAttribute(params) {
  const { organizationId, itemId, page, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-attributes/${itemId}`, {
    method: 'GET',
    query: other,
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
  return request(`${SRM_MDM}/v1/${organizationId}/item-attributes`, {
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
  return request(`${SRM_MDM}/v1/${organizationId}/item-partner-rels`, {
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
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assigns`, {
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
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-rels`, {
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
  return request(`${SRM_MDM}/v1/${organizationId}/item-attachments`, {
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
  return request(`${SRM_MDM}/v1/${organizationId}/items`, {
    method: 'POST',
    query: { customizeUnitCode },
    body: other,
  });
}
/**
 * 启用作废
 * @async
 * @function enabledFlag
 * @param {Number} params.itemId - 物料Id
 * @param {String} params.interfaceName - 接口名
 * @param {Number} params.objectVersionNumber - 版本号
 * @returns fetch Promise
 */
export async function enabledFlag(params) {
  const { organizationId, itemId, interfaceName, objectVersionNumber } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/items/${interfaceName}/${itemId}`, {
    method: 'POST',
    query: { objectVersionNumber },
  });
}
/**
 * 查询客户物品表数据
 * @async
 * @function queryPartner
 * @param {Number} params.itemId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function queryPartner(params) {
  const { organizationId, itemId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-partner-rels/${itemId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询自主品类分配物品
 * @async
 * @function queryCategory
 * @param {Number} params.itemId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function queryCategory(params) {
  const { organizationId, itemId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-category-assigns/${itemId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询所属组织
 * @async
 * @function queryAffliated
 * @param {Number} params.itemId - 物料Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns fetch Promise
 */
export async function queryAffliated(params) {
  const { organizationId, itemId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-rels/${itemId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 查询附件
 * @async
 * @function queryEnclosure
 * @param {Number} params.itemId - 物料Id
 * @returns fetch Promise
 */
export async function queryEnclosure(params) {
  const { organizationId, itemId, page, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-attachments/${itemId}`, {
    method: 'GET',
    query: other,
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
 * @param {Number} params.itemId - 物料Id
 * @param {String} params.key - 校验的key
 * @param {String} params.value - 校验的Value
 * @param {String} params.key1 - 校验的第二个key
 * @param {String} params.value1 - 校验的第二个Value
 * @returns fetch Promise
 */
export async function checkValid(params) {
  const { organizationId, itemId, key, value, key1, value1 } = params;
  const obj = { [key]: value, [key1]: value1 };
  let interfaceName = '';
  switch (key) {
    case 'itemCode':
      interfaceName = 'items/valid';
      break;
    case 'partnerCompanyId':
      interfaceName = `item-partner-rels/${itemId}/valid`;
      break;
    // case 'partnerItemId':
    //   interfaceName = `item-partner-rels/${itemId}/valid`;
    //   break;
    case 'categoryId':
      interfaceName = `item-category-assigns/${itemId}/valid`;
      break;
    case 'relOrganizationId':
      interfaceName = `item-org-rels/${itemId}/valid`;
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
 * @param {Number} params.itemId - 物料Id
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
 * @param {Number} params.itemId - 物料Id
 * @returns fetch Promise
 */
export async function queryItemOrgUom(params) {
  const { organizationId, itemId, customizeUnitCode } = params;
  // console.log(params)
  // const param = filterNullValueObject(parseParameters(other));
  // console.log(param)
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-uoms/${itemId}`, {
    method: 'GET',
    query: { customizeUnitCode },
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
  const { organizationId, itemId, value } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-org-uoms/${itemId}/valid`, {
    method: 'POST',
    body: { ...value },
  });
}

// 物料图片导入zip解压
export async function unPack(params) {
  return request(`${SRM_MDM}/v1/image-import-data/${getCurrentOrganizationId()}/unZip`, {
    method: 'GET',
    query: params,
  });
}

// 物料图片导入zip解压
export async function fetchFileList(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/image-import-data/${getCurrentOrganizationId()}`, {
    method: 'GET',
    query: param,
  });
}

// 导入校验
export async function validateFile(params) {
  return request(`${SRM_MDM}/v1/image-import-data/${getCurrentOrganizationId()}/validate`, {
    method: 'GET',
    query: params,
  });
}

// 校验成功后导入图片
export async function imgImport(params) {
  return request(`${SRM_MDM}/v1/image-import-data/${getCurrentOrganizationId()}/import`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询历史版本
 * @param {obj} params
 */
export async function fetchVersionList(params) {
  const { organizationId, itemId } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-reqs/history/${itemId}`, {
    method: 'GET',
  });
}

export async function fetchDataCategories(params) {
  const param = filterNullValueObject(parseParameters(params));
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/item-categories/lov`, {
    method: 'GET',
    query: { enabledFlag: 1, ...param },
  });
}

export async function fetchDataComponent(params) {
  const { itemId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${getCurrentOrganizationId()}/item-components/item/${itemId}`, {
    method: 'GET',
    query: param,
  });
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
  return request(`${SRM_MDM}/v1/${organizationId}/item-components`, {
    method: 'DELETE',
    body: [...idList],
  });
}

/**
 *查询物料操作记录
 * @async
 * @function queryOperation
 * @param {obj} params.itemId - 物料Id
 * @returns fetch Promise
 */
export async function queryOperation(params) {
  const { organizationId, itemId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-actions/all/${itemId}`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询申请单操作记录
 * @async
 * @function queryReqOperation
 * @param {obj} params.itemReqHeaderId
 * @returns fetch Promise
 */
export async function queryReqOperation(params) {
  const { organizationId, itemReqHeaderId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-actions/${itemReqHeaderId}`, {
    method: 'GET',
    query: param,
  });
}
/**
 *查询申请单审批记录
 * @async
 * @function queryReqApprove
 * @param {obj} params.itemReqHeaderId
 * @returns fetch Promise
 */
export async function queryReqApprove(params) {
  const { organizationId, itemReqHeaderId } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/item-req-approve-histories/${itemReqHeaderId}`, {
    method: 'GET',
  });
}

/**
 * 查询业务规则定义
 */
export async function fetchDoExecute(body) {
  const organizationId = getCurrentOrganizationId();
  const fullPathCode = body.map((ele) => ele.fullPathCode);
  return request(`${SRM_PLATFORM}/v1/${organizationId}/cnf/do-execute`, {
    method: 'POST',
    query: { fullPathCode },
    body,
  });
}

// 查询模块是否开启双单位
export async function fetchUomControl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/items/secondary/uom/getcnf`, {
    method: 'GET',
    query: params,
  });
}

// 查询物料名称多语言
export async function fetchItemNameLang(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_MDM}/v1/${organizationId}/items/multi-language`, {
    method: 'GET',
    query: params,
  });
}

// 查询图纸信息
export async function queryDrawingInfo(params) {
  const { organizationId, page, ...other } = params;
  return request(`${SRM_MDM}/v1/${organizationId}/drawings/view/list`, {
    method: 'GET',
    query: other,
  });
}
