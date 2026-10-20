import React, { Component } from 'react';
import { Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryUnitFilter } from '@/services/searchBarConfigService';
import styles from './index.less';
import FilterList from './FilterList';
import ListTable from './ListTable';

interface SearchBarConfigProps {
  unitId?: any;
  originFields: any[];
  unitInfo: any;
}

interface SearchBarConfigState {
  currentFilter: any;
  filterList: any[];
  fetchLoading: boolean;
}

@formatterCollections({ code: ['hpfm.searchBar'] })
export default class SearchBarConfig extends Component<SearchBarConfigProps, SearchBarConfigState> {
  constructor(props) {
    super(props);
    if (typeof props.onRef === 'function') {
      props.onRef(this);
    }
    this.state = {
      filterList: [],
      currentFilter: {},
      fetchLoading: false,
    };
  }

  componentDidMount() {
    this.querySearchBarDetail();
  }

  componentDidUpdate(prevProps) {
    if (this.props.unitId !== prevProps.unitId) this.querySearchBarDetail();
  }

  @Bind()
  querySearchBarDetail() {
    const { unitId } = this.props;
    const { currentFilter = {} } = this.state;
    this.setState({ fetchLoading: true });
    queryUnitFilter({ unitId }).then(res => {
      if (getResponse(res) && !isEmpty(res)) {
        const filterList = res.filter(item => item.enabledFlag === 1);
        let newCurrentFilter = currentFilter;
        if (isEmpty(currentFilter)) {
          newCurrentFilter = filterList[0];
        } else {
          newCurrentFilter =
            filterList.find(item => item.filterCode === newCurrentFilter.filterCode) || {};
        }
        this.setState({
          filterList: filterList,
          currentFilter: newCurrentFilter,
        });
      }
    }).finally(() => {
      this.setState({ fetchLoading: false });
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


  render() {
    const { fetchLoading, filterList = [], currentFilter } = this.state;
    const {
      originFields = [], 
      unitInfo = {},
     } = this.props;
    return (
      <Spin spinning={fetchLoading || false}>
        <div className={styles['searchBar-container']}>
          <div className={styles['searchBar-container-left']}>
            <FilterList
              filterList={filterList}
              currentFilter={currentFilter}
              onSelectFilter={this.handleSelectFilter}
            />
          </div>
          <div className={styles['searchBar-container-right']}>
            <ListTable
              unitInfo={unitInfo}
              originFields={originFields}
              currentFilter={currentFilter}
            />
          </div>
        </div>
      </Spin>
    );
  }
}
