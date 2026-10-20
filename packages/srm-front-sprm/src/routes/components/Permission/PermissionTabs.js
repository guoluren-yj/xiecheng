/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-10-25 10:38:57
 * @LastEditors: yanglin
 * @LastEditTime: 2024-04-02 17:36:51
 */
import React from 'react';
import { isArray, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import getPermissions from './getPermissions';

export default class Permission extends React.Component {
  codeSet = new Set();

  state = {
    keyList: [],
  };

  // 在 render 之前检查权限
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    this.check();
  }

  componentWillUnmount() {
    this.codeSet.clear();
  }

  /**
   * 调用 context 的 check
   * @param {object} props - 检查所需参数
   * @param {object} context - 上下文
   */
  @Bind()
  async check() {
    const {
      children: { props: refProps = {} },
    } = this.props;
    const { children: refChildren = [] } = refProps;
    const keyList = [];
    const refChildrenArr = isArray(refChildren) ? refChildren : [refChildren];
    refChildrenArr.forEach(item => {
      const { permissionCodeList } = item.props;
      if (!isNil(permissionCodeList) && isArray(permissionCodeList)) {
        permissionCodeList.forEach(code => {
          if (code) {
            this.codeSet.add(code);
          }
        });
      }
    });
    if (this.codeSet.size > 0) {
      const dataMap = await getPermissions([...this.codeSet]);
      refChildrenArr.forEach(item => {
        const { permissionCodeList } = item.props;
        [...dataMap].some(([code, approve]) => {
          if (isNil(permissionCodeList) || (permissionCodeList.includes(code) && approve)) {
            keyList.push(item.key);
            return true;
          } else {
            return false;
          }
        });
      });
      this.setState({ keyList });
    } else {
      this.setState({
        keyList: refChildrenArr?.map(item => item.key),
      });
    }
  }

  render() {
    const { children } = this.props;
    const { props: refProps } = children;
    const { activeKey, defaultActiveKey, children: refChildren } = refProps;
    const { keyList } = this.state;
    const refChildrenArr = isArray(refChildren) ? refChildren : [refChildren];
    const checkChildren = refChildrenArr.filter(item => keyList.includes(item.key));
    const newRefProps = {
      ...refProps,
      children: checkChildren,
      activeKey: keyList.includes(activeKey) ? activeKey : keyList[0],
      defaultActiveKey: keyList.includes(defaultActiveKey) ? defaultActiveKey : keyList[0],
    };

    return { ...children, props: newRefProps };
  }
}
