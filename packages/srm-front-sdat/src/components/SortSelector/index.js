import React, { Component } from 'react';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import formatterCollections from 'utils/intl/formatterCollections';
import { Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Icon, Menu } from 'choerodon-ui';
import intl from 'utils/intl';

import { getSortUpIcon, getSortDownIcon } from '@/utils/utils';

import styles from './index.less';

const stylePrefix = 'c7n-pro-table-search-bar';

class SortSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortFlag: 'DESC', // 排序规则 默认降序
      sortFieldCode: '', // 默认排序的项
    };
  }

  componentDidMount() {
    const { sortFieldCode } = this.props;
    this.setState({ sortFieldCode });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sortFieldCode && nextProps.sortFieldCode !== this.props.sortFieldCode) {
      this.setState({ sortFieldCode: nextProps.sortFieldCode });
    }
  }

  @Bind()
  renderOverlayMenu() {
    const { fields = [] } = this.props;
    const { sortFieldCode } = this.state;
    return (
      <Menu
        onClick={this.handleSelectSortField}
        className={`${stylePrefix}-sort-menu`}
        defaultSelectedKeys={[sortFieldCode]}
      >
        {fields.map((item) => (
          <Menu.Item key={item.name} className={`${stylePrefix}-sort-menu-item`}>
            {intl.get('sdat.commonFilter.view.label.orderBy').d('按')}
            {item.label}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  @Bind()
  handleToogleSortFlag() {
    const { sortFlag, sortFieldCode } = this.state;
    const newSortFlag = sortFlag === 'ASC' ? 'DESC' : 'ASC';
    this.setState({ sortFlag: newSortFlag });
    this.handleQuery(sortFieldCode, newSortFlag);
  }

  @Bind()
  handleQuery(sortFieldCode, sortFlag) {
    const { onSortQuery } = this.props;
    if (onSortQuery && typeof onSortQuery === 'function') {
      onSortQuery(sortFieldCode, sortFlag);
    }
  }

  @Bind()
  handleSelectSortField({ key }) {
    const { sortFlag } = this.state;
    this.setState({ sortFieldCode: key });
    this.handleQuery(key, sortFlag);
  }

  render() {
    const { fields = [] } = this.props;
    const { sortFlag, sortFieldCode } = this.state;

    const sortField =
      fields.length < 1 || !sortFieldCode
        ? {}
        : fields.find((item) => item.name === sortFieldCode) || {};

    const SortUpIcon = getSortUpIcon();
    const SortDownIcon = getSortDownIcon();

    return (
      <span className={`${stylePrefix}-sort ${styles['sort-area-cursor']}`}>
        <Dropdown overlay={this.renderOverlayMenu()} trigger={[Action.click]}>
          <span className={`${stylePrefix}-sort-control`}>
            {sortField.label
              ? `${intl.get('sdat.commonFilter.view.label.orderBy').d('按')}${sortField.label}`
              : ''}
            &nbsp;&nbsp;
            <Icon type="expand_more" />
          </span>
        </Dropdown>
        &nbsp;&nbsp;
        <Tooltip
          title={
            sortFlag === 'ASC'
              ? intl.get('srm.filterBar.view.tooltip.asc').d('升序')
              : intl.get('srm.filterBar.view.tooltip.desc').d('降序')
          }
        >
          <span onClick={this.handleToogleSortFlag} className={`${stylePrefix}-sort-icon`}>
            {sortFlag === 'DESC' ? SortDownIcon : SortUpIcon}
          </span>
        </Tooltip>
      </span>
    );
  }
}

export default formatterCollections({
  code: ['sdat.commonFilter'],
})(SortSelector);
