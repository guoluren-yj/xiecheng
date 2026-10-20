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

import { filterNullValueObject, tableScrollWidth, addItemsToPagination } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import FilterForm from './FilterForm';

@connect(({ businessOrderPublish, loading }) => ({
  businessOrderPublish,
  fetchDataLoading: loading.effects['businessOrderPublish/fetchSupplier'],
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
    const addRows = rows.filter(n => !lineSelectedKeys.includes(n.supplierCompanyId));
    const newRows = [...lineSelectedRows, ...addRows];
    // 取消勾选
    const newSelectedRows = newRows.filter(n => keys.includes(n.supplierCompanyId));
    this.setState({
      lineSelectedRows: newSelectedRows,
      lineSelectedKeys: keys,
    });
  }

  /**
   * 业务通知单列表查询
   * @param {*} page - 分页
   */
  @Bind()
  handleSearch(page) {
    const {
      dispatch,
      businessOrderPublish: { orderFormData = {} },
    } = this.props;
    const { companyId } = orderFormData;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'businessOrderPublish/fetchSupplier',
      payload: {
        ...fieldValues,
        companyId,
        page,
      },
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
      businessOrderPublish: { supplierTable = [], supplierPagination = {} },
    } = this.props;
    let repeatFlag = false;
    supplierTable.forEach(n => {
      if (lineSelectedKeys.includes(n.supplierCompanyId)) {
        repeatFlag = true;
        return false;
      }
    });
    if (repeatFlag) {
      notification.warning({
        message: intl
          .get('spfm.businessOrder.view.message.repeatSupplier')
          .d('请勿重复添加同一供应商'),
      });
      return false;
    }
    const newData = lineSelectedRows.map(n => {
      const {
        supplierTenantId,
        supplierCompanyId,
        supplierCompanyCode,
        supplierCompanyName,
        contactId,
        contactName,
        contactPhone,
        contactEmail,
      } = n;
      return {
        supplierTenantId,
        supplierCompanyId,
        supplierCompanyCode,
        supplierCompanyName,
        contactId,
        contactName,
        contactPhone,
        contactEmail,
        _status: 'update',
        editFlag: true,
      };
    });
    dispatch({
      type: 'businessOrderPublish/updateState',
      payload: {
        supplierTable: [...newData, ...supplierTable],
        supplierPagination: addItemsToPagination(
          newData.length,
          supplierTable.length,
          supplierPagination
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
    const { suppLovVisible, lineSelectedKeys = [] } = this.state;
    const {
      businessOrderPublish: { suppLovPagination = {}, suppLovDataSource = [] },
      fetchDataLoading,
    } = this.props;
    const filterProps = {
      onRef: this.handleBindRef,
      onHandleSearch: this.handleSearch,
    };
    const columns = [
      {
        title: intl.get(`entity.supplier.code`).d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        width: 150,
      },
      {
        title: intl.get(`entity.supplier.name`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.contactId').d('联系人'),
        dataIndex: 'contactName',
        width: 150,
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.contactPhone').d('联系电话'),
        dataIndex: 'contactPhone',
        width: 150,
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'contactEmail',
        width: 150,
      },
    ];
    const scrollX = tableScrollWidth(columns);
    return (
      <Modal
        title={intl.get('entity.supplier.tag').d('供应商')}
        visible={suppLovVisible}
        onCancel={this.handleCloseSuppModal}
        onOk={this.handleOk}
        width={1000}
      >
        <div className="table-list-search">
          <FilterForm {...filterProps} />
        </div>
        <Table
          bordered
          rowKey="supplierCompanyId"
          loading={fetchDataLoading}
          columns={columns}
          rowSelection={{
            selectedRowKeys: lineSelectedKeys,
            onChange: this.lineSelectedChange,
          }}
          scroll={{ x: scrollX }}
          dataSource={suppLovDataSource}
          pagination={suppLovPagination}
          onChange={page => this.handleSearch(page)}
        />
      </Modal>
    );
  }
}
