/**
 * EcAddressManage -电商平台地址管理
 * @date: 2018-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isEmpty, isUndefined } from 'lodash';
import { Link } from 'dva/router';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Content, Header } from 'components/Page';
import FilterForm from './FilterForm';

// const modelPrompt = 'spfm.configServer.model.purchaser';
@connect(({ ecPlatformDef, loading }) => ({
  ecPlatformDef,
  loading: loading.effects['ecPlatformDef/fetchEcPlatFormList'],
}))
@formatterCollections({ code: ['scec.ecAddressManage', 'scec.common'] })
export default class index extends Component {
  form;

  state = {
    tenantId: getCurrentOrganizationId(),
  };

  componentDidMount() {
    this.fetchEcAddressManageList();
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  fetchEcAddressManageList(params = {}) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecPlatformDef/fetchEcPlatFormList',
      payload: {
        tenantId,
        page: isEmpty(params) ? {} : params,
        ...filterValues,
      },
    });
  }

  // 跳转至详情页面
  @Bind()
  handleGoDetail(record) {
    const { ecPlatformCode } = record;
    this.props.history.push(`/scec/ec-address-manage/detail/${ecPlatformCode}`);
  }

  render() {
    const {
      ecPlatformDef: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const columns = [
      {
        title: intl.get('scec.ecAddressManage.model.Ec.platform.coding').d('电商平台编码'),
        dataIndex: 'ecPlatformCode',
      },
      {
        title: intl.get('scec.ecAddressManage.model.Ec.platform.name').d('电商平台名称'),
        dataIndex: 'ecPlatformName',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        render: (_, record) => {
          return (
            <Link
              to={`/scec/ec-address-manage/detail?regionCode=${record.ecPlatformCode}&&regionName=${
                record.ecPlatformName
              }`}
            >
              {intl.get('scec.ecAddressManage.detail').d('详情')}
            </Link>
          );
        },
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchDate: this.fetchEcAddressManageList,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('scec.ecAddressManage.E-commerce.address.management').d('电商地址管理')}
        />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
            bordered
            loading={loading}
            rowKey="regionId"
            dataSource={list.content || []}
            columns={columns}
            pagination={pagination}
            onChange={page => this.fetchEcAddressManageList(page)}
          />
        </Content>
      </React.Fragment>
    );
  }
}
