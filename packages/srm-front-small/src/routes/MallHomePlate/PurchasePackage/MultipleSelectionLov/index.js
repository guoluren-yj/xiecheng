/**
 * MultipleSelectionLov - 供应商多选lov
 * @date: 2020-2-24
 * @author: zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Table, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isFunction } from 'lodash';

import {
  filterNullValueObject,
  tableScrollWidth,
  createPagination,
  addItemsToPagination,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import FilterForm from './FilterForm';

@connect(({ mallHomePlate, loading }) => ({
  mallHomePlate,
  fetchDataLoading: loading.effects['mallHomePlate/fetchProduct'],
}))
export default class MultipleSelectionLov extends React.Component {
  form;

  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      lineSelectedRows: [], // 列表页选择行rows
      lineSelectedKeys: [], // 列表页选择行keys
    };
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCloseSuppModal() {
    this.setState(
      {
        suppLovVisible: false,
      },
      () => {
        this.form.resetFields();
      }
    );
  }

  /**
   * 供应商modal
   */
  @Bind()
  handleSupplierModal() {
    this.setState(
      {
        suppLovVisible: true,
        lineSelectedRows: [],
        lineSelectedKeys: [],
      },
      () => {
        this.handleSearch();
      }
    );
  }

  /**
   * table跨页勾选
   */
  @Bind()
  lineSelectedChange(keys = [], rows = []) {
    const { lineSelectedRows = [], lineSelectedKeys = [] } = this.state;
    // 新增勾选
    const addRows = rows.filter((n) => !lineSelectedKeys.includes(n.skuId));
    const newRows = [...lineSelectedRows, ...addRows];
    // 取消勾选
    const newSelectedRows = newRows.filter((n) => keys.includes(n.skuId));
    this.setState({
      lineSelectedRows: newSelectedRows,
      lineSelectedKeys: keys,
    });
  }

  /**
   * 列表查询
   * @param {*} page - 分页
   */
  @Bind()
  handleSearch(page) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'mallHomePlate/fetchProduct',
      payload: {
        ...fieldValues,
        shelfFlag: 1,
        companyId: -1,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          productDataSource: res.content,
          productPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 确定操作
   */
  @Bind()
  handleOk() {
    const { lineSelectedRows = [], lineSelectedKeys = [] } = this.state;
    const {
      dispatch,
      marketBasketId,
      mallHomePlate: { packageProductList = [], packageProductPage = {} },
    } = this.props;
    let repeatFlag = false;
    packageProductList.forEach((n) => {
      if (lineSelectedKeys.includes(n.productId)) {
        repeatFlag = true;
        return false;
      }
    });
    if (repeatFlag) {
      notification.warning({
        message: intl.get('small.common.view.message.repeatAdd').d('请勿重复添加'),
      });
      return false;
    }
    const newData = lineSelectedRows.map((n) => {
      const {
        supplierTenantId,
        supplierCompanyId,
        supplierCompanyNum,
        supplierCompanyName,
        skuId,
        skuCode,
        skuName,
        sourceFrom,
      } = n;
      return {
        skuId,
        marketBasketId,
        supplierTenantId,
        supplierCompanyId,
        supplierCompanyCode: supplierCompanyNum,
        supplierCompanyName,
        productId: skuId,
        productNum: skuCode,
        productName: skuName,
        sourceType: sourceFrom === 'CATA' ? 'CATA' : 'EC',
        sourceFrom,
        _status: 'create',
      };
    });
    dispatch({
      type: 'mallHomePlate/updateState',
      payload: {
        packageProductList: [...packageProductList, ...newData].map((n, index) => ({
          ...n,
          orderSeq: index + 1,
        })),
        packageProductPage: addItemsToPagination(
          newData.length,
          packageProductList.length,
          packageProductPage
        ),
      },
    });
    this.setState(
      {
        suppLovVisible: false,
        lineSelectedRows: [],
        lineSelectedKeys: [],
      },
      () => {
        this.form.resetFields();
      }
    );
  }

  render() {
    const {
      suppLovVisible,
      lineSelectedKeys = [],
      productPagination = {},
      productDataSource = [],
    } = this.state;
    const {
      fetchDataLoading,
      mallHomePlate: { treeList = [], sourceType = [] },
    } = this.props;
    const filterProps = {
      treeList,
      sourceType,
      onRef: this.handleBindRef,
      onHandleSearch: this.handleSearch,
    };
    const columns = [
      {
        title: intl.get(`small.common.model.common.ecProductNum`).d('商品编码'),
        dataIndex: 'skuCode',
        width: 150,
      },
      {
        title: intl.get(`small.common.model.common.ecProductName`).d('商品名称'),
        dataIndex: 'skuName',
      },
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 150,
      },
      // {
      //   title: intl.get(`small.common.model.agreementNumber`).d('协议编号'),
      //   dataIndex: 'agreementNumber',
      //   width: 170,
      // },
      {
        title: intl.get(`small.common.model.common.sourceType`).d('商品类型'),
        dataIndex: 'sourceFrom',
        width: 100,
        render: (val) =>
          val === 'CATA'
            ? intl.get('small.common.model.common.directory').d('目录化')
            : intl.get('small.common.model.common.E-commerce').d('电商'),
      },
    ];
    const scrollX = tableScrollWidth(columns);
    return (
      <Modal
        title={intl.get(`small.common.model.common.product`).d('商品')}
        destroyOnClose
        visible={suppLovVisible}
        onCancel={this.handleCloseSuppModal}
        onOk={this.handleOk}
        width={1100}
      >
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <Table
          bordered
          rowKey="skuId"
          loading={fetchDataLoading}
          columns={columns}
          rowSelection={{
            selectedRowKeys: lineSelectedKeys,
            onChange: this.lineSelectedChange,
          }}
          scroll={{ x: scrollX }}
          dataSource={productDataSource}
          pagination={productPagination}
          onChange={(page) => this.handleSearch(page)}
        />
      </Modal>
    );
  }
}
