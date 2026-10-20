import React, { Component, cloneElement } from 'react';
import { Icon, Popover } from 'choerodon-ui';
import { isArray, isObject, isNil, isEmpty } from 'lodash';

import { getPermissions } from '../utils';
import styles from './index.less';

// 导出权限集直接加在组件上
// 按钮禁用权限集未加,业务场景暂不需要
// 非导出的非按钮样式不做处理
export default class PermissionBtns extends Component {
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
    // 仅根据props.type不足以比较子组件更新，添加c7n-pro按钮icon对比
    const preIcon = (preProps.children || [])
      .map((i) => i?.props)
      .filter((i) => i?.type === 'c7n-pro')
      .map((i) => i?.icon);
    const icon = (this.props.children || [])
      .map((i) => i?.props)
      .filter((i) => i?.type === 'c7n-pro')
      .map((i) => i?.icon);
    const diffIcon = JSON.stringify(preIcon) !== JSON.stringify(icon);
    if ((preProps.type && preProps.type !== this.props.type) || (preIcon.length && diffIcon)) {
      this.check();
    }
  }

  check = async () => {
    const { dataMap } = this.state;
    const { children = [] } = this.props;
    const comp = children.find(
      (i) => i?.props?.children?.props?.component?.key === 'dynamicButtons'
    );
    let btns = [];
    if (comp) {
      const {
        props: {
          children: {
            props: {
              component: {
                props: { buttons = [] },
              },
            },
          },
        },
      } = comp;
      btns = buttons;
    }
    // 过滤 false
    const tempArr = (children && isArray(children) ? children.flat(1) : [children])
      .filter((item) => isObject(item))
      .concat(btns);
    // 添加权限集
    tempArr.forEach((item) => {
      const { permissionList = [] } = item.props || item.btnProps?.btnProps || item.btnProps;
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
    const { children = [], headerBtnLoading = false } = this.props;
    // 过滤 false
    const tempArr = (children && isArray(children) ? children.flat(1) : [children]).filter((item) =>
      isObject(item)
    );
    if (this.codeSet.size > 0) {
      tempArr.forEach((item) => {
        const { permissionList = [] } = item.props || item.btnProps?.btnProps || item.btnProps;
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
    let length = 0;
    checkBtns.forEach((item) => {
      if (item.props.children?.props?.component?.key === 'dynamicButtons') {
        const newProps = item.props;
        const {
          props: {
            children: {
              props: {
                component: {
                  props: { buttons: btns },
                  // ref: { current },
                },
              },
            },
          },
        } = item;
        // const { props: { buttons = [] } = {} } = current || {};
        const newButtons = btns.reduce((acc, i) => {
          const newButton = { ...i };
          const { permissionList = [] } = i.btnProps?.btnProps || i.btnProps;
          const permissionCodeList =
            permissionList && !isEmpty(permissionList)
              ? permissionList.map((n) => n.code)
              : undefined;
          const noPermission = [...dataMap].find(([code, approve]) => {
            return !isNil(permissionCodeList) && permissionCodeList.includes(code) && !approve;
          });
          // 临时处理
          if ('loading' in (newButton.btnProps?.btnProps || {})) {
            newButton.btnProps.btnProps.loading = headerBtnLoading;
          } else if ('loading' in newButton.btnProps) {
            newButton.btnProps.loading = headerBtnLoading;
          }
          return noPermission ? acc : [...acc, i];
        }, []);
        length += newButtons.length;
        showChildren.push(
          cloneElement(item, {
            ...newProps,
            children: {
              ...newProps.children,
              props: {
                ...newProps.children.props,
                component: {
                  ...newProps.children.props.component,
                  props: {
                    ...newProps.children.props.component.props,
                    buttons: newButtons,
                  },
                },
              },
            },
          })
        );
      } else if (length < 5) {
        showChildren.push(item);
        length += 1;
      } else {
        foldChildren.push(item);
      }
    });
    const moreButtons = [
      <Popover
        placement="bottom"
        content={foldChildren.map((i) => cloneElement(i, { ...i.props, icon: null }))}
        overlayClassName={styles['sodr-buttons-popover']}
      >
        <Icon type="more_horiz" className={styles['sodr-buttons-icon']} />
      </Popover>,
    ];
    return isEmpty(foldChildren) ? showChildren : showChildren.concat(moreButtons);
  }
}
