/*
 * 请求方式icon组件
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useEffect, useState, FC } from 'react';

import styles from './index.less';

interface IIndexProps {
  method?: EMethodsEnum | string;
}
interface IStyleObj {
  bgColor: string;
  display: string;
  text: string;
}
// 请求类型枚举
export enum EMethodsEnum {
  GET = 'GET',
  POST = 'POST',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTION = 'OPTION',
}
const Index: FC<IIndexProps> = ({ method }) => {
  // method 请求类型 POST GET PUT DELETE等 返回一个请求类型元素
  const [styleObj, setStyleObj] = useState<IStyleObj>({} as IStyleObj);
  useEffect(() => {
    const obj: any = {};

    // 设置标题前icon
    switch (method && method.toLowerCase()) {
      case 'get':
        Object.assign(obj, { bgColor: '#537bf5', text: EMethodsEnum.GET });
        break;
      case 'post':
        Object.assign(obj, { bgColor: '#00c44f', text: EMethodsEnum.POST });
        break;
      case 'delete':
        Object.assign(obj, { bgColor: '#ff4f57', text: EMethodsEnum.DELETE });
        break;
      case 'put':
        Object.assign(obj, { bgColor: '#ffb800', text: EMethodsEnum.PUT });
        break;
      case 'patch':
        Object.assign(obj, { bgColor: '#D38042', text: EMethodsEnum.PATCH });
        break;
      case 'head':
        Object.assign(obj, { bgColor: '#ffd20f', text: EMethodsEnum.HEAD });
        break;
      case 'option':
        Object.assign(obj, { bgColor: '#0f6ab4', text: EMethodsEnum.OPTION });
        break;
      default:
        Object.assign(obj, { bgColor: '#fff', text: '', display: 'none' });
        break;
    }
    setStyleObj(obj);
  }, [method]);

  return (
    <div
      className={styles['method-style']}
      style={{
        background: `${styleObj.bgColor}`,
        display: styleObj.display ? styleObj.display : '',
      }}
    >
      {styleObj.text}
    </div>
  );
};
export default Index;
