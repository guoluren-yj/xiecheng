import React, { PureComponent } from 'react';
import { Dropdown, Tooltip } from 'choerodon-ui/pro';
import { Icon, Menu } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { stylePrefix, SortFieldName, getSortUpIcon, getSortDownIcon } from '../util';

export default class SortSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectorHidden: true,
    };
  }

  @Bind()
  handleToogleSortFlag() {
    this.props.onAction(() => {
      const { sortFlag } = this.props;
      const newSortFlag = sortFlag !== 'desc' ? 'desc' : 'asc';
      this.handleQuery('sortFlag', newSortFlag);
    });
  }

  @Bind()
  handleQuery(key, value) {
    const { dataSet, onChange } = this.props;
    if (dataSet && dataSet.current) {
      const sortFieldValue = dataSet.current.get(SortFieldName) || '';
      let sortFieldCode = sortFieldValue.split(':')[0];
      let sortFlag = sortFieldValue.split(':')[1] || 'asc';
      if (key === 'sortFieldCode') {
        sortFieldCode = value;
      } else {
        sortFlag = value;
      }
      onChange({
        sortFieldCode,
        sortFlag,
      });
      dataSet.current.set(SortFieldName, `${sortFieldCode}:${sortFlag}`);
    }
  }

  @Bind()
  handleSelectSortField({ key }) {
    this.props.onAction(() => {
      this.setState({ selectorHidden: true });
      this.handleQuery('sortFieldCode', key);
    });
  }

  @Bind()
  renderOverlayMenu() {
    const { fields = [] } = this.props;
    const { sortFieldCode = '' } = this.props;
    return (
      <Menu
        onClick={this.handleSelectSortField}
        className={`${stylePrefix}-sort-menu`}
        defaultSelectedKeys={[sortFieldCode]}
      >
        {fields.map((item) => (
          <Menu.Item key={item.name} className={`${stylePrefix}-sort-menu-item`}>
            {intl
              .get('srm.filterBar.view.label.orderByLabel', { name: item.label })
              .d(`按${item.label}`)}
          </Menu.Item>
        ))}
      </Menu>
    );
  }

  @Bind()
  handleClear(event) {
    event.stopPropagation();
    const { onAction, onChange } = this.props;
    onAction(() => {
      this.setState({
        selectorHidden: true,
      });
      onChange({
        sortFieldCode: null,
        sortFlag: null,
      });
      const { dataSet } = this.props;
      if (dataSet && dataSet.current) {
        dataSet.current.set(SortFieldName, undefined);
      }
    });
  }

  @Bind()
  handleChangeSelectorHidden(hidden) {
    this.setState({
      selectorHidden: hidden,
    });
  }

  render() {
    const { selectorHidden } = this.state;
    const { sortFlag, sortFieldCode } = this.props;
    const { fields = [] } = this.props;
    const overlayMenu = this.renderOverlayMenu();
    const sortField =
      fields.length < 1 || !sortFieldCode
        ? {}
        : fields.find((item) => item.name === sortFieldCode) || {};
    const SortUpIcon = getSortUpIcon();
    const SortDownIcon = getSortDownIcon();
    return (
      <span className={`${stylePrefix}-sort`}>
        <Dropdown
          hidden={selectorHidden}
          onHiddenChange={this.handleChangeSelectorHidden}
          overlay={overlayMenu}
          trigger={[Action.click]}
        >
          {!sortFieldCode ? (
            <span className={`${stylePrefix}-sort-placeholder`}>
              {intl.get('srm.filterBar.view.placeholder.selectOrderBy').d('选择排序字段')}
              <Icon type="expand_more" />
            </span>
          ) : (
            <span className={`${stylePrefix}-sort-control`}>
              {sortField.label
                ? intl
                    .get('srm.filterBar.view.label.orderByLabel', { name: sortField.label })
                    .d(`按${sortField.label}`)
                : ''}
              <Icon type="expand_more" className={`${stylePrefix}-sort-expand`} />
              <Icon
                type="close"
                className={`${stylePrefix}-sort-clear`}
                onClick={this.handleClear}
              />
            </span>
          )}
        </Dropdown>
        {sortFieldCode && (
          <Tooltip
            title={
              sortFlag === 'desc'
                ? intl.get('srm.filterBar.view.tooltip.desc').d('降序')
                : intl.get('srm.filterBar.view.tooltip.asc').d('升序')
            }
          >
            <span onClick={this.handleToogleSortFlag} className={`${stylePrefix}-sort-icon`}>
              {sortFlag === 'desc' ? SortDownIcon : SortUpIcon}
            </span>
          </Tooltip>
        )}
      </span>
    );
  }
}
