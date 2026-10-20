/**
 * TableList -商品查询
 * @date: 2018-2-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { Link } from 'dva/router';

import intl from 'utils/intl';

import OperateRecord from '../OperateRecord';
import styles from './index.less';

export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  /**
   * 操作记录显示隐藏
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
    const { loading, onFetchGoods, pagination, list } = this.props;
    const { visible } = this.state;
    const columns = [
      {
        title: intl.get('scec.common.model.productStatus').d('状态'),
        dataIndex: 'productStatusMeaning',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.productNum').d('商品编码'),
        dataIndex: 'productNum',
        width: 150,
        render: (val, record) => {
          return (
            <Link to={`/scec/goods-demand-pur/detail?productId=${record.productId}`}>{val}</Link>
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
        width: 200,
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
        width: 120,
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
        width: 120,
      },
      {
        title: intl.get('scec.common.model.sourceFromType').d('数据来源'),
        dataIndex: 'sourceFromTypeMeaning',
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
        title: intl.get('scec.common.model.specification').d('规格'),
        dataIndex: 'specifications',
        width: 80,
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
        <Table
          pagination={pagination}
          dataSource={list.content || []}
          rowKey="productId"
          columns={columns}
          scroll={{ x: 1800 }}
          loading={loading}
          bordered
          onChange={page => onFetchGoods(page)}
        />
        {visible && (
          <OperateRecord
            productId={this.state.productId}
            modalVisible={visible}
            onHandleOk={this.openOperationRecord}
          />
        )}
      </React.Fragment>
    );
  }
}
