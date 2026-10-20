import React from 'react';
import { isArray, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import getPermissions from '../getPermissions';

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
    if (!this.props.children) return;
    const { onCallback = () => {} } = this.props;
    const refProps = this.props?.children?.props || {};
    const subProps = refProps?.children?.props || {};
    const custConfig = refProps?.value?.custConfig || {};
    const custCode = subProps?.options?.code;
    const { children: refChildren, activeKey } = subProps?.component?.props || {};
    let cuzActiveKey = activeKey;
    const keyList = [];
    const refChildrenArr = isArray(refChildren) ? refChildren : refChildren ? [refChildren] : [];

    let dataMap = [];

    refChildrenArr.forEach((item) => {
      const { permissionCodeList, children: sunChildren = {} } = item.props;
      this.bacthAddCode(permissionCodeList);
      // if (!isNil(permissionCodeList) && isArray(permissionCodeList)) {
      //   permissionCodeList.forEach((code) => {
      //     if (code) {
      //       this.codeSet.add(code);
      //     }
      //   });
      // }

      if (isArray(sunChildren)) {
        sunChildren.forEach((e) => {
          if (e?.props?.permissionCodeList) {
            this.bacthAddCode(e.props.permissionCodeList);
          }
          // if (!isNil(permissionCodeList) && isArray(permissionCodeList)) {
          //   permissionCodeList.forEach((code) => {
          //     if (code) {
          //       this.codeSet.add(code);
          //     }
          //   });
          // }
        });
      }
    });

    if (this.codeSet.size > 0) {
      dataMap = await getPermissions([...this.codeSet]);
    }

    refChildrenArr.forEach((item) => {
      const { children: sunChildren = {} } = item.props;
      if (isArray(sunChildren)) {
        sunChildren.forEach((e) => {
          if (e) {
            const { permissionCodeList } = e.props;
            if (isNil(permissionCodeList)) {
              keyList.push(e.key);
            } else {
              [...dataMap].some(([code, approve]) => {
                if (permissionCodeList.includes(code) && approve) {
                  keyList.push(e.key);
                  return true;
                } else {
                  return false;
                }
              });
            }
          }
        });
      } else {
        const { permissionCodeList } = item.props;
        if (isNil(permissionCodeList)) {
          keyList.push(item.key);
        } else {
          [...dataMap].some(([code, approve]) => {
            if (permissionCodeList.includes(code) && approve) {
              keyList.push(item.key);
              return true;
            } else {
              return false;
            }
          });
        }
      }
    });
    if (custConfig[custCode]) {
      const { fields = [] } = custConfig[custCode];
      fields
        .sort((a, b) => (a.seq || 0) - (b.seq || 0))
        .forEach((field) => {
          if (field.visible === 0 && keyList.indexOf(field.fieldCode) !== -1) {
            keyList.splice(keyList.indexOf(field.fieldCode), 1);
          }
          if (field.defaultActive === 1) {
            cuzActiveKey = field.fieldCode;
          }
        });
    }

    this.setState({ keyList });
    onCallback(keyList, cuzActiveKey);
  }

  @Bind()
  bacthAddCode(permissionCodeList) {
    if (!isNil(permissionCodeList) && isArray(permissionCodeList)) {
      permissionCodeList.forEach((code) => {
        if (code) {
          this.codeSet.add(code);
        }
      });
    }
  }

  @Bind()
  handleNewChildren() {
    const { children } = this.props;
    if (!children) return null;
    const { props: refProps } = children;
    const {
      children: {
        props: {
          component: {
            props: { children: refChildren },
          },
        },
      },
    } = refProps;
    const { keyList } = this.state;
    const newChildren = [];

    const refChildrenArr = isArray(refChildren) ? refChildren : [refChildren];

    refChildrenArr.forEach((item) => {
      if (item.props) {
        const { children: sunChildren = {} } = item.props;
        if (isArray(sunChildren)) {
          const checkChildren = sunChildren.filter((e) => keyList.includes(e?.key));
          newChildren.push({ ...item, props: { ...item.props, children: checkChildren } });
        } else {
          newChildren.push(item);
        }
      }
    });

    return newChildren;
  }

  render() {
    // 暂时只适应双层tab
    const { children } = this.props;

    if (!children) return null;
    const { props: refProps = {} } = children;
    const { activeKey } = refProps;
    const { keyList } = this.state;
    // const checkChildren = this.handleNewChildren();
    // if (refProps.children) {
    //   refProps.children.props.component.props.children = checkChildren;
    // }
    const newRefProps = {
      ...refProps,
      children,
      activeKey: keyList.includes(activeKey) ? activeKey : keyList[0],
    };

    return { ...children, props: newRefProps };
  }
}
