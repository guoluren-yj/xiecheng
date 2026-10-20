import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * cdp-179419 【携程】合同签订人和下单执行人自行转交
 * @param {object} body
 * @returns
 */
export async function transferSourceResults(body) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/9U8VGbgdPXSWcWk1QYgIbTztGDoCg0w0QriaUc6Ojdts`,
    {
      method: 'POST',
      body,
    }
  );
}
