/*
 * @Description: 协议自定义行表信息
 * @Date: 2024-03-11 16:49:10
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { Table } from 'hzero-ui';
// import intl from 'utils/intl';

@connect(({ loading, contractCommon }) => ({
  loading: loading.effects['contractCommon/fetchTableExtend'],
  contractCommon,
}))
export default class ContractTableExtend extends Component {
  state = {
    tableExtendList: [],
    tableExtendPagination: {},
  };

  componentDidMount() {
    this.fetchTableExtend();
  }

  /**
   * 查询
   */
  @Bind()
  fetchTableExtend(page) {
    const { dispatch, pcHeaderId } = this.props;
    if (pcHeaderId) {
      dispatch({
        type: 'contractCommon/fetchTableExtend',
        payload: {
          pcSourceId: pcHeaderId,
          page,
        },
      }).then((res) => {
        if (res) {
          this.setState({
            tableExtendList: res?.tableExtendList,
            tableExtendPagination: res?.tableExtendPagination,
          });
        }
      });
    }
  }

  @Bind()
  getColumns() {
    const columnArray = [];

    return columnArray;
  }

  render() {
    const { loading, customizeTable } = this.props;
    const columns = this.getColumns();
    const { tableExtendList = [], tableExtendPagination = {} } = this.state;
    const tableProps = {
      loading,
      columns,
      bordered: true,
      rowKey: 'pcTableExtendId',
      dataSource: tableExtendList,
      pagination: tableExtendPagination,
      onChange: this.fetchTableExtend,
    };
    return (
      <>
        {customizeTable(
          {
            code: 'SPCM.CONTRACT.SIGN.TABLEEXTEND.READONLY',
          },
          <Table {...tableProps} />
        )}
      </>
    );
  }
}
