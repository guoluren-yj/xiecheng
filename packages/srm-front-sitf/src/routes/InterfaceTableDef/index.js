/**
 * InterTableDef -接口表结构定义页面
 * @date: 2018-9-20
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import { isEmpty, isUndefined } from 'lodash';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { Header, Content } from 'components/Page';
import CacheComponent from 'components/CacheComponent';

import MessageQueueModel from './InterfaceTableDefModal';
import FitlerForm from './FitlerForm';
@connect(({ interfaceTableDef, loading }) => ({
  interfaceTableDef,
  loading: loading.effects['interfaceTableDef/queryInterFaceTable'],
  updateLoading: loading.effects['interfaceTableDef/updateInterFaceTable'],
}))
@formatterCollections({
  code: ['sitf.interTableDef', 'entity.interface'],
})
@CacheComponent({ cacheKey: '/sitf/interface-table-def' })
export default class InterfaceConstrucDef extends PureComponent {
  constructor(props) {
    super(props);
    const { interfaceId } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      tenantId: getCurrentOrganizationId(),
      modalVisible: false,
      interfaceId,
      tableRecord: {},
    };
  }

  /**
   * 初始化值级与接口表结构列表
   */
  componentDidMount() {
    const { dispatch } = this.props;
    this.queryInterfaceDef();
    dispatch({
      type: 'interfaceTableDef/batchCode',
      payload: 'SITF.EXTERNAL_SYSTEM_TYPE',
    });
  }

  form;

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }
  /**
   * 查询接口表结构列表
   * @param {object} params 查询条件
   * @memberof InterfaceConstrucDef
   */
  @Bind()
  queryInterfaceDef(params = {}) {
    const {
      dispatch,
      interfaceTableDef: { pagination = {} },
    } = this.props;
    const { interfaceId } = this.state;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'interfaceTableDef/queryInterFaceTable',
      payload: {
        interfaceId,
        page: isEmpty(params) ? pagination : params,
        ...fieldValues,
      },
    });
  }

  /**
   * 新建接口表结构
   */
  @Bind()
  handleCreateInterface() {
    this.setState({
      tableRecord: {},
      modalVisible: true,
    });
  }

  /**
   * 编辑接口表结构
   * @param {object} record 行记录
   * @memberof InterfaceConstrucDef
   */
  @Bind()
  handleEditInterface(record = {}) {
    this.setState({
      tableRecord: record,
      modalVisible: true,
    });
  }

  /**
   * 取消编辑/新建
   */
  @Bind()
  handleCancel() {
    this.setState({
      tableRecord: {},
      modalVisible: false,
    });
  }

  /**
   * 保存数据
   * @param {object} values 保存的数据
   */
  @Bind()
  handlesaveDate(values = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceTableDef/updateInterFaceTable',
      payload: {
        body: [values],
      },
    }).then(res => {
      if (res) {
        notification.success({});
        this.setState({
          tableRecord: {},
          modalVisible: false,
        });
        this.queryInterfaceDef();
      }
    });
  }

  render() {
    const {
      loading,
      updateLoading,
      interfaceTableDef: { list = {}, code, pagination = {} },
    } = this.props;
    const { modalVisible, tableRecord, tenantId } = this.state;
    const columns = [
      {
        title: intl.get(`sitf.interTableDef.model.interTableDef.tableName`).d('表名称'),
        dataIndex: 'tableName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`entity.interface.tag`).d('接口'),
        dataIndex: 'interfaceName',
        width: 120,
        align: 'left',
      },
      {
        title: intl.get(`sitf.interTableDef.model.interTableDef.erpSystemType`).d('外部系统类别'),
        dataIndex: 'erpSystemType',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get(`sitf.interTableDef.model.interTableDef.orderSeq`).d('排序号'),
        dataIndex: 'orderSeq',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get(`sitf.interTableDef.model.interTableDef.tableDescription`).d('描述'),
        dataIndex: 'tableDescription',
        align: 'left',
        width: 80,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        align: 'left',
        dataIndex: 'edit',
        width: 80,
        render: (val, record) => {
          return (
            <a
              onClick={() => {
                this.handleEditInterface(record);
              }}
            >
              {intl.get(`hzero.common.button.edit`).d('编辑')}
            </a>
          );
        },
      },
    ];
    const filterProps = {
      code,
      onRef: this.handleRef,
      onFetchData: this.queryInterfaceDef,
    };
    const detailProps = {
      tenantId,
      modalVisible,
      updateLoading,
      tableRecord,
      code,
      anchor: 'right',
      onHandleSaveDate: this.handlesaveDate,
      onCancel: this.handleCancel,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sitf.interTableDef.view.interTableDef.headerTitle`).d('接口表结构定义')}
          backPath="/sitf/interface-def/list"
        >
          <Button type="primary" icon="plus" onClick={this.handleCreateInterface}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FitlerForm {...filterProps} />
          </div>
          <Table
            pagination={pagination}
            dataSource={list.content || []}
            rowKey="interfaceTableId"
            columns={columns}
            loading={loading}
            bordered
            onChange={page => this.queryInterfaceDef(page)}
          />
        </Content>
        <MessageQueueModel {...detailProps} />
      </React.Fragment>
    );
  }
}
