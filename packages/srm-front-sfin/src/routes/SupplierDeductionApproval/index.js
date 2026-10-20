/**
 * index.js - 供应商扣款审批
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'hzero-ui';
import { isUndefined, isEmpty, isArray } from 'lodash';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';

const viewProps = 'sfin.supplierDeductionApproval.view';

const customizeUnitCode = ['SFIN.SUPPLIER_APPROVED.LIST', 'SFIN.SUPPLIER_APPROVED.FITTER.NEW'];

@connect(({ loading = {}, supplierDeductionApproval, supplierCommon }) => ({
  queryListLoading:
    loading.effects['supplierDeductionApproval/queryList'] ||
    loading.effects['supplierDeductionApproval/approve'] ||
    loading.effects['supplierDeductionApproval/returns'],
  fetchEnumLoading: loading.effects['supplierDeductionApproval/fetchEnum'],
  updateStateLoading: loading.effects['supplierDeductionApproval/updateState'],
  submitting: loading.effects['supplierDeductionApproval/update'],
  supplierDeductionApproval,
  supplierCommon,
}))
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.supplierChargeEntry',
    'entity.roles',
    'spcm.supplierChargeEntry',
    'sfin.supplierDeductionApproval',
    'entity.attachment',
    'sodr.common',
  ],
})
@withCustomize({
  unitCode: customizeUnitCode,
})
export default class SupplierDeductionApproval extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      // selectedRowKeys: [],
    };
  }

  componentDidMount() {
    this.fetchList(); // 查询数据
    this.fetchEnum(); // 查询值集
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    dispatch({
      type: 'supplierDeductionApproval/queryList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: customizeUnitCode.join(),
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierDeductionApproval/init',
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      // selectedRowKeys,
    });
  }

  /**
   * 通过
   */
  @Bind()
  @Throttle(1000)
  approve() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    Modal.confirm({
      title: intl.get(`${viewProps}.approve`).d('是否通过'),
      onOk: () => {
        dispatch({
          type: 'supplierDeductionApproval/approve',
          payload: { approveList: selectedRows },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchList();
          }
        });
      },
    });
  }

  /**
   * 退回
   */
  @Bind()
  @Throttle(1000)
  returns() {
    const { dispatch } = this.props;
    const { selectedRows = [] } = this.state;
    Modal.confirm({
      title: intl.get(`${viewProps}.returns`).d('是否退回'),
      onOk: () => {
        dispatch({
          type: 'supplierDeductionApproval/returns',
          payload: { returnsList: selectedRows },
        }).then((res) => {
          if (res) {
            notification.success();
            this.fetchList();
          }
        });
      },
    });
  }

  render() {
    const {
      supplierDeductionApproval: { dataSource = [], pagination = {}, enumMap = {} },
      queryListLoading = false,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { selectedRows = [] } = this.state;
    const selectedRowKeys = selectedRows.map((item) => item.supplierDeductionsId);

    const searchProps = {
      customizeFilterForm,
      onRef: (node) => {
        this.filterForm = (node.props || {}).form;
      },
      onFetchList: this.fetchList,
      enumMap,
    };
    const listProps = {
      customizeTable,
      dataSource,
      pagination,
      selectedRows,
      onSearch: this.fetchList,
      loading: queryListLoading,
      onHandleRecord: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${viewProps}.supplierApproval`).d('供应商扣款审批')}>
          <Button
            icon="check"
            type="primary"
            onClick={this.approve}
            loading={queryListLoading}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get(`sodr.common.button.approvalPass`).d('审批通过')}
          </Button>
          <Button
            icon="close"
            onClick={this.returns}
            loading={queryListLoading}
            disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
          >
            {intl.get(`sodr.common.button.approvalReject`).d('审批拒绝')}
          </Button>
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
