/**
 * purchaserInvestWorkbenchService - 采购方调查表工作台 - service
 * @date: 2022-11-30
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import request from 'utils/request';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

/**
 * 查询tab页数量
 * @export
 */
export async function queryTabsCount(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/purchaser/work/count`, {
    method: 'GET',
    body: params,
  });
}

// 列表批量审批拒绝
export async function batchReject({ customizeUnitCode, data }) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/batch-reject`, {
    method: 'POST',
    body: data,
    query: { customizeUnitCode },
  });
}

// 列表批量审批通过
export async function batchApprove(params) {
  return request(`${SRM_SSLM}/v1/${organizationId}/investigate/batch-approve`, {
    method: 'POST',
    body: params,
  });
}

// 查询调查表对比信息
export async function fetchInvestigateCompareInfo(params) {
  const { configName, type = 'after', supplierBasicId, ...others } = params;
  let interfaceName = '';
  const basicParams =
    type === 'before'
      ? {
          supplierBasicId,
        }
      : {};
  switch (configName) {
    // 基础信息
    case 'sslmInvestgBasic':
      interfaceName = 'investigate-basics/compare';
      break;
    // 业务信息
    case 'sslmInvestgBusiness':
      interfaceName = 'investigate-businesses/compare';
      break;
    // 产品及服务
    case 'sslmInvestgProservice':
      interfaceName = 'investigate-proservices';
      break;
    // 供应商分类
    case 'sslmInvestgSupplierCate':
      interfaceName = 'investg-supplier-cates';
      break;
    // 近三年财务状况
    case 'sslmInvestgFin':
      interfaceName = 'investigate-finances';
      break;
    // 分支机构
    case 'sslmInvestgFinBranch':
      interfaceName = 'investigate-finances-branchs';
      break;
    // 资质信息
    case 'sslmInvestgAuth':
      interfaceName = 'investigate-authes';
      break;
    // 联系人信息
    case 'sslmInvestgContact':
      interfaceName = 'investigate-contacts';
      break;
    // 地址信息
    case 'sslmInvestgAddress':
      interfaceName = 'investigate-addresses';
      break;
    // 开户行信息
    case 'sslmInvestgBankAccount':
      interfaceName = 'investigate-bank-accounts';
      break;
    // 主要客户情况
    case 'sslmInvestgCustomer':
      interfaceName = 'investigate-customers';
      break;
    // 分供方情况
    case 'sslmInvestgSubSupplier':
      interfaceName = 'investigate-sub-suppliers';
      break;
    // 设备信息
    case 'sslmInvestgEquipment':
      interfaceName = 'investigate-equipments';
      break;
    // 研发能力form
    case 'sslmInvestgRd':
      interfaceName = 'investigate-rds/compare';
      break;
    // 生产能力form
    case 'sslmInvestgProduce':
      interfaceName = 'investigate-produces/compare';
      break;
    // 质保能力form
    case 'sslmInvestgQa':
      interfaceName = 'investigate-qas/compare';
      break;
    // 售后服务form
    case 'sslmInvestgCustservice':
      interfaceName = 'investigate-custservices/compare';
      break;
    // 附件信息
    case 'sslmInvestgAttachment':
      interfaceName = 'investigate-attachments';
      break;
    // 预留表格页签1
    case 'sslmInvestgReserve1':
      interfaceName = 'investg-reserve1s';
      break;
    // 预留表格页签2
    case 'sslmInvestgReserve2':
      interfaceName = 'investg-reserve2s';
      break;
    // 预留表格页签3
    case 'sslmInvestgReserve5':
      interfaceName = 'investg-reserve5s';
      break;
    // 预留表格页签4
    case 'sslmInvestgReserve6':
      interfaceName = 'investg-reserve6s';
      break;
    // 预留表格页签5
    case 'sslmInvestgReserve7':
      interfaceName = 'investg-reserve7s';
      break;
    // 预留表格页签6
    case 'sslmInvestgReserve8':
      interfaceName = 'investg-reserve8s';
      break;
    // 预留表格页签7
    case 'sslmInvestgReserve9':
      interfaceName = 'investg-reserve9s';
      break;
    // 预留表单页签1form
    case 'sslmInvestgReserve3':
      interfaceName = 'investg-reserve3s/compare';
      break;
    // 预留表单页签2form
    case 'sslmInvestgReserve4':
      interfaceName = 'investg-reserve4s/compare';
      break;
    // 预留表单页签3form
    case 'sslmInvestgReserve10':
      interfaceName = 'investg-reserve10s/compare';
      break;
    // 预留表单页签4form
    case 'sslmInvestgReserve11':
      interfaceName = 'investg-reserve11s/compare';
      break;
    // 预留表单页签5form
    case 'sslmInvestgReserve12':
      interfaceName = 'investg-reserve12s/compare';
      break;
    // 预留表单页签6form
    case 'sslmInvestgReserve13':
      interfaceName = 'investg-reserve13s/compare';
      break;
    // 预留表单页签7form
    case 'sslmInvestgReserve14':
      interfaceName = 'investg-reserve14s/compare';
      break;
    default:
      break;
  }
  return request(`${SRM_SSLM}/v1/${organizationId}/${interfaceName}`, {
    method: 'GET',
    query: {
      ...others,
      ...basicParams,
    },
  });
}
