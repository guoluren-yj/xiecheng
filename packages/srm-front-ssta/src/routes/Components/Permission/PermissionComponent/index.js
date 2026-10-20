import React from 'react';
import PropTypes from 'prop-types';
import { isArray, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import { PENDING, SUCCESS } from 'components/Permission/Status';

export default class Permission extends React.Component {
  // 获取传递的context
  static contextTypes = {
    permission: PropTypes.object,
  };

  state = {
    status: PENDING,
  };

  // 在 render 之前检查权限
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    const { permissionList } = this.props;
    if (permissionList !== undefined && isArray(permissionList)) {
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
    const { permissionList } = props;
    if (context.permission) {
      context.permission.check({ permissionList }, this.handlePermission);
    }
  }

  /**
   * 检查权限后的回调函数
   * @param {number} status - 权限状态
   * @param {string} controllerType - 权限的控制类型
   */
  @Bind()
  handlePermission(status) {
    this.setState({
      status,
    });
  }

  @Bind()
  extendProps() {
    const { permissionList, children } = this.props;
    const { status } = this.state;
    if (isNil(permissionList) || status === SUCCESS) {
      return children;
    } else {
      return null;
    }
  }

  render() {
    return this.extendProps();
  }
}
