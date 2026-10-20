import request from 'utils/request';
import { SRM_DATA_PROCESS } from '_utils/config';

async function putNodeHideDefinitions(data) {
  return request(`${SRM_DATA_PROCESS}/v1/node-hide-definitions`, {
    method: 'POST',
    body: data,
  });
}
export { putNodeHideDefinitions };
