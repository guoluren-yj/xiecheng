/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-26 15:40:53
 * @LastEditors: yanglin
 * @LastEditTime: 2022-10-17 01:33:04
 */
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';

/**
 * 获取页面个性化模版详情
 */
export async function getCuszTemplate(body) {
  return request(`${SRM_MDM}/v1/customize/template-cusz`, {
    method: 'POST',
    body,
  });
}
