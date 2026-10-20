/**
 * CreditTenant - 租户配置
 * @date: 2018-12-26
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import CacheComponent from 'components/CacheComponent';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import QueryForm from './QueryForm';
import EditForm from './EditForm';

/**
 * 租户配置
 * @extends {Component} - React.Component
 * @reactProps {Object} creditTenant - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['seci.creditTenant', 'entity.tenant'],
})
@connect(({ creditTenant, loading }) => ({
  creditTenant,
  saveLoading: loading.effects['creditTenant/saveCreditTenant'],
  fetchLoading: loading.effects['creditTenant/fetchCreditTenant'],
}))
@withRouter
@CacheComponent({ cacheKey: '/seci/credit-tenant' })
export default class CreditTenant extends PureComponent {
  form;
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false, // 弹框显示、隐藏标记
      editRowData: {}, // 编辑数据
    };
  }

  componentDidMount() {
    this.onFetchCreditTenant();
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  onFetchCreditTenant(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'creditTenant/fetchCreditTenant',
      payload: {
        page: isEmpty(pageData) ? {} : pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onHandleEditModal(flag, record = {}) {
    const state = {
      modalVisible: !!flag,
      editRowData: record || {},
    };
    if (!flag) {
      state.editRowData = {};
    }
    this.setState(state);
  }

  /**
   * 新增租户
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  onAddCreditTenant(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'creditTenant/addCreditTenant',
      payload: {
        ...editRowData,
        ...fieldsValue,
      },
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.onHandleEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 禁用、启用租户
   * @param {Object} record 行数据
   */
  @Bind()
  handleDisabledTenant(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'creditTenant/handleDisabledTenant',
      payload: {
        ...record,
        enabledFlag: +!record.enabledFlag,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.onFetchCreditTenant();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryCreditTenant(queryData = {}) {
    this.onFetchCreditTenant(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.onFetchCreditTenant(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      history,
      creditTenant: { data = [], pagination = {} },
      saveLoading,
      fetchLoading,
    } = this.props;

    const { modalVisible, editRowData } = this.state;

    const columns = [
      {
        title: intl.get('entity.tenant.code').d('租户代码'),
        dataIndex: 'tenantNum',
        width: 200,
      },
      {
        title: intl.get('entity.tenant.name').d('租户名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'action',
        align: 'center',
        width: 120,
        render: (val, record) => {
          return (
            <span className="action-link">
              {record.enabledFlag ? (
                <a
                  onClick={() => {
                    this.handleDisabledTenant(record);
                  }}
                >
                  {intl.get('hzero.common..status.disable').d('禁用')}
                </a>
              ) : (
                <a
                  onClick={() => {
                    this.handleDisabledTenant(record);
                  }}
                >
                  {intl.get('hzero.common..status.enable').d('启用')}
                </a>
              )}
              <a
                onClick={() => {
                  history.push(`/seci/credit-tenant/product-assign?tenantId=${record.tenantId}`);
                }}
              >
                {intl.get('seci.creditTenant.view.message.meun.productSetting').d('产品配置')}
              </a>
            </span>
          );
        },
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      loading: saveLoading,
      onAddCreditTenant: this.onAddCreditTenant,
      onHandleEditModal: this.onHandleEditModal,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('seci.creditTenant.view.message.title').d('租户维护')}>
          <Button icon="plus" type="primary" onClick={() => this.onHandleEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <QueryForm onQueryCreditTenant={this.onFetchCreditTenant} onRef={this.handleBindRef} />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="tenantId"
            dataSource={data}
            columns={columns}
            pagination={pagination}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
