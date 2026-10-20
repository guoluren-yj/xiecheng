import React, { Component } from 'react';
import { Icon, Dropdown, Menu } from 'choerodon-ui/pro';
import { isArray, isObject, isNil, isEmpty } from 'lodash';

import getPermissions from '../getPermissions';
import Styles from './index.less';

// 导出权限集直接加在组件上
// 按钮禁用权限集未加,业务场景暂不需要
// 非导出的非按钮样式不做处理
export default class headerButtons extends Component {
  codeSet = new Set();

  state = {
    dataMap: new Map(),
  };

  // 在 render 之前检查权限
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    this.check();
  }

  componentDidUpdate(preProps) {
    if (preProps.type && preProps.type !== this.props.type) {
      this.check();
    }
  }

  check = async () => {
    const { dataMap } = this.state;
    const { children = [] } = this.props;
    // 过滤 false
    const tempArr = (children && isArray(children) ? children : [children]).filter((item) =>
      isObject(item)
    );
    // 添加权限集
    tempArr.forEach((item) => {
      const { permissionList } = item.props;
      if (!isNil(permissionList) && isArray(permissionList)) {
        permissionList.forEach((i) => {
          if (i.code) {
            this.codeSet.add(i.code);
          }
        });
      }
    });
    if (this.codeSet.size > 0 && this.codeSet.size !== dataMap.size) {
      const res = await getPermissions([...this.codeSet]);
      this.setState({
        dataMap: res,
      });
    }
  };

  render() {
    let checkBtns = [];
    const showChildren = [];
    const foldChildren = [];
    const { dataMap } = this.state;
    const { children = [] } = this.props;
    // 过滤 false
    const tempArr = (children && isArray(children) ? children : [children]).filter((item) =>
      isObject(item)
    );
    if (this.codeSet.size > 0) {
      tempArr.forEach((item) => {
        const { permissionList = [] } = item.props;
        const permissionCodeList =
          permissionList && !isEmpty(permissionList)
            ? permissionList.map((i) => i.code)
            : undefined;
        [...dataMap].some(([code, approve]) => {
          if (isNil(permissionCodeList) || (permissionCodeList.includes(code) && approve)) {
            checkBtns.push(item);
            return true;
          } else {
            return false;
          }
        });
      });
    } else {
      checkBtns = tempArr;
    }
    checkBtns.forEach((item, index) => {
      if (index === 0) {
        const { color, suffixCls, children: itemChildren = {} } = item.props || {};
        // 判断是否为按钮
        if (suffixCls === 'btn') {
          showChildren.push({
            ...item,
            props: { ...item.props, color: color || 'primary', funcType: 'raised' },
          });
        } else if (suffixCls === 'dropdown') {
          const { props: btnProps = {} } = itemChildren;
          showChildren.push({
            ...item,
            props: {
              ...item.props,
              children: {
                ...itemChildren,
                props: { ...btnProps, color: btnProps.color || 'primary', funcType: 'raised' },
              },
            },
          });
        } else {
          showChildren.push(item);
        }
      } else if (index < 5) {
        showChildren.push(item);
      } else {
        foldChildren.push(item);
      }
    });
    const moreButtons = [
      <Dropdown
        overlay={
          <Menu selectable={false} className={Styles['ssta-buttons-menu']}>
            {foldChildren.map((item) => (
              <Menu.Item>{item}</Menu.Item>
            ))}
          </Menu>
        }
      >
        <Icon type="more_horiz" />
      </Dropdown>,
    ];
    return isEmpty(foldChildren) ? showChildren : showChildren.concat(moreButtons);
  }
}
