/**
 * service - 供应商信息变更对比
 * @date: 2021-04-07
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 基础信息
export async function fetchBasicInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/supplier-change-reqs/compare-req-header`, {
    method: 'GET',
    query: params,
  });
}

// 查询供应商基础信息
export async function fetchSupplierBasicInfo(params) {
  const { key, ...others } = params;
  let interfaceName = '';
  let customizeUnitCode = '';
  switch (key) {
    case 'comBasicReq': // 登记信息(对比时个性化无法区分境内外还是个人，全量传)
      customizeUnitCode = [
        'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS',
        'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL',
      ].join(',');
      interfaceName = 'sup-basic-req/compare-supplier-basic';
      break;
    case 'comBusinessReqDTO': // 业务信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BUSINESS';
      interfaceName = 'sup-business-req/compare-supplier-business';
      break;
    case 'comContactsReqs': // 联系人信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT';
      interfaceName = 'sup-contacts-reqs/compare';
      break;
    case 'comAddressReqs': // 地址信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS';
      interfaceName = 'sup-address-reqs/compare';
      break;
    case 'comBankAccReqs': // 银行信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK';
      interfaceName = 'sup-bank-acc-reqs/compare';
      break;
    case 'supInvoiceReq': // 开票信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.INVOICE';
      interfaceName = 'sup-invoice-reqs/compare';
      break;
    case 'supAttachmentReqs': // 附件信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT';
      interfaceName = 'sup-attachment-reqs/compare';
      break;
    case 'supChangeAbilityLn': // 供货能力清单
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY';
      interfaceName = 'sup-change-compare/ability';
      break;
    case 'supChangeAbilityLnAtts': // 供货能力清单-附件信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ABILITY_LINE_ATTACHMENT';
      interfaceName = 'sup-change-ability-ln-atts/compare';
      break;
    case 'supChangeCate': // 供应商分类
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SCLASSIFY';
      interfaceName = 'sup-change-compare/category';
      break;
    case 'supChangeSync': // 采购/财务头
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_HEAD';
      interfaceName = 'sup-change-compare/sync';
      break;
    case 'supChangeSyncPf': // 采购/财务行
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE';
      interfaceName = 'sup-change-compare/pf';
      break;
    case 'supChangeEbsAdds': // 地点层
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION';
      interfaceName = 'sup-change-compare/address';
      break;
    case 'ouMessage': // ou层
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU';
      interfaceName = 'sup-change-compare/ou';
      break;
    case 'supChangeOther': // 其他信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OTHERS';
      interfaceName = 'sup-change-others/compare';
      break;
    default:
      break;
  }
  return request(`${SRM_SSLM}/v1/${organizationId}/${interfaceName}`, {
    method: 'GET',
    query: { customizeUnitCode, ...others },
  });
}

// 只读页面-标准页签查询接口
const getPurchaserFetchUrl = {
  comBasicReq: 'firmchange-req-all/query-sup-basic', // 登记信息
  comBusinessReqDTO: 'firmchange-req-all/query-sup-bussiness', // 业务信息
  comContactsReqs: 'firmchange-req-all/query-sup-contacts', // 联系人信息
  comAddressReqs: 'firmchange-req-all/query-sup-address', // 地址信息
  comBankAccReqs: 'firmchange-req-all/query-sup-bank-acc', // 银行信息
  supInvoiceReq: 'firmchange-req-all/query-sup-invoice', // 开票信息
  supAttachmentReqs: 'firmchange-req-all/query-sup-attachment', // 附件信息
  supChangeAbilityLn: 'firmchange-req-all/query-sup-ability', // 供货能力清单
  supChangeAbilityLnAtts: 'firmchange-req-all/query-sup-ability-atts', // 供货能力清单-附件信息
  supChangeCate: 'firmchange-req-all/query-sup-cate', // 供应商分类
  supChangeSync: 'firmchange-req-all/query-sup-sync', // 采购/财务头
  supChangeSyncPf: 'firmchange-req-all/query-sup-pf', // 采购/财务行
  supChangeEbsAdds: 'firmchange-req-all/query-sup-site', // 地点层
  ouMessage: 'firmchange-req-all/query-sup-ou', // ou层
  supChangeOther: 'firmchange-req-all/query-sup-other', // 其他信息
};

// 查询供应商基础信息
export async function fetchSupplierBasicInfoWfl(params) {
  const { key, ...others } = params;
  let interfaceName = '';
  let customizeUnitCode = '';
  switch (key) {
    case 'comBasicReq': // 登记信息(对比时个性化无法区分境内外还是个人，全量传)
      customizeUnitCode = [
        'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.REGISTRATION_OVERSEAS',
        'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.REGISTRATION_PERSONAL',
      ].join(',');
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'comBusinessReqDTO': // 业务信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.BUSINESS';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'comContactsReqs': // 联系人信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.CONTACT';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'comAddressReqs': // 地址信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.ADDRESS';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'comBankAccReqs': // 银行信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.BANK';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supInvoiceReq': // 开票信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.INVOICE';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supAttachmentReqs': // 附件信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.ATTACHMENT';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeAbilityLn': // 供货能力清单
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.SUPPLY_ABILITY';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeAbilityLnAtts': // 供货能力清单-附件信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.ABILITY_LINE_ATTACHMENT';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeCate': // 供应商分类
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.SCLASSIFY';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeSync': // 采购/财务头
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.PURCHASE_HEAD';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeSyncPf': // 采购/财务行
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.PURCHASE_LINE';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeEbsAdds': // 地点层
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.LOCATION';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'ouMessage': // ou层
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.OU';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    case 'supChangeOther': // 其他信息
      customizeUnitCode = 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.OTHERS';
      interfaceName = getPurchaserFetchUrl[key];
      break;
    default:
      break;
  }
  return request(`${SRM_SSLM}/v1/${organizationId}/${interfaceName}`, {
    method: 'GET',
    query: { customizeUnitCode, ...others },
  });
}

// 查询调查表信息（新）
export async function fetchInvestigateInfo(params) {
  const { configName, ...others } = params;
  let interfaceName = '';
  switch (configName) {
    case 'sslmInvestgBasic': // 基础信息
      interfaceName = 'investigate-basics';
      break;
    case 'sslmInvestgBusiness': // 业务信息
      interfaceName = 'investigate-business';
      break;
    case 'sslmInvestgProservice': // 产品及服务
      interfaceName = 'investigate-proservices';
      break;
    case 'sslmInvestgSupplierCate': // 供应商分类
      interfaceName = 'investigate-cate';
      break;
    case 'sslmInvestgFin': // 近三年财务状况
      interfaceName = 'investigate-finances';
      break;
    case 'sslmInvestgFinBranch': // 分支机构
      interfaceName = 'investigate-finances-branchs';
      break;
    case 'sslmInvestgAuth': // 资质信息
      interfaceName = 'investigate-authes';
      break;
    case 'sslmInvestgContact': // 联系人信息
      interfaceName = 'investigate-contacts';
      break;
    case 'sslmInvestgAddress': // 地址信息
      interfaceName = 'investigate-addresses';
      break;
    case 'sslmInvestgBankAccount': // 开户行信息
      interfaceName = 'investigate-bank-accounts';
      break;
    case 'sslmInvestgCustomer': // 主要客户情况
      interfaceName = 'investigate-customers';
      break;
    case 'sslmInvestgSubSupplier': // 分供方情况
      interfaceName = 'investigate-sub-suppliers';
      break;
    case 'sslmInvestgEquipment': // 设备信息
      interfaceName = 'investigate-equipments';
      break;
    case 'sslmInvestgRd': // 研发能力
      interfaceName = 'investigate-rds';
      break;
    case 'sslmInvestgProduce': // 生产能力
      interfaceName = 'investigate-produces';
      break;
    case 'sslmInvestgQa': // 质保能力
      interfaceName = 'investigate-qas';
      break;
    case 'sslmInvestgCustservice': // 售后服务
      interfaceName = 'investigate-custservices';
      break;
    case 'sslmInvestgAttachment': // 附件信息
      interfaceName = 'investigate-attachments';
      break;
    case 'sslmInvestgReserve1': // 预留表格1
      interfaceName = 'investigate-reserve1';
      break;
    case 'sslmInvestgReserve2': // 预留表格2
      interfaceName = 'investigate-reserve2';
      break;
    case 'sslmInvestgReserve5': // 预留表格3
      interfaceName = 'investigate-reserve5';
      break;
    case 'sslmInvestgReserve6': // 预留表格4
      interfaceName = 'investigate-reserve6';
      break;
    case 'sslmInvestgReserve7': // 预留表格5
      interfaceName = 'investigate-reserve7';
      break;
    case 'sslmInvestgReserve8': // 预留表格6
      interfaceName = 'investigate-reserve8';
      break;
    case 'sslmInvestgReserve9': // 预留表格7
      interfaceName = 'investigate-reserve9';
      break;
    case 'sslmInvestgReserve3': // 预留表单1
      interfaceName = 'investigate-reserve3';
      break;
    case 'sslmInvestgReserve4': // 预留表单2
      interfaceName = 'investigate-reserve4';
      break;
    case 'sslmInvestgReserve10': // 预留表单3
      interfaceName = 'investigate-reserve10';
      break;
    case 'sslmInvestgReserve11': // 预留表单4
      interfaceName = 'investigate-reserve11';
      break;
    case 'sslmInvestgReserve12': // 预留表单5
      interfaceName = 'investigate-reserve12';
      break;
    case 'sslmInvestgReserve13': // 预留表单6
      interfaceName = 'investigate-reserve13';
      break;
    case 'sslmInvestgReserve14': // 预留表单7
      interfaceName = 'investigate-reserve14';
      break;
    default:
      break;
  }
  return request(`${SRM_SSLM}/v1/${organizationId}/enterprise-change/detail/${interfaceName}`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 登记信息
 */
