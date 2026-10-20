/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-05-16 13:54:28
 * @LastEditors: yanglin
 * @LastEditTime: 2022-05-16 15:19:59
 */
import request from 'utils/request';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `/sbdm/v1`;
/**
 * 保存
 * @param {单条数据DTO} Object
 */
export async function save(data) {
  return request(`${prefix}/budget-item-pre/save`, {
    method: 'PUT',
    body: data,
  });
}
