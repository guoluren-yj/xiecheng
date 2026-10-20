/**
 * AccountVisible - 账号目录可见配置 - 详情页面
 * @date: 2019-12-12
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { Table, Badge, Modal } from 'hzero-ui';
import { isEmpty, isUndefined } from 'lodash';
import { withRouter } from 'react-router-dom';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import FilterForm from './FilterForm';

const organizationId = getCurrentOrganizationId();
@withRouter
@connect(({ loading, accountVisible }) => ({
  accountVisible,
  fetchCatalogListLoading: loading.effects['accountVisible/fetchCatalogList'],
  updateLoading: loading.effects['accountVisible/updateCatalogList'],
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { userCatalogConfigId = '', companyId = '' } = this.props.match.params;
    const {
      history: {
        location: { state = {} },
      },
    } = this.props;
    const { companyName = '' } = state;
    this.state = {
      companyId,
      companyName,
      userCatalogConfigId,
    };
  }

  from;

  componentDidMount() {
    this.handleSearchData();
  }

  @Bind()
  handleSearchData(params = {}) {
    const {
      dispatch,
      accountVisible: { catalogListPagination = {} },
    } = this.props;
    const { companyId, userCatalogConfigId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'accountVisible/fetchCatalogList',
      payload: {
        userCatalogConfigId,
        companyId,
        tenantId: organizationId,
        page: isEmpty(params) ? catalogListPagination : params,
        ...filterValues,
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleDisable(record) {
    const { dispatch } = this.props;
    const { userCatalogConfigId } = this.state;
    Modal.confirm({
      title: record.configEnableFlag ? '确认启用?' : '确认禁用?',
      onOk: () => {
        dispatch({
          type: 'accountVisible/updateCatalogList',
          payload: {
            ...record,
            userCatalogConfigId,
            configEnableFlag: record.configEnableFlag ? 0 : 1,
          },
        }).then(res => {
          if (res) {
            this.handleSearchData();
            notification.success();
          }
        });
      },
    });
  }

  render() {
    const {
      accountVisible: { catalogList = [], catalogListPagination = {} },
      fetchCatalogListLoading,
      updateLoading,
    } = this.props;
    const { companyName } = this.state;
    const columns = [
      {
        title: '目录编码',
        dataIndex: 'catalogCode',
      },
      {
        title: '目录名称',
        dataIndex: 'catalogName',
      },
      {
        title: '目录归属',
        dataIndex: 'catalogType',
      },
      {
        title: '排序号',
        dataIndex: 'orderSeq',
      },
      {
        title: '目录层级',
        dataIndex: 'catalogLevel',
      },
      {
        title: '状态',
        dataIndex: 'configEnableFlag',
        render: (_, record) => (
          <Badge
            status={record.configEnableFlag ? 'error' : 'success'}
            text={
              record.configEnableFlag
                ? intl.get('hzero.common.status.disable').d('禁用')
                : intl.get('hzero.common.status.enable').d('启用')
            }
          />
        ),
      },
      {
        title: '操作',
        render: (_, record) => (
          <a
            onClick={() => {
              this.handleDisable(record);
            }}
          >
            {record.configEnableFlag
              ? intl.get('hzero.common.status.enable').d('启用')
              : intl.get('hzero.common.status.disable').d('禁用')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title="目录部分可见维护" backPath="/scec/account-visible/list">
          <span>当前公司：{companyName}</span>
        </Header>
        <Content>
          <FilterForm onRef={this.handleRef} onFetchData={this.handleSearchData} />
          <Table
            bordered
            uncontrolled
            rowKey="catalogId"
            columns={columns}
            dataSource={catalogList}
            childrenColumnName="subMenus"
            loading={fetchCatalogListLoading || updateLoading}
            pagination={catalogListPagination}
            onChange={page => this.handleSearchData(page)}
          />
        </Content>
      </React.Fragment>
    );
  }
}
