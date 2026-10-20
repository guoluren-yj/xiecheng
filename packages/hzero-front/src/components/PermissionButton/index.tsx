import React from 'react';
import type { RouteComponentProps } from 'react-router';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Button as HzeroButton } from 'hzero-ui';
import { Button as C7nProButton } from 'choerodon-ui/pro';
import { Button as C7nButton } from 'choerodon-ui';
import qs from 'querystring';

import { PENDING, SUCCESS } from 'components/Permission/Status';

import { Bind } from 'lodash-decorators';
import { findMenuPath } from 'utils/menuTab';

interface ApmPermissionButtonProps {
  apmName: string;
  [x: string]: any;
}

class ApmPermissionButton extends React.Component<
  RouteComponentProps & ApmPermissionButtonProps,
  any
> {
  // 获取传递的context
  static contextTypes = {
    permission: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const routerParam = qs.parse(this.props.location.search.substr(1)) || {};
    this.state = {
      status: PENDING,
      controllerType: 'hidden',
      noCheckPermission: routerParam.noCheckPermission === 'true', // 判断当前页面是否在工作流审批表单内
    };
  }

  // 在 render 之前检查权限， permissionList
  // eslint-disable-next-line
  componentDidMount() {
    const { noCheckPermission } = this.state;
    const { permissionList = [] } = this.props;
    if (permissionList !== undefined && Array.isArray(permissionList) && !noCheckPermission) {
      this.check(this.props, this.context);
    }
  }

  /**
   * 调用 context 的 check
   * @param {object} props - 检查所需参数
   * @param {object} context - 上下文
   */
  @Bind()
  check(props, context) {
    const { permissionList = [] } = props;
    if (context.permission) {
      context.permission.check({ permissionList }, this.handlePermission);
    }
  }

  @Bind()
  handlePermission(status, controllerType = 'hidden') {
    this.setState({
      status,
      controllerType,
    });
  }

  @Bind()
  renderButton(params: any = {}) {
    const { type = '', c7nType = 'button', ...otherProps } = params;
    switch (type) {
      case 'text':
        return <a {...otherProps}>{params.children}</a>;
      case 'c7n-pro':
        return <C7nProButton {...otherProps} type={c7nType} />;
      case 'c7n':
        return <C7nButton {...otherProps} type={c7nType} />;
      default:
        return <HzeroButton {...otherProps} type={type} />;
    }
  }

  clickInterceptor = onClick => {
    return (...arg) => {
      try {
        const {
          global: { menu: menus },
          routing: {
            location: { pathname },
          },
          user: { tenantNum, tenantName },
        } = (window as any).dvaApp._store.getState();
        const menuPath = findMenuPath(menus, pathname);
        const menuInfo = menuPath.reduce((info, menu, index) => {
          const { menuItem, title } = menu;
          const { flex } = menuItem || {};
          const { defaultName } = flex || {};
          // eslint-disable-next-line no-param-reassign
          info[`permission${index + 1}级菜单`] = defaultName || title;
          return info;
        }, {});
        let btnName = this.props.apmName;
        if (btnName === undefined && this.props.children && this.props.children.toString) {
          btnName = this.props.children.toString() || '未知按钮';
          if (btnName.includes('object')) btnName = '未知按钮';
        }
        const permission = (this.props.permissionList || [])[0] || {};
        (window as any).collectEvent('button-click-permission', {
          pathname,
          ...menuInfo,
          btnName,
          permissionCode: permission.code,
          permissionType: permission.type,
          permissionMeaning: permission.meaning,
          permission_租户信息: `${tenantNum}-${tenantName}`,
        });
      } catch (e) {
        console.log(e);
      }
      if (onClick) return onClick(...arg);
    };
  };

  @Bind()
  extendProps() {
    const { permissionList, className: propsClass, onClick, ...otherProps } = this.props;
    const { style = {} } = otherProps;
    const { status, controllerType, noCheckPermission } = this.state;
    const className = [propsClass, 'hzero-permission-btn'].join(' ');
    // 普通按钮不做限制
    // 在工作流审批内不限制
    if (permissionList === undefined || noCheckPermission) {
      return (this as any).renderButton({
        ...otherProps,
        className,
        onClick: this.clickInterceptor(onClick),
      });
    }
    // 鉴权通过后的处理
    if (status === SUCCESS) {
      return (this as any).renderButton({
        ...otherProps,
        className,
        onClick: this.clickInterceptor(onClick),
      });
      // 鉴权失败
    } else if (controllerType === 'disabled') {
      // approved=false，则controllerType=disabled则禁用，其他，则隐藏
      return (this as any).renderButton({
        ...otherProps,
        className: [className, 'hzero-permission-btn-disabled'].join(' '),
        onClick: this.clickInterceptor(onClick),
        disabled: true,
        style: { ...style, cursor: 'not-allowed', color: 'rgba(0,0,0,0.25)' },
      });
    } else {
      return null;
    }
  }

  render() {
    return this.extendProps();
  }
}

export default withRouter(ApmPermissionButton);
