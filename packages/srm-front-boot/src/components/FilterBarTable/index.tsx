/* eslint-disable no-unused-vars */
import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { TableProps } from 'choerodon-ui/pro/lib/table/interface';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import { isNil } from 'lodash';
import { Bind } from 'lodash-decorators';

import formatterCollections from '../../utils/intl/formatterCollections';
import './index.less';
import FilterBar from './FilterBar';
import type { FilterBarConfigProperties } from './util';

interface FilterBarTableProps extends TableProps {
  cacheState?: boolean; // 是否缓存筛选器, 为true则开启缓存
  tableRef?: (elem: any) => any; // table ref
  filterBarRef?: (elem: any) => any; // filterBar ref
  filterBarConfig?: FilterBarConfigProperties; // filterBar 自定义属性对象
}

@formatterCollections({ code: ['srm.filterBar'] })
export default class FilterBarTable extends Component<FilterBarTableProps, any> {
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
  handleFilterBarRef(ref) {
    const { filterBarRef } = this.props;
    if (filterBarRef) {
      filterBarRef(ref);
    }
  }

  /**
   * 渲染 FilterBar
   */
  @Bind()
  renderQueryBar() {
    const {
      filterBarConfig = {},
      dataSet,
      cacheState,
      buttons: originButtons,
      mode,
    } = this.props;
    const buttons = isNil(originButtons) ? [] : originButtons;
    const barProps = {
      ...filterBarConfig,
      onRef: this.handleFilterBarRef,
      cacheState,
      dataSet: [dataSet],
      tableButtons: buttons,
      tableRef: this.tableRef,
      tableMode: mode,
    };
    return <FilterBar {...barProps} />;
  }

  render() {
    const { filterBarConfig = {}, buttons: originButtons } = this.props;
    const { expandable = true } = filterBarConfig;
    const buttons = expandable ? [] : originButtons;
    return (
      <Table
        boxSizing={TableBoxSizing.wrapper}
        {...this.props}
        ref={this.handleTableRef}
        buttons={buttons}
        queryBar={this.renderQueryBar}
      />
    );
  }
}
