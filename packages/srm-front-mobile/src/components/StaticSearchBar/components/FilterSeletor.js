import React, { Component } from 'react';
import classnames from 'classnames';
import { Dropdown } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Action } from 'choerodon-ui/pro/lib/trigger/enum';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import { stylePrefix, FilterType, noop } from '../utils/enum';

import FilterMenu from './FilterMenu';

// interface FilterSelectorProps {
//   filterList?: filterProperties[]; // 筛选器列表
//   defaultFilter?: filterProperties; // 当前筛选器
//   currentFilter?: filterProperties; // 当前筛选器
//   changeFlag?: boolean; // 筛选器是否发生更改标识
//   onSelectFilter?: (filter: object, callback?: Function) => void; // 选择筛选器回调函数
//   onSaveFilter?: (filter?: object, onSuccess?: Function, onError?: Function) => void; // 保存筛选器回调函数
//   onRenameFilter?: (filter?: object) => void; // 保存筛选器回调函数
// }

export default class FilterSelector extends Component {
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
  renderFilterOption(filter) {
    const { defaultFlag, type, filterCode } = filter;
    const { defaultFilter = {}, onSaveFilter = noop, onRenameFilter = noop } = this.props;
    // 默认的且是预定义类型, 无可操作菜单
    const menuFlag = defaultFlag === 1 && type === FilterType.SYSTEM;
    return (
      <div
        key={filterCode}
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
              {intl.get('srm.filterBar.view.message.savedFilter').d('保存的筛选器')}
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
              {intl.get('srm.filterBar.view.title.quickFilter').d('快速筛选')}
            </span>
          ) : (
            <>
              <span className={`${stylePrefix}-filter-text`}>{currentFilter.filterName}</span>
              {changeFlag && (
                <span className={`${stylePrefix}-filter-has-changed`}>
                  {intl.get('srm.filterBar.view.title.alreadyEdited').d('已修改')}
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
