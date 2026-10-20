/**
 * EcPlatformDef -电商平台定义
 * @date: 2019-1-17
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import { Button, Table } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';

import intl from 'utils/intl';

import FilterForm from './FilterForm';
import EditModal from './EditModal';

@connect(({ loading, ecPlatformDef }) => ({
  loading: loading.effects['ecPlatformDef/fetchEcPlatFormList'],
  saveLoading: loading.effects['ecPlatformDef/updateEcPlatForm'],
  ecPlatformDef,
}))
@formatterCollections({ code: ['scec.ecplatformDef', 'scec.ecAddressManage', 'scec.common'] })
export default class index extends Component {
  form;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      tenantId: getCurrentOrganizationId(),
      tableRecord: {},
    };
  }

  componentDidMount() {
    this.fetchEcData();
  }

  // 绑定表单ref
  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 编辑数据
   */
  @Bind()
  handleEditData(record = {}) {
    this.setState({
      visible: true,
      tableRecord: record,
    });
  }

  /**
   * 新建数据
   */
  @Bind()
  handleCreateData() {
    this.setState({
      visible: true,
      tableRecord: {},
    });
  }

  /**
   * 查询数据
   */
  @Bind()
  fetchEcData(page) {
    const { dispatch } = this.props;
    const { tenantId } = this.state;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'ecPlatformDef/fetchEcPlatFormList',
      payload: {
        tenantId,
        page,
        ...filterValues,
      },
    });
  }

  /**
   * 保存数据
   */
  @Bind()
  handleSaveData(data = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'ecPlatformDef/updateEcPlatForm',
      payload: data,
    }).then(res => {
      if (res) {
        this.fetchEcData();
        this.handleCancel();
      }
    });
  }

  // 取消编辑状态
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      tableRecord: {},
    });
  }

  render() {
    const {
      ecPlatformDef: { list = {}, pagination = {} },
      loading,
    } = this.props;
    const { visible, tableRecord } = this.state;
    const columns = [
      {
        title: intl.get('scec.ecAddressManage.model.Ec.platform.coding').d('电商平台编码'),
        dataIndex: 'ecPlatformCode',
        width: 200,
      },
      {
        title: intl.get('scec.ecAddressManage.model.Ec.platform.name').d('电商平台名称'),
        dataIndex: 'ecPlatformName',
        width: 200,
      },
      {
        title: intl.get('scec.ecplatformDef.model.ecplatformDef.tenant').d('租户'),
        dataIndex: 'tenantName',
        width: 250,
      },
      {
        title: intl
          .get('small.ecplatformDef.model.ecplatformDef.purchaseQuantity')
          .d('单次采购最大购买量'),
        dataIndex: 'purchaseQuantity',
        width: 150,
      },
      {
        title: intl.get('scec.common.table.column.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 100,
        render: (_, record) => {
          return (
            <a
              onClick={() => {
                this.handleEditData(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          );
        },
      },
    ];
    const filterList = {
      onRef: this.handleRef,
      onFetchData: this.fetchEcData,
    };
    const detailProps = {
      visible,
      tableRecord,
      anchor: 'right',
      onCancel: this.handleCancel,
      onHandleSaveEcDef: this.handleSaveData,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('scec.ecplatformDef.model.ecplatformDef.title').d('电商平台定义')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
            pagination={pagination}
            columns={columns}
            loading={loading}
            bordered
            dataSource={list.content}
            rowKey="queueGroupId"
            onChange={page => this.fetchEcData(page)}
          />
        </Content>
        <EditModal {...detailProps} />
      </React.Fragment>
    );
  }
}
