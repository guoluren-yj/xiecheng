/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { TableProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import formatterCollections from '../../utils/intl/formatterCollections';
import './index.less';
import SearchBar from './SearchBar';
import type { searchBarConfigProperties } from './util';

interface SearchBarTableProps extends TableProps {
  searchCode: string; // searchBar 编码
  cacheState?: boolean; // 是否缓存筛选器, 为true则开启缓存
  tableRef?: (elem: any) => any; // table ref
  searchBarRef?: (elem: any) => any; // searchBar ref
  searchBarConfig?: searchBarConfigProperties; // searchBar 自定义属性对象
}

@formatterCollections({ code: ['srm.filterBar'] })
export default class SearchBarTable extends Component<SearchBarTableProps, any> {
  tableRef;

  @Bind()
  handleTableRef(ref) {
    this.tableRef = ref;
    const { tableRef } = this.props;
    if (tableRef) {
      tableRef(ref);
    }
  }

  @Bind()
  handleSearchBarRef(ref) {
    const { searchBarRef } = this.props;
    if (searchBarRef) {
      searchBarRef(ref);
    }
  }

  /**
   * 渲染SearchBar
   */
  @Bind()
  renderSearchBar() {
    const {
      searchBarConfig = {},
      searchCode,
      dataSet,
      cacheState,
      buttons: originButtons,
      mode,
    } = this.props;
    const buttons = isNil(originButtons) ? [] : originButtons;
    return (
      <SearchBar
        {...searchBarConfig}
        onRef={this.handleSearchBarRef}
        cacheState={cacheState}
        dataSet={[dataSet]}
        searchCode={searchCode}
        tableButtons={buttons}
        tableRef={this.tableRef}
        tableMode={mode}
      />
    );
  }

  render() {
    const { searchBarConfig = {}, buttons: originButtons } = this.props;
    const { closeFilterSelector, expandable = true } = searchBarConfig;
    const buttons = closeFilterSelector && expandable ? [] : originButtons;
    return (
      <Table
        boxSizing={TableBoxSizing.wrapper}
        {...this.props}
        ref={this.handleTableRef}
        buttons={buttons}
        queryBar={this.renderSearchBar}
      />
    );
  }
}
