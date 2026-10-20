/**
 * PurchaseTransaction -采购事务类型定义
 * @date: 2018-12-18
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import uuidv4 from 'uuid/v4';

import {
  filterNullValueObject,
  delItemToPagination,
  addItemToPagination,
  getEditTableData,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';

import { Content, Header } from 'components/Page';

import FilterForm from './FilterForm';
import TableList from './TableList';

@connect(({ purchaseTransaction, loading }) => ({
  purchaseTransaction,
  loading: loading.effects['purchaseTransaction/fetchPurchaseTransList'],
  updateLoading: loading.effects['purchaseTransaction/updatePurchaseTransList'],
}))
@formatterCollections({ code: ['spfm.purchaseTransaction'] })
export default class PurchaseTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'purchaseTransaction/queryBusinessTypeList',
    });
    this.fetchList();
  }

  form;

  @Bind()
  fetchList(params) {
    const { dispatch } = this.props;
    const filedValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'purchaseTransaction/fetchPurchaseTransList',
      payload: {
        page: isEmpty(params) ? {} : params,
        ...filedValues,
      },
    }).then(res => {
      if (res) {
        this.setState({
          dataSource: res.content,
        });
      }
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleCreatePurchase() {
    const {
      dispatch,
      purchaseTransaction: { pagination = {} },
    } = this.props;
    const { dataSource } = this.state;
    dispatch({
      type: 'purchaseTransaction/updateState',
      payload: {
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
    this.setState({
      dataSource: [
        {
          rcvTrxTypeId: uuidv4(),
          enabledFlag: 1,
          receiveFlag: 0,
          deliverFlag: 0,
          returnToReceivingFlag: 0,
          returnToSupplierFlag: 0,
          poFlag: 0,
          asnFlag: 0,
          reverseFlag: 0,
          canCreateBillFlag: 0,
          isUpdate: true,
          _status: 'create',
        },
        ...dataSource,
      ],
    });
  }

  /**
   * 保存数据
   * @param {*Object} record
   */
  @Bind()
  savePurchaseList() {
    const { dataSource } = this.state;
    const {
      dispatch,
      purchaseTransaction: { pagination = {} },
    } = this.props;
    const lines = getEditTableData(dataSource.filter(item => item.isUpdate), ['rcvTrxTypeId']);
    if (Array.isArray(lines) && lines.length !== 0) {
      for (let i = 0; i < lines.length; i++) {
        const {
          receiveFlag, // 接收标识
          deliverFlag, // 入库标识
          returnToReceivingFlag, // 退回至接收标识
          returnToSupplierFlag, // 退回至供应商标识
        } = lines[i];
        if (
          !(
            (receiveFlag || deliverFlag) ^ (returnToReceivingFlag || returnToSupplierFlag) ||
            ((receiveFlag || deliverFlag) === 0 &&
              (returnToReceivingFlag || returnToSupplierFlag) === 0)
          )
        ) {
          notification.error({
            message: intl
              .get('spfm.purchaseTransaction.view.message.Checked')
              .d('事务正负标识不能同时勾选'),
          });
          return;
        }
      }
      dispatch({
        type: 'purchaseTransaction/updatePurchaseTransList',
        payload: lines,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList(pagination);
        }
      });
    }
  }

  /**
   * 取消新建
   * @param {*Object} record 行记录
   */
  @Bind()
  handleCancelOrg(record = {}) {
    const {
      dispatch,
      purchaseTransaction: { pagination = {} },
    } = this.props;
    const { dataSource } = this.state;
    const endData = dataSource.filter(item => item.rcvTrxTypeId !== record.rcvTrxTypeId);
    dispatch({
      type: 'purchaseTransaction/updateState',
      payload: {
        pagination: delItemToPagination(dataSource.length, pagination),
      },
    });
    this.setState({ dataSource: endData });
  }

  /**
   * 编辑/取消编辑
   * @param {*Object} record 行记录
   * @param flag 标记
   */
  @Bind()
  handleOrgEdit(record = {}, flag) {
    const { dataSource } = this.state;
    const newDataSource = dataSource.map(item => {
      if (item.rcvTrxTypeId === record.rcvTrxTypeId) {
        return {
          ...item,
          _status: flag ? 'update' : '',
        };
      }
      return item;
    });
    this.setState({ dataSource: newDataSource });
  }

  /**
   * 监听每一行数据是否发生改变
   * @param {*Object} record 行记录
   * @param {*String} elementsName 元素名称
   * @param {*Boolean} isUpdate 记录当前行是否被更改
   * reverseFlag
   */
  @Bind()
  changeRecordStatus(record = {}, field = '') {
    const { dataSource } = this.state;
    if (record._status === 'create') {
      return;
    }
    const newDataSource = dataSource.map(item => {
      if (item.rcvTrxTypeId === record.rcvTrxTypeId) {
        if (field === 'reverseFlag') {
          return {
            ...item,
            reverseTrxTypeName: undefined,
            reverseTrxTypeId: undefined,
            isUpdate: true,
          };
        }
        return {
          ...item,
          isUpdate: true,
        };
      }
      return item;
    });
    this.setState({ dataSource: newDataSource });
    // const formList = record.$form.getFieldsValue();
    // const index = dataSource.findIndex(item => item.rcvTrxTypeId === record.rcvTrxTypeId);
    // const updateList = [];
    // const formKey = Object.keys(formList);
    // formKey.forEach(item => {
    //   if (record.$form.getFieldValue(item) === dataSource[index][item]) {
    //     updateList.push(item);
    //   }
    // });
    // if (isArray(updateList) && !isEmpty(updateList)) {
    //   this.setState({
    //     dataSource: [
    //       ...dataSource.slice(0, index),
    //       {
    //         ...record,
    //         isUpdate: true,
    //       },
    //       ...dataSource.slice(index + 1),
    //     ],
    //   });
    // }
  }

  render() {
    const { dataSource } = this.state;
    const {
      purchaseTransaction: { pagination = {}, businessTypeList = [] },
      loading,
      updateLoading,
    } = this.props;

    const filterList = {
      onRef: this.handleRef,
      onFetchPurchaseTransList: this.fetchList,
    };
    const tableList = {
      businessTypeList,
      dataSource,
      pagination,
      loading,
      tableKey: this.index,
      onFetchPurchaseTransList: this.fetchList,
      onHandleCancelOrg: this.handleCancelOrg,
      onHandleOrgEdit: this.handleOrgEdit,
      onChangeRecordStatus: this.changeRecordStatus,
    };
    const saveDisabled = !dataSource.some(item => item.isUpdate);
    return (
      <React.Fragment>
        <Header
          title={intl.get('spfm.purchaseTransaction.view.message.title').d('采购事务类型定义')}
        >
          <Button icon="plus" type="primary" onClick={this.handleCreatePurchase}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="save"
            onClick={this.savePurchaseList}
            loading={updateLoading}
            disabled={saveDisabled}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterList} />
          </div>
          <TableList {...tableList} />
        </Content>
      </React.Fragment>
    );
  }
}
