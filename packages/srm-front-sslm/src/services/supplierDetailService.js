/**
 * supplierDetailService - 供应商360度查询 - service
 * @date: 2018-08-20
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { checkPrintWindow } from '_utils/utils';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { queryUnifyIdpValue } from 'services/api';

/**
 *
 *查询品类、物料
 * @export
 * @function queryEliminate
 * @param {Number} params.organizationId 租户Id
 * @param {Number} params.requisitionId 申请单头Id
 * @returns
 */
export async function queryEliminate(params) {
  const { organizationId, requisitionId } = params;
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle/degrade/${requisitionId}`, {
    method: 'GET',
  });
}

/**
 * 查询考评结果评分明细数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryScoreDetail({ tenantId, evalTplId, evalLineId }) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/${evalTplId}/${evalLineId}/subtree`,
    { method: 'GET' }
  );
}

/**
 *查询采购/财务表单信息
 *FIXME: 接口待调整
 * @param {Object} params 查询参数
 */

export async function fetchPurchaseFormList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync/selectSync`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询采购/财务信息
 *FIXME: 接口待调整
 * @param {Object} params 查询参数
 */

export async function fetchPurchaseList(params) {
  const organizationId = getCurrentOrganizationId();
  const query = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-pfs`, {
    method: 'GET',
    query,
  });
}

/**
 *记账冻结/取消记账冻结
 * @param {Object} params 查询参数
 */
export async function fetchAccountFreeze(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync/updateSyncFrozenFlag`, {
    method: 'POST',
    body: params,
  });
}

/**
 *查询地址层信息
 *FIXME: 接口待调整
 * @param {Object} params 查询参数
 */

export async function fetchDestinationList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-adds`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询本地供应商地址层信息
 *FIXME: 接口待调整
 * @param {Object} params 查询参数
 */

export async function fetchLocalDestinationList(params) {
  const organizationId = getCurrentOrganizationId();
  const { supplierCompanyId, customizeUnitCode } = params;
  return request(
    `${SRM_SSLM}/v1/${organizationId}/ext-supplier-sites/supplier-detail/${supplierCompanyId}`,
    {
      method: 'GET',
      query: {
        customizeUnitCode,
      },
    }
  );
}

/**
 *查询OU层信息
 *FIXME: 接口待调整
 * @param {Object} params 查询参数
 */
export async function fetchOuList(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-sync-ebs-ous`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询考评结果评分明细数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryLocationData({ tenantId, evalTplId, evalLineId }) {
  return request(
    `${SRM_SSLM}/v1/${tenantId}/eval-templates/indicators/${evalTplId}/${evalLineId}/subtree`,
    { method: 'GET' }
  );
}

/**
 * 查询考评结果详情页数据
 * @param {number} tenantId - 租户ID
 * @param {string} evalHeaderId - 考评档案ID
 */
export async function queryDetailData(params) {
  const { organizationId, evalHeaderId } = params;
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/result/${evalHeaderId}`, {
    method: 'GET',
    query: parseParameters(param),
  });
}

/**
 *查询供应商分类信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchSupplierCatagoryInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-category-assign/queryAssign`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询供应商分类信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchSupplyCapacityListData(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-lines/query`, {
    method: 'GET',
    query: {
      ...params,
      page: 0,
      size: 0,
    },
  });
}

// 查询供应商考评结果数据
export async function supplierEvaluationResultsData(params) {
  const organizationId = getCurrentOrganizationId();
  const param = parseParameters(params);
  return request(`${SRM_SSLM}/v1/${organizationId}/eval-headers/result/purchase`, {
    method: 'GET',
    query: param,
  });
}

/**
 *查询供应商公司信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchCompanyInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/suppliers`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询供ERP供应商信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchERPInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/external-suppliers/name-num`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询供应商联系人信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchContacts(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-detail/contacts`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.CONTACTS_INFO',
    },
  });
}

/**
 *查询供应商地址信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchAddress(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-detail/address`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.ADDRESS_INFO',
    },
  });
}

/**
 *查询供应商银行账户信息
 *
 * @param {Object} params 查询参数
 */
