/**
 * index.js - 我收到的扣款单
 * @date: 2020-11-13
 * @author: lichao <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import { SRM_FINANCE } from 'srm-front-boot/lib/utils/config';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import ExcelExport from 'components/ExcelExport';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import Search from './Search';
import List from './List';

const viewProps = 'sfin.myReceivedDeduction.view';
const unitCode = ['SFIN.RECEIVED_DEDUCTION_LIST.FILTER', 'SFIN.RECEIVED_DEDUCTION_LIST.GRID'];

@connect(({ loading = {}, myReceivedDeduction, supplierCommon }) => ({
  queryListLoading: loading.effects['myReceivedDeduction/queryList'],
  fetchEnumLoading: loading.effects['myReceivedDeduction/fetchEnum'],
  updateStateLoading: loading.effects['myReceivedDeduction/updateState'],
  submitting: loading.effects['myReceivedDeduction/update'],
  myReceivedDeduction,
  supplierCommon,
}))
@formatterCollections({
  code: [
    'hzero.common',
    'entity.company',
    'sfin.supplierChargeEntry',
    'entity.roles',
    'sfin.myReceivedDeduction',
    'entity.attachment',
  ],
})
@withCustomize({ unitCode })
export default class MyReceivedDeduction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      organizationId: getCurrentOrganizationId(),
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
      type: 'myReceivedDeduction/queryList',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode: unitCode.join(),
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
      type: 'myReceivedDeduction/init',
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

  @Bind()
  getExportParams() {
    const { selectedRows } = this.state;
    const customizeUnitCode = unitCode.join();
    if (selectedRows.length > 0) {
      const inDeductionIds = selectedRows.map((item) => item.supplierDeductionsId);
      return {
        inDeductionIds,
        customizeUnitCode,
      };
    } else {
      const filterValues = isUndefined(this.filterForm)
        ? {}
        : filterNullValueObject(this.filterForm.getFieldsValue());
      return {
        ...filterValues,
        customizeUnitCode,
      };
    }
  }

  render() {
    const {
      myReceivedDeduction: { dataSource = [], pagination = {}, enumMap = {} },
      queryListLoading = false,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { selectedRows = [], organizationId } = this.state;

    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = (node.props || {}).form;
      },
      onFetchList: this.fetchList,
      customizeFilterForm,
    };
    const listProps = {
      dataSource,
      pagination,
      selectedRows,
      customizeTable,
      onSearch: this.fetchList,
      loading: queryListLoading,
      onHandleRecord: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${viewProps}.supplierQuery`).d('我收到的扣款单')}>
          <ExcelExport
            requestUrl={`${SRM_FINANCE}/v1/${organizationId}/supplier-deduction/received-list/page-export`}
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
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
