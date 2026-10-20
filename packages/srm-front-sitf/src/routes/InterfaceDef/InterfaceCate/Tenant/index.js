/**
 * InterfaceTableModal -接口类别定义 -modal 中间表
 * @date: 2018-11-28
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, InputNumber, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';
import qs from 'querystring';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getEditTableData, isTenantRoleLevel } from 'utils/utils';

import FilterForm from './FilterForm';

@formatterCollections({ code: ['sitf.interfaceCate', 'sitf.common'] })
export default class index extends PureComponent {
  constructor(props) {
    super(props);
    const { interfaceId, interfaceCode, interfaceName } = qs.parse(
      props.history.location.search.substr(1)
    );
    this.state = {
      interfaceId,
      interfaceCode,
      interfaceName,
      organizationLevel: isTenantRoleLevel(),
    };
  }

  componentDidMount() {
    this.fetchInterfaceTable();
  }

  @Bind()
  fetchInterfaceTable(params = {}) {
    const { dispatch, modelName = 'interfaceDef' } = this.props;
    const { interfaceId } = this.state;
    const page = {
      page: 0,
      size: 10,
    };
    // 查询接口表结构定义数据
    dispatch({
      type: `${modelName}/fetchInterFaceTable`,
      payload: {
        ...page,
        ...params,
        interfaceId,
        tableType: 'SOURCE',
      },
    });
  }

  /**
   * 新建数据
   */
  @Bind()
  createInterfaceData() {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      dispatch,
      [modelName]: { interfaceList = [] },
    } = this.props;
    const { interfaceId } = this.state;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        interfaceList: [
          {
            externalSystemCode: '',
            tableName: '',
            tableDescription: '',
            orderSeq: '',
            interfaceTableId: uuidv4(),
            _status: 'create',
            interfaceId,
            tableType: 'SOURCE',
          },
          ...interfaceList,
        ],
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  saveInterfaceData() {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      dispatch,
      [modelName]: { interfaceList = [] },
    } = this.props;
    const params = getEditTableData(interfaceList, ['_status', 'interfaceTableId']);
    if (Array.isArray(params) && params.length === 0) {
      notification.warning({
        message: intl.get('sitf.interfaceDef.view.interfaceDef.warning').d('未进行数据新增或编辑'),
      });
      return;
    }
    dispatch({
      type: `${modelName}/updateInterFaceTable`,
      payload: {
        body: params,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchInterfaceTable();
      }
    });
  }

  @Bind()
  handleCancelOrg(record = {}) {
    const { modelName = 'interfaceDef' } = this.props;
    const {
      dispatch,
      [modelName]: { interfaceList = [] },
    } = this.props;
    const arrayList = interfaceList.filter(
      item => item.interfaceTableId !== record.interfaceTableId
    );
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        interfaceList: arrayList,
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
    }).then(ref => {
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
      [modelName]: { interfaceList = [] },
    } = this.props;
    const { interfaceCode, interfaceName, organizationLevel } = this.state;
    const formList = {
      interfaceRecord,
      interfaceList,
      interfaceCode,
      interfaceName,
      onFetchInterfaceData: this.fetchInterfaceTable,
    };
    const numberValidator = (_, value, callback) => {
      if (value && value.toString().length > 9) {
        callback(
          intl.get(`sitf.interfaceCate.view.interTableDef.min`).d('排序号大于0且在10位数内')
        );
      } else {
        callback();
      }
    };
    const columns = [
      {
        title: intl.get('sitf.interfaceCate.model.interfaceCate.externalSystemCode').d('外部系统'),
        dataIndex: 'externalSystemCode',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('externalSystemCode', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sitf.interfaceCate.model.interfaceCate.externalSystemCode')
                          .d('外部系统'),
                      }),
                    },
                  ],
                  initialValue: val,
                })(<Lov code="SITF.ES_RELATIONS" />)}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get('sitf.interfaceCate.model.interfaceCate.tableName').d('表名称'),
        dataIndex: 'tableName',
        width: 200,
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('tableName', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sitf.interfaceCate.model.interfaceCate.tableName')
                          .d('表名称'),
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
        title: intl.get('sitf.interfaceCate.model.interfaceCate.tableDescription').d('表描述'),
        dataIndex: 'tableDescription',
        width: 100,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('tableDescription', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get('sitf.interfaceCate.model.interfaceCate.tableDescription')
                          .d('表描述'),
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
        title: intl.get('sitf.common.data.orderSeq').d('排序号'),
        dataIndex: 'orderSeq',
        width: 100,
        align: 'left',
        render: (val, record) => {
          if (['update', 'create'].includes(record._status)) {
            const { getFieldDecorator } = record.$form;
            return (
              <Form.Item>
                {getFieldDecorator('orderSeq', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('sitf.common.data.orderSeq').d('排序号'),
                      }),
                    },
                    {
                      validator: numberValidator,
                    },
                  ],
                  initialValue: val,
                })(<InputNumber min={0} />)}
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
        align: 'left',
        render: (val, record) => {
          if (record._status === 'create') {
            return (
              <a onClick={() => this.handleCancelOrg(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            );
          } else {
            return (
              <Popconfirm
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => this.deleteInterfaceTable(record)}
                okText={intl.get('hzero.common.status.yes').d('是')}
                cancelText={intl.get('hzero.common.status.no').d('否')}
                loading={deleteLoading}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            );
          }
        },
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('sitf.interfaceDef.view.interfaceDef.interfaceCateDef').d('中间表定义')}
          backPath={organizationLevel ? '/sitf/interface-def-org/list' : '/sitf/interface-def/list'}
        >
          <Button type="primary" icon="plus" onClick={this.createInterfaceData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" onClick={this.saveInterfaceData} loading={updateLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="sync" onClick={this.fetchInterfaceTable} loading={loading}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formList} />
          </div>
          <EditTable
            pagination={false}
            dataSource={interfaceList}
            rowKey="interfaceTableId"
            columns={columns}
            loading={loading}
            bordered
          />
        </Content>
      </React.Fragment>
    );
  }
}
