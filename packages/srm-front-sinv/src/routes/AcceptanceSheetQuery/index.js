/**
 * index - 验收单查询
 * @date: 2019-11-19
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { Component, Fragment } from 'react';
import { Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isArray, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import withCustomize from 'srm-front-cuz';

import Search from './Search.js';
import List from './List.js';
import DetailSearch from './DetailSearch';
import DetailList from './DetailList';
import OperationRecord from '../components/AcceptanceOperation';

const { TabPane } = Tabs;

/**
 * 验收单查询入口界面
 *
 * @export
 * @class Reception - 入口界面
 * @extends {Component} - React.Component
 * @reactProps {object} acceptanceSheetQuery - 数据源
 * @reactProps {boolean} fetchLoading - 获取数据状态
 * @reactProps {function} dispatch - redux dispatch
 * @returns React.element
 */
@withCustomize({
  unitCode: [
    'SINV.ACCEPTANCE_QUERY.LIST_BAY_DETAIL',
    'SINV.ACCEPTANCE_QUERY.LIST',
    'SINV.ACCEPTANCE_QUERY.LIST_SEARCH',
    'SINV.ACCEPTANCE_QUERY.LIST_BAY_DETAIL_SEARCH',
  ],
})
@connect(({ loading, acceptanceSheetQuery }) => ({
  fetchLoading: loading.effects['acceptanceSheetQuery/fetchList'],
  fetchDetailLoading: loading.effects['acceptanceSheetQuery/fetchDetail'],
  acceptanceSheetQuery,
}))
@formatterCollections({
  code: [
    'sinv.acceptanceSheetQuery',
    'entity.supplier',
    'entity.item',
    'sinv.common',
    'entity.company',
    'sinv.acceptanceSheetType',
    'sinv.acceptanceSheetCreate',
    'sinv.acceptanceApproved',
    'sinv.acceptance',
    'hzn.date',
    'model.common',
    'sodr.orderCancel',
    'sprm.purchaseRequisitionInquiry',
    'sinv.purchaserDelivery',
  ],
})
export default class Reception extends Component {
  constructor(props) {
    super(props);
    this.state = {
      operationRecordId: '', // table中打开的对应操作记录的id
      operationRecordModalVisible: false, // 修改操作记录模态框
      activeKey: 'list', // 当前tabs的活动页
      selectedListRowKeys: [], // 列表选中主键
      selectedLinesRowKeys: [], // 明细行选中主键
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidMount() {
    this.handleSearch();
    this.queryValueCode();
  }

  /**
   * 查询表单请求
   * @params {object} page - 分页
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = (this.searchForm && this.searchForm.props.form.getFieldsValue()) || {};
    const acceptDateStart = filterValues.acceptDateStart
      ? filterValues.acceptDateStart.format(DATETIME_MIN)
      : undefined;
    const acceptDateEnd = filterValues.acceptDateEnd
      ? filterValues.acceptDateEnd.format(DATETIME_MAX)
      : undefined;
    dispatch({
      type: 'acceptanceSheetQuery/fetchList',
      payload: {
        page,
        ...filterValues,
        acceptDateStart,
        acceptDateEnd,
        customizeUnitCode: 'SINV.ACCEPTANCE_QUERY.LIST,SINV.ACCEPTANCE_QUERY.LIST_SEARCH',
      },
    });
  }

  /**
   * 查询表单明细请求
   * @params {object} page - 分页
   */
  @Bind()
  handleDetailSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues =
      (this.searchDetailForm && this.searchDetailForm.props.form.getFieldsValue()) || {};
    dispatch({
      type: 'acceptanceSheetQuery/fetchDetail',
      payload: {
        page,
        ...filterValues,
        customizeUnitCode:
          'SINV.ACCEPTANCE_QUERY.LIST_BAY_DETAIL_SEARCH,SINV.ACCEPTANCE_QUERY.LIST_BAY_DETAIL',
      },
    });
  }

  /**
   * 跳转验收单详情
   */
  @Bind()
  handleJumpApproved(record) {
    const { history } = this.props;
    history.push({
      pathname: `/sinv/acceptance-sheet-query/detail/${record.acceptListHeaderId}/${record.sourceCode}`,
      payload: {
        sourceCode: record.sourceCode,
      },
    });
  }

  /**
   *
   * 修改操作记录可见
   * @memberof deliveryApproved
   * @param {Boolean} flag
   */
  @Bind()
  handleOperationRecordVisible(flag, operationRecordId) {
    this.setState({
      operationRecordId,
      operationRecordModalVisible: !!flag,
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'acceptanceSheetQuery/queryValueCode',
      payload: {
        statusCode: 'SPUC.ACCEPT_SELECT_STATUS',
        orderSource: 'SPUC.ACCEPT_SOURCE_CODE',
      },
    });
  }

  /**
   * tab改变回调
   * @param {String} activeKey // 当前活动的tab
   */
  @Bind()
  handleTabsChange(activeKey) {
    this.setState({ activeKey });
    if (activeKey === 'list') {
      this.handleSearch();
    } else {
      this.handleDetailSearch();
    }
  }

  /**
   * 修改列表和详情列表的选中的主键
   * @param {string} key //主键对应的key
   * @param {String} selectedRowKeys //选中主键
   */
  @Bind()
  handleChangeRowKeys(key, selectedRowKeys) {
    this.setState({ [key]: selectedRowKeys });
  }

  /**
   * @returns React.element
   * @memberof Reception
   */
  render() {
    const {
      operationRecordModalVisible,
      operationRecordId,
      selectedListRowKeys,
      selectedLinesRowKeys,
      activeKey,
      tenantId,
    } = this.state;
    const {
      acceptanceSheetQuery: {
        dataSource = [],
        pagination = {},
        queryParams = {},
        detailDataSource = [],
        detailPagination = {},
        queryDetailParams = {},
        deliveryType,
        // orderSource = [],
        code: { orderSource = [], statusCode = [] },
      },
      customizeTable,
      fetchLoading,
      fetchDetailLoading,
      customizeFilterForm,
    } = this.props;
    const acceptListHeaderIds = selectedListRowKeys.join(',');
    const acceptListLineIds = selectedLinesRowKeys.join(',');
    const listRowSelection = {
      selectedRowKeys: selectedListRowKeys,
      onChange: (selectedRowKeys) =>
        this.handleChangeRowKeys('selectedListRowKeys', selectedRowKeys),
    };
    const linesRowSelection = {
      selectedRowKeys: selectedLinesRowKeys,
      onChange: (selectedRowKeys) =>
        this.handleChangeRowKeys('selectedLinesRowKeys', selectedRowKeys),
    };
    const searchProps = {
      customizeFilterForm,
      onSearch: this.handleSearch,
      deliveryType,
      onRef: (node) => {
        this.searchForm = node;
      },
      orderSource,
      statusCode,
    };
    const listProps = {
      customizeTable,
      loading: fetchLoading,
      dataSource,
      pagination,
      rowSelection: listRowSelection,
      onChange: this.handleSearch,
      handleJumpApproved: this.handleJumpApproved,
      openOperationRecord: this.handleOperationRecordVisible,
    };
    const detailSearchProps = {
      customizeFilterForm,
      onSearch: this.handleDetailSearch,
      onRef: (node) => {
        this.searchDetailForm = node;
      },
    };
    const detailListProps = {
      customizeTable,
      loading: fetchDetailLoading,
      detailDataSource,
      detailPagination,
      rowSelection: linesRowSelection,
      onChange: this.handleDetailSearch,
    };
    const operationRecordProps = {
      operationRecordId,
      visible: operationRecordModalVisible,
      hideModal: () => this.handleOperationRecordVisible(false),
    };
    const otherButtonProps = {
      icon: 'export',
      permissionList: [
        {
          code: 'srm.logistics.acceptance.query.button.export',
          type: 'c7n-pro',
        },
      ],
    };
    const listCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedListRowKeys) && isEmpty(selectedListRowKeys),
      permissionList: [
        {
          code: 'srm.logistics.acceptance.query.button.check.export',
          type: 'c7n-pro',
        },
      ],
    };
    const detailCheckExportBtnProps = {
      icon: 'export',
      disabled: isArray(selectedLinesRowKeys) && isEmpty(selectedLinesRowKeys),
      permissionList: [
        {
          code: 'srm.logistics.acceptance.query.button.check.export',
          type: 'c7n-pro',
        },
      ],
    };

