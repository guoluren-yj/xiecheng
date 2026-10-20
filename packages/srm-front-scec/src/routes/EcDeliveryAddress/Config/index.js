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

const modelPrompt = 'scec.ecAcquirerAddress.model';
const viewPrompt = 'scec.ecDeliveryAddress.view.ecDeliveryAddress';
@formatterCollections({
  code: [
    'scec.ecAcquirerAddress',
    'scec.ecDeliveryAddress',
    'entity.company',
    'entity.roles',
    'scec.common',
  ],
})
@connect(({ loading, ecAcquirerAddress, ecDeliveryAddress }) => ({
  ecAcquirerAddress,
  ecDeliveryAddress,
  loading: loading.effects['ecDeliveryAddress/fetchEcDeliveryAddress'],
  companyLoading: loading.effects['ecDeliveryAddress/fetchCompanyDetail'],
  addLoading: loading.effects['ecDeliveryAddress/addEcDeliveryAddress'],
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
      type: 'ecDeliveryAddress/updateState',
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
      ecDeliveryAddress: { modalPagination = {} },
    } = this.props;
    const userId = getCurrentUserId();
    const { modalData } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecDeliveryAddress/fetchAllDeliveryAddress',
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
      type: 'ecDeliveryAddress/fetchCompanyDetail',
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
      () => this.fetchModalData()
    );
  }

  render() {
    const {
      ecDeliveryAddress: { companyList = [], comPagination = {} },
      companyLoading,
    } = this.props;
    const { modalVisible, modalData } = this.state;
    const columns = [
      {
        title: intl.get('scec.common.model.companyName').d('公司名称'),
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
              record.enabledFlag
                ? intl.get(`${modelPrompt}.enable`).d('已设置')
                : intl.get(`${modelPrompt}.disabled`).d('未设置')
            }
          />
        ),
      },
      {
        title: intl.get('scec.ecAcquirerAddress.entity.roles.contacts').d('联系人'),
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
        title: intl.get(`${modelPrompt}.regionName`).d('地址区域'),
        width: 170,
        dataIndex: 'regionName',
        render: (_, record) => {
          const regionNameList = record.rgNameList || [];
          return regionNameList.join('');
        },
      },
      {
        title: intl.get(`${modelPrompt}.address`).d('详细地址'),
        width: 150,
        dataIndex: 'address',
      },
      {
        title: intl.get('scec.common.table.column.remark').d('备注'),
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
              {intl.get('scec.ecDeliveryAddress.view.ecDeliveryAddress.config').d('配置默认地址')}
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
        <Header
          title={intl.get(`${viewPrompt}.config`).d('默认收货地址配置')}
          backPath="/scec/ec-delivery-address/list"
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
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
