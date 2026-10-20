/**
 * index.js - 供应商扣款查询
 * @date: 2020-11-13
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { isUndefined } from 'lodash';
import moment from 'moment';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExport from 'components/ExcelExport';
import { filterNullValueObject, getCurrentOrganizationId, getEditTableData } from 'utils/utils';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { SRM_FINANCE } from 'srm-front-boot/lib/utils/config';
import { Bind, Throttle } from 'lodash-decorators';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import Search from './Search';
import List from './List';

const viewProps = 'sfin.supplierDeductionQuery.view';
const unitCode = ['SFIN.SUPPLIER_QUERY.LIST', 'SFIN.SUPPLIER_QUERY.FILTER_FORM_NEW'];

@connect(({ loading = {}, supplierDeductionQuery = {}, supplierCommon = {} }) => ({
  queryListLoading: loading.effects['supplierDeductionQuery/queryList'],
  fetchEnumLoading: loading.effects['supplierDeductionQuery/fetchEnum'],
  submitting: loading.effects['supplierDeductionQuery/update'],
  loading:
    loading.effects['supplierDeductionQuery/save'] ||
    loading.effects['supplierDeductionQuery/back'],
  supplierDeductionQuery,
  supplierCommon,
}))
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.supplierChargeEntry',
    'entity.roles',
    'sfin.supplierDeductionQuery',
    'entity.attachment',
  ],
})
@withCustomize({ unitCode })
export default class SupplierDeductionQuery extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      organizationId: getCurrentOrganizationId(),
      backFlag: false,
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
  fetchList(page = {}, _, sort = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows: [] });
    const { billingDateFrom, billingDateTo } = filterValues;
    dispatch({
      type: 'supplierDeductionQuery/queryList',
      payload: {
        page,
        sort,
        ...filterValues,
        billingDateFrom: billingDateFrom ? moment(billingDateFrom).format(DATETIME_MIN) : undefined,
        billingDateTo: billingDateTo ? moment(billingDateTo).format(DATETIME_MAX) : undefined,
        customizeUnitCode: unitCode.join(),
      },
    });
  }

  @Bind()
  @Throttle(1000)
  save() {
    const { dispatch } = this.props;
    const lines = getEditTableData(this.state.selectedRows, ['_status'], { force: true });
    if (Array.isArray(lines) && lines.length !== 0) {
      dispatch({
        type: 'supplierDeductionQuery/save',
        payload: lines,
      }).then((res) => {
        if (res) {
          this.fetchList();
        }
      });
    }
  }

  // 退回
  @Bind()
  @Throttle(1000)
  back() {
    const { dispatch } = this.props;
    const lines = this.state.selectedRows;
    if (Array.isArray(lines) && lines.length !== 0) {
      dispatch({
        type: 'supplierDeductionQuery/back',
        payload: lines,
      }).then((res) => {
        if (res) {
          notification.success();
          this.fetchList();
        }
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierDeductionQuery/init',
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    let backFlag = true;
    selectedRows.forEach((item) => {
      if (
        item.useFlag !== 0 ||
        !['UNSYNCHRONIZED', 'SYNC_FAILURE'].includes(item.syncStatus) ||
        item.statusCode !== 'CONFIRMED'
      ) {
        backFlag = false;
      }
    });
    this.setState({
      selectedRows,
      backFlag,
      // selectedRowKeys,
    });
  }

  // 获取导出条件
  @Bind()
  getExportParams() {
    const { selectedRows } = this.state;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { billingDateFrom, billingDateTo } = filterValues;
    const customizeUnitCode = unitCode.join();
    if (selectedRows.length > 0) {
      const inDeductionIds = selectedRows.map((item) => item.supplierDeductionsId);
      return {
        inDeductionIds,
        customizeUnitCode,
      };
    } else {
      return {
        ...filterValues,
        billingDateFrom: billingDateFrom ? moment(billingDateFrom).format(DATETIME_MIN) : undefined,
        billingDateTo: billingDateTo ? moment(billingDateTo).format(DATETIME_MAX) : undefined,
        customizeUnitCode,
      };
    }
  }

  render() {
    const {
      supplierDeductionQuery: { dataSource = [], pagination = {}, enumMap = {} },
      queryListLoading = false,
      customizeTable,
      customizeFilterForm,
      loading,
    } = this.props;
    const { selectedRows = [], organizationId, backFlag } = this.state;

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
      selectedRows,
      onSearch: this.fetchList,
      loading: queryListLoading,
      onHandleRecord: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${viewProps}.supplierQuery`).d('供应商扣款查询')}>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/list/page-export`}
            queryParams={this.getExportParams()}
            otherButtonProps={{
              type: 'primary',
            }}
            buttonText={
              selectedRows.length > 0
                ? intl.get(`hzero.common.button.exportSelect`).d('勾选导出')
                : intl.get(`hzero.common.button.export`).d('导出')
            }
          />
          <Button onClick={this.save} disabled={selectedRows.length === 0} loading={loading}>
            {intl.get(`hzero.common.btn.save`).d('保存')}
          </Button>
          <Button
            onClick={this.back}
            loading={loading}
            disabled={selectedRows.length === 0 || !backFlag}
          >
            {intl.get(`hzero.common.button.sendBack`).d('退回')}
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
