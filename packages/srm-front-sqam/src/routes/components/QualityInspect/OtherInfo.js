/* eslint-disable no-useless-constructor */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';

export default class OtherInfo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { dataSource = {}, loading, customizeTable, code, handleSearch, queryType } = this.props;
    const { list = [], pagination } = dataSource;
    return (
      <React.Fragment>
        {customizeTable(
          { code },
          <Table
            bordered
            loading={loading}
            rowKey="inspectionExpandLineId"
            pagination={pagination}
            dataSource={list}
            onChange={(page) => handleSearch && handleSearch(queryType, page)}
            columns={[]}
          />
        )}
      </React.Fragment>
    );
  }
}
