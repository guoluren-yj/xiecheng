/*
 * contractCommonService - 协议公共service
 * @Author: HB <bin.huang02@hand-china.com>
 * @Date: 2019-08-02 09:22:50
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import {
  getCurrentOrganizationId,
} from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

/**
 * 查询是否开启双单位配置
 * @async
 * @function queryCollByLine
 * @returns {object} fetch Promise 0不开启双单位，1上下游和订单都开启，2仅协议开启
 */
export async function queryDoubleUomConfig(params) {
  return request(`${SRM_SPCM}/v1/${getCurrentOrganizationId()}/secondary/getcnf`, {
    method: 'GET',
    query: params,
  });
}