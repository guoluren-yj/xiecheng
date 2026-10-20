/**
 * NormalNav
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019/8/27
 * @copyright 2019 © HAND
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';

import { getClassName } from '../../utils';

import NormalHeaderSearch from '../NormalHeaderSearch';
import DefaultMenu from '../../../components/DefaultMenu';

function getDefaultNavClassName(...paths) {
  return getClassName('nav', ...paths);
}

@connect(({ user }) => ({ user }))
export default class NormalNav extends Component {
  static propTypes = {
    collapsed: PropTypes.bool.isRequired,
    getClassName: PropTypes.func,
  };

  state = { menuLineWrap: false };
  static defaultProps = {
    getClassName: getDefaultNavClassName,
  };

  componentDidMount() {
    const { currentUser } = this.props.user || {};
    if (currentUser && currentUser.themeConfigVO && currentUser.themeConfigVO.pageStyleLineFeed) {
      this.setState({
        menuLineWrap: true,
      })
    }
  }

  render() {
    const {
      collapsed,
      getClassName: getNavClassName,
      components = {},
      onSearchMouseEnter,
      menuHidden = false,
      menuLineWrap
    } = this.props;

    const Menu = components.Menu || DefaultMenu;
    const HeaderSearch = components.HeaderSearch || NormalHeaderSearch;

    return (
      <div className={[getNavClassName('container'), this.state.menuLineWrap && "menu-line-wrap"].filter(Boolean).join(" ")}>
        <div className={getNavClassName('normal', 'search')} onMouseEnter={onSearchMouseEnter}>
          <HeaderSearch collapsed={collapsed} menuHidden={menuHidden} />
        </div>
        {!menuHidden && (
          <div className={getNavClassName('menu')}>
            <Menu collapsed={collapsed} offsetTop={80} menuLineWrap={menuLineWrap} />
          </div>
        )}
      </div>
    );
  }
}
