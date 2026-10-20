import React, { Component, Fragment } from 'react';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button } from 'hzero-ui';

import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
// getCurrentOrganizationId
import { Header, Content } from 'components/Page';
import moment from 'moment';
import intl from 'utils/intl';
import { Bind, Throttle } from 'lodash-decorators';
import notification from 'utils/notification';
import { DATETIME_MIN } from 'utils/constants';

import Search from './Search';
import List from './List';

const viewProps = 'sfin.supplierDeductionSync.view';

const customizeUnitCode = ['SFIN.SUPPLIER_SYNC.LIST', 'SFIN.SUPPLIER_SYNC.FILTER_FORM'];

@connect(({ loading = {}, supplierDeductionSync = {}, supplierCommon = {} }) => ({
  queryListLoading: loading.effects['supplierDeductionSync/queryList'],
  fetchEnumLoading: loading.effects['supplierDeductionSync/fetchEnum'],
  submitting: loading.effects['supplierDeductionSync/update'],
  syncLoading: loading.effects['supplierDeductionSync/supplierDeductionSync'],
  supplierDeductionSync,
  supplierCommon,
}))
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.supplierChargeEntry',
    'entity.roles',
    'sfin.supplierDeductionSync',
    'entity.attachment',
    'sfin.invoiceBill',
  ],
})
@withCustomize({
  unitCode: customizeUnitCode,
})
export default class SupplierDeductionQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      // organizationId: getCurrentOrganizationId(),
      // selectedRowKeys: [],
      flag: false,
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
      type: 'supplierDeductionSync/queryList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: customizeUnitCode.join(),
      },
    });
  }

  /**
   * handerNum - 列表项数据修改
   */
  @Bind()
  handerSubjectNum(text, record, values) {
    const { dispatch, supplierDeductionSync } = this.props;
    const { dataSource } = supplierDeductionSync;
    const newDataSource = dataSource.map((item) => {
      if (item.supplierDeductionsId === record.supplierDeductionsId) {
        return {
          ...item,
          edited: true,
          // accountSubjectNum: values.accountSubjectNum,
          generalLedgerId: values.accountSubjectId,
          accountSubjectName: values.accountSubjectName,
        };
      }
      return item;
    });
    dispatch({
      type: 'supplierDeductionSync/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  /**
   * handleRecordChange - 列表项数据修改
   */
  @Bind()
  handleRecordChange(record) {
    const { dispatch, supplierDeductionSync } = this.props;
    const { dataSource } = supplierDeductionSync;
    const newDataSource = dataSource.map((item) => {
      if (item.supplierDeductionsId === record.supplierDeductionsId) {
        return {
          ...item,
          edited: true,
          // supplierId: values.supplierId,
          // supplierCompanyId: values.supplierCompanyId,
          // supplierCompanyName: values.supplierCompanyName,
        };
      }
      return item;
    });
    dispatch({
      type: 'supplierDeductionSync/updateState',
      payload: {
        dataSource: newDataSource,
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
      type: 'supplierDeductionSync/init',
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    const flag =
      selectedRows.find((item) => !['SYNC_FAILURE', 'UNSYNCHRONIZED'].includes(item.syncStatus)) &&
      selectedRows.find((item) => !['SYNC_FAILURE', 'UNSYNCHRONIZED'].includes(item.syncStatus))
        .length > 0;
    this.setState({
      selectedRows,
      // selectedRowKeys,
      flag,
    });
  }

  @Bind()
  @Throttle(1000)
  handleSync() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const {
      supplierDeductionSync: { dataSource = [] },
    } = this.props;
    // supplierDeductionsId
    const selectedIds = selectedRows.map((item) => item.supplierDeductionsId);
    const selectedDatas = dataSource.filter((item) =>
      selectedIds.includes(item.supplierDeductionsId)
    );
    const datas = getEditTableData(selectedDatas).map((item) => {
      return {
        ...item,
        billingDate: item.billingDate ? moment(item.billingDate).format(DATETIME_MIN) : null,
      };
    });
    if (datas.length === 0) {
      return;
    }
    dispatch({
      type: 'supplierDeductionSync/supplierDeductionSync',
      payload: {
        selectedRows: datas,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList();
      }
    });
  }

  render() {
    const {
      supplierDeductionSync: { dataSource = [], pagination = {}, enumMap = {} },
      queryListLoading = false,
      customizeTable,
      customizeFilterForm,
      syncLoading,
    } = this.props;
    const { selectedRows = [] } = this.state;

    const searchProps = {
      customizeFilterForm,
      enumMap,
      onRef: (node) => {
        this.filterForm = (node.props || {}).form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      customizeTable,
      dataSource,
      pagination,
      tenantId: getCurrentOrganizationId(),
      selectedRows,
      onSearch: this.fetchList,
      loading: queryListLoading,
      handerSubjectNum: this.handerSubjectNum,
      handleRecordChange: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
      enumMap,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${viewProps}.supplierSync`).d('同步供应商扣款')}>
          <Button
            type="primary"
            icon="sync"
            loading={syncLoading}
            onClick={this.handleSync}
            disabled={this.state.selectedRows.length === 0 || this.state.flag}
          >
            {intl.get('sfin.invoiceBill.status.sync').d('同步')}
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
