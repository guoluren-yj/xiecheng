import React, { Component } from 'react';
import { sum, isNumber, isArray } from 'lodash';
import { Table } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';

export default class List extends Component {
  @Bind()
  toDetail(ele) {
    const { history = {} } = this.props;
    const { sourceCode, acceptListHeaderId } = ele;
    history.push({
      pathname:
        sourceCode === 'NONE'
          ? `/sinv/acceptance-sheet-create/noDocument/detail/${acceptListHeaderId}`
          : `/sinv/acceptance-sheet-create/agreement/detail/${acceptListHeaderId}`,
    });
  }

  //   操作
  render() {
    const {
      dataSource,
      pagination,
      onSearch,
      selectedRowKeys = [],
      onSelectRow,
      loading,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.acceptListNum`).d('验收单号'),
        dataIndex: 'acceptListNum',
        width: 150,
        render: (val, record) => (
          <a
            onClick={() => {
              this.toDetail(record);
            }}
          >
            {val}
          </a>
        ),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.title`).d('验收单标题'),
        dataIndex: 'title',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.acceptListStatus`).d('验收单状态'),
        dataIndex: 'statusCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.acceptListType`).d('验收类型'),
        dataIndex: 'acceptListTypeName',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.sourceCode`).d('验收单据来源'),
        dataIndex: 'sourceCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.companyId`).d('公司'),
        dataIndex: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.supplier`).d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.checkMan`).d('验收人'),
        dataIndex: 'acceptorNameList',
        width: 150,
        render: val => (isArray(val) ? val.join() : val),
      },
      {
        title: intl.get(`sinv.acceptanceSheetCreate.model.checkDate`).d('验收日期'),
        width: 120,
        dataIndex: 'acceptDate',
        render: dateRender,
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Table
        bordered
        columns={columns}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectRow,
        }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onSearch}
        scroll={{ x: scrollX }}
      />
    );
  }
}
