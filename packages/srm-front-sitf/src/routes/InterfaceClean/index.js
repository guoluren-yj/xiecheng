/**
 * InterfaceClean - 接口清理
 * @date: 2018-11-27
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';
import { createPagination, filterNullValueObject } from 'utils/utils';
import CleanModal from './CleanModal';
import QueryForm from './QueryForm';

/**
 * 接口清理
 * @extends {Component} - React.Component
 * @reactProps {Object} interfaceClean - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sitf.interfaceClean', 'sitf.common'] })
@connect(({ interfaceClean, loading }) => ({
  interfaceClean,
  fetchLoading: loading.effects['interfaceClean/fetchInterfaceClean'],
}))
@withRouter
@CacheComponent({ cacheKey: '/sitf/interface-clean' })
export default class InterfaceClean extends PureComponent {
  form;
  /**
   * 内部状态
   */
  state = {
    modalVisible: false, // 弹出框显示/隐藏标记
    externalSystemCode: '',
    externalSystemName: '',
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceClean/updateState',
      payload: {
        data: {
          list: [],
        },
      },
    });
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchInterfaceClean(pageData = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceClean/updateState',
      payload: {
        data: {
          list: [],
        },
      },
    });
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'interfaceClean/fetchInterfaceClean',
      payload: {
        page: {
          ...pageData,
          ...filterValues,
        },
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {Object} record 行数据
   */
  @Bind()
  onShowCleanModal(flag) {
    const state = {
      modalVisible: !!flag,
    };
    this.setState(state);
  }

  /**
   * 清理数据
   * @param {Object} values 清理数据
   */
  @Bind()
  onCleanData(values) {
    const { dispatch } = this.props;
    const { externalSystemCode, externalSystemName } = values;
    this.setState({
      externalSystemCode,
      externalSystemName,
    });
    dispatch({
      type: 'interfaceClean/cleanInterface',
      payload: {
        ...values,
        cleanDateFrom: values.cleanDateFrom && values.cleanDateFrom.format(DEFAULT_DATETIME_FORMAT),
        cleanDateTo: values.cleanDateTo && values.cleanDateTo.format(DEFAULT_DATETIME_FORMAT),
      },
    }).then(res => {
      if (res) {
        this.refreshValue();
        notification.success();
        this.onShowCleanModal(false);
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchInterfaceClean();
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  onQueryInterfaceClean(queryData = {}) {
    this.fetchInterfaceClean(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchInterfaceClean(pagination);
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
      interfaceClean: { data = {} },
      fetchLoading,
    } = this.props;
    const { externalSystemCode, externalSystemName } = this.state;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('sitf.common.data.externalSystemName').d('外部系统名称'),
        dataIndex: 'externalSystemName',
        width: 150,
      },
      {
        title: intl.get('sitf.interfaceClean.model.interfaceClean.userName').d('用户名称'),
        dataIndex: 'realName',
        width: 150,
      },
      {
        title: intl.get('sitf.interfaceClean.model.interfaceClean.cleanDateFrom').d('清理日期从'),
        dataIndex: 'cleanDateFrom',
        width: 150,
      },
      {
        title: intl.get('sitf.interfaceClean.model.interfaceClean.cleanDateTo').d('清理日期至'),
        dataIndex: 'cleanDateTo',
        width: 150,
      },
      {
        title: intl.get('sitf.interfaceClean.model.interfaceClean.cleanDetail').d('清理详情内容'),
        dataIndex: 'cleanDetail',
        width: 180,
      },
      {
        title: intl.get('sitf.interfaceClean.model.interfaceClean.cleanStatus').d('清理状态'),
        dataIndex: 'cleanStatus',
        width: 100,
      },
    ];
    const clearModalOptions = {
      modalVisible,
      onCleanData: this.onCleanData,
      onShowCleanModal: this.onShowCleanModal,
    };
    const externalSystem = {
      externalSystemCode,
      externalSystemName,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('sitf.interfaceClean.view.message.title').d('接口清理')}>
          <Button icon="clean" type="primary" onClick={() => this.onShowCleanModal(true)}>
            {intl.get('hzero.common.button.clean').d('清理')}
          </Button>
        </Header>
        <Content>
          <QueryForm
            onQueryInterfaceClean={this.onQueryInterfaceClean}
            onRef={this.handleBindRef}
            {...externalSystem}
          />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="recordId"
            dataSource={data.list}
            columns={columns}
            pagination={createPagination(data)}
            onChange={this.handleStandardTableChange}
          />
          <CleanModal {...clearModalOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
