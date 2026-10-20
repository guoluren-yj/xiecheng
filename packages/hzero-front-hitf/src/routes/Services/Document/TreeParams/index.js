/**
 * TreeParams - XML和JSON类型的BODY
 * @date: 2019-6-4
 * @author: hulingfangzi <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Popconfirm, Select, Table } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'hzero-front/lib/utils/intl';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { tableScrollWidth } from 'hzero-front/lib/utils/utils';
import { isEmpty } from 'lodash';
import Drawer from './Drawer';
import ParamConfig from './ParamConfig';

const { Option } = Select;
/**
 * XML和JSON类型的BODY参数信息
 * @extends {Component} - React.Component
 * @reactProps {array} dataSource - 数据源
 * @reactProps {array} mainColumns - 除了操作列之外的列
 * @reactProps {boolean} loading - 列表数据加载标志
 * @reactProps {boolean} confirmLoading - 新建/编辑保存加载标志
 * @reactProps {array} paramValueTypes- BODY参数值的类型值集
 * @reactProps {array} timeZones- BODY参数的时区值集
 * @reactProps {array} dateFormats- BODY参数的时间格式值集
 * @reactProps {string} actionType - HTTP操作类型(REQ/RESP)
 * @reactProps {string} paramTypes - 参数类型(HEADER/GET/PATH/BODY)
 * @reactProps {string} mimeType - BODY的MIME类型(form-data/x-www-form-urlencoded/xml/json/raw)
 * @reactProps {Function} onDelete - 删除参数
 * @reactProps {Function} onSave - 保存参数
 * @reactProps {number} interfaceId - 接口ID
 * @reactProps {Function} onSaveConfig - 保存请求/响应报文参数
 * @return React.element
 */
export default class TreeParams extends Component {
  state = {
    visible: false,
    currentParamData: null,
    currentAction: 'create',
    paramConfigVisible: false,
    batchDeleteLoading: false,
  };

  /**
   * 打开参数侧滑
   */
  @Bind()
  openDrawer() {
    this.setState({ visible: true });
  }

  /**
   * 关闭参数侧滑
   */
  @Bind()
  closeDrawer() {
    this.setState({ visible: false });
  }

  /**
   * 更改JSON根节点
   * @param {string} value 选中的值
   */
  @Bind()
  changeRootType(value) {
    const { actionType } = this.props;
    const lower = actionType.toLowerCase();
    this.props.onChangeRoot({
      [`${lower}RootType`]: value,
      [`${lower}MimeType`]: 'application/json',
    });
  }

  /**
   * 保存参数
   */
  @Bind()
  handleSaveParams(values, flag) {
    this.props.onSave(values, flag);
  }

  /**
   * 创建参数
   * @param {boolean} recordCreateFlag - 是否在行上创建
   * @param {object} record - 当前行数据
   */
  @Bind()
  handleCreate(recordCreateFlag = false, record = null) {
    this.setState({
      visible: true,
      currentParamData: record,
      currentAction: recordCreateFlag ? 'createRecord' : 'create',
    });
  }

  /**
   * 编辑参数
   * @param {object} record - 当前行数据
   */
  @Bind()
  handleEdit(record) {
    this.setState({
      visible: true,
      currentParamData: record,
      currentAction: 'edit',
    });
  }

  /**
   * 获取JSON根节点类型
   */
  @Bind()
  getRootType() {
    const { actionType, reqRootType, respRootType } = this.props;
    let rootType = 'object';
    if (actionType === 'REQ' && reqRootType) {
      rootType = reqRootType;
    }

    if (actionType === 'RESP' && respRootType) {
      rootType = respRootType;
    }
    return rootType;
  }

  /**
   * 打开参数侧滑
   */
  @Bind()
  openParamConfig() {
    this.setState({ paramConfigVisible: true });
  }

  /**
   * 关闭参数侧滑
   */
  @Bind()
  closeParamConfig() {
    this.setState({ paramConfigVisible: false });
  }

