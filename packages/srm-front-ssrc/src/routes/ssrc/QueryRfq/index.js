/**
 * queryRfq - 寻源服务/寻源事件查询
 * @date: 2019-01-25
 * @author: LC <chao.li03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind, Throttle } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import querystring from 'querystring';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';

import remotes from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import ExcelExportOld from 'components/ExcelExport';
import ExcelExport from 'components/ExcelExportPro';
import { asyncPageFetchList } from '@/utils/utils';
import FilterForm from './FilterForm';
import TableList from './TableList';
import Drawer from '../InquiryHall/Drawer';

const promptCode = 'ssrc.queryRfq';

@formatterCollections({
  code: ['ssrc.queryRfq', 'ssrc.common', 'hzero.common', 'ssrc.inquiryHall'],
})
@withCustomize({
  unitCode: [
    'SSRC.RFX_EVENT.LIST', // 寻源结果查询列表code
    'SSRC.RFX_EVENT.FILTER_NEW', // 寻源结果查询条件渲染
    'SSRC.RFX_EVENT.QUERYRFQBUTTONS', // 头部按钮
  ],
})
@connect(({ inquiryHall, queryRfq, loading }) => ({
  inquiryHall,
  queryRfq,
  fetchDataLoading: loading.effects['queryRfq/fetchRfqDataList'],
  fetchQuotationFeedBackLoading: loading.effects['inquiryHall/quotationFeedBack'],
  organizationId: getCurrentOrganizationId(),
}))
@remotes({
  code: 'SSRC_QUERY_RFX_LIST',
  name: 'remote',
})
export default class QueryRfq extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    visible: false, // 报价响应模态框
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      organizationId,
      queryRfq: { pagination = {} },
    } = this.props;
    this.handleSearch(pagination);
    const lovCodes = {
      sourceMethod: 'SSRC.SOURCE_METHOD', // 询价方式
      rfxStatus: 'SSRC.RFX_EVENT_STATUS', // 询价单状态
      auctionDirection: 'SSRC.SOURCE_AUCTION_DIRECTION', // 报价方向
      sourceCategory: 'SSRC.SOURCE_CATEGORY', // 寻源类别
      quotationType: 'SSRC.QUOTATION_TYPE', // 报价方式
      tenantId: organizationId,
    };
    dispatch({
      type: 'inquiryHall/batchCode',
      payload: { lovCodes },
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   * @param { Boolean } pageChangeFlag - 是否来源于翻页查询
   */
  @Bind()
  async handleSearch(page = {}, pageChangeFlag = false) {
    const {
      dispatch,
      organizationId,
      queryRfq: { oldTotalElements },
    } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const handleFormValues = this.handleFormQuery(fieldValues);
    const commonPayload = {
      page,
      ...handleFormValues,
      organizationId,
      customizeUnitCode: 'SSRC.RFX_EVENT.LIST,SSRC.RFX_EVENT.FILTER_NEW',
    };

    const fetchRfqDataList = (payload) => {
      return dispatch({
        type: 'queryRfq/fetchRfqDataList',
        payload,
      });
    };
    // 异步分页
    await asyncPageFetchList({
      pageChangeFlag,
      commonPayload,
      oldTotalElements,
      fetchDataList: fetchRfqDataList,
    });
    // 非翻页查询 清空勾选
    if (!pageChangeFlag) {
      this.setState({ selectedRowKeys: [], selectedRows: [] });
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'quotationStartDateFrom', 'quotationEndDateFrom'];
    const timeToArray = ['creationDateTo', 'quotationStartDateTo', 'quotationEndDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    timeToArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MAX) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const { form } = this;
    const formValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    const filterValues = this.handleFormQuery(formValues);
    const customizeData = {
      customizeUnitCode: 'SSRC.RFX_EVENT.LIST,SSRC.RFX_EVENT.FILTER_NEW',
    };
    return { ...filterValues, ...customizeData };
  }

  /**
   * 跳转到明细页面
   */
  @Bind()
  inquiryDetail(record = {}) {
    const { rfxHeaderId, offlineWholeFlag = 0 } = record || {};
    if (!rfxHeaderId) {
      return;
    }

    const { rfxStatus = null, projectLineSectionId = null, secondarySourceCategory } = record;
    const url =
      offlineWholeFlag === 1
        ? `/ssrc/query-rfq/whole-detail/${rfxHeaderId}`
        : secondarySourceCategory === 'NEW_BID'
        ? `/ssrc/query-rfq/bid-detail/${rfxHeaderId}`
        : `/ssrc/query-rfq/rfx-detail/${rfxHeaderId}`;

    const path = {
      pathname: url,
      search: querystring.stringify({
        rfxStatus,
        sourcePage: 'QueryRfqList',
        projectLineSectionId,
      }),
    };
    this.props.history.push(path);
  }

  /**
   * 报价响应
   */
  @Throttle(500)
  @Bind()
  quotationFeedBack(record) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'inquiryHall/quotationFeedBack',
      payload: { organizationId, rfxHeaderId: record.rfxHeaderId },
    }).then((res) => {
      if (res) {
        this.setState({ visible: true });
      }
    });
  }

  /**
   * 报价响应-确定关闭模态框
   */
  @Bind()
  handleOkModal() {
    this.setState({ visible: false });
  }

  @Bind()
  renderHeaderButtons() {
    const {
      remote,
      organizationId,
      match: { path },
    } = this.props;
    const standard = [
      {
        name: 'excelExport',
        btnComp: ExcelExportOld,
        btnProps: {
          requestUrl: `/ssrc/v1/${organizationId}/rfx/all/excel`,
          queryParams: this.handleGetFormValue(),
        },
      },
      {
        name: 'excelExportNew',
        btnComp: ExcelExport,
        btnProps: {
          requestUrl: `/ssrc/v1/${organizationId}/rfx/all/excel`,
          queryParams: this.handleGetFormValue(),
          templateCode: 'SSRC_SOURCE_EVENT_EXPORT',
          buttonText: `${intl.get('hzero.common.export.new').d('(新)导出')}`,
          otherButtonProps: {
            permissionList: [
              {
                code: `${path}.button.exportnew`,
                type: 'button',
                meaning: `${
                  intl.get(`${promptCode}.view.message.title.sourceQuery`).d('寻源事件查询') -
                  intl.get(`ssrc.common.button.batchExport`).d('导出')
                }${intl.get('ssrc.common.view.new').d('新')}`,
              },
            ],
            icon: 'unarchive',
            type: 'c7n-pro',
          },
        },
      },
    ];
    const buttons = remote?.process('getHeaderButtons', standard, { that: this });
    return buttons;
  }

  @Bind()
  onSelectChange(selectedRowKeys = [], selectedRows = []) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  render() {
    const {
      remote,
      organizationId,
      fetchDataLoading,
      fetchQuotationFeedBackLoading,
      customizeTable,
      customizeForm,
      inquiryHall: {
        quotationFeedBackList = [],
        code: { sourceMethod = [], rfxStatus = [], auctionDirection = [], quotationType = [] },
      },
      queryRfq: { rfqList = [], pagination = {} },
      customizeBtnGroup = () => {},
    } = this.props;
    const { visible = false, selectedRows = [], selectedRowKeys = [] } = this.state;
    const formProps = {
      customizeForm,
      organizationId,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      quotationType,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const rowSelection = remote?.process('getTableRowSelectionProps', null, {
      that: this,
      selectedRows,
      selectedRowKeys,
    });
    const tableProps = {
      rowSelection,
      customizeTable,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      pagination,
      dataSource: rfqList,
      loading: fetchDataLoading,
      onChange: this.handleSearch,
      onQuotationFeedBack: this.quotationFeedBack,
      onInquiryDetail: this.inquiryDetail,
    };
    const drawerProps = {
      visible,
      loading: fetchQuotationFeedBackLoading,
      dataSource: quotationFeedBackList,
      onOk: this.handleOkModal,
      onCancel: this.handleOkModal,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.sourceQuery`).d('寻源事件查询')}>
          {customizeBtnGroup(
            { code: 'SSRC.RFX_EVENT.QUERYRFQBUTTONS', pro: true },
            <DynamicButtons buttons={this.renderHeaderButtons()} />
          )}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...formProps} />
          </div>
          <TableList {...tableProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}
