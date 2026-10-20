/*
 * purchaseContractService - 协议引用采购申请列表
 * @date: 2019/12/13
 * @author: liliang <liang.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
// import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, filterNullValueObject } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';
import request from 'utils/request';

const organizationId = getCurrentOrganizationId();

/**
 * -查询列表的数据
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function queryList(params) {
  return request(`${SRM_SPCM}/v1/${organizationId}/prLine/page`, {
    method: 'GET',
    query: filterNullValueObject(parseParameters({ ...params, tenantId: organizationId })),
  });
}

// -获取列表数据
export async function verified(params) {
  const { selectedPurchaseContracts } = params;
  return request(`${SRM_SPCM}/v1/${organizationId}/createPcOrder-verified`, {
    method: 'POST',
    body: selectedPurchaseContracts,
  });
}
