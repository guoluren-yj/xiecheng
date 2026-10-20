/**
 * ApplyToInquiry - 引用申请立项
 * @date: 2019-3-28
 * @author: ZT <tong.zhao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import React, { Component } from 'react';
import { Table, Modal, Button } from 'hzero-ui';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { isUndefined, isEmpty } from 'lodash';

import { getActiveTabKey } from 'utils/menuTab';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getCurrentUserId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import FilterForm from './FilterForm';

@connect(({ inquiryHall, loading }) => ({
  inquiryHall,
  dataSource: inquiryHall.quoteApprovalList,
  pagination: inquiryHall.quoteApprovalPagination,
  loading: loading.effects['inquiryHall/fetchListData'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
@formatterCollections({
  code: ['ssrc.common'],
})
export default class QuoteApproval extends Component {
  form;

  state = {
    selectedRows: [],
    selectedRowKeys: [],
  };

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleSearch(page = {}) {
    const { dispatch, organizationId, userId } = this.props;

    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'inquiryHall/fetchListData',
      payload: {
        page,
        ...fieldValues,
        sourceProjectStatus: 'APPROVED',
        referenceFlag: 0,
        contactUserId: userId,
        sourceCategory: 'RFX',
        organizationId,
        fromSourceHallToRfxFlag: 1,
      },
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  @Bind()
  onSelectChange(selectedRowKeys, selectedRows) {
    if (selectedRows.length > 0) {
      selectedRows.splice(0, selectedRows.length - 1);
      selectedRowKeys.splice(0, selectedRowKeys.length - 1);
    }
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  handleClick(record) {
    const { dispatch, current } = this.props;
    if (!record.sourceProjectId) return;
    const search = querystring.stringify({
      sourceFrom: 'RFX',
      sourcePage: 'inquiryHallList',
      current,
    });
    const pathname = `${getActiveTabKey()}/project-setup/detail/${record.sourceProjectId}`;
    dispatch(
      routerRedux.push({
        pathname,
        search,
      })
    );
  }

  @Bind()
  handleCreate() {
    const { createModalShow = (e) => e } = this.props;
    const { selectedRows = [] } = this.state;
    if (isEmpty(selectedRows)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return;
    }
    createModalShow(selectedRows);
  }

  render() {
    const {
      loading,
      dataSource = [],
      pagination = {},
      visible = false,
      onCancel = (e) => e,
    } = this.props;
    const { selectedRows, selectedRowKeys } = this.state;

    const columns = [
      {
        title: intl.get(`ssrc.common.model.common.projectDecode`).d('项目编码'),
        dataIndex: 'sourceProjectNum',
        width: 150,
        render: (val, record) => <a onClick={() => this.handleClick(record)}>{val}</a>,
      },
      {
        title: intl.get(`ssrc.common.model.common.projectName`).d('项目名称'),
        dataIndex: 'sourceProjectName',
      },
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      type: 'radio',
      onChange: this.onSelectChange,
    };
    const filterFormProps = {
      loading,
      onRef: this.handleRef,
      onSearch: this.handleSearch,
    };
    const modalProps = {
      visible,
      title: intl.get(`ssrc.common.view.message.title.sourcingItem`).d('寻源项目'),
      width: 650,
      onCancel,
      footer: [
        <Button onClick={onCancel}>{intl.get(`hzero.common.view.button.cancel`).d('取消')}</Button>,
        <Button type="primary" disabled={isEmpty(selectedRowKeys)} onClick={this.handleCreate}>
          {intl.get(`hzero.common.create`).d('创建')}
        </Button>,
      ],
    };
    return (
      <Modal {...modalProps}>
        <div className="table-list-search">
          <FilterForm {...filterFormProps} />
        </div>
        <Table
          scroll={{ x: scrollWidth }}
          dataSource={dataSource}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.handleSearch}
          loading={loading}
          columns={columns}
          bordered
          rowKey="prLineId"
        />
      </Modal>
    );
  }
}
