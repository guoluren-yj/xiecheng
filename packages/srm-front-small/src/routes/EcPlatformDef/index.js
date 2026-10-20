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
import { Button, Table, Checkbox } from 'hzero-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';

import intl from 'utils/intl';

import FilterForm from './FilterForm';
import EditModal from './EditModalNew';

@connect(({ loading, smallEcPlatformDef }) => ({
  loading: loading.effects['smallEcPlatformDef/fetchEcPlatFormList'],
  saveLoading: loading.effects['smallEcPlatformDef/updateEcPlatForm'],
  smallEcPlatformDef,
}))
@formatterCollections({ code: ['small.ecplatformDef', 'small.common'] })
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
    this.props.dispatch({ type: 'smallEcPlatformDef/fetchInterfaceType' });
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
      type: 'smallEcPlatformDef/fetchEcPlatFormList',
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
      type: 'smallEcPlatformDef/updateEcPlatForm',
      payload: data,
    }).then((res) => {
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
      smallEcPlatformDef: { list = {}, pagination = {}, interfaceType = [] },
      loading,
      saveLoading,
    } = this.props;
    const { visible, tableRecord } = this.state;
    const columns = [
      {
        title: intl.get('small.ecplatformDef.model.Ec.platform.coding').d('电商平台编码'),
        dataIndex: 'ecPlatformCode',
        width: 160,
      },
      {
        title: intl.get('small.ecplatformDef.model.Ec.platform.name').d('电商平台名称'),
        dataIndex: 'ecPlatformName',
        width: 160,
      },
      {
        title: intl.get('small.ecplatformDef.model.ecplatformDef.tenant').d('租户'),
        dataIndex: 'tenantName',
        width: 250,
      },
      {
        title: intl
          .get('small.ecplatformDef.model.ecplatformDef.purchaseQuantity')
          .d('单次采购最大购买量'),
        dataIndex: 'purchaseQuantity',
        width: 200,
      },
      {
        title: intl.get('small.ecplatformDef.model.interface.type').d('接口类型'),
        dataIndex: 'interfaceTypeMeaning',
        width: 100,
      },
      {
        title: intl.get('small.common.table.column.ecGift').d('赠品'),
        dataIndex: 'ecGift',
        width: 80,
        render: (val) => <Checkbox disabled checked={!!val} />,
      },
      {
        title: intl.get('small.ecplatformDef.model.ecplatformDef.ecService').d('电商服务'),
        dataIndex: 'ecService',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.ecplatformDef.cancelAfterSale').d('取消售后'),
        dataIndex: 'cancelAfterSale',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.ecplatformDef.afterSaleType').d('售后类型查询'),
        dataIndex: 'afterSaleType',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl
          .get('small.ecplatformDef.model.ecplatformDef.aggregationProduct')
          .d('商品聚合查询'),
        dataIndex: 'aggregationProduct',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.feight.query').d('运费查询'),
        dataIndex: 'freightQueryEnabled',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.batchBill').d('批量差异反馈'),
        dataIndex: 'batchBill',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.telPhoneRequired').d('座机号维护'),
        dataIndex: 'telPhoneRequired',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.remainLimit').d('查询账户余额'),
        dataIndex: 'remainLimit',
        width: 120,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.onlineService').d('查询在线客服入口'),
        dataIndex: 'onlineServiceFlag',
        width: 150,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.feedbackFlag').d('商品反馈'),
        dataIndex: 'feedbackFlag',
        width: 150,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.cancelBillingRequestFlag').d('取消发票申请'),
        dataIndex: 'cancelBillingRequestFlag',
        width: 150,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.rushInvoiceFlag').d('在线红冲'),
        dataIndex: 'rushInvoiceFlag',
        width: 150,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.ecplatformDef.model.onlineSign').d('线上签约'),
        dataIndex: 'onlineSign',
        width: 150,
        render: (val) => <Checkbox checked={val === 1} disabled />,
      },
      {
        title: intl.get('small.common.table.column.remark').d('备注'),
        width: 100,
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        dataIndex: 'edit',
        width: 80,
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
      loading: saveLoading,
      visible,
      tableRecord,
      interfaceType,
      anchor: 'right',
      onCancel: this.handleCancel,
      onHandleSaveEcDef: this.handleSaveData,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('small.ecplatformDef.model.ecplatformDef.title').d('电商平台定义')}>
          <Button type="primary" icon="plus" onClick={this.handleCreateData}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <Table
            className="small-table-all-space"
            pagination={pagination}
            columns={columns}
            loading={loading}
            bordered
            dataSource={list.content}
            rowKey="queueGroupId"
            onChange={(page) => this.fetchEcData(page)}
          />
        </Content>
        {visible && <EditModal {...detailProps} />}
      </React.Fragment>
    );
  }
}
