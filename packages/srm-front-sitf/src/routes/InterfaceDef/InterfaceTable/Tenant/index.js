/**
 * InterfaceTableModal -接口表结构定义 -modal
 * @date: 2018-11-27
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Input, Button, Switch, Popconfirm, Select, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import qs from 'querystring';
import { isNil } from 'lodash';

import { Header, Content } from 'components/Page';
import EditTable from 'components/EditTable';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getEditTableData, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';

import FilterForm from './FilterForm';

const { Option } = Select;
@formatterCollections({
  code: ['sitf.interfaceDef', 'entity.interface', 'entity.application', 'sitf.interTableDef'],
})
export default class InterfaceTableModal extends Component {
  constructor(props) {
    super(props);
    const { interfaceId, interfaceCode, interfaceName } = qs.parse(
      props.history.location.search.substr(1)
    );
    this.state = {
      interfaceId,
      interfaceCode,
      interfaceName,
      organizationId: getCurrentOrganizationId(),
      organizationLevel: isTenantRoleLevel(),
    };
  }

  componentDidMount() {
    this.fetchInterfaceTable();
    this.batchCode();
  }

  /**
   * 值级查询
   */
  @Bind()
  batchCode() {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const lovCodes = {
      tableType: 'SITF.TABLE_TYPE',
      documentCodeType: 'SITF.INTERFACE_KEYWORD_RESERVED_FIELD',
    };
    dispatch({
      type: `${modelName}/batchCode`,
      payload: {
        lovCodes,
      },
    });
  }

  @Bind()
  fetchInterfaceTable(page = {}) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const { interfaceId, organizationId } = this.state;
    dispatch({
      type: `${modelName}/fetchKeywordConfig`,
      payload: {
        page,
        interfaceId,
        tenantId: organizationId,
        tableType: organizationId === 0 ? '' : 'SITF',
      },
    });
  }

  @Bind()
  createInterfaceData() {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const {
      [modelName]: { keyWordList = [] },
    } = this.props;
    const { interfaceId } = this.state;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        keyWordList: [
          {
            reservedField: '',
            fieldDesc: '',
            orderSeq: 0,
            mappingField: '',
            enabledFlag: 1,
            interfaceTableId: uuidv4(),
            _status: 'create',
            interfaceId,
          },
          ...keyWordList,
        ],
      },
    });
  }

  @Bind()
  saveInterfaceData() {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const {
      [modelName]: { keyWordList = [] },
    } = this.props;
    const params = getEditTableData(keyWordList, ['_status', 'interfaceTableId']);
    if (Array.isArray(params) && params.length === 0) {
      notification.warning({
        message: intl.get('sitf.interfaceDef.view.interfaceDef.warning').d('未进行数据新增或编辑'),
      });
      return;
    }
    dispatch({
      type: `${modelName}/optionsKeywordConfig`,
      payload: {
        param: params,
        method: 'POST',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchInterfaceTable();
      }
    });
  }

  @Bind()
  handleCancelOrg(record = {}) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const {
      [modelName]: { keyWordList = [] },
    } = this.props;
    const arrayList = keyWordList.filter(
      (item) => item.interfaceTableId !== record.interfaceTableId
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        keyWordList: arrayList,
      },
    });
  }

  @Bind()
  deleteInterfaceData(record) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    dispatch({
      type: `${modelName}/optionsKeywordConfig`,
      payload: {
        param: [record],
        method: 'DELETE',
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchInterfaceTable();
      }
    });
  }

  @Bind()
  handleEditor(record) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const {
      [modelName]: { keyWordList = [] },
    } = this.props;
    const newResultList = keyWordList.map((item) =>
      record.keywordId === item.keywordId ? { ...item, _status: 'update' } : item
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        keyWordList: newResultList,
      },
    });
  }

  @Bind()
  fetchReload() {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const { interfaceId, organizationId } = this.state;
    dispatch({
      type: `${modelName}/fetchReload`,
      payload: {
        newList: { tenantId: organizationId, interfaceId },
      },
    });
  }

  /**
   * 删除接口表数据
   * @param {*object} record 当前行记录
   */
  @Bind()
  deleteInterfaceTable(record = {}) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const { interfaceTableId } = record;
    dispatch({
      type: `${modelName}/deleteInterFaceTable`,
      payload: [{ interfaceTableId }],
    }).then((ref) => {
      if (ref) {
        this.fetchInterfaceTable();
        notification.success();
      }
    });
  }

  render() {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      loading,
      updateLoading,
      deleteLoading,
      interfaceRecord,
      [modelName]: {
        keyWordList = [],
        keyWordPagination = {},
        code: { documentCodeType = [] },
      },
    } = this.props;
    const { interfaceCode, interfaceName, organizationLevel } = this.state;
    const formList = {
      interfaceRecord,
      keyWordList,
      interfaceCode,
      interfaceName,
    };
    const columns = [
      {
        title: intl.get('sitf.interTableDef.model.interTableDef.reservedField').d('预留字段'),
        dataIndex: 'reservedField',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('reservedField', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sitf.interTableDef.model.interTableDef.reservedField')
                          .d('预留字段'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(
                  <Select allowClear style={{ width: '100%' }}>
                    {documentCodeType &&
                      documentCodeType.map((type) => {
                        return (
                          <Option value={type.value} key={type.value}>
                            {type.meaning}
                          </Option>
                        );
                      })}
                  </Select>
                )}
              </Form.Item>
            );
          } else {
            return record.reservedFieldMeaning;
          }
        },
      },
      {
        title: intl.get('sitf.interTableDef.model.interTableDef.fieldDesc').d('字段描述'),
        dataIndex: 'fieldDesc',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('fieldDesc', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sitf.interTableDef.model.interTableDef.fieldDesc')
                          .d('字段描述'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sitf.interTableDef.model.interTableDef.mappingField').d('映射字段'),
        dataIndex: 'mappingField',
        width: 100,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('mappingField', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sitf.interTableDef.model.interTableDef.mappingField')
                          .d('映射字段'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Input />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sitf.interTableDef.model.interTableDef.enabledFlag').d('是否启用'),
        dataIndex: 'enabledFlag',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('enabledFlag', {
                  initialValue: val,
                })(<Switch checkedValue={1} unCheckedValue={0} />)}
              </Form.Item>
            );
          } else {
            return <Switch value={val} disabled checkedValue={1} unCheckedValue={0} />;
          }
        },
      },
      {
        title: intl.get('sitf.interTableDef.model.interTableDef.orderSeq').d('排序'),
        dataIndex: 'orderSeq',
        width: 120,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('orderSeq', {
                  initialValue: isNil(val) ? 1 : val,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sitf.interTableDef.model.interTableDef.orderSeq').d('排序'),
                      }),
                    },
                  ],
                })(<InputNumber precision={0} />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <a onClick={() => this.handleCancelOrg(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            );
          } else {
            return (
              <Fragment>
                {record._status !== 'update' && (
                  <a style={{ marginRight: '10px' }} onClick={() => this.handleEditor(record)}>
                    {intl.get('hzero.common.button.editor').d('编辑')}
                  </a>
                )}
                <Popconfirm
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                  onConfirm={() => this.deleteInterfaceData(record)}
                  okText={intl.get('hzero.common.status.yes').d('是')}
                  cancelText={intl.get('hzero.common.status.no').d('否')}
                  loading={deleteLoading}
                >
                  <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              </Fragment>
            );
          }
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.interfaceDef.view.interfaceDef.interfaceTableDef').d('接口表定义')}
          backPath={organizationLevel ? '/sitf/interface-def-org/list' : '/sitf/interface-def/list'}
        >
          <Button type="primary" icon="plus" onClick={this.createInterfaceData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" onClick={this.saveInterfaceData} loading={updateLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="sync" onClick={this.fetchReload} loading={loading}>
            {intl.get('hzero.common.button.reload').d('重新加载')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formList} />
          </div>
          <EditTable
            pagination={keyWordPagination}
            dataSource={keyWordList}
            rowKey="interfaceTableId"
            columns={columns}
            loading={loading}
            onChange={this.fetchInterfaceTable}
            bordered
          />
        </Content>
      </React.Fragment>
    );
  }
}
