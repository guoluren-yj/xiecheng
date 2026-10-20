/**
 * rulesDefinitionMetaService.js
 * @date: 2020-07-15
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { SRM_PLATFORM } from '_utils/config';

export async function savaMetaData(params) {
  return request(`${SRM_PLATFORM}/v1/cnf/detail`, {
    method: 'POST',
    body: params,
  });
}

export async function updateMetaData(params) {
  return request(`${SRM_PLATFORM}/v1/cnf/detail`, {
    method: 'PUT',
    body: params,
  });
}

export async function deleteMetaData(params) {
  return request(`${SRM_PLATFORM}/v1/cnf/detail`, {
    method: 'DELETE',
    body: params,
  });
}
