/**
 * InterfaceMappingConfig -IDoc接口映射配置
 * @date: 2018-10-18
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { omit, isEmpty, isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import notification from 'utils/notification';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';

import InterfaceMappingModal from './InterfaceMappingModal';
import FilterForm from './FilterForm';

@formatterCollections({
  code: ['sitf.interfaceMappingConfig', 'entity.interface', 'entity.application'],
})
@connect(({ interfaceMappingConfig, loading }) => ({
  interfaceMappingConfig,
  loading: loading.effects['interfaceMappingConfig/queryInterfaceMappingList'],
  deleting: loading.effects['interfaceMappingConfig/deleteInterfaceMapping'],
}))
export default class InterfaceMappingConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tableRecord: {},
      selectedRows: [], // 勾选的数据
      isCreate: true, // 新建或编辑  true为新建，false为编辑
    };
  }

  form;

  componentDidMount() {
    this.refreshData();
  }

  @Bind()
  refreshData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceMappingConfig/queryInterfaceMappingList',
      payload: {
        page: {},
      },
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }
  /**
   * 查询IDoc接口映射配置
   * @param {object} params  查询参数
   */
  @Bind()
  fetchInterfaceMappingList(params = {}) {
    const {
      dispatch,
      interfaceMappingConfig: { pagination = {} },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'interfaceMappingConfig/queryInterfaceMappingList',
      payload: {
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建IDoc接口映射配置
   */
  @Bind()
  handleCreateInterfaceMapping() {
    this.setState({
      tableRecord: {},
      visible: true,
      isCreate: true,
    });
  }

  /**
   * 编辑IDoc接口映射配置
   * @param {object} record 编辑参数
   */
  @Bind()
  handlerEditInterfaceMapping(record = {}) {
    this.setState({
      tableRecord: record,
      visible: true,
      isCreate: false,
    });
  }

  /**
   * 取消模态框
   */
  @Bind()
  onHandleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  /**
   * 勾选框勾选
   * @param {object} selectedRows 勾选的当前行数据
   */
  @Bind()
  handleRowSelectChange(_, selectedRows) {
    this.setState({
      selectedRows,
    });
  }

  /**
   * 数据保存接口
   * @param {object} values 保存参数
   */
  @Bind()
  handleSaveInterfaceMapping(values = {}) {
    const { dispatch } = this.props;
    const { isCreate } = this.state;
    dispatch({
      type: isCreate
        ? 'interfaceMappingConfig/createInterfaceMapping'
        : 'interfaceMappingConfig/updateInterfaceMapping',
      payload: {
        body: values,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          visible: false,
          tableRecord: {},
        });
        this.fetchInterfaceMappingList();
      }
    });
  }

  /**
   * 删除数据配置
   */
  @Bind()
  handlerDeleteMapping() {
    const { dispatch, deleting } = this.props;
    const { selectedRows } = this.state;
    const { fetchInterfaceMappingList } = this;
    const selectId = [];
    selectedRows.forEach(item => {
      const copyList = { ...item };
      const endList = omit(copyList, [
        'creationDate',
        'createdBy',
        'lastUpdateDate',
        'lastUpdatedBy',
        '_token',
        'objectVersionNumber',
      ]);
      selectId.push(endList);
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示框?'),
      content: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk() {
        dispatch({
          type: 'interfaceMappingConfig/deleteInterfaceMapping',
          payload: selectId,
        }).then(result => {
          if (result) {
            notification.success();
            fetchInterfaceMappingList();
          }
        });
      },
      confirmLoading: deleting,
    });
  }

  render() {
    const {
      interfaceMappingConfig: { list = {}, pagination = {} },
      loading,
      deleting,
    } = this.props;
    const { visible, tableRecord } = this.state;
    const columns = [
      {
        title: intl.get('entity.application.group').d('应用组'),
        dataIndex: 'applicationGroupName',
        align: 'left',
      },
      {
        title: intl
          .get('sitf.interfaceMappingConfig.model.interfaceMappingConfig.idocType')
          .d('IDoc类别'),
        dataIndex: 'idocType',
        width: 120,
        align: 'left',
      },
      {
        title: intl
          .get(`sitf.interfaceSegment.model.interfaceSegment.parentIdocType`)
          .d('父IDOC类别'),
        dataIndex: 'parentIdocType',
        width: 120,
        align: 'left',
      },
      {
        title: intl
          .get('sitf.interfaceMappingConfig.model.interfaceMappingConfig.idocTypeDesc')
          .d('IDoc描述'),
        width: 120,
        dataIndex: 'idocTypeDesc',
        align: 'left',
      },
      {
        title: intl.get('entity.interface.tag').d('接口'),
        align: 'left',
        dataIndex: 'interfaceCode',
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
                this.handlerEditInterfaceMapping(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const fillerProps = {
      onRef: this.handleRef,
      onFetchData: this.fetchInterfaceMappingList,
    };
    const detailProps = {
      visible,
      loading,
      tableRecord,
      onCancel: this.onHandleCancel,
      onHandleSaveInterface: this.handleSaveInterfaceMapping,
      anchor: 'right',
    };
    const rowSelection = {
      selectedRowKeys: this.state.selectedRows.map(n => n.idocTypeInterfaceId),
      onChange: this.handleRowSelectChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sitf.interfaceMappingConfig.view.interfaceMappingConfig.headerTitler')
            .d('IDoc接口映射配置')}
        >
          <Button type="primary" icon="plus" onClick={this.handleCreateInterfaceMapping}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            onClick={this.handlerDeleteMapping}
            loading={deleting}
            disabled={this.state.selectedRows.length < 1}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fillerProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            loading={loading}
            rowKey="idocTypeInterfaceId"
            columns={columns}
            rowSelection={rowSelection}
            bordered
            onChange={page => this.fetchInterfaceMappingList(page)}
          />
        </Content>
        <InterfaceMappingModal {...detailProps} />
      </React.Fragment>
    );
  }
}
