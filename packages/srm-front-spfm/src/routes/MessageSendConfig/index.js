/**
 * MessageSendConfig - 消息发送配置
 * @date: 2018-10-29
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind, Debounce } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import { DEBOUNCE_TIME } from 'utils/constants';
import { isEmpty, isUndefined } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 发送配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageSendConfig - 数据源
 * @reactProps {!Object} fetchTableListLoading - 列表数据加载是否完成
 * @reactProps {!Object} sendMessageLoading - 消息发送是否完成
 * @reactProps {Function} [dispatch= e=>e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['spfm.messageSendConfig'] })
@connect(({ messageSendConfig, loading }) => ({
  messageSendConfig,
  loading: loading.effects['messageSendConfig/fetchSendConfigData'],
  saveLoading: loading.effects['messageSendConfig/saveSendConfig'],
  tenantId: getCurrentOrganizationId(),
}))
export default class List extends Component {
  form;

  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'messageSendConfig/fetchSendConfigData',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 新增，跳转到明细页面
   */
  @Bind()
  handleAddSendConfig() {
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 数据列表，行编辑
   *@param {obejct} record - 操作对象
   */
  @Bind()
  handleEditContent(record) {
    this.setState({ drawerVisible: true, targetItem: record });
  }

  /**
   * 发送保存
   *
   * @param {object} values
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleDrawerOk(values) {
    const {
      dispatch,
      messageSendConfig: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'messageSendConfig/saveSendConfig',
      payload: values,
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({ drawerVisible: false, targetItem: {} });
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * 设置form对象
   * @param {object} ref - FilterForm子组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      tenantId,
      saveLoading,
      messageSendConfig: { list = [], pagination = {}, scopeType = [] },
    } = this.props;
    const { drawerVisible = false, targetItem = {} } = this.state;
    const filterProps = {
      tenantId,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      scopeType,
      pagination,
      loading,
      dataSource: list,
      onEdit: this.handleEditContent,
      onSearch: this.handleSearch,
    };
    const drawerProps = {
      targetItem,
      visible: drawerVisible,
      anchor: 'right',
      loading: saveLoading || loading,
      title: intl.get('spfm.messageSendConfig.view.message.drawer.title').d('消息发送配置维护'),
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.messageSendConfig.view.message.title').d('消息接收者类型设置')}
        >
          <Button icon="plus" type="primary" onClick={this.handleAddSendConfig}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}
