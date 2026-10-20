/* eslint-disable no-unused-vars */
import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Dropdown } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { stylePrefix, FilterType, noop } from '../util';

import FilterMenu from './FilterMenu';

export default class FilterSelector extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      listVisible: false,
    };
  }

  @Bind()
  handleSelectFilterItem(filter) {
    const { onSelectFilter = noop } = this.props;
    this.handleListVisibleChange(false);
    onSelectFilter(filter);
  }

  @Bind()
  renderFilterOption(filter = {}) {
    const { defaultFlag, type } = filter;
    const { defaultFilter = {}, onSaveFilter = noop, onRenameFilter = noop } = this.props;
    // 默认的且是预定义类型, 无可操作菜单
    const menuFlag = defaultFlag === 1 && type === FilterType.SYSTEM;
    return (
      <div
        className={classnames({
          [`${stylePrefix}-filter-option-item`]: true,
        })}
        onClick={() => this.handleSelectFilterItem(filter)}
      >
        <span className={`${stylePrefix}-filter-option-item-text`}>{filter.filterName}</span>
        {filter.filterCode === defaultFilter.filterCode && (
          <span className={`${stylePrefix}-filter-option-item-default`}>
            {intl.get('hzero.common.status.default').d('默认')}
          </span>
        )}
        {!menuFlag && (
          <span
            className={`${stylePrefix}-filter-option-item-more`}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <FilterMenu
              filter={filter}
              onSaveFilter={onSaveFilter}
              onRenameFilter={onRenameFilter}
            />
          </span>
        )}
      </div>
    );
  }

  @Bind()
  renderFilterOptions() {
    const { filterList = [] } = this.props;
    const predefinedFilter = filterList.filter((item) => item.type === FilterType.SYSTEM);
    const custmoFilter = filterList.filter((item) => item.type === FilterType.CUSTOM);
    return (
      <div className={`${stylePrefix}-filter-option-list`}>
        {predefinedFilter.map((item) => this.renderFilterOption(item))}
        {!isEmpty(custmoFilter) && (
          <>
            <div className={`${stylePrefix}-filter-option-divider`}>
              {intl.get('ssrc.filterBar.view.message.savedFilter').d('保存的筛选器')}
            </div>
            {custmoFilter.map((item) => this.renderFilterOption(item))}
          </>
        )}
      </div>
    );
  }

  @Bind()
  handleListVisibleChange(listVisible) {
    this.setState({ listVisible });
  }

  render() {
    const { listVisible } = this.state;
    const { currentFilter = {}, changeFlag } = this.props;
    return (
      <Dropdown
        overlay={this.renderFilterOptions()}
        trigger={[Action.click]}
        onVisibleChange={this.handleListVisibleChange}
        visible={listVisible}
      >
        <div className={`${stylePrefix}-qucik-filter`}>
          <span>
            <Icon type="filter_list" style={{ fontWeight: 600, color: '#000', fontSize: '15px' }} />
          </span>
          {isEmpty(currentFilter) ? (
            <span style={{ color: 'rgba(0, 0, 0, 0.45)', verticalAlign: 'middle' }}>
              {intl.get('ssrc.filterBar.view.title.quickFilter').d('快速筛选')}
            </span>
          ) : (
            <>
              <span className={`${stylePrefix}-filter-text`}>{currentFilter.filterName}</span>
              {changeFlag && (
                <span className={`${stylePrefix}-filter-has-changed`}>
                  {intl.get('ssrc.filterBar.view.title.alreadyEdited').d('已修改')}
                </span>
              )}
            </>
          )}
          <span>
            <Icon type="expand_more" />
          </span>
        </div>
      </Dropdown>
    );
  }
}