  /**
   * 批量删除，勾选的数据
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  async handleBatchDelete() {
    const { onBatchDelete } = this.props;
    const { selectedRows } = this.state;
    this.setState({ batchDeleteLoading: true });
    const res = await onBatchDelete(selectedRows);
    this.setState({ batchDeleteLoading: false });
    if (res) {
      this.setState({ selectedRowKeys: [], selectedRows: [] });
    }
  }

  render() {
    const {
      dataSource,
      mainColumns,
      loading,
      confirmLoading,
      paramValueTypes,
      timeZones,
      dateFormats,
      actionType,
      paramType,
      mimeType,
      rootTypes,
      onDelete,
      onSaveConfig,
    } = this.props;
    const {
      visible,
      currentParamData,
      recordCreateFlag,
      currentAction,
      paramConfigVisible,
      selectedRowKeys,
      batchDeleteLoading,
    } = this.state;
    const isHaveRoot = !!dataSource.length;
    const columns = [
      ...mainColumns,
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        fixed: 'right',
        width: 180,
        render: (_, record) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a onClick={() => this.handleEdit(record)}>
                  {intl.get('hzero.common.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.edit').d('编辑'),
            },
            (record.paramValueType === 'OBJECT' || record.paramValueType === 'ARRAY') && {
              key: 'create',
              ele: (
                <a onClick={() => this.handleCreate(true, record)}>
                  {intl.get('hzero.common.create').d('新建')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.create').d('新建'),
            },
            {
              key: 'delete',
              ele: (
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                  placement="topRight"
                  onConfirm={() => onDelete(record)}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            },
          ].filter(Boolean);

          return operatorRender(operators, record);
        },
      },
    ];
    const tableProps = {
      columns,
      loading,
      dataSource,
      pagination: false,
      bordered: true,
      style: { marginBottom: '50px' },
      scroll: { x: tableScrollWidth(columns) },
      defaultExpandAllRows: true,
      rowSelection: {
        selectedRowKeys,
        onChange: this.handleRowSelect,
      },
    };

    const drawerProps = {
      visible,
      paramType,
      mimeType,
      actionType,
      recordCreateFlag,
      currentAction,
      currentParamData,
      confirmLoading,
      isHaveRoot,
      paramValueTypes,
      timeZones,
      dateFormats,
      onCancel: this.closeDrawer,
      onSave: this.handleSaveParams,
    };

    const paramConfigProps = {
      dataSource,
      actionType,
      mimeType,
      paramType,
      rootType: this.getRootType(),
      visible: paramConfigVisible,
      onCancel: this.closeParamConfig,
      onSave: onSaveConfig,
    };
    return (
      <>
        <div className="table-list-search" style={{ textAlign: 'right', marginTop: '10ox' }}>
          <Button style={{ marginRight: 8 }} onClick={this.openParamConfig}>
            {intl.get('hitf.document.button.param.config').d('报文维护')}
          </Button>
          {mimeType === 'application/json' && (
            <>
              <span>{intl.get('hitf.document.view.title.rootType').d('JSON根类型')}:</span>
              <Select
                style={{ margin: '10px 8px 0', width: '90px' }}
                onChange={this.changeRootType}
                value={this.getRootType()}
              >
                {rootTypes.length &&
                  rootTypes.map(({ value, meaning }) => (
                    <Option key={value} value={value}>
                      {meaning}
                    </Option>
                  ))}
              </Select>
            </>
          )}
          <Button
            style={{ marginRight: 8 }}
            loading={batchDeleteLoading}
            disabled={isEmpty(selectedRowKeys)}
            onClick={this.handleBatchDelete}
          >
            {intl.get('hitf.document.view.button.batchDelete').d('批量删除')}
          </Button>
          <Button
            type="primary"
            onClick={() => this.handleCreate(false)}
            disabled={mimeType !== 'application/json' && isHaveRoot}
          >
            {intl.get('hzero.common.create').d('新建')}
          </Button>
        </div>
        <Table {...tableProps} />
        <Drawer {...drawerProps} />
        <ParamConfig {...paramConfigProps} />
      </>
    );
  }
}
