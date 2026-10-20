/**
 * 即刻3.0相关方法
 * @author: sheng.yao <sheng.yao@going-link.com>
 * @date: 2024/02/26
 * @copyright: Copyright (c) 2024, Zhenyun
 */
import { isFunction } from 'lodash';
import { ASSISTANT_KEY_LIST } from '../constant';

// 判断是否是助手
export const isAssistatnt = (room) => {
  const { type } = room;
  return ASSISTANT_KEY_LIST.includes(type);
};

// 获取文本内容
export const getText = (text) => {
  if (isFunction(text)) return text();
  return text;
};
