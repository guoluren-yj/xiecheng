/**
 * GoodsMaintain -Sourcing 商品维护-寻源
 * @date: 2019-2-21
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import { filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

import FilterForm from './FilterForm';

@connect(({ sourcing, loading }) => ({
  sourcing,
  loading: loading.effects['sourcing/fetchSourcingList'],
}))
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [], // 保存目录接口
    };
  }

  form;

  componentDidMount() {
    this.fetchSourcing();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 获取目录列表
   */
  @Bind()
  fetchSourcing(params = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { quotationExpiryDateFrom, quotationExpiryDateTo } = fieldValues;
    dispatch({
      type: 'sourcing/fetchSourcingList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
        quotationExpiryDateFrom: quotationExpiryDateFrom
          ? quotationExpiryDateFrom.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        quotationExpiryDateTo: quotationExpiryDateTo
          ? quotationExpiryDateTo.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        createdParty: 'PURCHASE',
      },
    });
  }

  /**
   * 保存选择的目录列表
   */
  @Bind()
  handleRowSelectChange(_, selectedRows = []) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 点击确认后的回调
   */
  @Bind()
  onOk() {
    const { onHandOk } = this.props;
    const { selectedRows } = this.state;
    if (isFunction(onHandOk)) {
      onHandOk(selectedRows);
    }
  }

  render() {
    const {
      sourcing: { list = {}, pagination = {} },
      loading,
      onCancel,
      modalVisible,
      importSoucing,
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.sourceNum').d('寻源单号'),
        dataIndex: 'sourceNum',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.itemNum').d('行号'),
        dataIndex: 'itemNum',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.itemName').d('物料名称'),
        dataIndex: 'itemName',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.currencyName').d('币种'),
        dataIndex: 'currencyCode',
        width: 100,
      },
      {
        title: intl.get('scec.common.model.unitPrice').d('单价'),
        dataIndex: 'unitPrice',
        align: 'right',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.taxRate').d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get('scec.common.model.uomName').d('单位'),
        dataIndex: 'uomName',
        width: 120,
        align: 'center',
      },
      {
        title: intl.get('scec.common.model.supplier').d('供应商'),
        dataIndex: 'supplierCompanyName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.validDeliveryCycle').d('供货周期'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.company').d('公司'),
        dataIndex: 'companyName',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.effectiveDateFrom').d('有效期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 120,
      },
      {
        title: intl.get('scec.common.model.effectiveDateTo').d('有效期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 120,
      },
    ];
    const filterForm = {
      onRef: this.handleRef,
      onFetchData: this.fetchSourcing,
    };
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: this.state.selectedRows.map(n => n.resultId),
      onChange: this.handleRowSelectChange,
    };
    return (
      <Modal
        destroyOnClose
        title={intl.get('scec.common.model.sourcing').d('寻源结果')}
        visible={modalVisible}
        onOk={this.onOk}
        onCancel={onCancel}
        width={1020}
        confirmLoading={importSoucing}
      >
        <FilterForm {...filterForm} />
        <Table
          bordered
          loading={loading}
          rowKey="resultId"
          dataSource={list.content}
          columns={columns}
          pagination={pagination}
          scroll={{ x: 1300 }}
          rowSelection={rowSelection}
          onChange={page => this.fetchSourcing(page)}
        />
      </Modal>
    );
  }
}