    return (
      <Fragment>
        <Header title={intl.get(`sinv.acceptanceApproved.view.message.detail`).d('验收单查询')}>
          {activeKey === 'list' ? (
            <React.Fragment>
              <ExcelExportPro
                buttonText={
                  listCheckExportBtnProps.disabled
                    ? intl.get('sinv.purchaserDelivery.view.button.newExport').d('新版导出')
                    : intl
                        .get(`sinv.purchaserDelivery.view.button.newCheckExport`)
                        .d('新版勾选导出')
                }
                otherButtonProps={{
                  icon: 'unarchive',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.acceptance.query.ps.srm.logistics.acceptance.query.ps.button.newexport',
                      type: 'c7n-pro',
                      // funcType: 'flat',
                    },
                  ],
                }}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/ac-header/page-list/export`}
                queryParams={
                  listCheckExportBtnProps.disabled
                    ? {
                        ...queryParams,
                        tenantId,
                      }
                    : { acceptListHeaderIds }
                }
                templateCode="SPUC_ACCEPT_LIST_EXPORT"
              />
              <ExcelExport
                otherButtonProps={otherButtonProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/ac-header/page-list/export`}
                queryParams={{
                  ...queryParams,
                  tenantId,
                }}
              />
              <ExcelExport
                buttonText={intl
                  .get(`sinv.purchaserDelivery.view.button.checkExport`)
                  .d('勾选导出')}
                otherButtonProps={listCheckExportBtnProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/ac-header/page-list/export`}
                queryParams={{ acceptListHeaderIds }}
              />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <ExcelExportPro
                buttonText={
                  detailCheckExportBtnProps.disabled
                    ? intl.get('sinv.purchaserDelivery.view.button.newExport').d('新版导出')
                    : intl
                        .get(`sinv.purchaserDelivery.view.button.newCheckExport`)
                        .d('新版勾选导出')
                }
                otherButtonProps={{
                  icon: 'unarchive',
                  // type: 'primary',
                  type: 'c7n-pro',
                  permissionList: [
                    {
                      code:
                        'srm.logistics.acceptance.query.ps.srm.logistics.acceptance.query.ps.button.newexport',
                      type: 'c7n-pro',
                    },
                  ],
                }}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/ac-header/line/page-list/export/new`}
                queryParams={
                  detailCheckExportBtnProps.disabled
                    ? {
                        ...queryDetailParams,
                        tenantId,
                      }
                    : {
                        acceptListLineIds,
                        // tenantId,
                      }
                }
                templateCode="SPUC_ACCEPT_LIST_LINE_EXPORT"
              />
              <ExcelExport
                otherButtonProps={otherButtonProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/ac-header/line/page-list/export`}
                queryParams={{
                  ...queryDetailParams,
                  tenantId,
                }}
              />
              <ExcelExport
                buttonText={intl
                  .get(`sinv.purchaserDelivery.view.button.checkExport`)
                  .d('勾选导出')}
                otherButtonProps={detailCheckExportBtnProps}
                requestUrl={`${SRM_SPUC}/v1/${tenantId}/ac-header/line/page-list/export`}
                queryParams={{
                  acceptListLineIds,
                  // tenantId,
                }}
              />
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Tabs defaultActiveKey="list" onChange={this.handleTabsChange} animated={false}>
            <TabPane
              tab={intl.get('sodr.orderCancel.view.message.orderSearch').d('整单查询')}
              key="list"
            >
              <Search {...searchProps} />
              <List {...listProps} />
            </TabPane>
            <TabPane
              tab={intl
                .get('sprm.purchaseRequisitionInquiry.view.title.detailInquiry')
                .d('明细查询')}
              key="detail"
            >
              <DetailSearch {...detailSearchProps} />
              <DetailList {...detailListProps} />
            </TabPane>
          </Tabs>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </Fragment>
    );
  }
}
