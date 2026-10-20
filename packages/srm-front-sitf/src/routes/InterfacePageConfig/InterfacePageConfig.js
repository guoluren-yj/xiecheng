/**
 * InterfacePageConfig - 接口页面配置
 * @date: 2018-9-28
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hands
 */
import React, { PureComponent, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Table, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import EditForm from './EditForm';
import QueryForm from './QueryForm';

/**
 * 接口页面配置
 * @extends {Component} - React.Component
 * @reactProps {Object} interfacePageConfig | interfacePageConfigOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@formatterCollections({ code: ['sitf.interfacePageConfig', 'entity.interface'] })
@withRouter
@CacheComponent({ cacheKey: '/hpfm/interface-page-config' })
export default class InterfacePageConfig extends PureComponent {
  Form;
  /**
   *Creates an instance of InterfacePageConfig.
   * @param {Object} props
   */
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      editRowData: {},
      selectedRows: [],
    };
  }

  /**
   *组件挂载后执行方法
   *
   */
  componentDidMount() {
    this.fetchData();
  }

  /**
   *查询数据
   *
   * @param {Object} pageData 页面信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { dispatch, modelName = 'interfacePageConfig' } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: `${modelName}/fetch`,
      payload: {
        page: pageData,
        ...filterValues,
      },
    });
  }

  /**
   *控制弹出框显示隐藏
   *
   * @param {Boolean} flag 显/隐标记
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
   * 新增接口配置
   * @param {Object} fieldsValue 传递的filedvalue
   * @param {Object} form 表单
   */
  @Bind()
  handleAdd(fieldsValue = {}) {
    const { dispatch, modelName = 'interfacePageConfig' } = this.props;
    const { editRowData } = this.state;
    dispatch({
      type: `${modelName}/save`,
      payload: {
        ...editRowData,
        ...fieldsValue,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshValue();
      }
    });
  }

  /**
   * 删除接口配置数据
   */
  @Bind()
  remove() {
    const { dispatch, modelName = 'interfacePageConfig' } = this.props;
    const { selectedRows } = this.state;
    const onOk = () => {
      dispatch({
        type: `${modelName}/remove`,
        payload: selectedRows,
      }).then(response => {
        if (response) {
          notification.success();
          this.refreshValue();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  /**
   * 引用平台级数据
   */
  @Bind()
  quoteSiteData() {
    const { dispatch, modelName = 'interfacePageConfig' } = this.props;
    dispatch({
      type: `${modelName}/quoteSiteData`,
      payload: {},
    }).then(response => {
      if (response) {
        notification.success();
        this.refreshValue();
      }
    });
  }

  /**
   *刷新
   *
   */
  @Bind()
  refreshValue() {
    const { modelName = 'interfacePageConfig' } = this.props;
    const { [modelName]: interfacePageConfig } = this.props;
    const { data = {} } = interfacePageConfig;
    this.fetchData(data.pagination);
    this.setState({
      editRowData: {},
      modalVisible: false,
    });
    this.clearSelectRows();
  }

  /**
   *点击查询按钮事件
   *
   */
  @Bind()
  queryValue(queryData = {}) {
    this.fetchData(queryData);
  }

  /**
   * 勾选时间
   * @param {Null} _ 占位
   * @param {Array} rows 选中的行数据
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 清除选择状态
   */
  @Bind()
  clearSelectRows() {
    this.setState({
      selectedRows: [],
    });
  }

  /**
   *分页change时间
   * @param {Object} pagination 分页参数
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    this.fetchData(pagination);
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
   *渲染方法
   */
  render() {
    const { modelName = 'interfacePageConfig', saveLoading, fetchLoading } = this.props;
    const { modalVisible, editRowData, selectedRows } = this.state;
    const { [modelName]: interfacePageConfig } = this.props;
    const { data = {} } = interfacePageConfig;

    const columns = [
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.pageConfigId')
          .d('配置ID'),
        dataIndex: 'pageConfigId',
        width: 100,
      },
      {
        title: intl.get('entity.interface.name').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 120,
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.parentPageConfigId')
          .d('父级配置ID'),
        dataIndex: 'parentPageConfigId',
        width: 150,
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.interfaceUrl')
          .d('查询接口url'),
        dataIndex: 'interfaceUrl',
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.tableName')
          .d('接口表名'),
        dataIndex: 'tableName',
        width: 150,
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.numberColumnName')
          .d('编号列名'),
        dataIndex: 'numberColumnName',
        width: 150,
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.erpDateColumnName')
          .d('ERP业务时间列名'),
        dataIndex: 'erpDateColumnName',
        width: 150,
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.srmDateColumnName')
          .d('SRM业务时间列名'),
        dataIndex: 'srmDateColumnName',
        width: 150,
      },
      {
        title: intl
          .get('sitf.interfacePageConfig.model.interfacePageConfig.tableTypeName')
          .d('接口表类型'),
        dataIndex: 'tableTypeName',
        width: 150,
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

    const level = isTenantRoleLevel();

    const editFormOptions = {
      modalVisible,
      editRowData,
      level,
      handleAdd: this.handleAdd,
      showEditModal: this.showEditModal,
      queryValue: this.queryValue,
      loading: saveLoading,
    };

    const rowSelection = {
      onChange: this.handleSelectRows,
      selectedRowKeys: selectedRows.map(n => n.pageConfigId),
    };

    return (
      <React.Fragment>
        <Header title={intl.get('sitf.interfacePageConfig.view.title.head').d('接口页面配置')}>
          <Button icon="plus" type="primary" onClick={() => this.showEditModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="minus" onClick={this.remove} disabled={selectedRows.length <= 0}>
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          {level && (
            <Button icon="fork" onClick={this.quoteSiteData}>
              {intl.get('sitf.interfacePageConfig.view.button.quote').d('引用平台配置')}
            </Button>
          )}
        </Header>
        <Content>
          <QueryForm queryValue={this.queryValue} onRef={this.handleBindRef} level={level} />
          <Table
            bordered
            loading={fetchLoading}
            rowKey="pageConfigId"
            dataSource={data.list}
            columns={columns}
            rowSelection={rowSelection}
            pagination={data.pagination}
            onChange={this.handleStandardTableChange}
          />
          <EditForm {...editFormOptions} />
        </Content>
      </React.Fragment>
    );
  }
}