export async function fetchRegistInform(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-basic-req/compare-supplier-basic`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 业务信息
 */
export async function fetchBusinessInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-business-req/compare-supplier-business`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BUSINESS_INFO',
    },
  });
}

/**
 * 联系人信息
 */
export async function fetchContactInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-contacts-reqs/compare`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CONTACT_INFO',
    },
  });
}

/**
 * 地址信息
 */
export async function fetchAddressInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-address-reqs/compare`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ADDRESS_INFO',
    },
  });
}

/**
 * 银行信息
 */
export async function fetchBankInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-bank-acc-reqs/compare`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BANK_INFO',
    },
  });
}

/**
 * 开票信息
 */
export async function fetchInvoicefo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-invoice-reqs/compare`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 附件信息
 */
export async function fetchAttachmentInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-attachment-reqs/compare`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ATTACHMENT_INFO',
    },
  });
}

/**
 * 供货能力清单
 */
export async function fetchSupplyCapacity(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-compare/ability`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 供应商分类
 */
export async function fetchSupplierClassify(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-compare/category`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.SUPPLIER_CLASSIFY',
    },
  });
}

/**
 * 采购财务头信息
 * @param {*} params -- 信息比对
 */
export async function fetchPurHeadInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-compare/sync`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_HEAD',
    },
  });
}

