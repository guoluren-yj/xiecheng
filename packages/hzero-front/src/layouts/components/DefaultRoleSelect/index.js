/**
 * 角色切换
 */
import React, { PureComponent } from 'react';
import { Menu, Spin, Icon } from 'choerodon-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { find, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import NProgress from 'components/NProgress';

import { getCurrentRole, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import { cleanMenuTabs } from 'utils/menuTab';
import { CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE, YQCLOUD_TABMAP, YQCLOUD_COUNT } from 'utils/constants';

import styles from './index.less';

class DefaultRoleSelect extends PureComponent {
  @Bind()
  onClick({ key }) {
    const { user = {}, updateCurrentRole, updateCurrentUser, gotoTab } = this.props;
    const { roleList = [], currentUser } = user;
    const { timeZone } = currentUser || {};
    const newDefaultRole = find(roleList, (o) => String(o.id) === key) || {};
    NProgress.start();
    const { id, name } = newDefaultRole;
    updateCurrentRole({ roleId: id }).then((res) => {
      NProgress.done();
      if (!(res && res.failed)) {
        updateCurrentUser({
          currentRoleId: id,
          currentRoleName: name,
        });
        // 切换角色时记录当前登陆租户、角色和语言
        localStorage.setItem(
          CURRENT_TENANT_ROLE_LANGUAGE_TIMEZONE,
          `${getCurrentOrganizationId()}-${id}-${getCurrentLanguage()}-${timeZone}`
        );
        localStorage.removeItem(YQCLOUD_TABMAP);
        localStorage.removeItem(YQCLOUD_COUNT);
        // 切换到 工作台
        // warn 清空 tabs 信息
        cleanMenuTabs();
        gotoTab({ pathname: '/workplace' });
        window.location.reload();
      }
    });
  }

  render() {
    const { user = {}, icon } = this.props;
    const { roleList = [] } = user;
    return (
      <Menu
        className="default-role-select-dropdown"
        selectedKeys={[`${(getCurrentRole() || {}).id}`]}
        onClick={this.onClick}
      >
        {isEmpty(roleList) ? (
          <Menu.Item key="loading-spin">
            <Spin />
          </Menu.Item>
        ) : (
          <Menu.SubMenu
            className={icon ? undefined : styles['select-role-wrap']}
            title={
              <div
                className={icon ? undefined : styles['select-role']}
                style={icon ? { marginRight: '.1rem' } : undefined}
              >
                {icon && <Icon type={icon} />}
                <span>{getCurrentRole().name || ''}</span>
              </div>
            }
          >
            {roleList.map((n) => (
              <Menu.Item key={n.id} className={icon ? undefined : styles['select-role-item']}>
                <div className={icon ? undefined : styles['select-role-item-divider']}>
                  {n.name}
                </div>
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
      </Menu>
    );
  }
}

export default connect(
  ({ user = {} }) => ({
    user,
  }),
  (dispatch) => ({
    // 更新当前角色(调接口)
    updateCurrentRole: (payload) =>
      dispatch({
        type: 'user/updateCurrentRole',
        payload,
      }),
    // 更新用户信息
    updateCurrentUser: (payload) =>
      dispatch({
        type: 'user/updateCurrentUser',
        payload,
      }),
    // 跳转到页面
    gotoTab: (location, state) => dispatch(routerRedux.push(location, state)),
  })
)(DefaultRoleSelect);
