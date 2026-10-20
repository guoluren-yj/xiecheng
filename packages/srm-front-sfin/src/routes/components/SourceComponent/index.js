/**
 * plantNum - 新建分配
 * @date: 2019 1/1
 * @author: LC <chao.li03@hand-china>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Form, Button, Drawer, Modal, Input, Icon } from 'hzero-ui';
import { isNumber, sum, filter, isEmpty } from 'lodash';
import uuid from 'uuid/v4';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import { getEditTableData, getCurrentOrganizationId, createPagination } from 'utils/utils';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';

import formatterCollections from 'utils/intl/formatterCollections';
import OrderListModal from './OrderModal';
import ContractListModal from './ContractModal';
import SourceFilterForm from './SourceFilterForm';
import styles from './index.less';

const FormItem = Form.Item;

// sodr.common
@connect(({ supplierCommon, loading }) => ({
  supplierCommon,
  loading: loading.effects['supplierCommon/fetchSourceList'],
  saveLoading: loading.effects['supplierCommon/saveSource'],
  delLoading: loading.effects['supplierCommon/deleteSource'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['sodr.common', 'sfin.source', 'sodr.sheet', 'sfin.common'] })
@withRouter
export default class SourceList extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      tagShow: false,
      contractShow: false,
      orderRecord: {},
      contractRecord: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 跳转索赔单, 订单., 协议
   * 区分采购商/供应商
   * 区分页面来源
   */
  @Bind()
  handleRedirectUrl(record, status, sourcePage) {
    const { dispatch, handleChangeVisible, routePrefix, routeSourceFlag } = this.props;
    const sodrSearch = { sourceFlag: routeSourceFlag };
    const sqamSearch = { formHeaderId: record.claimHeaderId, sourceFlag: routeSourceFlag };
    const spcmSearch = { pcHeaderId: record.contractHeaderId, sourceFlag: routeSourceFlag };
    switch (status) {
      case 'sodr':
        handleChangeVisible(false);
        if (sourcePage === 'purchase') {
          dispatch(
            routerRedux.push({
              pathname: `/sfin/${routePrefix}/sendOrder/detail/${record.poHeaderId}`,
              search: stringify(sodrSearch),
            })
          );
        } else {
          dispatch(
            routerRedux.push({
              pathname: `/sfin/${routePrefix}/receivedOrder/detail/${record.poHeaderId}`,
              search: stringify(sodrSearch),
            })
          );
        }
        break;
      case 'sqam':
        handleChangeVisible(false);
        // 我的索赔单.
        if (sourcePage === 'purchase') {
          dispatch(
            routerRedux.push({
              pathname: `/sfin/${routePrefix}/my-claimForm/detail`,
              search: stringify(sqamSearch),
            })
          );
        } else {
          dispatch(
            routerRedux.push({
              pathname: `/sfin/${routePrefix}/my-received-claim-form/detail`,
              search: stringify(sqamSearch),
            })
          );
        }
        break;
      case 'spcm':
        handleChangeVisible(false);
        // 我发起的协议
        if (sourcePage === 'purchase') {
          dispatch(
            routerRedux.push({
              pathname: `/sfin/${routePrefix}/purchase-contract-view/detail`,
              search: stringify(spcmSearch),
            })
          );
        } else {
          dispatch(
            routerRedux.push({
              pathname: `/sfin/${routePrefix}/supplier-contract-view/detail`,
              search: stringify(spcmSearch),
            })
          );
        }
        break;
      default:
        break;
    }
  }

  /**
   * 查询供应商来源单据
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const field = this.planNumForm && this.planNumForm.props.form.getFieldsValue();
    const { dispatch, data, updateFlag } = this.props;
    dispatch({
      type: 'supplierCommon/fetchSourceList',
      payload: {
        page,
        supplierDeductionsId: data.supplierDeductionsId,
        ...field,
      },
    }).then((res) => {
      if (res) {
        if (updateFlag) {
          this.setState({
            dataSource: res.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: page,
          });
        } else {
          this.setState({
            dataSource: res.content,
            pagination: createPagination(res),
          });
        }
      }
    });
  }

  // 方法处理

  // 新建
  @Bind()
  handleCreate() {
    const { data } = this.props;
    const { dataSource } = this.state;
    const newDataSource = {
      _status: 'create',
      upstreamId: uuid(),
      supplierDeductionsId: data.supplierDeductionsId,
    };
    this.setState({
      dataSource: [newDataSource, ...dataSource],
    });
  }

  // 更新订单编号
  @Bind()
  handleCreateOrder(record) {
    const [data] = record;
    const { dataSource } = this.state;
    const { orderRecord } = this.state;
    const { poHeaderId, displayPoNum } = data;
    const newRecord = { ...orderRecord, poHeaderId, displayPoNum };
    const newDataSource = dataSource.map((item) => {
      if (item.upstreamId === newRecord.upstreamId) {
        return { ...item, ...newRecord };
      } else {
        return item;
      }
    });
    if (newDataSource) {
      this.setState(
        {
          dataSource: newDataSource,
        },
        () => this.hoverTagHide()
      );
    }
  }

  // 更新协议编号
  @Bind()
  handleCreateContract(record) {
    const [data] = record;
    const { dataSource } = this.state;
    const { contractRecord } = this.state;
    const { pcNum, pcHeaderId } = data;
    const newRecord = { ...contractRecord, pcHeaderId, pcNum };
    const newDataSource = dataSource.map((item) => {
      if (item.upstreamId === newRecord.upstreamId) {
        return { ...item, ...newRecord, contractHeaderId: pcHeaderId };
      } else {
        return item;
      }
    });
    if (newDataSource) {
      this.setState(
        {
          dataSource: newDataSource,
        },
        () => this.hoverContractHide()
      );
    }
  }

  // 保存
  @Bind()
  handleSave() {
    const { dataSource } = this.state;
    const { dispatch, chargeEntryQuery } = this.props;
    const lines = getEditTableData(dataSource, ['upstreamId', '_status']);
    if (dataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      dispatch({
        type: 'supplierCommon/saveSource',
        payload: { lines },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch();
          chargeEntryQuery();
        }
      });
    }
  }

  // 删除
  @Bind()
  handleDelete() {
    const { dispatch, chargeEntryQuery } = this.props;
    const { selectedRowKeys = [], dataSource = [] } = this.state;
    // 过滤出勾选数据
    const newParameters = filter(dataSource, (item) => {
      return selectedRowKeys.indexOf(item.upstreamId) >= 0;
    });
    // 过滤出勾选数据的剩下数据
    const newItemDetails = filter(dataSource, (item) => {
      return selectedRowKeys.indexOf(item.upstreamId) < 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据？'),
      onOk: () => {
        const remoteDelete = [];
        const localDelete = [];
        newParameters.forEach((item) => {
          if (item._status === 'create') {
            localDelete.push(item);
          }
          if (item._status === 'update') {
            remoteDelete.push(item);
          }
        });
        if (isEmpty(remoteDelete)) {
          this.setState({
            selectedRowKeys: [],
            dataSource: newItemDetails,
          });
        } else {
          dispatch({
            type: `supplierCommon/deleteSource`,
            payload: {
              dataSource: selectedRowKeys,
            },
          }).then((res) => {
            if (res) {
              notification.success();
              this.handleSearch();
              chargeEntryQuery();
            }
          });
        }
      },
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  handleSelectChange(selectedRowKeys) {
    this.setState({
      selectedRowKeys,
    });
  }

  @Bind()
  hoverTagShow(value) {
    const { tagShow } = this.state;
    this.setState({
      tagShow: !tagShow,
      orderRecord: value,
    });
  }

  @Bind()
  hoverTagHide() {
    this.setState({
      tagShow: false,
    });
  }

  @Bind()
  hoverContractShow(value) {
    const { contractShow } = this.state;
    this.setState({
      contractShow: !contractShow,
      contractRecord: value,
    });
  }

  @Bind()
  hoverContractHide() {
    this.setState({
      contractShow: false,
    });
  }

  @Bind()
  emitEmpty(record, status) {
    const { dataSource } = this.state;
    if (status === 'po') {
      const newDataSource = dataSource.map((item) => {
        if (item.upstreamId === record.upstreamId) {
          return { ...item, poHeaderId: null, displayPoNum: null };
        } else {
          return item;
        }
      });
      if (newDataSource) {
        this.setState(
          {
            dataSource: newDataSource,
          },
          () => this.hoverTagHide()
        );
      }
    } else {
      const newDataSource = dataSource.map((item) => {
        if (item.upstreamId === record.upstreamId) {
          return { ...item, pcNum: null, contractHeaderId: null };
        } else {
          return item;
        }
      });
      if (newDataSource) {
        this.setState(
          {
            dataSource: newDataSource,
          },
          () => this.hoverContractHide()
        );
      }
    }
  }

  searchButton(record, status) {
    return (
      <Icon
        key="search"
        type="search"
        onClick={() => this.hoverShowStatus(record, status)}
        style={{ cursor: 'pointer', color: '#666' }}
      />
    );
  }

  @Bind()
  hoverShowStatus(values, status) {
    if (status === 'po') {
      this.hoverTagShow(values);
    } else {
      this.hoverContractShow(values);
    }
  }

  @Bind()
  suffix(record, status) {
    const suffix = (
      <React.Fragment>
        <Icon
          key="clear"
          className="lov-clear"
          type="close-circle"
          onClick={() => this.emitEmpty(record, status)}
          style={{ marginRight: '3px' }}
        />
        {this.searchButton(record, status)}
      </React.Fragment>
    );
    return suffix;
  }

  render() {
    const {
      visible,
      handleChangeVisible,
      // pagination,
      updateFlag,
      loading,
      saveLoading,
      delLoading,
      // dataSource,
      data,
      sourcePage,
    } = this.props;
    const {
      pagination,
      dataSource = [],
      tenantId,
      selectedRowKeys,
      tagShow,
      contractShow,
      // orderRecord,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectChange,
    };
    const columns = [
      {
        title: intl.get(`sodr.common.model.common.lineNumber`).d('序号'),
        dataIndex: 'lineNumber',
        width: 60,
      },
      {
        title: intl.get(`sodr.common.model.common.claimHeaderNum`).d('索赔单号'),
        dataIndex: 'claimHeaderId',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`claimHeaderId`, {
                initialValue: record.claimHeaderId,
              })(
                <Lov
                  code="SPUC.DEDUCTION_CLAIM__RELATION"
                  allowClear
                  lovOptions={{
                    valueField: 'claimHeaderId',
                    displayField: 'claimHeaderNum',
                  }}
                  textValue={record.claimHeaderNum}
                  queryParams={{ tenantId, supplierDeductionsId: data.supplierDeductionsId }}
                />
              )}
            </FormItem>
          ) : (
            <a onClick={() => this.handleRedirectUrl(record, 'sqam', sourcePage)}>
              {record.claimHeaderNum}
            </a>
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.orderNum`).d('订单号'),
        dataIndex: 'displayPoNum',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('displayPoNum', {
                initialValue: record.displayPoNum,
              })(<Input suffix={this.suffix(record, 'po')} />)}
            </FormItem>
          ) : (
            <a onClick={() => this.handleRedirectUrl(record, 'sodr', sourcePage)}>
              {record.displayPoNum}
            </a>
          ),
      },
      {
        title: intl.get(`sodr.common.model.common.pcNum`).d('协议编号'),
        dataIndex: 'pcNum',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('pcNum', {
                initialValue: record.pcNum,
              })(<Input suffix={this.suffix(record, 'pc')} />)}
            </FormItem>
          ) : (
            <a onClick={() => this.handleRedirectUrl(record, 'spcm', sourcePage)}>{record.pcNum}</a>
          ),
      },
    ];
    const planFilterProps = {
      pagination,
      onSearch: this.handleSearch,
      onRef: (node) => {
        this.planNumForm = node;
      },
    };
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    const modalProps = {
      visible,
      width: '1000px',
      mask: true,
      onClose: () => handleChangeVisible(false),
      bodyStyle: { overflow: 'auto' },
      title: `${data.supplierCompanyName}${data.deductionsNum}${intl
        .get(`sfin.source.view.message.title.sourceDeductionNum`)
        .d(`扣款来源单据`)}`,
      footer: (
        <div>
          <Button type="primary">{intl.get('hzero.common.button.ok').d('确定')}</Button>
          <Button onClick={() => handleChangeVisible(false)}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      ),
    };
    const tableProps = {
      rowKey: 'upstreamId',
      columns,
      dataSource,
      pagination,
      rowSelection,
      loading,
      onChange: (page) => this.handleSearch(page),
    };
    const orderProps = {
      handleChangeVisible: this.hoverTagHide,
      handleCreateOrder: this.handleCreateOrder,
      visible: tagShow,
      onRef: (node) => {
        this.orderForm = node;
      },
      data,
    };
    const contractProps = {
      handleChangeVisible: this.hoverContractHide,
      visible: contractShow,
      handleCreateContract: this.handleCreateContract,
      onRef: (node) => {
        this.orderForm = node;
      },
      data,
    };
    return (
      <Fragment>
        <Drawer {...modalProps}>
          <div className="table-list-search">
            <SourceFilterForm {...planFilterProps} />
            <div className={styles['item-list-search']}>
              {updateFlag && (
                <Form layout="inline">
                  <Button
                    type="primary"
                    onClick={this.handleCreate}
                    loading={delLoading || saveLoading}
                  >
                    {intl.get('hzero.common.button.create').d('新建')}
                  </Button>
                  <Button
                    onClick={this.handleSave}
                    disabled={dataSource.length === 0}
                    loading={saveLoading || delLoading}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>
                  <Button onClick={this.handleDelete} loading={delLoading || saveLoading}>
                    {intl.get('hzero.common.button.delete').d('删除')}
                  </Button>
                </Form>
              )}
              <EditTable {...tableProps} scroll={{ x: scrollX }} bordered />
            </div>
          </div>
        </Drawer>
        {tagShow ? <OrderListModal {...orderProps} /> : null}
        {contractShow ? <ContractListModal {...contractProps} /> : null}
      </Fragment>
    );
  }
}
