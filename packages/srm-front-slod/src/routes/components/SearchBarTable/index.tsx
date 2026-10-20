/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-07-20 20:29:45
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-23 15:34:35
 */
/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { TableProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import './index.less';
import SearchBar from './SearchBar';
import { searchBarConfigProperties } from './util';

interface SearchBarTableProps extends TableProps {
  // searchCode: string; // searchBar 编码
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
  renderSearchBar(props) {
    const { queryDataSet, queryFields, queryFieldsLimit } = props;
    const {
      searchBarConfig = {},
      dataSet,
      buttons: originButtons,
      mode,
    } = this.props;
    const buttons = isNil(originButtons) ? [] : originButtons;
    return (
      <SearchBar
        {...searchBarConfig}
        onRef={this.handleSearchBarRef}
        dataSet={dataSet}
        queryFieldsLimit={queryFieldsLimit || 3}
        queryFields={queryFields}
        queryDataSet={queryDataSet}
        tableButtons={buttons}
        tableRef={this.tableRef}
        tableMode={mode}
      />
    );
  }

  render() {
    const { searchBarConfig = {}, buttons: originButtons } = this.props;
    const { expandable = true } = searchBarConfig;
    const buttons = expandable ? [] : originButtons;
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
