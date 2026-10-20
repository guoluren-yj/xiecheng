/**
 * ExternalSystems - 外部系统定义
 * @date: 2018-09-06
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Button, Table, Menu, Icon, Dropdown } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { enableRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 外部系统定义
 * @extends {Component} - React.Component
 * @reactProps {Object} externalSystems - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({
  code: [
    'sitf.externalSystems',
    'entity.tenant',
    'entity.interface',
    'entity.application',
    'sitf.common',
  ],
})
@connect(({ externalSystems, loading }) => ({
  externalSystems,
  saveLoading: loading.effects['externalSystems/saveSystem'],
  fetchLoading: loading.effects['externalSystems/fetchSystemList'],
}))
@withRouter
@CacheComponent({ cacheKey: '/sitf/external-systems' })
export default class ExternalSystems extends PureComponent {
  form;
  /**
   * 内部状态
   * @memberof ApplicationConfigure
   */

  state = {
    modalVisible: false,
    editRowData: {},
  };

  /**
   * 组件挂载后执行方法
   * @memberof ApplicationConfigure
   */
  componentDidMount() {
    const {
      dispatch,
      externalSystems: { data = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const page = isUndefined(_back) ? {} : data.pagination;
    this.batchCode();
    this.fetchSystemList(page);
    dispatch({
      type: 'externalSystems/fetchSystemType',
      payload: {},
    });
  }

  /**
   * 值级查询
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      getPublickKey: 'SITF.AES_KEY_SIZE',
    };
    dispatch({
      type: 'externalSystems/batchCode',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * 查询数据
   * @param {object} pageData 页面信息数据
   * @memberof ApplicationConfigure
   */
  @Bind()
  fetchSystemList(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'externalSystems/fetchSystemList',
      payload: {
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   * 控制弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {object} record 行数据
   * @memberof ApplicationConfigure
   */
  @Bind()
  showEditModal(flag, record) {
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
   * 新增外部系统定义
   * @param {object} fieldsValue 传递的filedvalue
   * @param {object} form 表单
   */
  @Bind()
  handleAddSystem(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;

    dispatch({
      type: 'externalSystems/saveSystem',
      payload: [
        {
          ...editRowData,
          ...fieldsValue,
        },
      ],
    }).then((response) => {
      if (response) {
        notification.success();
        form.resetFields();
        this.showEditModal(false);
        this.refreshValue();
      }
    });
  }

  /**
   * 刷新数据
   * @memberof ApplicationConfigure
   */
  @Bind()
  refreshValue() {
    const {
      externalSystems: { data = {} },
    } = this.props;
    this.fetchSystemList(data.pagination);
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 点击查询按钮事件
   * @memberof ApplicationConfigure
   */
  @Bind()
  fetchSystemByCondition() {
    this.fetchSystemList();
  }

  /**
   * 关联租户
   * @param {object} record 行记录
   * @memberof ApplicationConfigure
   */
  @Bind()
  cunnectTenant(record = {}) {
    const { history } = this.props;
    history.push(
      `/sitf/external-systems/es-relations?applicationGroupCode=${record.applicationGroupCode}&externalSystemCode=${record.externalSystemCode}`
    );
  }

  /**
   * 关联服务
   * @param {object} record 行记录
   * @memberof ApplicationConfigure
   */
  @Bind()
  cunnectService(record = {}) {
    const { history } = this.props;
    history.push(
      `/sitf/external-systems/es-service?applicationGroupCode=${record.applicationGroupCode}&externalSystemCode=${record.externalSystemCode}`
    );
  }

  /**
   * 分页改变事件
   * @param {object} pagination  分页信息
   * @memberof ApplicationConfigure
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchSystemList(pagination);
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  refreshCache() {
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystems/refreshCache',
      payload: {},
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  @Bind()
  handleJumpClient(record) {
    const { externalSystemId, externalSystemCode, externalSystemName } = record || {};
    this.props.history.push(
      `/sitf/external-systems/bindclient/${externalSystemId}?externalSystemName=${externalSystemName}&externalSystemCode=${externalSystemCode}`
    );
  }

  /**
   * 渲染方法
   * @returns
   * @memberof ApplicationConfigure
   */

  render() {
    const {
      externalSystems: {
        data = {},
        code: { SystemType = [] },
        lovCode = {},
      },
      saveLoading,
      fetchLoading,
      dispatch,
    } = this.props;
    const { modalVisible, editRowData } = this.state;
    const columns = [
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
          .d('系统代码'),
        dataIndex: 'externalSystemCode',
        width: 100,
      },
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.externalSystemName')
          .d('系统名称'),
        dataIndex: 'externalSystemName',
      },
      {
        title: intl.get('sitf.common.applicationGroup.name').d('应用组名称'),
        dataIndex: 'applicationGroupName',
        width: 150,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.systemType').d('系统类别'),
        width: 120,
        dataIndex: 'systemType',
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.systemVersion').d('系统版本'),
        dataIndex: 'systemVersion',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.roles.contacts').d('联系人'),
        dataIndex: 'contactPerson',
        width: 80,
      },
      {
        title: intl.get('hzero.common.phone').d('电话'),
        dataIndex: 'contactPhone',
        width: 100,
      },
      {
        title: intl.get('hzero.common.email').d('邮箱'),
        dataIndex: 'contactEmail',
        width: 120,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.startDate').d('上线时间'),
        dataIndex: 'startDate',
        width: 130,
        align: 'left',
        render: dateTimeRender,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.ip').d('IP地址'),
        dataIndex: 'ip',
        width: 100,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.ipCheckFlag').d('IP校验'),
        dataIndex: 'ipCheckFlag',
        width: 100,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.commom.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        align: 'left',
        render: enableRender,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.primaryFlag').d('主系统标识'),
        dataIndex: 'primaryFlag',
        width: 120,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('sitf.externalSystems.model.externalSystems.encryptFlag').d('接口加密'),
        dataIndex: 'encryptFlag',
        width: 100,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('entity.interface.version').d('接口版本'),
        dataIndex: 'interfaceVersion',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 100,
        align: 'left',
        // fixed: 'right',
        render: (_, record) => {
          const menu = (
            <Menu>
              <Menu.Item>
                <a onClick={() => this.showEditModal(true, record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              </Menu.Item>
              {record.enabledFlag && (
                <Menu.Item>
                  <a
                    onClick={() => {
                      this.cunnectTenant(record);
                    }}
                  >
                    {intl.get('entity.tenant.ralation').d('关联租户')}
                  </a>
                </Menu.Item>
              )}
              <Menu.Item>
                <a onClick={() => this.handleJumpClient(record)}>
                  {intl.get('hzero.common.button.bindClient').d('绑定客户端')}
                </a>
              </Menu.Item>
              {/* 暂时注释 */}
              {/* <Menu.Item>
                <a
                  onClick={() => {
                    this.cunnectService(record);
                  }}
                >
                  <Icon type="link" />{' '}
                  {intl.get('sitf.externalSystems.view.message.title.esservice.head').d('关联服务')}
                </a>
              </Menu.Item> */}
            </Menu>
          );
          return (
            <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
              <a className="ant-dropdown-link">
                {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      SystemType,
      lovCode,
      onHandleAddSystem: this.handleAddSystem,
      onShowEditModal: this.showEditModal,
      onFetchSystem: this.fetchSystemByCondition,
      loading: saveLoading,
      dispatch,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.externalSystems.view.message.title.externalSystems.head')
            .d('外部系统定义')}
        >
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="sync" onClick={() => this.refreshCache()}>
            {intl.get('sitf.externalSystems.button.refreshCache').d('刷新缓存')}
          </Button>
        </Header>
        <Content>
          <QueryForm
            SystemType={SystemType}
            onFetchSystem={this.fetchSystemByCondition}
            onRef={this.handleBindRef}
          />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="externalSystemId"
            dataSource={data.list}
            scroll={{ x: 1651 }}
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
