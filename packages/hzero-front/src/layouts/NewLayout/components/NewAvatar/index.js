/**
 * NewAvatar
 * @author Hugh <huazhen.wu01@going-link.com>
 * @date 2022/7/7
 * @copyright 2022 © ZHENYUN
 */

import React, { useCallback, useMemo, useState } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import classNames from 'classnames';
import { Avatar } from 'choerodon-ui';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentRole } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import NewWrapDropdown from '../NewWrapDropdown';
import NavigationSelect from '../NavigationSelect';
import DefaultRoleSelect from '../../../components/DefaultRoleSelect';

const itemCls = ['right', 'item'];
const userCls = [...itemCls, 'user'];
const userNavSelectCls = [...itemCls, 'nav', 'select'];
const avatarCls = [...itemCls, 'avatar'];
const userInfoCls = [...userCls, 'info'];
const userInfoContentCls = [...userInfoCls, 'content'];

const NewAvatar = function NewAvatar(props) {
  const { getHeaderClassName, currentUser = {}, roleList, menuHidden, dispatch } = props;
  const { realName, currentRoleName, loginName, imageUrl } = currentUser;
  const [{
    dropdownHidden,
  }, setState] = useState({
    dropdownHidden: true,
    roleListLoaded: false,
  });
  const handleItemClick = useCallback((e) => {
    if (e.key === 'logout') {
      dispatch({
        type: 'login/logout',
      });
    }
  }, []);
  const handleDropdownHiddenChange = useCallback((dropdownHidden) => {
    setState((prevState) => {
      if (!dropdownHidden && !prevState.roleListLoaded) {
        setTimeout(() => {
          dispatch({
            type: 'user/fetchRoleList',
            payload: { organizationId: getCurrentOrganizationId() },
          }).then(() => {
            setState(pState => ({ ...pState, roleListLoaded: true }));
          });
        }, 0);
      }
      return {
        ...prevState,
        dropdownHidden,
      };
    });
  }, [dispatch]);
  const dropdownProps = useMemo(() => {
    const name = realName || currentRoleName || '';
    const avatarProps = {
      src: imageUrl,
      title: name,
      children: name.slice(0, 1),
    };
    const items = [
      [
        !menuHidden && {
          key: 'user-info',
          className: getHeaderClassName(...userInfoCls, 'wrapper'),
          ele: (
            <Link
              to="/hiam/user/info"
            >
              <div className={getHeaderClassName(...userInfoCls)}>
                <Avatar
                  className={classNames(
                    getHeaderClassName(...avatarCls, 'img'),
                    getHeaderClassName(...avatarCls, 'img', 'light'),
                  )}
                  {...avatarProps}
                />
                <div className={getHeaderClassName(...userInfoContentCls)}>
                  <div className={getHeaderClassName(...userInfoContentCls, 'count')}>{realName}</div>
                  <div className={getHeaderClassName(...userInfoContentCls, 'secondary')}>{loginName}</div>
                </div>
              </div>
            </Link>
          ),
        },
        roleList.length === 0 ? {
          key: 'role',
          icon: 'assignment_ind',
          ele: getCurrentRole().name || '',
        } : {
          key: 'role',
          type: 'subItem',
          ele: <DefaultRoleSelect icon="assignment_ind" />,
        },
      ].filter(Boolean),
      [
        {
          key: 'account',
          icon: 'person',
          ele: (
            <Link to="/hiam/user/info?key=account">
              {intl.get('hiam.userInfo.view.title.main.accountInfo').d('账号信息')}
            </Link>
          ),
        },
        {
          key: 'safe',
          icon: 'admin_panel_settings',
          ele: (
            <Link to="/hiam/user/info?key=safe">
              {intl.get('hiam.userInfo.view.title.main.safeSetting').d('安全设置')}
            </Link>
          ),
        },
        {
          key: 'preference',
          icon: 'settings_suggest',
          ele: (
            <Link to="/hiam/user/info?key=preference">
              {intl.get('hiam.userInfo.view.title.main.preferenceSetting').d('偏好设置')}
            </Link>
          ),
        },
      ],
      [
        {
          key: 'nav_mode',
          icon: 'auto_fix_high',
          className: getHeaderClassName(...userNavSelectCls, 'wrapper'),
          ele: (
            <NavigationSelect className={getHeaderClassName(...userNavSelectCls)} />
          ),
        },
      ],
      {
        key: 'logout',
        icon: 'exit_to_app',
        className: getHeaderClassName(...userCls, 'logout'),
        ele: intl.get('hzero.common.message.loginOut').d('退出登录'),
      },
    ].filter(Boolean);
    const host = (
      <span
        className={classNames(
          getHeaderClassName(...itemCls),
          getHeaderClassName(...avatarCls),
        )}
      >
        <Avatar
          className={getHeaderClassName(...avatarCls, 'img')}
          {...avatarProps}
        />
      </span>
    );
    return {
      host,
      items,
    };
  }, [
    imageUrl, roleList, menuHidden, getHeaderClassName, loginName, realName, currentRoleName,
  ]);

  return (
    <NewWrapDropdown
      {...dropdownProps}
      onItemClick={handleItemClick}
      menuClassName={getHeaderClassName(...avatarCls, 'dropdown')}
      hidden={dropdownHidden}
      onHiddenChange={handleDropdownHiddenChange}
    />
  );
};

export default formatterCollections({ code: ['hiam.userInfo'] })(connect(
  ({ user = {}, global = {} }) => ({
    currentUser: user.currentUser, // 当前用户
    roleList: user.roleList, // 当前角色
    menuHidden: global.menuHidden, // 隐藏菜单
  }),
  null,
  null,
  { pure: true },
)(NewAvatar));
