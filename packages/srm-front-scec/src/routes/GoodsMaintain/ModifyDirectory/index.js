/**
 * GoodsMaintain -目录修改
 * @date: 2019-2-20
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

import FilterForm from './FilterForm';

@connect(({ modifyDirectory, loading }) => ({
  modifyDirectory,
  loading: loading.effects['modifyDirectory/fetchGoodsCateLogs'],
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
    this.fetchDirectory();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  fetchDirectory(params = {}) {
    const { dispatch, selectedRows = [] } = this.props;
    const companyId = selectedRows.map(item => item.companyId)[0];
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'modifyDirectory/fetchGoodsCateLogs',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...fieldValues,
        companyId,
      },
    });
  }

  /**
   * 保存选择的目录列表
   */
  @Bind()
  handleRowSelectChange(_, selectedRows) {
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
    onHandOk(this.state.selectedRows);
  }

  render() {
    const {
      modifyDirectory: { list = {}, pagination = {} },
      loading,
      onCancel,
      modalVisible,
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.common.model.catalogCode').d('目录代码'),
        dataIndex: 'catalogCode',
        align: 'center',
      },
      {
        title: intl.get('scec.common.model.catalogName').d('目录名称'),
        dataIndex: 'catalogFullName',
      },
    ];
    const filterForm = {
      onRef: this.handleRef,
      onFetchData: this.fetchDirectory,
    };
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: this.state.selectedRows.map(n => n.catalogId),
      onChange: this.handleRowSelectChange,
    };
    return (
      <Modal
        destroyOnClose
        title={intl.get('scec.common.model.editCatalog').d('修改目录')}
        width={800}
        visible={modalVisible}
        onCancel={onCancel}
        onOk={this.onOk}
      >
        <FilterForm {...filterForm} />
        <Table
          rowKey="catalogId"
          bordered
          loading={loading}
          dataSource={list.content || []}
          columns={columns}
          pagination={pagination}
          rowSelection={rowSelection}
          onChange={page => this.fetchDirectory(page)}
        />
      </Modal>
    );
  }
}
