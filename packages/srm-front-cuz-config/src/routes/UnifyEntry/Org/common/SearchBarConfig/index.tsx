import React, { Component, CSSProperties } from 'react';
import { Spin, DataSet } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { queryUnitFilter } from '../../../../../services/searchBarConfigService';
import styles from './index.less';
import FilterList from './FilterList';
import ListTable from './ListTable';

@formatterCollections({ code: ['hpfm.searchBar'] })
export default class SearchBarConfig<T> extends Component<T & {
  onRef: Function,
  unitId?: number | string;
  originFields?: any[];
  unitInfo: any;
  unitList?: any[];
  style?: CSSProperties;
  className?: string;
  tplParams?: any;
  mode?: string;
  readonly?: boolean;
  tplFxParams?: any;
}, any> {
  tableDs: DataSet;

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      filterList: [],
      currentFilter: {},
      loading: false,
    };
    this.tableDs = new DataSet({
      paging: false,
    });
  }

  componentDidMount() {
    this.querySearchBarDetail();
  }

  @Bind()
  async querySearchBarDetail() {
    const { unitInfo = {}, mode, tplParams } = this.props;
    const { currentFilter = {} } = this.state;
    this.tableDs.status = DataSetStatus.loading;
    const res = await queryUnitFilter(
      { unitId: unitInfo.id },
      mode,
      tplParams,
    );
    this.tableDs.status = DataSetStatus.ready;
    if (getResponse(res) && !isEmpty(res)) {
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
    const { loading, filterList = [], currentFilter } = this.state;
    const { originFields = [], unitInfo = {}, unitList = [], className, tplParams, mode, readonly, tplFxParams } = this.props;
    return (
      <Spin spinning={loading || false}>
        <div className={[styles['searchBar-container'], className].join(" ")} style={this.props.style}>
          <div className={styles['searchBar-container-left']}>
            <FilterList
              unitInfo={unitInfo}
              filterList={filterList}
              currentFilter={currentFilter}
              onSelectFilter={this.handleSelectFilter}
              onRefresh={this.querySearchBarDetail}
              onChange={this.changeFilterList}
              tplParams={tplParams}
              mode={mode}
              readonly={readonly}
            />
          </div>
          <div className={styles['searchBar-container-right']}>
            <ListTable
              unitInfo={unitInfo}
              originFields={originFields}
              currentFilter={currentFilter}
              filterList={filterList}
              unitList={unitList}
              onRefresh={this.querySearchBarDetail}
              tplParams={tplParams}
              mode={mode}
              readonly={readonly}
              tableDs={this.tableDs}
              tplFxParams={tplFxParams}
            />
          </div>
        </div>
      </Spin>
    );
  }
}