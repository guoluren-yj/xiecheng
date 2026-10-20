import React, { Component } from 'react';
import { Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';
import FilterList from './FilterList';
import ListTable from './ListTable';

@formatterCollections({ code: ['hpfm.searchBar'] })
@connect(({ loading }) => ({
  fetchLoading: loading.effects['searchBarConfig/queryUnitFilter'],
}))
export default class SearchBarConfig extends Component {
  constructor(props) {
    super(props);
    if (typeof props.onRef === 'function') {
      props.onRef(this);
    }
    this.state = {
      filterList: [],
      currentFilter: {},
    };
  }

  componentDidMount() {
    this.querySearchBarDetail();
  }

  @Bind()
  querySearchBarDetail() {
    const { dispatch, unitId } = this.props;
    const { currentFilter = {} } = this.state;
    dispatch({
      type: 'searchBarConfig/queryUnitFilter',
      params: { unitId },
    }).then(res => {
      if (!isEmpty(res)) {
        let newCurrentFilter = currentFilter;
        if (isEmpty(currentFilter)) {
          newCurrentFilter = res.find(item => item.enabledFlag === 1)
            ? res.filter(item => item.enabledFlag === 1)[0]
            : {};
        } else {
          newCurrentFilter =
            res.find(item => item.filterCode === newCurrentFilter.filterCode) || {};
        }
        this.setState({
          filterList: res,
          currentFilter: newCurrentFilter,
        });
      }
    });
  }

  @Bind()
  handleSelectFilter(filter) {
    const { currentFilter } = this.state;
    if (!isEmpty(currentFilter) && currentFilter.filterId === filter.filterId) {
      return;
    }
    this.setState({ currentFilter: filter });
  }

  @Bind()
  changeFilterList(filterList) {
    this.setState({ filterList });
  }

  render() {
    const { filterList = [], currentFilter } = this.state;
    const { fetchLoading, originFields = [], unitInfo = {}, codes, unitList = [] } = this.props;
    return (
      <Spin spinning={fetchLoading || false}>
        <div className={styles['searchBar-container']}>
          <div className={styles['searchBar-container-left']}>
            <FilterList
              unitInfo={unitInfo}
              filterList={filterList}
              currentFilter={currentFilter}
              onSelectFilter={this.handleSelectFilter}
              onRefresh={this.querySearchBarDetail}
              onChange={this.changeFilterList}
            />
          </div>
          <div className={styles['searchBar-container-right']}>
            <ListTable
              unitInfo={unitInfo}
              codes={codes}
              unitList={unitList}
              originFields={originFields}
              currentFilter={currentFilter}
              filterList={filterList}
              onRefresh={this.querySearchBarDetail}
            />
          </div>
        </div>
      </Spin>
    );
  }
}
