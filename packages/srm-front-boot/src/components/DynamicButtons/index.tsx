/* eslint-disable no-param-reassign */
import type { JSXElementConstructor, ReactNode } from 'react';
import React, { Fragment, cloneElement, createElement, isValidElement } from 'react';
import { observer } from "mobx-react";
import { Button as H0Button } from 'hzero-ui';
import { Button as C7NButton } from 'choerodon-ui';
import { Dropdown, Button as C7NProButton, Menu, Icon } from 'choerodon-ui/pro';
import { checkPermission } from 'hzero-front/lib/services/api';
import type { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { findMenuPath } from "../../utils/utils";

const { SubMenu } = Menu;
type PermissionInfo = {code: string, approve: boolean, controllerType: undefined | null | 'disabled' | 'hidden'};
type BtnProps = {
  [x:string]: any;
  // eslint-disable-next-line no-unused-vars
  onClick?: (_e: any) => void;
}
type ChildBtn = {
  child: ReactNode;
  text?: string;
  childFor?: string;
  name: string;
  btnComp?: JSXElementConstructor<any>;
  hidden?: boolean;
  /** 为true时删除按钮的children属性 */
  noChild?: boolean;
  btnType?: "h0" | "c7n" | "c7n-pro";
  btnProps?: BtnProps;
  observerBtnProps?: () => BtnProps;
};
type Btn = {
  child: ReactNode;
  text?: string;
  childFor?: string;
  name: string;
  btnType?: "h0" | "c7n" | "c7n-pro";
  btnComp?: JSXElementConstructor<any>;
  /** 为true时删除按钮的children属性 */
  noChild?: boolean;
  hidden?: boolean;
  /** 如果child本身是一个button，可以通过该属性控制是否在child上嵌套button */
  noNest?: boolean;
  btnProps?: BtnProps;
  group?: boolean;
  observerBtnProps?: () => BtnProps;
  children?: Array<ChildBtn>;
}
type DynamicButtonsProps = {
  trigger?: Action[];
  /** 权限集编码，不允许动态变化，与按钮的name属性一一对应 */
  permissions?: {code: string, name: string}[];
  // 最大按钮数量，多余的会收到...内
  maxNum?: number;
  unitCode?: string;
  noCollection?: string;
  buttons?: Array<Btn>;
  defaultBtnType?: "c7n" | "c7n-pro" | "h0";
}

const moreLinkBtnFixedStyle = (buttonProps) => {
  return {
    ...buttonProps,
    type: "c7n-pro",
    funcType: "link",
    style: { width: "100%", color: "#000", textAlign: "left", justifyContent: "flex-start", ...(buttonProps || {}).style },
  };
};
@observer
export default class DynamicButtons<T> extends React.PureComponent<DynamicButtonsProps & T, any> {

  permissionsMap: null | Map<string, PermissionInfo | "loading"> = null;

  constructor(props) {
    super(props);
    const { permissions } = props;
    if (permissions && permissions.length) {
      this.permissionsMap = new Map();
      permissions.forEach(p => this.permissionsMap!.set(p.name, "loading"));
    }
  }

  componentDidMount() {
    const { permissions } = this.props;
    if (permissions && permissions.length) {
      const permissionsMap = new Map<string, string[]>();
      permissions.forEach(p => {
        const code = p.code.replace(/^\//g, '').replace(/\//g, '.').replace(/:/g, '-');
        const collections = permissionsMap.get(code) || [];
        if (!collections.includes(p.name)) collections.push(p.name);
        permissionsMap.set(code, collections);
      });
      checkPermission(permissions.map(p => p.code.replace(/^\//g, '').replace(/\//g, '.').replace(/:/g, '-'))).then(res => {
        if (getResponse(res)) {
          this.permissionsMap = new Map();
          (res || []).forEach(p => {
            if (!permissionsMap.has(p.code)) {
              console.error(new Error('code not match any name!'));
            } else {
              const collections = permissionsMap.get(p.code) || [];
              collections.forEach(name => {
                this.permissionsMap!.set(name, p);
              });
            }
          });
          this.forceUpdate();
        }
      });
    }
  }

  clickInterceptor = (child, _btnName, btnCode, onClick) => {
    let btnName = _btnName;
    if(btnName === undefined && child && child.toString){
      btnName = child.toString() || "未知按钮";
      if(btnName.includes("object")) btnName = "未知按钮";
    }
    return (...arg)=>{
      try {
        const {global: {menu: menus}, routing: {location: {pathname}}, user: {tenantNum, tenantName}} = (window as any).dvaApp._store.getState();
        const menuPath = findMenuPath(menus, pathname);
        const menuInfo = menuPath.reduce((info, menu, index) => {
          const { menuItem, title } = menu;
          const { flex } = menuItem || {};
          const { defaultName } = flex || {};
          info[`custom${index + 1}级菜单`] = defaultName || title;
          return info;
        }, {});

        (window as any).collectEvent('button-click', {
          pathname,
          ...menuInfo,
          btnName,
          btnCode,
          "custom_租户信息": `${tenantNum}-${tenantName}`,
          unitCode: this.props.unitCode,
          unitGroupCode: this.props.unitCode,
        });
      } catch (e) {
        console.log(e);
      }
      if(onClick) return onClick(...arg);
    };
  }

  // 阻止来自menuitem的点击事件
  preventClick(){

  }

  renderDefaultBtn(btn: Btn, inMenuItem = false) {
    const {
      props: {
        noCollection = false,
        defaultBtnType,
      },
      permissionsMap,
    } = this;
    if(!btn) return;
    const {
      btnComp,
      btnType = defaultBtnType,
      group,
      children = [],
      noChild,
      noNest,
      hidden,
      childFor = "children",
      name,
      text = "未知按钮",
      observerBtnProps,
    } = btn;
    const obProps = observerBtnProps ? observerBtnProps() : {};
    const btnProps = {hidden, ...btn.btnProps, ...obProps} || {};
    let BtnComp;
    let { child } = btn;
    let permissionInfo: undefined | PermissionInfo;
    if (permissionsMap) permissionInfo = permissionsMap.get(name) as undefined | PermissionInfo;
    if (btnProps.hidden || permissionInfo && permissionInfo.controllerType === "hidden" && !permissionInfo.approve) return;
    const newBtnProps: BtnProps = {...btnProps, key: name};
    const otherButtonProps = { ...newBtnProps.otherButtonProps };
    const buttonProps = { ...newBtnProps.buttonProps };
    if (permissionInfo && !permissionInfo.approve) {
      Object.assign(btnProps, { disabled: true });
      Object.assign(otherButtonProps, { disabled: true });
      Object.assign(buttonProps, { disabled: true });
    }
    if (typeof child === "function") child = child();
    let Wrapper: JSXElementConstructor<any> | null = null;
    if (btnComp) {
      if (inMenuItem) {
        // 用于自定义BtnComp的场景
        newBtnProps.inMenuItem = true;
        // 用于新老导出的场景
        newBtnProps.otherButtonProps = moreLinkBtnFixedStyle(otherButtonProps);
        // 用于导入的场景
        newBtnProps.buttonProps = moreLinkBtnFixedStyle(buttonProps);
        Wrapper = Menu.Item;
      }
      BtnComp = btnComp;
    }
    else if (inMenuItem) BtnComp = Menu.Item;
    else BtnComp = getBtnType(btnType);

    newBtnProps[childFor] = child;
    if(noChild)delete newBtnProps.children;
    let btnNode;

    if (group) {
      /**
       * 对于已经是Element节点的child，修改inMenuItem后直接作为btnNode，避免影响功能侧历史实现
       * group模式下，child可使用文字、函数两种形式，如果使用函数形式，务必返回功能包装后的按钮节点，包装按钮要实现inMenuItem属性
       * group模式也可使用btnComp，需要实现inMenuItem属性。（20230923支持）
       */
      if (isValidElement(child)) {
        // child模式需清理【childrFor】属性，否则会出现自身前套自身的情况
        delete newBtnProps[childFor];
        btnNode = cloneElement(child, { inMenuItem } as any);
      } else {
        btnNode = <BtnComp {...newBtnProps} />;
      }
      return this.renderGroupBtn(name, newBtnProps, btnNode, children, inMenuItem);
    }
    if(!noCollection) newBtnProps.onClick = this.clickInterceptor(child, text, name, btnProps.onClick);
    if(noNest && isValidElement(child)) return cloneElement(child, {key: name, onClick: newBtnProps.onClick} as any);
    btnNode = <BtnComp {...newBtnProps} />;
    return Wrapper ? <Wrapper>{btnNode}</Wrapper> : btnNode;
  }

  renderGroupBtn(name: string, btnProps: BtnProps, child: ReactNode, children: ChildBtn[], inMenuItem = false) {
    const {
      props: {
        trigger,
        noCollection = false,
      },
      permissionsMap,
    } = this;
    const menuChildren = children.map(subBtn => {
      if(!subBtn) return;
      const {childFor: subChildFor = "children", hidden, name: subName, text: subText = "未知按钮", noChild, observerBtnProps} = subBtn;

      const obProps = observerBtnProps ? observerBtnProps() : {};
      const subBtnProps = {hidden, ...subBtn.btnProps, ...obProps} || {};
      let permissionInfo: undefined | PermissionInfo | "loading";
      if (permissionsMap) permissionInfo = permissionsMap.get(subName) as undefined | PermissionInfo;
      if(subBtnProps.hidden || permissionInfo && (permissionInfo === "loading" || permissionInfo.controllerType === "hidden" && !permissionInfo.approve)) return;
      let { child: subChild } = subBtn;
      if(typeof subChild === "function") subChild = subChild();
      /** 聚合按钮内强制按钮类型为链接（需自行在组件内接收处理funcType属性） */
      const newSubBtnProps = {...subBtnProps, [subChildFor]: subChild, key: subName, funcType: "link"} as BtnProps;
      const otherButtonProps = { ...newSubBtnProps.otherButtonProps };
      const buttonProps = { ...newSubBtnProps.buttonProps };
      if (permissionInfo && !permissionInfo.approve) {
        Object.assign(newSubBtnProps, { disabled: true });
        Object.assign(otherButtonProps, { disabled: true });
        Object.assign(buttonProps, { disabled: true });
      }
      if(subChild && isValidElement(subChild)) newSubBtnProps[subChildFor] = cloneElement(subChild, {funcType: "link"} as any);
      if(!noCollection) newSubBtnProps.onClick = this.clickInterceptor(subChild, subText, subName, subBtnProps.onClick);
      if (subBtn.btnComp) {
        // 历史原因，inMenuItem已经用于标识是否处于更多按钮内
        // 因此group模式下子按钮的标识该用其它属性名，含义为标识当前按钮是作为group的子按钮渲染的，其它属性不做控制
        newSubBtnProps.advisedMenuItem = true;
        if (inMenuItem) {
          // 用于自定义BtnComp的场景
          newSubBtnProps.inMenuItem = true;
          // 用于新老导出的场景
          newSubBtnProps.otherButtonProps = moreLinkBtnFixedStyle(otherButtonProps);
          // 用于导入的场景
          newSubBtnProps.buttonProps = moreLinkBtnFixedStyle(buttonProps);
        }
        const BtnCompSub = subBtn.btnComp;
        let node = <BtnCompSub {...newSubBtnProps} />;
        // 仅对因超过maxNum产生的下拉按钮套menuitem，其他情况维持以前逻辑
        if (inMenuItem) {
          node = <Menu.Item>{node}</Menu.Item>;
        }
        return node;
      }
      if(noChild)delete newSubBtnProps.children;
      return (
        <Menu.Item {...newSubBtnProps} />
      );
    });
    if (inMenuItem) {
      return (
        <SubMenu key={name} title={child} onClick={this.preventClick}>
          {menuChildren}
        </SubMenu>
      );
    }

    return (
      <Dropdown
        key={name}
        trigger={trigger}
        overlay={
          <Menu style={{ minWidth: '100px' }} onClick={this.preventClick} mode="vertical">
            {menuChildren}
          </Menu>
        }
      >
        {isValidElement(child) ? cloneElement(child, btnProps) : child}
      </Dropdown>
    );
  }

  renderMoreBtns(btns: Btn[]) {
    const {
      props: {
        trigger,
        defaultBtnType,
      },
    } = this;
    const BtnComp = getBtnType(defaultBtnType);
    return (
      <Dropdown
        key="__more_btns__"
        trigger={trigger}
        overlay={
          <Menu style={{ minWidth: '100px' }} onClick={this.preventClick} mode="vertical">
            {btns.map(btn => this.renderDefaultBtn(btn, true))}
          </Menu>
        }
      >
        <BtnComp funcType={FuncType.flat} style={{ borderRadius: '2px' }}>
          <Icon type="more_horiz" />
        </BtnComp>
      </Dropdown>
    );
  }

  render() {
    const {
      props: {
        buttons = [],
        maxNum = -1,
      },
      permissionsMap,
    } = this;
    // 过滤掉一级按钮中正在加载权限集配置和权限集配置为隐藏的
    let defaultBtns = buttons.filter(b => {
      if (!b) return false;
      let permissionInfo: undefined | PermissionInfo | "loading";
      if (permissionsMap) permissionInfo = permissionsMap.get(b.name);
      if (!b || b.hidden || b.observerBtnProps && (b.observerBtnProps() || {}).hidden) return false;
      if (!permissionInfo) return true;
      if (permissionInfo === "loading") return false;
      if (permissionInfo.controllerType === "hidden" && !permissionInfo.approve) return false;
      return true;
    });
    let moreBtns: typeof buttons = [];
    if (maxNum > 1 && defaultBtns.length > maxNum) {
      moreBtns = defaultBtns.slice(maxNum - 1);
      defaultBtns = defaultBtns.slice(0, maxNum - 1);
    }
    return (
      <>
        {defaultBtns.map(btn => this.renderDefaultBtn(btn))}
        {!!moreBtns.length && this.renderMoreBtns(moreBtns)}
      </>
    );
  }
}

function getBtnType(btnType?: string) {
  let BtnComp;
  switch (btnType) {
    case "c7n": BtnComp = C7NButton; break;
    case "c7n-pro": BtnComp = C7NProButton; break;
    case "h0":
    default: BtnComp = H0Button;
  }
  return BtnComp;
}