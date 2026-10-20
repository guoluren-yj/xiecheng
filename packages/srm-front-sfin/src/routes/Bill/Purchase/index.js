/* eslint-disable no-return-assign */
/**
 * PurchaseBill - 我的采购账单
 * @date: 2018-12-05
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Tabs } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import { SRM_FINANCE } from '_utils/config';
import notification from 'utils/notification';
import { Button as PermissionButton } from 'components/Permission';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import Icons from '../../components/Icons';
import NoConsignment from './NoConsignment';
import DetailSearch from './DetailSearch';

/**
 * tab标签页
 */
const { TabPane } = Tabs;
@connect(({ loading }) => ({
  reImportLoading: loading.effects['bill/reImport'],
}))
/**
 * 开票申请单审核
 * @extends {Component} - React.Component
 * @reactProps {Object} [history={}]
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@formatterCollections({ code: ['sfin.invoiceBill', 'entity.company', 'hzero.common'] })
@withRouter
export default class Audit extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      organizationId: getCurrentOrganizationId(),
      selectedRowKeys: [], // 已选择采购账单key
      queryValue: {},
      detailValue: {},
      tabKey: '1',
      selectedDetailKeys: [],
    };
  }

  /**
   * 选中采购账单改变回调
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
  onSetDetailValue(values = {}) {
    this.setState({
      detailValue: values,
    });
  }

  @Bind()
  handleDetailSelectChange(selectedDetailKeys) {
    this.setState({
      selectedDetailKeys,
    });
  }

  @Bind()
  handleReImport() {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'bill/reImport',
      payload: selectedRowKeys,
    }).then((res) => {
      if (res) {
        notification.success();
      }
    });
  }

  render() {
    const { reImportLoading } = this.props;
    const {
      tabKey,
      organizationId,
      selectedDetailKeys,
      selectedRowKeys,
      queryValue,
      detailValue,
    } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const selectedRowKeyIds = selectedRowKeys.join(',');
    const customizeUnitCode =
      tabKey === '1'
        ? 'SFIN.BILL_PURCHASE_LIST.GRID,SFIN.BILL_PURCHASE_LIST.MORE_FILTER'
        : 'SFIN.BILL_PURCHASE_LIST.DETAIL_FILTER,SFIN.BILL_PURCHASE_LIST.DETAIL_GRID';
    return (
      <React.Fragment>
        <Header title={intl.get('sfin.invoiceBill.model.invoiceBill.purchase').d('我的采购账单')}>
          {tabKey === '1' && (
            <ExcelExport
              otherButtonProps={{ icon: 'export' }}
              requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill/export`}
              queryParams={
                selectedRowKeyIds
                  ? { billHeaderIds: selectedRowKeyIds, customizeUnitCode }
                  : { ...queryValue, customizeUnitCode }
              }
            />
          )}
          {tabKey === '1' && (
            <PermissionButton
              permissionList={[
                {
                  code: `srm.finance.purchase-bill.list.ps.button.reimport`,
                  type: 'button',
                },
              ]}
              loading={reImportLoading}
              onClick={this.handleReImport}
              disabled={isEmpty(selectedRowKeys)}
            >
              <Icons type="main-import" style={{ marginRight: '8px' }} />
              {intl
                .get('sfin.invoiceBill.model.invoiceBill.reImportExternaSystem')
                .d('重新导入外部系统')}
            </PermissionButton>
          )}

          {tabKey === '2' && (
            <ExcelExport
              requestUrl={`${SRM_FINANCE}/v1/${organizationId}/bill-detail/export`}
              otherButtonProps={{ type: 'primary' }}
              queryParams={
                selectedDetailKeys.length
                  ? { billDetailIds: selectedDetailKeys, customizeUnitCode }
                  : { ...detailValue, customizeUnitCode }
              }
            />
          )}
        </Header>
        <Content style={{ paddingTop: 0 }}>
          <Tabs defaultActiveKey="1" activeKey={tabKey} onChange={this.changeTab} animated={false}>
            <TabPane
              tab={intl.get('sfin.invoiceBill.model.invoiceBill.purchase').d('我的采购账单')}
              key="1"
            >
              <NoConsignment
                rowSelection={rowSelection}
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
                onSetDetailValue={this.onSetDetailValue}
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
