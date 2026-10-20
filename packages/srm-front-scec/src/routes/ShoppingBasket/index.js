/**
 * shoppingBasket - 购物篮管理
 * @date: 2019年11月05日
 * @author: ZZ <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Form, Popconfirm, Table, Modal, Menu, Dropdown, Icon, Badge } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { dateTimeRender } from 'utils/renderer';
import { Content, Header } from 'components/Page';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import cacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';

import FilterForm from './FilterForm.js';
import HistoryModal from './HistoryModal.js';
import styles from './index.less';

const FormItem = Form.Item;

@connect(({ loading, shoppingBasket, ecCompanyCatalog }) => ({
  shoppingBasket,
  ecCompanyCatalog,
  loading: loading.effects['shoppingBasket/fetchBasketList'],
  historyLoading: loading.effects['shoppingBasket/fetchHistoryRecord'],
}))
@withRouter
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['scec.common', 'scec.shopBasket', 'scec.customBar', 'scec.ecCompanyCatalog'],
})
@cacheComponent({ cacheKey: '/scec/shoppingBasket/list' })
export default class ShoppingBasket extends Component {
  state = {
    historyVisible: false,
  };

  componentDidMount() {
    const {
      dispatch,
      shoppingBasket: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'shoppingBasket/updateState',
      payload: {
        productList: {},
        productPagination: {},
        shoppingBasket: {},
      },
    });
    this.fetchData(pagination);
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  fetchData(page = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecCompanyCatalog/fetchEcCompany',
    }).then(res => {
      if (res) {
        this.fetchBasketList(page);
      }
    });
  }

  @Bind()
  fetchBasketList(page = {}) {
    const {
      dispatch,
      form: { getFieldValue },
    } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const params = {
      page,
      ...filterValues,
      startDate: filterValues.startDate ? filterValues.startDate.format(DATETIME_MIN) : undefined,
      endDate: filterValues.endDate ? filterValues.endDate.format(DATETIME_MAX) : undefined,
      companyId: getFieldValue('companyId'),
    };
    dispatch({
      type: 'shoppingBasket/fetchBasketList',
      payload: params,
    });
  }

  @Bind()
  handleCreateData() {
    const {
      form: { getFieldValue },
    } = this.props;
    if (!getFieldValue('companyId')) {
      Modal.confirm({
        title: intl.get('scec.customBar.chooseCompany').d('请选择公司！'),
        onOk: () => {
          this.setState();
        },
      });
      return;
    }
    this.props.history.push(`/scec/shopping-basket/create/${getFieldValue('companyId')}`);
  }

  /**
   * 选择公司值集
   */
  @Bind()
  handleOnChange(companyId) {
    const { form } = this.props;
    form.setFieldsValue({
      companyId,
    });
    this.form.resetFields();
    this.fetchBasketList();
  }

  @Bind()
  handleShelfAction(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'shoppingBasket/shelfAction',
      payload: {
        ...record,
        enabledFlag: record.enabledFlag ? 0 : 1,
      },
    }).then(res => {
      if (res.errorMessage) {
        notification.error({ message: `${res.errorMessage}` });
      } else {
        notification.success();
        this.fetchBasketList();
      }
    });
  }

  @Bind()
  handleEditData(record) {
    const {
      history,
      form: { getFieldValue },
    } = this.props;
    history.push(
      `/scec/shopping-basket/detail/${getFieldValue('companyId')}/${record.marketBasketId}`
    );
  }

  /**
   * 取消模态框
   * @param {模态框类型} type
   */
  @Bind()
  handleModalCancel() {
    const { dispatch } = this.props;
    this.setState({
      historyVisible: false,
    });
    dispatch({
      type: 'shoppingBasket/updateState',
      payload: {
        historyList: [],
        historyPagination: {},
      },
    });
  }

  /**
   * 查看数据
   */
  @Bind()
  handleCheckData(record) {
    const {
      form: { getFieldValue },
      history,
    } = this.props;
    history.push(
      `/scec/shopping-basket/check-detail/${getFieldValue('companyId')}/${record.marketBasketId}`
    );
  }

  /**
   * 查看历史记录
   * @param {行记录} record
   */
  @Bind()
  handleShowHistory(record = {}) {
    this.setState({
      historyVisible: true,
      marketBasketId: record.marketBasketId,
    });
    this.showHistory(record);
  }

  /**
   * 历史记录
   */
  @Bind()
  showHistory(record, page = {}) {
    const { dispatch } = this.props;
    const payload = {
      marketBasketId: record.marketBasketId,
      page,
    };
    dispatch({
      type: 'shoppingBasket/fetchHistoryRecord',
      payload,
    });
  }

  /**
   * 历史记录-改变分页
   */
  @Bind()
  changeHistoryPagination(page) {
    const {
      shoppingBasket: { historyList = [] },
    } = this.props;
    this.showHistory(historyList && historyList[0], page);
  }

  render() {
    const {
      shoppingBasket: {
        shoppingBasketList = [],
        pagination = {},
        historyList = [],
        historyPagination = {},
      },
      ecCompanyCatalog: { currentCompany = [] },
      loading,
      historyLoading,
      form: { getFieldDecorator },
    } = this.props;
    const { historyVisible, marketBasketId } = this.state;

    const historyModalProps = {
      visible: historyVisible,
      marketBasketId,
      pagination: historyPagination,
      dataSource: historyList,
      loading: historyLoading,
      onCancel: () => {
        this.handleModalCancel();
      },
      onChange: this.changeHistoryPagination,
    };

    const filterProps = {
      onRef: this.handleRef,
      onFetchData: this.fetchBasketList,
      // basketStatus,
    };

    const columns = [
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.basketName').d('购物篮名称'),
        dataIndex: 'basketName',
        width: 150,
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.remark').d('购物篮介绍'),
        dataIndex: 'remark',
        width: 200,
        render: val => (
          <p title={val} className={styles['introduction-style']}>
            {val}
          </p>
        ),
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.creationDate').d('创建时间'),
        dataIndex: 'creationDate',
        render: dateTimeRender,
        width: 150,
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.startDate').d('开始时间'),
        dataIndex: 'startDate',
        render: dateTimeRender,
        width: 150,
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.endDate').d('截止时间'),
        dataIndex: 'endDate',
        render: dateTimeRender,
        width: 150,
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.effectiveDays').d('有效天数'),
        dataIndex: 'effectiveDays',
        width: 120,
        render: val => {
          return val;
        },
        onCell: record => {
          const { effectiveDays } = record;
          const Days = parseInt(effectiveDays, 10);
          if (Days >= 0 && Days <= 7) {
            return { className: styles['effectiveDays-more-col'] };
          } else if (Days < 0) {
            return { className: styles['effectiveDays-col'] };
          } else {
            return {};
          }
        },
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 120,
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
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operate',
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
                  record.enabledFlag
                    ? intl
                        .get('scec.shopBasket.view.message.forbidden')
                        .d('点击禁用，该购物篮会被禁用')
                    : intl.get('scec.shopBasket.view.message.using').d('点击启用，该购物篮会被启用')
                }
                onConfirm={() => this.handleShelfAction(record)}
              >
                {record.enabledFlag ? (
                  <a>{intl.get('hzero.common.status.disable').d('禁用')}</a>
                ) : (
                  <a>{intl.get('hzero.common.status.enable').d('启用')}</a>
                )}
              </Popconfirm>
              {record.enabledFlag ? (
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
        width: 200,
      },
      {
        title: intl.get('scec.shopBasket.model.shoppingBasket.processUser').d('操作人'),
        dataIndex: 'lastUpdatedByName',
        width: 150,
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('scec.shopBasket.view.message.title').d('公司购物篮管理')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Form layout="inline">
            <FormItem
              label={intl
                .get('scec.ecCompanyCatalog.model.ecCompanyCatalog.currentCompany')
                .d('当前公司')}
            >
              {getFieldDecorator('companyId', {
                initialValue: currentCompany[0] && currentCompany[0].companyId,
              })(
                <Lov
                  allowClear={false}
                  textField="companyName"
                  textValue={currentCompany[0] && currentCompany[0].companyName}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={this.handleOnChange}
                />
              )}
            </FormItem>
          </Form>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            bordered
            rowKey="marketBasketId"
            columns={columns}
            loading={loading}
            pagination={pagination}
            dataSource={shoppingBasketList}
            onChange={this.fetchBasketList}
          />
        </Content>
        {historyVisible && <HistoryModal {...historyModalProps} />}
      </React.Fragment>
    );
  }
}
