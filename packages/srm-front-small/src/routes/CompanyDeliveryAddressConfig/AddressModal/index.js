import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentUserId } from 'utils/utils';

import FilterForm from './FilterForm';

@connect(({ loading, smallEcDeliveryAddress }) => ({
  smallEcDeliveryAddress,
  fetchLoading: loading.effects['smallEcDeliveryAddress/fetchAllDeliveryAddress'],
}))
@Form.create({ fieldNameProp: null })
export default class AddressModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowkeys: [],
      selectedRows: [],
    };
  }

  form;

  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  @Bind()
  setDefaultAddress() {
    const { selectedRows } = this.state;
    const { dispatch, onHandleCancel, onFetchData, modalData } = this.props;
    let data = selectedRows[0];
    data = { ...data, defaultFlag: 1, companyId: modalData.companyId };
    dispatch({
      type: 'smallEcDeliveryAddress/updateCompanyDetail',
      payload: data,
    }).then(res => {
      if (res) {
        onHandleCancel();
        notification.success();
        dispatch({
          type: 'smallEcDeliveryAddress/updateState',
          payload: {
            companyList: [],
          },
        });
        onFetchData();
      }
    });
  }

  @Bind()
  fetchModalData(params) {
    const {
      dispatch,
      smallEcDeliveryAddress: { modalPagination = {} },
    } = this.props;
    const userId = getCurrentUserId();
    const { modalData } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'smallEcDeliveryAddress/fetchAllDeliveryAddress',
      payload: {
        page: isEmpty(params) ? modalPagination : params,
        companyId: modalData.companyId,
        userId,
        ...filterValues,
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCancel() {
    const { onHandleCancel } = this.props;
    onHandleCancel();
  }

  render() {
    const columns = [
      {
        title: intl.get('small.common.model.type').d('类型'),
        dataIndex: 'belongTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('small.common.view.contact').d('联系人'),
        dataIndex: 'contactName',
        width: 120,
      },
      {
        title: intl.get('hzero.common.phone').d('手机'),
        width: 120,
        dataIndex: 'mobile',
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        width: 170,
        dataIndex: 'email',
      },
      {
        title: intl.get(`small.common.model.regionArea`).d('地址区域'),
        width: 170,
        dataIndex: 'regionName',
        render: (_, record) => {
          const regionNameList = record.regionNameList || [];
          return regionNameList.join('');
        },
      },
      {
        title: intl.get(`small.common.model.detailAddress`).d('详细地址'),
        width: 150,
        dataIndex: 'address',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (_, record) => (
          <Badge
            status={record.enabledFlag ? 'success' : 'error'}
            text={
              record.enabledFlag
                ? intl.get('hzero.common.status.enable').d('启用')
                : intl.get('hzero.common.status.disable').d('禁用')
            }
          />
        ),
      },
      {
        title: intl.get('hzero.common.button.remark').d('备注'),
        width: 150,
        dataIndex: 'remark',
      },
    ];
    const { selectedRowkeys = [] } = this.state;
    const rowSelection = {
      type: 'radio',
      selectedRowkeys,
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: record.enabledFlag === 0,
      }),
    };
    const {
      modalVisible,
      fetchLoading,
      modalData,
      smallEcDeliveryAddress: { modalPagination = {}, modalList = [] },
    } = this.props;
    const tableProps = {
      rowSelection,
      pagination: modalPagination,
      bordered: true,
      loading: fetchLoading,
      columns,
      dataSource: modalList,
      rowKey: 'addressId',
      onChange: page => this.fetchModalData(page),
    };
    return (
      <Modal
        destroyOnClose
        title={`${modalData.companyName}-${intl
          .get('small.ecAcquirerAddress.view.address.config')
          .d('默认收货地址配置')}`}
        visible={modalVisible}
        width={1000}
        onOk={this.setDefaultAddress}
        onCancel={this.handleCancel}
      >
        <div className="table-list-search">
          <FilterForm onRef={this.handleRef} onFetchModalData={this.fetchModalData} />
        </div>
        <Table className="small-table-all-space" {...tableProps} />
      </Modal>
    );
  }
}
