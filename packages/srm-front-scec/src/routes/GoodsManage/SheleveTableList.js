/**
 * SheleveTableList -商品上架管理 -已上架
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
import CauseModal from './causeModal';

export default class TableList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      selectedRows: [],
      selectedRowKeys: [],
      modalVisible: false,
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
      visible: false,
    });
  }

  /**
   * 批量下架
   */
  @Bind()
  batchUnsheleve() {
    const { getSetting, onHandBatchUnsheleve } = this.props;
    getSetting().then(res => {
      if (res) {
        this.setState({
          modalVisible: true,
        });
      } else {
        const { selectedRowKeys } = this.state;
        const productIds = selectedRowKeys;
        const param = productIds.map(item => ({
          productId: item,
        }));
        onHandBatchUnsheleve(param);
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
      }
    });
  }

  @Bind()
  handleOk() {
    const { onHandBatchUnsheleve } = this.props;
    const { selectedRowKeys } = this.state;
    const productIds = selectedRowKeys;
    const value = this.form.getFieldValue('operatedRemark');
    const param = productIds.map(item => ({
      productId: item,
      operatedRemark: value,
    }));
    onHandBatchUnsheleve(param);
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
      modalVisible: false,
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

  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      loading,
      unSheleveLoading,
      getSettingLoading,
      onFetchGoods,
      pagination,
      list,
      tabStatus,
    } = this.props;
    const { selectedRows, productId, visible, modalVisible } = this.state;
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
        width: 140,
        align: 'right',
        render: val => {
          return <span>{this.toFixedTax(val)}</span>;
        },
      },
      {
        title: intl.get('scec.common.model.netPrice').d('不含税单价'),
        dataIndex: 'netPrice',
        width: 140,
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
        // width: 150,
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
            loading={unSheleveLoading || getSettingLoading}
            onClick={this.batchUnsheleve}
          >
            {intl.get('scec.goodsManage.button.goodsManage.unSheleve').d('下架')}
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
            getCheckboxProps: record => ({
              disabled:
                record.productStatus === 'UNSHELF_APPROVALING' ||
                record.productStatus === 'WORK_FLOW_APPROVALING',
            }),
          }}
        />
        {visible && (
          <OperateRecord
            productId={productId}
            modalVisible={visible}
            onHandleOk={this.openOperationRecord}
          />
        )}
        {modalVisible && (
          <CauseModal
            onRef={this.handleRef}
            modalVisible={modalVisible}
            onHandleCancel={this.handleCancel}
            onHandleOk={this.handleOk}
          />
        )}
      </React.Fragment>
    );
  }
}
