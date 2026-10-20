/**
 * AccountVisible - 账号目录可见配置
 * @date: 2019-12-12
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Table, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { withRouter } from 'react-router-dom';

import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject, getEditTableData } from 'utils/utils';
import intl from 'utils/intl';

import FilterForm from './FilterForm';
import AssignModal from './AssignModal';
import CreateModal from './CreateModal.js';

const organizationId = getCurrentOrganizationId();
@withRouter
@connect(({ loading, accountVisible }) => ({
  accountVisible,
  loading: loading.effects['accountVisible/fetchAccountList'],
  updateLoading: loading.effects['accountVisible/updateAccountList'],
}))
export default class AccountVisible extends Component {
  constructor(props) {
    super(props);
    this.state = {
      assignModalVisible: false,
      createModalVisible: false,
      initData: {},
      assignData: {},
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountVisible/fetchEcCompany',
    });
    this.handleSearchData();
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleOpenModal(record) {
    this.setState(
      {
        assignModalVisible: true,
        assignData: record,
      },
      () => this.handleSearchAssignData()
    );
  }

  @Bind()
  hiddenModal() {
    this.setState({
      assignModalVisible: false,
    });
  }

  @Bind()
  handleSearchData(params) {
    const {
      dispatch,
      accountVisible: { accountListPagination },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'accountVisible/fetchAccountList',
      payload: {
        page: isEmpty(params) ? accountListPagination : params,
        ...filterValues,
      },
    });
  }

  @Bind()
  handleSearchAssignData(params = {}) {
    const {
      dispatch,
      accountVisible: { assignListPagination = {} },
    } = this.props;
    const { assignData } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'accountVisible/fetchAssignList',
      payload: {
        page: isEmpty(params) ? assignListPagination : params,
        ...filterValues,
        tenantId: organizationId,
        userCatalogConfigId: assignData.userCatalogConfigId,
      },
    });
  }

  @Bind()
  hiddenCreateModal() {
    this.setState({
      createModalVisible: false,
    });
  }

  @Bind()
  openCreateModal() {
    this.setState({
      createModalVisible: true,
      initData: [],
    });
  }

  @Bind()
  handleSaveModal(fieldsValue = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'accountVisible/saveAccountList',
      payload: { ...fieldsValue, tenantId: organizationId },
    }).then(res => {
      if (res) {
        notification.success();
        this.hiddenCreateModal();
        this.handleSearchData();
      }
    });
  }

  @Bind()
  handlDisabled(record) {
    const { dispatch } = this.props;

    dispatch({
      type: 'accountVisible/updateAccountList',
      payload: { ...record, enabledFlag: !record.enabledFlag ? 1 : 0 },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchData();
      }
    });
  }

  @Bind()
  handleSaveAssign() {
    const {
      dispatch,
      accountVisible: { assignList = [] },
    } = this.props;
    const { assignData = {} } = this.state;
    const newParams = getEditTableData(assignList, ['accountId']);
    // const params = [...newParams];
    const param = newParams.map(item => {
      return {
        ...item,
        userCatalogConfigId: assignData.userCatalogConfigId,
        tenantId: organizationId,
      };
    });
    dispatch({
      type: 'accountVisible/saveAssignList',
      payload: {
        param,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchData();
        this.setState({ assignModalVisible: false });
      }
    });
  }

  render() {
    const {
      accountVisible: { currentCompany = [], accountList = [], accountListPagination = {} },
      loading,
      updateLoading,
    } = this.props;
    const { assignModalVisible, createModalVisible, initData = {}, assignData = {} } = this.state;
    const columns = [
      {
        title: '所属公司',
        dataIndex: 'companyName',
      },
      {
        title: '目录可见模版',
        dataIndex: 'configName',
        render: (text, record) => {
          const router = {
            pathname: `/scec/account-visible/detail/${record.userCatalogConfigId}/${record.companyId}`,
            state: { companyName: record.companyName },
          };
          return <a onClick={() => this.props.history.push(router)}>{text}</a>;
        },
      },
      {
        title: '状态',
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
        title: '操作',
        render: (_, record) => (
          <span className="action-link">
            {record.enabledFlag ? (
              <a onClick={() => this.handlDisabled(record)}>禁用</a>
            ) : (
              <a onClick={() => this.handlDisabled(record)}>启用</a>
            )}
            <a onClick={() => this.handleOpenModal(record)}>分配账号</a>
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header title="账号目录可见配置">
          <Button type="primary" onClick={this.openCreateModal}>
            新建
          </Button>
        </Header>
        <Content>
          <FilterForm
            onRef={this.handleRef}
            currentCompany={currentCompany}
            onFetchData={this.handleSearchData}
          />
          <Table
            bordered
            columns={columns}
            loading={loading || updateLoading}
            dataSource={accountList}
            pagination={accountListPagination}
            onChange={page => this.handleSearchData(page)}
          />
          <AssignModal
            modalVisible={assignModalVisible}
            onHandleCancel={this.hiddenModal}
            onHandleOK={this.handleSaveAssign}
            onHandleSearch={this.handleSearchAssignData}
            assignData={assignData}
          />
          <CreateModal
            modalVisible={createModalVisible}
            initData={initData}
            onHandleCancel={this.hiddenCreateModal}
            currentCompany={currentCompany}
            onHandleOk={this.handleSaveModal}
          />
        </Content>
      </React.Fragment>
    );
  }
}
