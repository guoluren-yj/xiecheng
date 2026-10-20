/**
 * MessageTemplate - 消息模板列表
 * @date: 2018-9-30
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @description: 弃用准备删除 如果有问题，请联系 kan.li01@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button, Form } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 消息模板列表组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageTemplate - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ spfmMessageTemplate, loading }) => ({
  spfmMessageTemplate,
  loading: loading.effects['spfmMessageTemplate/fetchTemplateList'],
}))
@formatterCollections({ code: ['spfm.messageTemplate'] })
@CacheComponent({ cacheKey: '/spfm/message-template' })
export default class List extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    this.handleSearchTemplate();
  }

  /**
   * 新增模板，跳转到明细页面
   */
  @Bind()
  handleAddTemplate() {
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 页面查询
   * @param {object} [fields = {}] - 查询参数
   * @param {?string} fields.templateCode - 消息模板编码
   * @param {?string} fields.templateName - 消息模板名称
   * @param {?number} fields.page - 页码
   * @param {?number} fields.size - 分页大小
   */
  @Bind()
  handleSearchTemplate(fields = {}) {
    const {
      dispatch,
      spfmMessageTemplate: { query },
    } = this.props;
    dispatch({
      type: 'spfmMessageTemplate/fetchTemplateList',
      payload: {
        ...query,
        ...fields,
      },
    });
  }

  /**
   * 维护消息明细
   * @param {object} record - 消息模板对象
   */
  @Bind()
  handleMaintainDetail(record) {
    if (record.enabledFlag === 0) {
      notification.warning({
        message: intl
          .get('spfm.messageTemplate.view.message.title.messageDisable')
          .d('消息模板已禁用，不可维护明细信息'),
      });
      return;
    }
    this.props.dispatch(
      routerRedux.push({
        pathname: `/spfm/message-template/detail/${record.templateId}`,
      })
    );
  }

  /**
   * 消息模板编辑
   */
  @Bind()
  handleEditContent(record) {
    this.setState({ drawerVisible: true, targetItem: record });
  }

  /**
   * 保存消息模板
   * @param {object} values 新建消息模板对象
   */
  @Bind()
  handleDrawerOk(values) {
    const { dispatch } = this.props;
    dispatch({
      type: 'spfmMessageTemplate/saveTemplate',
      payload: values.data,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearchTemplate();
        this.setState({ drawerVisible: false });
        values.form.resetFields();
      }
    });
  }

  @Bind()
  handleDrawerCancel() {
    this.setState({ drawerVisible: false });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      loading,
      spfmMessageTemplate: { templateList = [], pagination = {} },
    } = this.props;
    const { drawerVisible = false, targetItem = {} } = this.state;
    const filterProps = {
      form,
      onSearch: this.handleSearchTemplate,
    };
    const listProps = {
      pagination,
      loading,
      dataSource: templateList,
      onChange: this.handleSearchTemplate,
      onEdit: this.handleEditContent,
      onMaintain: this.handleMaintainDetail,
    };
    const drawerPorps = {
      targetItem,
      title: intl.get('spfm.messageTemplate.view.message.drawer.title').d('消息模板维护'),
      visible: drawerVisible,
      anchor: 'right',
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('spfm.messageTemplate.view.message.title.list').d('消息模板')}>
          <Button icon="plus" type="primary" onClick={this.handleAddTemplate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
          <Drawer {...drawerPorps} />
        </Content>
      </React.Fragment>
    );
  }
}
