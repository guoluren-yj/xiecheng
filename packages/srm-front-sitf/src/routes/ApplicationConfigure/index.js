/**
 * ApplicationConfigure - 应用配置
 * @date: 2018-9-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import CacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 应用配置
 * @extends {Component} - React.Component
 * @reactProps {Object} applicationConfigure - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sitf.applicationConfigure', 'entity.application', 'sitf.common'] })
@connect(({ applicationConfigure, loading }) => ({
  applicationConfigure,
  saveLoading: loading.effects['applicationConfigure/saveApplicationConfigure'],
  fetchLoading: loading.effects['applicationConfigure/fetchApplication'],
}))
@withRouter
@CacheComponent({ cacheKey: '/sitf/application-configure' })
export default class ApplicationConfigure extends PureComponent {
  form;
  /**
   * 内部状态
   */
  state = {
    modalVisible: false,
    editRowData: {},
  };

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'applicationConfigure/fetchApplicationType',
      payload: {},
    });
    this.fetchApplicationData();
  }

  /**
   * 查询数据
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchApplicationData(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'applicationConfigure/fetchApplication',
      payload: {
        page: pageData,
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
  showEditModal(flag, record = {}) {
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
   * 新增应用配置
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAddApplication(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: 'applicationConfigure/saveApplicationConfigure',
      payload: [
        {
          ...editRowData,
          ...fieldsValue,
        },
      ],
    }).then(response => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    const {
      applicationConfigure: { data = {} },
    } = this.props;
    this.fetchApplicationData(data.pagination);
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  fetchApplication(queryData = {}) {
    this.fetchApplicationData(queryData);
  }

  /**
   * 分页改变事件
   * @param {Object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchApplicationData(pagination);
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
      applicationConfigure: {
        data = {},
        code: { ApplicationType = [] },
      },
      saveLoading,
      fetchLoading,
    } = this.props;
    const { modalVisible, editRowData } = this.state;
    const columns = [
      {
        title: intl.get('entity.application.code').d('应用代码'),
        dataIndex: 'applicationCode',
        width: 150,
      },
      {
        title: intl.get('entity.application.name').d('应用名称'),
        dataIndex: 'applicationName',
      },
      {
        title: intl.get('sitf.common.applicationGroup.name').d('应用组名称'),
        dataIndex: 'applicationGroupName',
        width: 140,
      },
      {
        title: intl.get('sitf.common.product.name').d('产品线名称'),
        dataIndex: 'productLineCode',
        width: 100,
      },
      {
        title: intl.get('entity.application.type').d('应用类型'),
        dataIndex: 'applicationTypeMeaning',
        width: 100,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 80,
        align: 'left',
        render: (_, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.showEditModal(true, record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      ApplicationType,
      loading: saveLoading,
      onHandleAddApplication: this.handleAddApplication,
      showEditModal: this.showEditModal,
      onFetchApplication: this.fetchApplication,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('entity.application.definition').d('应用定义')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <QueryForm
            ApplicationType={ApplicationType}
            onFetchApplication={this.fetchApplication}
            onRef={this.handleBindRef}
          />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="applicationId"
            dataSource={data.list}
            columns={columns}
            pagination={data.pagination}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