export async function fetchBankAccount(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-detail/bank-account`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_LIFE_CYCLE.BANK_INFO',
    },
  });
}

/**
 *查询编辑次数信息
 *
 * @param {Object} params 查询参数
 */
export async function fetEditedInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/version-history/info`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询目录
 *
 * @param {Object} params 查询参数
 */
export async function fetCatalog(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-detail/directory`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询调查表模板
 *
 * @param {Object} params 查询参数
 */
export async function fetchQuestionnaireTmpl(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/template-modules`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询供应商生命周期
 *
 * @param {Object} params 查询参数
 */
export async function fetchSupplierLifeCycle(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-Admission`, {
    method: 'GET',
    query: params,
  });
}

// c7n 360页面 查询生命周期历程
export async function fetchLifeCycle(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycle-Admission/history`, {
    method: 'GET',
    query: params,
  });
}

/**
 *查询调查表数据
 *
 * @param {Object} params 查询参数
 */
export async function fetchDataSource(params) {
  const organizationId = getCurrentOrganizationId();
  const { configName, investgHeaderId, supplierBasicId = undefined } = params;
  let interfaceName = '';
  switch (configName) {
    // 基础信息
    case 'sslm_investg_basic':
      interfaceName = 'investigate-basics';
      break;
    // 业务信息
    case 'sslm_investg_business':
      interfaceName = 'investigate-businesses';
      break;
    // 产品及服务
    case 'sslm_investg_proservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslm_investg_supplier_cate':
      interfaceName = 'investg-supplier-cates';
      break;
    // 近三年财务状况
    case 'sslm_investg_fin':
      interfaceName = 'investigate-finances';
      break;
    // 分支机构
    case 'sslm_investg_fin_branch':
      interfaceName = 'investigate-finances-branchs';
      break;
    // 资质信息
    case 'sslm_investg_auth':
      interfaceName = 'investigate-authes';
      break;
    // 联系人信息
    case 'sslm_investg_contact':
      interfaceName = 'investigate-contacts';
      break;
    // 地址信息
    case 'sslm_investg_address':
      interfaceName = 'investigate-addresses';
      break;
    // 开户行信息
    case 'sslm_investg_bank_account':
      interfaceName = 'investigate-bank-accounts';
      break;
    // 主要客户情况
    case 'sslm_investg_customer':
      interfaceName = 'investigate-customers';
      break;
    // 分供方情况
    case 'sslm_investg_sub_supplier':
      interfaceName = 'investigate-sub-suppliers';
      break;
    // 设备信息
    case 'sslm_investg_equipment':
      interfaceName = 'investigate-equipments';
      break;
    // 研发能力
    case 'sslm_investg_rd':
      interfaceName = 'investigate-rds';
      break;
    // 生产能力
    case 'sslm_investg_produce':
      interfaceName = 'investigate-produces';
      break;
    // 质保能力
    case 'sslm_investg_qa':
      interfaceName = 'investigate-qas';
      break;
    // 售后服务
    case 'sslm_investg_custservice':
      interfaceName = 'investigate-custservices';
      break;
    // 附件信息
    case 'sslm_investg_attachment':
      interfaceName = 'investigate-attachments';
      break;
    // 预留表格页签1
    case 'sslm_investg_reserve1':
      interfaceName = 'investg-reserve1s';
      break;
    // 预留表格页签2
    case 'sslm_investg_reserve2':
      interfaceName = 'investg-reserve2s';
      break;
    // 预留表单页签1
    case 'sslm_investg_reserve3':
      interfaceName = 'investg-reserve3s';
      break;
    // 预留表单页签2
    case 'sslm_investg_reserve4':
      interfaceName = 'investg-reserve4s';
      break;
    // 预留表格页签3
    case 'sslm_investg_reserve5':
      interfaceName = 'investg-reserve5s';
      break;
    // 预留表格页签4
    case 'sslm_investg_reserve6':
      interfaceName = 'investg-reserve6s';
      break;
    // 预留表格页签5
    case 'sslm_investg_reserve7':
      interfaceName = 'investg-reserve7s';
      break;
    // 预留表格页签6
    case 'sslm_investg_reserve8':
      interfaceName = 'investg-reserve8s';
      break;
    // 预留表格页签7
    case 'sslm_investg_reserve9':
      interfaceName = 'investg-reserve9s';
      break;
    // 预留表单页签3
    case 'sslm_investg_reserve10':
      interfaceName = 'investg-reserve10s';
      break;
    // 预留表单页签4
    case 'sslm_investg_reserve11':
      interfaceName = 'investg-reserve11s';
      break;
    // 预留表单页签5
    case 'sslm_investg_reserve12':
      interfaceName = 'investg-reserve12s';
      break;
    // 预留表单页签6
    case 'sslm_investg_reserve13':
      interfaceName = 'investg-reserve13s';
      break;
    // 预留表单页签7
    case 'sslm_investg_reserve14':
      interfaceName = 'investg-reserve14s';
      break;
    default:
      break;
  }
  return request(`${SRM_SSLM}/v1/${organizationId}/${interfaceName}`, {
    method: 'GET',
    query: {
      investgHeaderId,
      tenantId: organizationId,
      supplierBasicId,
    },
  });
}

/**
 * 查询列表
 * @param {Object} params 查询参数
 */
export async function fetchHistoryVersionList(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/version-history`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询操作列表
 * @param {Object} params
 */
export async function fetchOperationList(params) {
  return request(`${SRM_SSLM}/v1/${getCurrentOrganizationId()}/version-history/record`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 查询调查表和配置中心维度
 * @param {Object} params
 */
export async function fetchLevelConfig(params) {
  const { investgHeaderId } = params;
  return request(
    `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/investigate/level/${investgHeaderId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询其他信息
 * @param {Object} params
 */
export async function fetchOtherInfo(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-others/getSupplierOther`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询供货能力清单行附件
 * @async
 * @function queryOperation
 * @param {Number} params.abilityLineId - 供货能力清单行Id
 * @param {Number} [params.page = 0] - 数据页码
 * @param {Number} [params.size = 10] - 分页大小
 * @returns {Object} fetch Promise
 */
export async function queryLineAttachment(params) {
  const organizationId = getCurrentOrganizationId();
  const query = filterNullValueObject(parseParameters(params));
  return request(`${SRM_SSLM}/v1/${organizationId}/supply-ability-line-att-lns`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询采购商Lov
 * @async
 * @function queryOperation
 * @param {String} params.lovCode - 值集编码
 * @param {Number} params.queryParams  - 其它参数
 * @returns {Object} fetch Promise
 */
export async function fetchCompanyIdReserve(params) {
  const { lovCode, queryParams } = params;
  return queryUnifyIdpValue(lovCode, queryParams);
}

/**
 * 360 打印
 * @param {Object} params 查询参数
 */
export async function handlePrint(params) {
  const flag = checkPrintWindow();
  const organizationId = getCurrentOrganizationId();
  return request(`${SRM_SSLM}/v1/${organizationId}/life-cycles/print`, {
    method: 'GET',
    query: params,
    responseType: flag ? 'blob' : 'json',
    headers: flag ? {} : { 's-print-using-preview': '1' },
  });
}
