/**
 * ESRelations - 外部系统定义 - 租户关联
 * @date: 2018-09-21
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Form, Button, Table, Row, Col, Divider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import EditForm from './EditForm';
/**
 * 外部系统定义 - 租户关联
 * @extends {Component} - React.Component
 * @reactProps {Object} externalSystems - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['sitf.externalSystems', 'entity.interface', 'entity.application', 'entity.tenant'],
})
@connect(({ externalSystems, loading }) => ({
  externalSystems,
  saveRelationData: loading.effects['externalSystems/saveRelationData'],
  fetchCompanyData: loading.effects['externalSystems/fetchCompanyData'],
  fetchUnitOptions: loading.effects['externalSystems/fetchUnitOptions'],
  fetchInterface: loading.effects['externalSystems/fetchInterface'],
  fetchRelationData: loading.effects['externalSystems/fetchRelationData'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class ESRelations extends PureComponent {
  constructor(props) {
    super(props);
    const parentParams = qs.parse(props.history.location.search.substr(1));
    this.state = {
      modalVisible: false,
      editRowData: {},
      parentParams,
    };
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch } = this.props;
    const { parentParams } = this.state;
    dispatch({
      type: 'externalSystems/queryRelationType',
      payload: {},
    });
    dispatch({
      type: 'externalSystems/fetchESInfo',
      payload: {
        externalSystemCode: parentParams && parentParams.externalSystemCode,
      },
    });
    this.fetchExternalSystem();
  }

  /**
   * 查询外部系统
   */
  @Bind()
  fetchExternalSystem() {
    const { dispatch } = this.props;
    const { parentParams } = this.state;
    dispatch({
      type: 'externalSystems/fetchRelationData',
      payload: {
        ...parentParams,
      },
    });
  }

  /**
   * 打开编辑框
   * @param {boolean} flag 是否打开
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
   * 添加租户关联
   * @param {object} fieldsValue
   * @param {object} form
   */
  @Bind()
  handleAddExternal(fieldsValue, form) {
    const { dispatch } = this.props;
    const { editRowData, parentParams } = this.state;
    dispatch({
      type: 'externalSystems/saveRelationData',
      payload: {
        ...parentParams,
        ...editRowData,
        ...fieldsValue,
      },
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
   * 刷新数据
   */
  @Bind()
  refreshValue() {
    this.fetchExternalSystem();
    this.setState({
      editRowData: {},
    });
  }

  /**
   * 清除model数据
   * @memberof ESRelations
   */
  @Bind()
  clearModalData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'externalSystems/updateState',
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

  render() {
    const {
      externalSystems: {
        esRelationsdata = [],
        esInfo = {},
        code: { ESRelationType = [] },
      },
      saveRelationData,
      fetchRelationData,
      match,
    } = this.props;
    const { modalVisible, editRowData, parentParams } = this.state;
    const columns = [
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.relationTypeMeaning')
          .d('关联类型'),
        dataIndex: 'relationTypeMeaning',
        width: 150,
      },
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.relationDataCode')
          .d('关系数据代码'),
        dataIndex: 'relationDataCode',
        width: 150,
      },
      {
        title: intl.get('entity.application.name').d('应用名称'),
        dataIndex: 'applicationName',
        width: 150,
      },
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.interfaceEnabledFlag')
          .d('启用接口'),
        dataIndex: 'interfaceEnabledFlag',
        width: 80,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl
          .get('sitf.externalSystems.model.externalSystems.interfaceControlFlag')
          .d('接口管控'),
        dataIndex: 'interfaceControlFlag',
        width: 80,
        align: 'left',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.edit').d('编辑'),
        width: 80,
        align: 'left',
        render: (_, record) => {
          return (
            <a onClick={() => this.showEditModal(true, record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];

    const editFormOptions = {
      modalVisible,
      editRowData,
      parentParams,
      ESRelationType,
      onHandleAddExternal: this.handleAddExternal,
      onShowEditModal: this.showEditModal,
      loading: saveRelationData,
    };
    const basePath = match.path.substring(0, match.path.indexOf('/es-relations'));

    return (
      <React.Fragment>
        <Header
          title={intl.get('entity.tenant.ralation').d('关联租户')}
          backPath={`${basePath}/list`}
        >
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Row>
            <Col span={3}>
              {intl
                .get('sitf.externalSystems.model.externalSystems.externalSystemCode')
                .d('系统代码')}
              :
            </Col>
            <Col span={4}>{esInfo.externalSystemCode}</Col>
            <Col span={3}>
              {intl
                .get('sitf.externalSystems.model.externalSystems.externalSystemName')
                .d('系统名称')}
              :
            </Col>
            <Col span={4}>{esInfo.externalSystemName}</Col>
            <Divider />
          </Row>
          <Table
            bordered
            loading={fetchRelationData}
            rowKey="relationId"
            dataSource={esRelationsdata}
            columns={columns}
            pagination={false}
          />
          <EditForm {...editFormOptions} />
          {/* <InterfaceCompany {...companyOptions} />
          <InterfaceOperationUnit {...operationUnitOptions} />
          <InterfaceAllocation {...interfaceOptions} /> */}
        </Content>
      </React.Fragment>
    );
  }
}
