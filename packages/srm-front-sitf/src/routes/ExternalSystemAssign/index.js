/**
 * ExternalSystemAssign - 外部系统分配
 * @date: 2018-12-17
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Table, Menu, Icon, Dropdown } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNumber, sum } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { enableRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
import notification from 'utils/notification';
import CacheComponent from 'components/CacheComponent';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import EditForm from './EditForm';
import InterfaceCompany from './InterfaceCompany';
import InterfaceOperationUnit from './InterfaceOperationUnit';
import InterfaceAllocation from './InterfaceAllocation';

/**
 * 外部系统定义
 * @extends {Component} - React.Component
 * @reactProps {Object} externalSystemAssign - 数据源
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
    'entity.roles',
    'sitf.common',
  ],
})
@connect(({ externalSystemAssign, loading }) => ({
  externalSystemAssign,
  saveLoading: loading.effects['externalSystemAssign/saveSystem'],
  fetchLoading: loading.effects['externalSystemAssign/fetchSystemList'],
  fetchCompanyData: loading.effects['externalSystemAssign/fetchCompanyData'],
  fetchUnitOptions: loading.effects['externalSystemAssign/fetchUnitOptions'],
  fetchInterface: loading.effects['externalSystemAssign/fetchInterface'],
}))
@withRouter
@CacheComponent({ cacheKey: '/sitf/external-system-assign' })
export default class ExternalSystemAssign extends PureComponent {
  form;

  /**
   * 内部状态
   */
  state = {
    editRowData: {},
    companyVisible: false,
    ouVisible: false,
    interfaceVisible: false,
    modalVisible: false,
  };

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/fetchSystemType',
      payload: {},
    });
    this.fetchSystemList();
  }

  /**
   * 查询数据
   * @param {object} pageData 页面信息数据
   */
  @Bind()
  fetchSystemList(pageData = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'externalSystemAssign/fetchSystemList',
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
   * @param {object} fieldsValue 表单数据
   * @param {object} form 表单
   */
  @Bind()
  handleAddSystem(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData } = this.state;

    dispatch({
      type: 'externalSystemAssign/saveSystem',
      payload: {
        // ...editRowData,
        objectVersionNumber: editRowData.objectVersionNumber,
        ...fieldsValue,
      },
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
   */
  @Bind()
  refreshValue() {
    const {
      externalSystemAssign: { data = {} },
    } = this.props;
    this.fetchSystemList(data.pagination);
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 点击查询按钮事件
   */
  @Bind()
  fetchSystemByCondition() {
    this.fetchSystemList();
  }

  /**
   * 清除model数据
   */
  @Bind()
  clearModalData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/updateState',
      payload: {
        companyData: [],
        companyTargetKeys: [],
        unitOptionsData: [],
        ouTargetKeys: [],
        interfaceData: [],
        interfaceTargetKeys: [],
      },
    });
  }

  /**
   * 分配公司
   * @param {true} flag 是否分配
   * @param {object} record 行记录
   * @memberof ESRelations
   */
  @Bind()
  handleCompanyModal(flag, record) {
    const state = {
      companyVisible: flag,
      currentData: record || [],
    };
    if (flag) {
      state.currentData = record;
      this.fetchCompany(record);
    } else {
      state.currentData = [];
      this.clearModalData();
    }
    this.setState(state);
  }

  /**
   * 查询公司数据
   * @param {object} record
   * @memberof ESRelations
   */
  @Bind()
  fetchCompany(record = {}) {
    const { dispatch } = this.props;
    const organizationId = getCurrentOrganizationId();
    dispatch({
      type: 'externalSystemAssign/fetchCompanyData',
      payload: {
        organizationId,
        relationId: record.relationId,
      },
    });
  }

  /**
   * 添加公司
   * @param {object} 公司参数
   * @memberof ESRelations
   */
  @Bind()
  handleAddCompany(rows = {}) {
    const { currentData } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/addCompany',
      payload: {
        relationId: currentData.relationId,
        companyIds: rows,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.fetchCompany(currentData);
      }
    });
  }

  /**
   * 移除公司
   * @param {object} rows 行数据
   * @memberof ESRelations
   */
  @Bind()
  handleRemoveCompany(rows = {}) {
    const { currentData } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/removeCompany',
      payload: {
        relationId: currentData.relationId,
        companyIds: rows,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.fetchCompany(currentData);
      }
    });
  }

  /**
   *查询业务实体
   * @param {*Object} record 行数据
   */
  @Bind()
  queryUnitOptions(record = {}) {
    const { dispatch } = this.props;
    const organizationId = getCurrentOrganizationId();
    dispatch({
      type: 'externalSystemAssign/fetchUnitOptions',
      payload: {
        organizationId,
        relationId: record.relationId,
      },
    });
  }

  /**
   * 控制业务实体弹窗显示隐藏
   * @param {*Boolean} flag 显示/隐藏标记
   * @param {*Object} record 行数据
   */
  @Bind()
  handleOUModal(flag, record) {
    const state = {
      ouVisible: flag,
      currentData: record || [],
    };
    if (flag) {
      state.currentData = record;
      this.queryUnitOptions(record);
    } else {
      state.currentData = [];
      this.clearModalData();
    }
    this.setState(state);
  }

  /**
   * 分配业务实体
   * @param {*Array} rows 分配数据
   */
  @Bind()
  handleAddUnitOptions(rows = []) {
    const { currentData } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/addUnitOptions',
      payload: {
        relationId: currentData.relationId,
        ouIds: rows,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.queryUnitOptions(currentData);
      }
    });
  }
  /**
   * 取消分配业务实体
   * @param {*Array} rows 取消分配数据
   */

  @Bind()
  removeUnitOptions(rows = []) {
    const { currentData } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/removeUnitOptions',
      payload: {
        relationId: currentData.relationId,
        ouIds: rows,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.queryUnitOptions(currentData);
      }
    });
  }

  /**
   *查询分配接口数据
   * @param {*Object} record 行数据
   */
  @Bind()
  queryInterface(record = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/fetchInterface',
      payload: {
        relationId: record.relationId,
        applicationGroupCode: record.applicationGroupCode,
      },
    });
  }

  /**
   * 控制分配接口弹框
   * @param {*Boolean} flag 显示/隐藏标记
   * @param {*Object} record 行数据
   */
  @Bind()
  handleInterfaceModal(flag, record) {
    const state = {
      interfaceVisible: flag,
      currentData: record || [],
    };
    if (flag) {
      state.currentData = record;
      this.queryInterface(record);
    } else {
      state.currentData = [];
      this.clearModalData();
    }
    this.setState(state);
  }

  /**
   * 添加接口
   * @param {Array} rows 行数据
   * @memberof ESRelations
   */
  @Bind()
  handleAddInterface(rows = []) {
    const { currentData, parentParams } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/addInterface',
      payload: {
        relationId: currentData.relationId,
        interfaceIds: rows,
        externalSystemCode: parentParams && parentParams.externalSystemCode,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.queryInterface(currentData);
      }
    });
  }

  /**
   * 移除接口
   * @param {Array} rows 行数据
   * @memberof ESRelations
   */
  @Bind()
  handleRemoveInterface(rows = {}) {
    const { currentData, parentParams } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystemAssign/removeInterface',
      payload: {
        relationId: currentData.relationId,
        interfaceIds: rows,
        externalSystemCode: parentParams && parentParams.externalSystemCode,
      },
    }).then((response) => {
      if (response) {
        notification.success();
        this.queryInterface(currentData);
      }
    });
  }

  /**
   * 绑定ref
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
      externalSystemAssign: {
        companyData = [],
        companyTargetKeys = [],
        unitOptionsData = [],
        ouTargetKeys = [],
        interfaceData = [],
        interfaceTargetKeys = [],
        data = {},
        pagination,
        code: { SystemType = [] },
      },
      saveLoading,
      fetchLoading,
      fetchCompanyData,
      fetchUnitOptions,
      fetchInterface,
    } = this.props;
    const { content = [] } = data;
    const { modalVisible, editRowData, companyVisible, ouVisible, interfaceVisible } = this.state;
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
        width: 100,
      },
      {
        title: intl.get('sitf.common.applicationGroup.name').d('应用组名称'),
        dataIndex: 'applicationGroupName',
        width: 150,
      },
      {
        title: intl.get('entity.application.name').d('应用名称'),
        dataIndex: 'applicationName',
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
        title: intl.get('entity.roles.contacts').d('联系人'),
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
        width: 80,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
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
        width: 100,
        align: 'left',
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.interfaceEnabledFlag')
          .d('启用接口'),
        dataIndex: 'interfaceEnabledFlag',
        width: 100,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.interfaceControlFlag')
          .d('接口管控'),
        dataIndex: 'interfaceControlFlag',
        width: 200,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 230,
        fixed: 'right',
        render: (_, record) => {
          const menu = (
            <Menu style={{ padding: 0 }}>
              {record.primaryFlag === 1 && (
                <Menu.Item>
                  <a
                    onClick={() => {
                      this.handleOUModal(true, record);
                    }}
                  >
                    {intl.get('sitf.externalSystems.view.menu.operationUnit').d('分配业务实体')}
                  </a>
                </Menu.Item>
              )}
              {record.interfaceEnabledFlag && record.interfaceControlFlag && (
                <Menu.Item>
                  <a
                    onClick={() => {
                      this.handleInterfaceModal(true, record);
                    }}
                  >
                    {intl.get('sitf.externalSystems.view.menu.interfaceAllocation').d('分配接口')}
                  </a>
                </Menu.Item>
              )}
            </Menu>
          );
          return (
            <div>
              <a onClick={() => this.showEditModal(true, record)} style={{ width: 40 }}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {record.primaryFlag === 1 && (
                <a
                  onClick={() => {
                    this.handleCompanyModal(true, record);
                  }}
                  style={{ marginLeft: '30px' }}
                >
                  {intl.get('sitf.externalSystems.view.menu.company').d('分配公司')}
                </a>
              )}
              <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                <a className="ant-dropdown-link" style={{ marginLeft: '40px' }}>
                  {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
                </a>
              </Dropdown>
            </div>
          );
        },
      },
    ];

    const companyOptions = {
      companyVisible,
      onHandleCompanyModal: this.handleCompanyModal,
      onHandleAddCompany: this.handleAddCompany,
      onHandleRemoveCompany: this.handleRemoveCompany,
      companyData,
      companyTargetKeys,
      loading: fetchCompanyData,
    };

    const operationUnitOptions = {
      ouVisible,
      onHandleOUModal: this.handleOUModal,
      onHandleAddUnitOptions: this.handleAddUnitOptions,
      onHandleRemoveUnitOptions: this.removeUnitOptions,
      unitOptionsData,
      ouTargetKeys,
      loading: fetchUnitOptions,
    };

    const interfaceOptions = {
      interfaceVisible,
      onHandleInterfaceModal: this.handleInterfaceModal,
      onHandleAddInterface: this.handleAddInterface,
      onHandleRemoveInterface: this.handleRemoveInterface,
      interfaceData,
      interfaceTargetKeys,
      loading: fetchInterface,
    };

    const editFormOptions = {
      modalVisible,
      editRowData,
      SystemType,
      onHandleAddSystem: this.handleAddSystem,
      onShowEditModal: this.showEditModal,
      onFetchSystem: this.fetchSystemByCondition,
      loading: saveLoading,
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.externalSystems.view.message.title.externalSystems.head')
            .d('外部系统分配')}
        />
        <Content>
          <Table
            bordered
            loading={fetchLoading}
            rowKey="externalSystemId"
            dataSource={content}
            scroll={scrollX}
            columns={columns}
            pagination={pagination}
            onChange={this.fetchSystemList}
          />
          <EditForm {...editFormOptions} />
          <InterfaceCompany {...companyOptions} />
          <InterfaceOperationUnit {...operationUnitOptions} />
          <InterfaceAllocation {...interfaceOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
