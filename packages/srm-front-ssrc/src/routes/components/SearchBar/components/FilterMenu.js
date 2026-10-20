/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Dropdown } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { stylePrefix, FilterType, FilterStatus, noop } from '../util';

export default class FilterMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false,
    };
  }

  @Bind()
  setDefaultFilter(filter) {
    const newFilter = {
      ...filter,
      _status: FilterStatus.UPDATE,
      defaultFlag: 1,
    };
    this.handleUpdateFilter(newFilter);
  }

  @Bind()
  handleUpdateFilter(filter) {
    const { onSaveFilter = noop } = this.props;
    onSaveFilter(filter);
  }

  @Bind()
  renameFilter(filter) {
    const { onRenameFilter = noop } = this.props;
    if (isFunction(onRenameFilter)) {
      onRenameFilter(filter);
    }
  }

  @Bind()
  removeFilter(filter) {
    const newFilter = {
      ...filter,
      _status: FilterStatus.DELETE,
    };
    this.handleUpdateFilter(newFilter);
  }

  @Bind()
  handleClickMenu(key, filter) {
    this.handleMenuVisibleChange(false);
    if (key === 'default') {
      this.setDefaultFilter(filter);
    } else if (key === 'rename') {
      this.renameFilter(filter);
    } else if (key === 'delete') {
      this.removeFilter(filter);
    }
  }

  @Bind()
  renderMenu(filter) {
    return (
      <Menu
        className={`${stylePrefix}-filter-option-menu`}
        onClick={({ key }) => this.handleClickMenu(key, filter)}
      >
        {filter.defaultFlag !== 1 && (
          <Menu.Item key="default">
            {intl.get('ssrc.filterBar.button.setDefault').d('设为默认')}
          </Menu.Item>
        )}
        {filter.type !== FilterType.SYSTEM && (
          <Menu.Item key="rename">{intl.get('ssrc.filterBar.button.rename').d('重命名')}</Menu.Item>
        )}
        {filter.type !== FilterType.SYSTEM && (
          <Menu.Item key="delete" style={{ color: '#f81d22' }}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Menu.Item>
        )}
      </Menu>
    );
  }

  @Bind()
  handleMenuVisibleChange(menuVisible) {
    this.setState({ menuVisible });
    const menuList = document.getElementsByClassName('ssrc-c7n-pro-table-search-bar-filter-menu');
    if (!isEmpty(menuList)) {
      for (let i = 0; i < menuList.length; i++) {
        menuList[i].style.display = menuVisible ? 'block' : 'none';
      }
    }
  }

  render() {
    const { menuVisible } = this.state;
    const { filter = {} } = this.props;
    return (
      <Dropdown
        popupClassName={classnames(
          `${stylePrefix}-filter-menu`,
          `${stylePrefix}-filter-menu-${filter.filterCode}`
        )}
        overlay={this.renderMenu(filter)}
        trigger={[Action.click]}
        onVisibleChange={this.handleMenuVisibleChange}
        visible={menuVisible}
      >
        <span>
          <Icon type="more_horiz" />
        </span>
      </Dropdown>
    );
  }
}
