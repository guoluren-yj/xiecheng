/**
 * customBar\index.js - 平台自定义栏管理
 * @date: 2019年2月19日 17:20:11
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { Content, Header } from 'components/Page';
import { connect } from 'dva';
import { Button, Form, Popconfirm, Select, Table, Modal, Menu, Dropdown, Icon } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import cacheComponent from 'components/CacheComponent';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { dateTimeRender } from 'utils/renderer';
import { filterNullValueObject, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import FilterForm from './FilterForm';
import HistoryModal from './HistoryModal';

const prompt = 'scec.customBar';
@connect(({ loading, customBar }) => ({
  fetchCurrentCompanyLoading: loading.effects['customBar/fetchCurrentCompanyValue'],
  loading: loading.effects['customBar/fetchCustomBarList'],
  customBar,
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['scec.customBar, scec.common', 'scec.shopBasket'] })
@cacheComponent({ cacheKey: '/scec/custom-bar/list' })
export default class CustomBar extends Component {
  state = {
    historyVisible: false,
    tenantId: getCurrentOrganizationId(),
    isPlatform: !isTenantRoleLevel(),
  };

  componentDidMount() {
    const {
      dispatch,
      customBar: { pagination },
    } = this.props;
    dispatch({
      type: 'customBar/updateState',
      payload: {
        barType: '',
        assignDataChange: false,
        customBar: {},
        assignList: {},
        assignPagination: {},
      },
    });
    dispatch({
      type: 'customBar/init',
    });
    if (isTenantRoleLevel()) {
      this.fetchCompanyBarList(pagination);
    } else {
      this.fetchBarList(pagination);
    }
  }

  /**
   * 查询-当前公司值集
   */
  @Bind()
  fetchCompanyBarList(page = {}) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    dispatch({
      type: 'customBar/fetchCurrentCompanyValue',
      payload: {
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        tenantId,
      },
    }).then(res => {
      if (res) {
        this.fetchBarList(page);
      }
    });
  }

  /**
   *
   * @param {object} ref - 绑定表单ref
   */
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 新建数据
   */
  @Bind()
  handleCreateData() {
    const {
      history,
      form: { getFieldValue },
    } = this.props;
    if (isTenantRoleLevel()) {
      if (!getFieldValue('currentCompany')) {
        Modal.confirm({
          title: intl.get(`${prompt}.chooseCompany`).d('请选择公司！'),
          onOk: () => {
            this.setState();
          },
        });
        return;
      }
      history.push(`/scec/company-custom-bar/create/${getFieldValue('currentCompany')}`);
    } else {
      history.push(`/scec/platform-custom-bar/create`);
    }
  }

  /**
   * 编辑数据
   */
  @Bind()
  handleEditData(record) {
    const {
      history,
      form: { getFieldValue },
    } = this.props;
    const { isPlatform } = this.state;
    if (!isPlatform) {
      history.push(
        `/scec/company-custom-bar/detail/${getFieldValue('currentCompany')}/${record.barId}`
      );
    } else {
      history.push(`/scec/platform-custom-bar/detail/${record.barId}`);
    }
  }

  /**
   * 查看数据
   */
  @Bind()
  handleCheckData(record) {
    const {
      history,
      form: { getFieldValue },
    } = this.props;
    const { isPlatform } = this.state;
    if (!isPlatform) {
      history.push(
        `/scec/company-custom-bar/check-detail/${getFieldValue('currentCompany')}/${record.barId}`
      );
    } else {
      history.push(`/scec/platform-custom-bar/check-detail/${record.barId}`);
    }
  }

  /**
   * 查询数据
   */
  @Bind()
  fetchBarList(page = {}) {
    const {
      dispatch,
      form: { getFieldValue },
    } = this.props;
    const { tenantId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    let payload = {
      tenantId,
      page,
      ...filterValues,
      startDate: filterValues.startDate ? filterValues.startDate.format(DATETIME_MIN) : undefined,
      endDate: filterValues.endDate ? filterValues.endDate.format(DATETIME_MAX) : undefined,
    };
    if (isTenantRoleLevel() && getFieldValue('currentCompany')) {
      payload = {
        ...payload,
        companyId: getFieldValue('currentCompany'),
      };
    }
    dispatch({
      type: 'customBar/fetchCustomBarList',
      payload,
    });
  }

  /**
   * 上下架操作
   * @param {行记录} record
   */
  @Bind()
  handleShelfAction(record) {
    const { dispatch } = this.props;
    // 1上架0下架
    const action = record.barStatus === '1' ? 0 : 1;
    dispatch({
      type: 'customBar/shelfAction',
      payload: {
        idForShelf: record.barId,
        action,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchBarList();
      }
    });
  }

  /**
   * 查看历史记录
   * @param {行记录} record
   */
  @Bind()
  handleShowHistory(record = {}) {
    this.setState({
      historyVisible: true,
      barId: record.barId,
    });
  }

  /**
   * 取消模态框
   * @param {模态框类型} type
   */
  @Bind()
  handleModalCancel = type => {
    const { dispatch } = this.props;
    this.setState({
      [`${type}Visible`]: false,
    });
    dispatch({
      type: 'customBar/updateState',
      payload: {
        historyList: {},
        historyPagination: {},
      },
    });
  };

  /**
   * 选择公司事件
   * @param {公司id} value
   */
  @Bind()
  handleCompanyChange(value) {
    const {
      dispatch,
      customBar: { pagination = {} },
    } = this.props;
    const { tenantId } = this.state;
    this.form.resetFields();
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const payload = {
      tenantId,
      page: pagination,
      ...filterValues,
      startDate: filterValues.startDate ? filterValues.startDate.format(DATETIME_MIN) : undefined,
      endDate: filterValues.endDate ? filterValues.endDate.format(DATETIME_MAX) : undefined,
      companyId: value,
    };
    dispatch({
      type: 'customBar/fetchCustomBarList',
      payload,
    });
  }

  render() {
    const {
      customBar: {
        list = {},
        pagination = {},
        currentCompanyList = [],
        lov: { customBarStatus = [] },
      },
      loading,
      fetchCurrentCompanyLoading,
      form: { getFieldDecorator },
    } = this.props;

    const { historyVisible, barId, isPlatform } = this.state;

    const filterProps = {
      onRef: this.handleRef,
      onFetchData: this.fetchBarList,
      customBarStatus,
    };

    const historyModalProps = {
      visible: historyVisible,
      barId,
      onCancel: () => {
        this.handleModalCancel('history');
      },
    };

    const columns = [
      {
        title: intl.get(`scec.customBar.model.customBar.barName`).d('自定义栏名称'),
        dataIndex: 'barName',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`scec.customBar.model.customBar.barType`).d('自定义栏类型'),
        dataIndex: 'barTypeName',
        align: 'left',
        width: 120,
      },
      {
        title: intl.get(`scec.customBar.model.customBar.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        align: 'left',
        width: 80,
      },
      {
        title: intl.get(`scec.shopBasket.model.shoppingBasket.creationDate`).d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        align: 'left',
      },
      {
        title: intl.get(`scec.shopBasket.model.shoppingBasket.startDate`).d('开始时间'),
        dataIndex: 'startDate',
        render: dateTimeRender,
        align: 'left',
      },
      {
        title: intl.get(`scec.shopBasket.model.shoppingBasket.endDate`).d('截止时间'),
        dataIndex: 'endDate',
        render: dateTimeRender,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'barStatusName',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: '_edit',
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a
                  onClick={() => {
                    this.handleCheckData(record);
                  }}
                >
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              </Menu.Item>
              <Menu.Item>
                <a
                  onClick={() => {
                    this.handleShowHistory(record);
                  }}
                >
                  {intl.get('scec.common.button.operating').d('操作记录')}
                </a>
              </Menu.Item>
            </Menu>
          );

          return (
            <span className="action-link">
              <Popconfirm
                placement="topRight"
                title={
                  record.barStatus === '1'
                    ? intl
                        .get(`${prompt}.model.clickRemoveAction.willBeRemoved`)
                        .d('点击下架操作，该自定义栏将会下架')
                    : intl
                        .get(`${prompt}.model.clickRemoveAction.willBeOn`)
                        .d('点击上架操作，该自定义栏将会上架')
                }
                onConfirm={() => this.handleShelfAction(record)}
              >
                {record.barStatus === '1' ? (
                  <a>{intl.get(`${prompt}.model.customBar.offShelf`).d('下架')}</a>
                ) : (
                  <a>{intl.get(`${prompt}.model.customBar.onShelf`).d('上架')}</a>
                )}
              </Popconfirm>
              {record.barStatus === '1' ? (
                <a disabled>{intl.get('hzero.common.button.edit').d('编辑')}</a>
              ) : (
                <a
                  onClick={() => {
                    this.handleEditData(record);
                  }}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              )}

              <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <a className="ant-dropdown-link">
                  {intl.get('scec.common.button.more').d('更多')} <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        },
      },
      {
        title: intl.get(`scec.customBar.model.customBar.processUser`).d('操作人'),
        dataIndex: 'lastUpdatedByName',
        width: 180,
        render: (_, record) => {
          return <span title={record.lastUpdatedByName}>{record.lastUpdatedByName}</span>;
        },
      },
    ];

    const titleLevel = !isTenantRoleLevel()
      ? intl.get(`${prompt}.view.platformCustombar.title`).d('平台自定义栏管理')
      : intl.get(`${prompt}.view.custombar.title`).d('公司自定义栏管理');

    return (
      <React.Fragment>
        <Header title={titleLevel}>
          <Button
            loading={fetchCurrentCompanyLoading}
            type="primary"
            icon="plus"
            onClick={this.handleCreateData}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {!isPlatform && (
            <Form
              layout="inline"
              style={{ marginLeft: '20px', display: 'inline-block', lineHeight: '39px' }}
            >
              <Form.Item
                label={intl.get(`${prompt}.model.customBar.the.current.company`).d('当前公司')}
              >
                {getFieldDecorator('currentCompany', {
                  initialValue: currentCompanyList[0] && currentCompanyList[0].companyId,
                })(
                  <Select style={{ width: '170px' }} onChange={this.handleCompanyChange}>
                    {currentCompanyList &&
                      currentCompanyList.map(item => (
                        <Select.Option key={item.companyId} value={item.companyId}>
                          {item.companyName}
                        </Select.Option>
                      ))}
                  </Select>
                )}
              </Form.Item>
            </Form>
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            pagination={pagination}
            columns={columns}
            loading={loading}
            bordered
            dataSource={list.content}
            rowKey="barId"
            onChange={this.fetchBarList}
          />
        </Content>
        {historyVisible && <HistoryModal {...historyModalProps} />}
      </React.Fragment>
    );
  }
}
