/**
 * TableList -电商商品上下架
 * @date: 2018-12-25
 * @author lx <xia.li@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { numberRender } from 'utils/renderer';

export default class TableList extends Component {
  // 含税/不含税单价，显示保留小数点后两位小数
  @Bind()
  toFixedTax(data = '') {
    if (data === null) {
      return '';
    } else {
      const taxData = numberRender(data, 2, false);
      return taxData;
    }
  }

  render() {
    const {
      list,
      select,
      loading,
      pagination,
      onFetchGoods,
      selectedRows,
      handlePreview,
      handlerRowSelect,
      handBatchSheleve,
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.ecProductNum').d('商品编码'),
        dataIndex: 'ecProductNum',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.ecProductName').d('商品名称'),
        dataIndex: 'ecProductName',
      },
      {
        title: intl.get('scec.common.model.ecPlatFormName').d('电商名称'),
        dataIndex: 'ecPlatFormName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.ecCategoryName').d('电商分类名称'),
        dataIndex: 'ecCategoryName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.mappingStatus').d('映射状态'),
        dataIndex: 'mappingStatus',
        width: 120,
        render: text => (text === 1 ? '已映射' : '未映射'),
      },
      {
        title: intl.get('scec.common.model.groupCatalogue').d('集团目录'),
        dataIndex: 'catalogName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.agreementPrice').d('协议价'),
        dataIndex: 'agreementPrice',
        width: 100,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.jdPrice').d('电商价'),
        dataIndex: 'jdPrice',
        width: 120,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.wareQd').d('单位'),
        dataIndex: 'wareQd',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.tntShelfFlag').d('上架状态'),
        dataIndex: 'tntShelfFlag',
        width: 100,
        render: text => (text === 1 ? '已上架' : '未上架'),
      },
      {
        title: intl.get('scec.common.button.action').d('操作'),
        width: 120,
        render: record => {
          return (
            <span className="action-link">
              {record.tntShelfFlag === 1 ? (
                <a onClick={() => handBatchSheleve(record)}>下架</a>
              ) : (
                <a onClick={() => handBatchSheleve(record)}>上架</a>
              )}
              <a onClick={() => handlePreview(record)}>预览</a>
            </span>
          );
        },
      },
    ];

    const rowSelection = {
      onChange: handlerRowSelect,
      selectedRowKeys: selectedRows.map(item => item.tntShelfFlag === select && item.ecProductId),
      getCheckboxProps: record => ({
        disabled: select !== undefined && record.tntShelfFlag !== select,
      }),
    };

    return (
      <React.Fragment>
        <Table
          bordered
          loading={loading}
          columns={columns}
          scroll={{ x: 1300 }}
          rowKey="ecProductId"
          pagination={pagination}
          rowSelection={rowSelection}
          dataSource={list.content || []}
          onChange={page => onFetchGoods(page)}
        />
      </React.Fragment>
    );
  }
}