/**
 * 采购财务Table
 */
export async function fetchPurchaseInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-compare/pf`, {
    method: 'GET',
    query: {
      ...params,
      customizeUnitCode: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.PURCHASE_INFO',
    },
  });
}

/**
 * 地点层信息
 */
export async function fetchDestination(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-compare/address`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询调查表配置
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryInvestigateConfig({ changeReqId, ...rest }) {
  return request(
    `${SRM_SSLM}/v1/${organizationId}/supplier-change-investigate-config/${changeReqId}`,
    {
      method: 'GET',
      query: rest,
    }
  );
}

/**
 *
 *查询调查表数据
 * @export
 * @param {*} params
 * @returns
 */
export async function queryInvestigate(params) {
  const { configName, ...others } = params;
  let interfaceName = '';
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      interfaceName = 'basics/compare';
      break;
    // 业务信息
    case 'sslmInvestgBusiness':
      interfaceName = 'business/compare';
      break;
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'proservices/compare';
      break;
    // 近三年财务状况
    case 'sslmInvestgFin':
      interfaceName = 'finances/compare';
      break;
    // 分支机构
    case 'sslmInvestgFinBranch':
      interfaceName = 'finances-branchs/compare';
      break;
    // 资质信息
    case 'sslmInvestgAuth':
      interfaceName = 'authes/compare';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'contacts/compare';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'addresses/compare';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'bank-accounts/compare';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'customers/compare';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'sub-suppliers/compare';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'equipments/compare';
      break;
    // 研发能力
    case 'sslmInvestgRd':
      interfaceName = 'rds/compare';
      break;
    // 生产能力
    case 'sslmInvestgProduce':
      interfaceName = 'produces/compare';
      break;
    // 质保能力
    case 'sslmInvestgQa':
      interfaceName = 'qas/compare';
      break;
    // 售后服务
    case 'sslmInvestgCustservice':
      interfaceName = 'custservices/compare';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      return request(`${SRM_SSLM}/v1/${organizationId}/firm-change-attachments/compare`, {
        method: 'GET',
        query: others,
      });
    default:
      break;
  }
  return request(
    `${SRM_SSLM}/v1/${organizationId}/enterprise-change/detail/investigate-${interfaceName}`,
    {
      method: 'GET',
      query: others,
    }
  );
}

/**
 * 其他信息
 */
export async function fetchOtherInfo(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/sup-change-others/compare`, {
    method: 'GET',
    query: params,
  });
}
