/**
 * InterfaceCateDef -接口类别定义页面
 * @date: 2018-9-28
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button } from 'hzero-ui';

import { isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';

import { Header, Content } from 'components/Page';

import InterfaceCateDefModal from './InterfaceCateDefModal';
import FilterForm from './FilterForm';
@formatterCollections({ code: ['sitf.interfaceCateDef'] })
export default class InterfaceCateDef extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      tableRecord: {},
    };
  }

  form;

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  refreshData() {
    const { dispatch, modelName = 'interfaceCateDef' } = this.props;
    dispatch({
      type: `${modelName}/fetchInterfaceCareDef`,
      payload: {
        page: {},
      },
    });
  }

  /**
   * 接口类别定义
   * @param {object} params 查询参数
   * @param {object} query  默认查询条件
   */
  @Bind()
  queryInterfaceCateDef(params = {}) {
    const { modelName = 'interfaceCateDef' } = this.props;
    const {
      dispatch,
      [modelName]: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());

    dispatch({
      type: `${modelName}/fetchInterfaceCareDef`,
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建表格
   */
  @Bind()
  handleInterfaceCate() {
    this.setState({
      tableRecord: {},
      modalVisible: true,
    });
  }

  /**
   * 编辑
   * @param {object} record 行记录
   */
  @Bind()
  handleEditInterfaceCate(record = {}) {
    this.setState({
      tableRecord: record,
      modalVisible: true,
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }
  /**
   * 取消编辑/新建
   */
  @Bind()
  cancelInterfaceUpdate() {
    this.setState({
      tableRecord: {},
      modalVisible: false,
    });
  }

  /**
   * 数据保存
   * @param {object} values  保存的参数
   */
  @Bind()
  saveDate(values = {}) {
    const { dispatch, modelName = 'interfaceCateDef' } = this.props;
    dispatch({
      type: `${modelName}/updateInterFaceCareDef`,
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          tableRecord: {},
          modalVisible: false,
        });
        this.queryInterfaceCateDef();
      }
    });
  }

  render() {
    const { modelName = 'interfaceCateDef' } = this.props;

    const {
      loading,
      updateLoading,
      [modelName]: { list = {}, pagination = {} },
    } = this.props;
    const { modalVisible, tableRecord = {} } = this.state;
    const columns = [
      {
        title: intl
          .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryCode`)
          .d('接口类别代码'),
        dataIndex: 'interfaceCategoryCode',
        width: 200,
        align: 'left',
      },
      {
        title: intl
          .get(`sitf.interfaceCateDef.model.interfaceCateDef.interfaceCategoryDesc`)
          .d('接口类别描述'),
        dataIndex: 'interfaceCategoryName',
        align: 'left',
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        align: 'left',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 100,
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                this.handleEditInterfaceCate(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const filterProps = {
      onRef: this.handleRef,
      onFetchData: this.queryInterfaceCateDef,
    };
    const detailProps = {
      modalVisible,
      updateLoading,
      tableRecord,
      onSaveDate: this.saveDate,
      onCancel: this.cancelInterfaceUpdate,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`sitf.interfaceCateDef.view.interfaceCateDef.headerTitle`)
            .d('接口类别定义')}
        >
          <Button type="primary" icon="plus" onClick={this.handleInterfaceCate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            rowKey="interfaceCategoryId"
            columns={columns}
            loading={loading}
            bordered
            onChange={page => this.queryInterfaceCateDef(page)}
          />
        </Content>
        <InterfaceCateDefModal {...detailProps} />
      </React.Fragment>
    );
  }
}
