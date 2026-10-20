/**
 * UnSheleveTableList -商品上架管理 -待上架
 * @date: 2018-2-7
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button, Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Link } from 'dva/router';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

import OperateRecord from '../OperateRecord';
import styles from './index.less';

export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 保存上架商品的值
      selectedRowKeys: [],
    };
  }

  /**
   * 保存勾选的数据
   * @param {string} selectedRowKeys --当前勾选数据key
   * @param {object} selectedRows --当前勾选行数据
   */
  @Bind()
  handlerRowSelect(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  }

  /**
   * 批量上架
   * @param {string} selectedRowKeys --当前勾选数据key
   * @param {object} selectedRows --当前勾选行数据
   */
  @Bind()
  batchSheleve() {
    const { onHandBatchSheleve } = this.props;
    const { selectedRowKeys } = this.state;
    const productIds = selectedRowKeys;
    onHandBatchSheleve(productIds);
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    });
  }

  /**
   * 打开操作记录
   */
  @Bind()
  openOperationRecord(record = {}) {
    const { visible } = this.state;
    this.setState({
      visible: !visible,
      productId: record.productId,
    });
  }

  // 含税/不含税单价，显示保留小数点2-5位小数
  @Bind()
  toFixedTax(price = '') {
    if (price === null || price === '' || isNaN(price)) {
      return '';
    } else {
      const value = price.toString();
      const ind = value.indexOf('.');
      const precision = ind === -1 ? 0 : Math.abs(value.length - ind);
      if (precision > 2) {
        return Math.round(price * 100000) / 100000;
      } else {
        return price.toFixed(2);
      }
    }
  }

  render() {
    const { loading, onFetchGoods, pagination, list, sheleveLoading, tabStatus } = this.props;
    const { selectedRows, visible, productId } = this.state;
    const columns = [
      {
        title: intl.get('scec.common.model.productStatus').d('状态'),
        dataIndex: 'productStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.productNum').d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
        render: (val, record) => {
          return (
            <Link
              to={`/scec/goods-manage/detail?productId=${record.productId}&tabStatus=${tabStatus}`}
            >
              {val}
            </Link>
          );
        },
      },
      {
        title: intl.get('scec.common.model.productName').d('商品名称'),
        dataIndex: 'productName',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.catalogName').d('目录名称'),
        dataIndex: 'catalogName',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.effectiveDays').d('有效天数'),
        dataIndex: 'effectiveDays',
        width: 100,
        render: val => {
          return val;
        },
        onCell: record => {
          const { effectiveDays } = record;
          const Days = parseInt(effectiveDays, 10);
          if (Days >= 0 && Days <= 7) {
            return { className: styles['effectiveDays-more-col'] };
          } else if (Days < 0) {
            return { className: styles['effectiveDays-col'] };
          } else {
            return {};
          }
        },
      },
      {
        title: intl.get('scec.common.model.taxPrice').d('含税单价'),
        dataIndex: 'taxPrice',
        width: 100,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.netPrice').d('不含税单价'),
        dataIndex: 'netPrice',
        width: 100,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.supplier').d('供应商'),
        dataIndex: 'supplierName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.company').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.createdUserName').d('创建人'),
        dataIndex: 'createdUserName',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.sourceFromType').d('数据来源'),
        dataIndex: 'sourceFromTypeMeaning',
        // width: 150,
        render: (text, value) => (
          <span style={value.sourceFromType === 'SHARE' ? { marginLeft: -12 } : {}}>
            <Badge
              status={
                value.sourceFromType === 'SHARE' ? (value.enableFlag ? 'success' : 'error') : ''
              }
            />
            {text}
          </span>
        ),
      },
      {
        title: intl.get('scec.common.model.sourceFromNum').d('来源单号'),
        dataIndex: 'sourceFromNum',
        width: 150,
      },
      {
        title: intl.get('scec.common.model.mappingState').d('映射状态'),
        dataIndex: 'refFlag',
        width: 100,
        render: text => (text === 1 ? '已映射' : '未映射'),
      },
      {
        title: intl.get('scec.common.button.operating').d('操作记录'),
        dataIndex: 'records',
        width: 100,
        render: (_, record) => {
          return (
            <a onClick={() => this.openOperationRecord(record)}>
              {intl.get('scec.common.button.operating').d('操作记录')}
            </a>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <div className="table-operator">
          <Button
            disabled={selectedRows.length === 0}
            loading={sheleveLoading}
            onClick={this.batchSheleve}
          >
            {intl.get('scec.goodsManage.button.goodsManage.sheleve').d('上架')}
          </Button>
        </div>
        <Table
          pagination={pagination}
          dataSource={list.content || []}
          rowKey="productId"
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          loading={loading}
          bordered
          onChange={page => onFetchGoods(page)}
          rowSelection={{
            selectedRowKeys: selectedRows.map(n => n.productId),
            onChange: this.handlerRowSelect,
          }}
        />
        {visible && (
          <OperateRecord
            productId={productId}
            modalVisible={visible}
            onHandleOk={this.openOperationRecord}
          />
        )}
      </React.Fragment>
    );
  }
}
