/* eslint-disable no-param-reassign */
import request from 'utils/request';

/**
 * 复制操作
 * @param data
 */
export async function copyDataRow(data) {
  const url = data?.requestUrl ?? '';

  delete data.requestUrl;

  return request(`${url}`, {
    method: 'POST',
    body: {
      ...data,
    },
  });
}
