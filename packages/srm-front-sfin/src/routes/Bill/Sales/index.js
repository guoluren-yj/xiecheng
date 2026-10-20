/**
 * MaintainIndex -开票申请维护查询界面 -table 表格
 * @date: 2018-12-4
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import NonPerformance from '../Sales/NonPerformance';

import DetailSearch from './DetailSearch';

/**
 * tab标签页
 */
const { TabPane } = Tabs;

@formatterCollections({
  code: ['sfin.invoiceBill'],
})
@connect(({ bill, loading, user: { currentUser = {} } }) => ({
  nonPerformanceProps: {
    bill,
    currentUser,
    loading: loading.effects['bill/fetchSupplierBill'],
  },
}))
export default class Maintain extends Component {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      selectedRowKeys: [], // 已选择销售账单key
      queryValue: {},
      tabKey: '1',
      selectedDetailKeys: [],
    };
  }

  nonRef;

  @Bind()
  handleNonRef(ref = {}) {
    this.nonRef = ref;
  }

  /**
   * 选中销售账单改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectChange(newSelectedRowKeys) {
    this.setState({ selectedRowKeys: newSelectedRowKeys });
  }

  @Bind()
  onSetQueryValue(values = {}) {
    this.setState({
      queryValue: filterNullValueObject(values),
    });
  }

  @Bind()
  changeTab(key) {
    this.setState({
      tabKey: key,
    });
  }

  @Bind()
  onClearQueryValue() {
    this.setState({
      queryValue: {},
    });
  }

  @Bind()
  handleDetailSelectChange(selectedDetailKeys) {
    this.setState({
      selectedDetailKeys,
    });
  }

  render() {
    const { tabKey, organizationId, selectedDetailKeys, selectedRowKeys, queryValue } = this.state;
    const { nonPerformanceProps, ...otherProps } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const selectedRowKeyIds = selectedRowKeys.join(',');
    const querySearchParams = this.detailSearch
      ? filterNullValueObject(this.detailSearch.getFormValues())
      : {};
    return (
      <React.Fragment>
        <Header title={intl.get('sfin.invoiceBill.view.message.title.bill.sale').d('我的销售账单')}>
          {tabKey === '1' && (
            <ExcelExport
              otherButtonProps={{ icon: 'export' }}
              requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/supplier/export`}
              queryParams={
                selectedRowKeyIds
                  ? {
                      billHeaderIds: selectedRowKeyIds,
                      customizeUnitCode: 'SFIN.BILL_SALE_LIST.GRID,SFIN.BILL_SALE_LIST.FILTER',
                    }
                  : {
                      ...queryValue,
                      customizeUnitCode: 'SFIN.BILL_SALE_LIST.GRID,SFIN.BILL_SALE_LIST.FILTER',
                    }
              }
            />
          )}
          {tabKey === '2' && (
            <ExcelExport
              requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill-detail/supplier/export`}
              otherButtonProps={{ type: 'primary' }}
              queryParams={
                selectedDetailKeys.length
                  ? {
                      billDetailIds: selectedDetailKeys,
                      customizeUnitCode:
                        'SFIN.BILL_SALE_LIST.DETAIL_FILTER,SFIN.BILL_SALE_LIST.DETAIL_GRID',
                    }
                  : {
                      ...querySearchParams,
                      customizeUnitCode:
                        'SFIN.BILL_SALE_LIST.DETAIL_FILTER,SFIN.BILL_SALE_LIST.DETAIL_GRID',
                    }
              }
            />
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs defaultActiveKey="1" activeKey={tabKey} onChange={this.changeTab} animated={false}>
            <TabPane
              tab={intl.get('sfin.invoiceBill.view.message.title.bill.sale').d('我的销售账单')}
              key="1"
            >
              <NonPerformance
                {...nonPerformanceProps}
                rowSelection={rowSelection}
                onNonRef={this.handleNonRef}
                {...otherProps}
                onSetQueryValue={this.onSetQueryValue}
                onClearQueryValue={this.onClearQueryValue}
              />
            </TabPane>
            <TabPane
              tab={intl
                .get('sfin.invoiceBill.view.message.title.tab.billDetailSearch')
                .d('对账单明细')}
              key="2"
            >
              <DetailSearch
                onRef={(node) => {
                  this.detailSearch = node;
                }}
                rowSelection={{
                  selectedRowKeys: selectedDetailKeys,
                  onChange: this.handleDetailSelectChange,
                }}
              />
            </TabPane>
          </Tabs>
        </Content>
      </React.Fragment>
    );
  }
}
