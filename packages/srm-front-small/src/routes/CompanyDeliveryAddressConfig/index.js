/**
 * EcDeliveryAddress -收货地址
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { connect } from 'dva';
import { Table, Badge } from 'hzero-ui';
import { withRouter } from 'react-router-dom';

import { filterNullValueObject, getCurrentUserId } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';

import FilterForm from './FilterForm';
import AddressModal from './AddressModal';

@formatterCollections({
  code: ['small.common', 'small.ecAcquirerAddress', 'small.ecDeliveryAddress'],
})
@connect(({ loading, smallEcAcquirerAddress, smallEcDeliveryAddress }) => ({
  smallEcAcquirerAddress,
  smallEcDeliveryAddress,
  companyLoading: loading.effects['smallEcDeliveryAddress/fetchCompanyDetail'],
}))
@withRouter
export default class EcDeliveryAddress extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalData: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'smallEcAcquirerAddress/updateState',
      payload: {
        companyList: [],
      },
    });
    this.fetchEcData();
  }

  @Bind()
  fetchModalData(params) {
    const {
      dispatch,
      smallEcAcquirerAddress: { modalPagination = {} },
    } = this.props;
    const userId = getCurrentUserId();
    const { modalData } = this.state;
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

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   */
  @Bind()
  fetchEcData(params = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'smallEcDeliveryAddress/fetchCompanyDetail',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...filterValues,
      },
    });
  }

  /**
   * 取消
   */
  @Bind()
  handleCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  @Bind()
  handleConfig(record) {
    this.setState(
      {
        modalVisible: true,
        modalData: record,
      },
      () => {
        this.fetchModalData();
      }
    );
  }

  render() {
    const {
      smallEcDeliveryAddress: { companyList = [], comPagination = {} },
      companyLoading,
    } = this.props;
    const { modalVisible, modalData } = this.state;
    const columns = [
      {
        title: intl.get('small.common.model.companyName').d('公司名称'),
        width: 150,
        dataIndex: 'companyName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'defaultFlag',
        render: (_, record) => (
          <Badge
            status={record.enabledFlag ? 'success' : 'error'}
            text={
              record.mapping
                ? intl.get(`small.ecAcquirerAddress.model.enable`).d('已设置')
                : intl.get(`small.ecAcquirerAddress.model.disabled`).d('未设置')
            }
          />
        ),
      },
      {
        title: intl.get('small.ecAcquirerAddress.entity.roles.contacts').d('联系人'),
        width: 100,
        dataIndex: 'contactName',
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
        title: intl.get(`small.ecAcquirerAddress.model.regionName`).d('地址区域'),
        width: 170,
        dataIndex: 'regionName',
        render: (_, record) => {
          const regionNameList = record.regionNameList || [];
          return regionNameList.join('');
        },
      },
      {
        title: intl.get(`small.ecAcquirerAddress.model.address`).d('详细地址'),
        width: 150,
        dataIndex: 'address',
      },
      {
        title: intl.get('small.common.model.remark').d('备注'),
        width: 100,
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        // fixed: 'right',
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.handleConfig(record);
              }}
            >
              {intl.get('small.ecDeliveryAddress.view.ecDeliveryAddress.config').d('配置默认地址')}
            </a>
          );
        },
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchData: this.fetchEcData,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`small.ecDeliveryAddress.view.config`).d('默认收货地址配置')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
            className="small-table-all-space"
            bordered
            dataSource={companyList}
            pagination={comPagination}
            columns={columns}
            loading={companyLoading}
            rowKey="companyId"
            onChange={page => this.fetchEcData(page)}
          />
          <AddressModal
            modalVisible={modalVisible}
            modalData={modalData}
            onHandleCancel={this.handleCancel}
            onFetchModalData={this.fetchModalData}
            onFetchData={this.fetchEcData}
          />
        </Content>
      </React.Fragment>
    );
  }
}
