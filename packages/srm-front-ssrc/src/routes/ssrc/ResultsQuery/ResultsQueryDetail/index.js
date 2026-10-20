/**
 * CheckPrice - 寻源服务/寻源结果详情页面
 * @date: 2019-2-14
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Collapse, Form, Col, Row, Tabs, Tag, Spin, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isEmpty } from 'lodash';

import ExcelExport from 'components/ExcelExport';
import ExcelExportNew from 'hzero-front/lib/components/ExcelExportPro';
import remoteHoc from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import querystring from 'querystring';
import classnames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';
import { numberRender, yesOrNoRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, getCurrentTenant, getResponse } from 'utils/utils';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { fetchConfigSheet } from '@/services/inquiryHallNewService';
import { numberSeparatorRender } from '@/utils/renderer';
import { isText } from '@/utils/utils';
import DetailLineTable from './DetailLineTable';
import styles from './Header.less';
import Attachment from '../../components/Attachment';
import LadderLevel from '../../components/LadderLevelDoubleUnit';

const { Panel } = Collapse;
const { TabPane } = Tabs;
const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
const promptCode = 'ssrc.resultsQuery';

@withCustomize({
  unitCode: ['SSRC.RESULTS_QUERY.DETAIL', 'SSRC.RESULTS_QUERY.DETAIL_HEADER_BUTTON'],
})
@connect(({ resultsQuery, queryRfq, loading }) => ({
  resultsQuery,
  queryRfq,
  fetchresultsQueryLineLoading: loading.effects['resultsQuery/fetchQuoteLine'],
  fetchLadderLevelTableLoading: loading.effects['queryRfq/fetchLadderLevelTable'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['ssrc.resultsQuery', 'ssrc.common', 'ssrc.inquiryHall', 'ssrc.scux'],
})
@remoteHoc(
  {
    code: 'SSRC_RESULT_QUERY_DETAIL',
  },
  {
    events: {
      // 纯二开埋点,页面查询后操作
      cuxHandleAfterMountEvent() {},
    },
  }
)
export default class resultsQueryDetail extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(props.location.search.substr(1));
    this.state = {
      routerParam,
      // activeKey: 'itemLine', // 当前激活tab面板的key
      viewOnly: true, // 是否只读标识位
      rfxBucketDirectory: 'ssrc-rfx-rfxheader',
      collapseKeys: [], // 打开的折叠面板key
      viewLadderLevelVisible: false, // 阶梯报价弹窗
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      doubleUnitFlag: false, // 双精度标志
      configSheet: {},
    };
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchConfig();
    this.fetchResultsHeaderDetail();
    this.initPage();
  }

  initPage = () => {
    this.cuxHandleAfterMount();
  };

  cuxHandleAfterMount = () => {
    const { remote } = this.props;
    if (remote?.event) {
      remote.event.fireEvent('cuxHandleAfterMountEvent', {
        that: this,
      });
    }
  };

  getSnapshotBeforeUpdate(prevProps) {
    const {
      match: { params },
    } = prevProps || {};
    const { sourceHeaderId: preSourceHeaderId } = params;
    const { sourceHeaderId } = (this.props || {}).match?.params;

    return sourceHeaderId && sourceHeaderId !== preSourceHeaderId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchResultsHeaderDetail();
    }
  }

  componentWillUnmount() {
    const { routerParam } = this.state;
    if (routerParam.typeName === 'resultImportDetail') {
      this.props.dispatch({
        type: 'resultsQuery/updateState',
        payload: {
          importHeader: {}, // 寻源结果明细页面头
          importQuoteLine: [], // 全部报价明细
          importQuoteLinePagination: {}, // 全部报价明细分页
        },
      });
    } else {
      this.props.dispatch({
        type: 'resultsQuery/updateState',
        payload: {
          header: {}, // 寻源结果明细页面头
          quoteLine: [], // 全部报价明细
          quoteLinePagination: {}, // 全部报价明细分页
        },
      });
    }
  }

  // 查询配置表
  fetchConfig = async () => {
    const { configSheet = {} } = this.state;
    let data = null;

    try {
      data = await fetchConfigSheet({
        configCode: 'sprm_old_ui_config',
        organizationId: getCurrentOrganizationId(),
        data: {
          tenant: getCurrentTenant().tenantNum,
        },
      });
      data = getResponse(data);
      if (!data) {
        return;
      }

      this.setState({
        configSheet: {
          ...configSheet,
          sprmOldUiConfig: !isEmpty(data),
        },
      });
    } catch (e) {
      throw e;
    }
  };

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 寻源结果-明细头信息查询
   */
  @Bind()
  fetchResultsHeaderDetail() {
    const { routerParam } = this.state;
    const {
      match: { params },
      dispatch,
      organizationId,
    } = this.props;
    dispatch({
      type: 'resultsQuery/fetchResultsHeaderDetail',
      payload: { routerParam, rfxHeaderId: params.sourceHeaderId, organizationId },
    });
    this.fetchResultsQueryLine();
    this.queryDoubleUnit();
  }

  /**
   * 全部报价明细 - 查询
   */
  @Bind()
  fetchResultsQueryLine(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
    } = this.props;
    const { routerParam } = this.state;
    dispatch({
      type: 'resultsQuery/fetchQuoteLine',
      payload: {
        page,
        routerParam,
        organizationId,
        sourceHeaderId: params.sourceHeaderId,
        customizeUnitCode: 'SSRC.RESULTS_QUERY.DETAIL',
      },
    });
  }

  @Bind()
  queryDoubleUnit() {
    queryEnableDoubleUnit({ businessModule: 'RFX' }).then((res) => {
      if (isText(res)) {
        this.setState({ doubleUnitFlag: !!Number(res) });
      }
    });
  }

  resultsTitleForm(header = {}) {
    return (
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.templateName`).d('寻源模板')}
              value={header.templateName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.sourceCategory`).d('寻源类别')}
              value={header.secondarySourceCategoryMeaning || header.sourceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.resultsQuery.purOrganizationName`)
                .d('采购组织名称')}
              value={header.purOrganizationName}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={header.companyName}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.sourceMethod`).d('寻源方式')}
              value={header.sourceMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.quotationType`).d('报价方式')}
              value={header.quotationTypeMeaning}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={<QuotationDirectLable />}
              value={header.auctionDirectionMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.budgetAmount`).d('预算金额')}
              value={header.budgetAmount && numberSeparatorRender(header.budgetAmount)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.currencyCode`).d('币种')}
              value={header.currencyCodeMeaning}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.exchangeRate`).d('汇率')}
              value={header.exchangeRate ? numberRender(header.exchangeRate, 8, false) : ''}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.creationDate`).d('创建时间')}
              value={dateTimeRender(header.creationDate)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.resultsQuery.quotationStartDate`)
                .d('报价开始时间')}
              value={dateTimeRender(header.quotationStartDate)}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.resultsQuery.quotationEndDate`)
                .d('报价截止时间')}
              value={dateTimeRender(header.quotationEndDate)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.sourceType`).d('寻源类型')}
              value={header.sourceTypeMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.paymentTypeName`).d('付款方式')}
              value={header.paymentTypeName}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.priceCategory`).d('价格类型')}
              value={header.priceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.resultsQuery.sourceAnnouncement`)
                .d('创建寻源公告')}
              value={yesOrNoRender(header.sourceAnnouncementFlag)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.rfxRemark`).d('备注')}
              value={header.rfxRemark}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.pretrailRemark`).d('初审备注')}
              value={header.pretrailRemark}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.totalCost`).d('总成本')}
              value={header.totalCost && numberSeparatorRender(header.totalCost)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.totalPrice`).d('核价总金额')}
              value={header.totalPrice && numberSeparatorRender(header.totalPrice)}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.overCostFlag`).d('是否超成本')}
              value={header.overCostFlag}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.overCostPrice`).d('超成本金额')}
              value={header.overCostPrice && numberSeparatorRender(header.overCostPrice)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.overCostScale`).d('超成本百分比')}
              value={header.overCostScale}
            />
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.resultsQuery.costRemark`).d('成本备注')}
              value={header.costRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  renderHeaderTitle(header) {
    return (
      <h3 style={{ maxWidth: '90%' }}>
        <span
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '85%',
            float: 'left',
          }}
        >
          {header.rfxNum}-
          <Tooltip
            title={`${header.rfxNum}-${header.rfxTitle}`}
            overlayStyle={{ minWidth: '300px' }}
          >
            {header.rfxTitle}
          </Tooltip>
        </span>
        <Tag style={{ marginLeft: '15px' }}>
          {intl.get(`${promptCode}.model.resultsQuery.roundNumber`).d('轮次')}：{header.roundNumber}
        </Tag>
      </h3>
    );
  }

  /**
   * 渲染父路由
   * @returns {*}
   */
  renderParent() {
    let url;
    const { routerParam } = this.state;
    if (routerParam.typeName === 'resultImportDetail') {
      url = '/ssrc/search-result-import/list';
    } else if (routerParam.typeName === 'resultImportNewDetail') {
      url = '/ssrc/search-result-import-new/list';
    } else {
      url = '/ssrc/results-query/list';
    }
    return url;
  }

  /**
   * 打开阶梯报价模态框
   */
  @Bind()
  viewLadderLevelModal(record = {}) {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      quotationLineId,
      quotationLineStatus,
    } = record;
    this.setState({
      viewLadderLevelVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });

    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'queryRfq/fetchLadderLevelTable',
      payload: {
        quotationLineId,
        organizationId,
      },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'queryRfq/updateState',
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  @Bind()
  linktoPrNumDetail(record) {
    const { history } = this.props;
    const { configSheet } = this.state;
    const { sprmOldUiConfig = false } = configSheet || {};
    const { prSourcePlatform, prHeaderId } = record || {};

    const isErp = prSourcePlatform && prSourcePlatform.toLowerCase() === 'erp';
    let pathUrl = null;

    if (!sprmOldUiConfig) {
      // 采购申请工作台
      pathUrl = isErp
        ? `/sprm/purchase-platform/erp-detail/${prHeaderId}`
        : `/sprm/purchase-platform/noerp-detail/${prHeaderId}`;
    } else {
      pathUrl = isErp
        ? `/sprm/purchase-requisition-inquiry/erp-detail/${prHeaderId}`
        : `/sprm/purchase-requisition-inquiry/not-erp-detail/${prHeaderId}`;
    }

    history.push({
      pathname: pathUrl,
    });
  }

  @Bind()
  getHeaderButtons() {
    const {
      match,
      organizationId,
      resultsQuery: { header = {}, importHeader = {} },
      remote,
    } = this.props;
    const { routerParam } = this.state;
    const sourceFrom = 'RFX';
    const { sourceHeaderId } = match.params;
    let validHeader = {};
    if (routerParam.typeName === 'resultImportDetail') {
      validHeader = importHeader;
    } else {
      validHeader = header;
    }
    const buttons = [
      <ExcelExport
        requestUrl={`/ssrc/v1/${organizationId}/source/result/${sourceFrom}/${sourceHeaderId}/export`}
        name="export"
      />,
      <ExcelExportNew
        name="newExport"
        templateCode="SSRC_SOURCE_RESULT_EXPORT"
        requestUrl={`/ssrc/v1/${organizationId}/source/result/${sourceFrom}/${sourceHeaderId}/export`}
        buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
        icon="unarchive"
        otherButtonProps={{
          permissionList: [
            {
              code: `${this.props.match.path}.button.batch-export-new`.toLowerCase(),
              type: 'button',
              meaning:
                intl
                  .get(`${promptCode}.view.message.title.findSourceResultQuery`)
                  .d('寻源结果查询') - intl.get('hzero.common.export.new').d('(新)导出'),
            },
          ],
        }}
      />,
    ].filter(Boolean);
    const otherProps = {
      header: validHeader,
      that: this,
      rfxHeaderId: sourceHeaderId,
    };
    console.log(buttons, 'buttons');
    return remote
      ? remote.process('SSRC_RESULT_QUERY_DETAIL_HEADER_BUTTONS', buttons, otherProps)
      : buttons;
  }

  render() {
    const {
      organizationId,
      customizeTable,
      fetchresultsQueryLineLoading,
      fetchLadderLevelTableLoading,
      resultsQuery: {
        header = {},
        quoteLine = [],
        quoteLinePagination = {},
        importHeader = {},
        importQuoteLine = [],
        importQuoteLinePagination = {},
      },
      queryRfq: { quotaLadderLevelData },
      customizeBtnGroup,
    } = this.props;
    const {
      viewOnly,
      rfxBucketDirectory,
      collapseKeys = [],
      routerParam,
      viewLadderLevelVisible = false,
      LadderLevelHeaderData = {},
      doubleUnitFlag,
    } = this.state;
    let validHeader = {};
    let validQuoteLine = [];
    let validQoteLinePagination = {};
    if (routerParam.typeName === 'resultImportDetail') {
      validHeader = importHeader;
      validQuoteLine = importQuoteLine;
      validQoteLinePagination = importQuoteLinePagination;
    } else {
      validHeader = header;
      validQuoteLine = quoteLine;
      validQoteLinePagination = quoteLinePagination;
    }
    const DetailLineTableProps = {
      organizationId,
      customizeTable,
      quotationDetailFlag: routerParam.quotationDetailFlag,
      loading: fetchresultsQueryLineLoading,
      dataSource: validQuoteLine,
      pagination: validQoteLinePagination,
      handleResultsQueryLine: this.fetchResultsQueryLine,
      viewLadderLevel: this.viewLadderLevelModal,
      hideModal: this.hideLadderLevelModal,
      linktoPrNumDetail: this.linktoPrNumDetail,
      showQuotationDetail: this.showQuotationDetail,
      doubleUnitFlag,
    };
    const rfxAttachmentsProps = {
      viewOnly,
      tenantId: organizationId,
      bucketDirectory: rfxBucketDirectory,
      bucketName: PRIVATE_BUCKET,
      businessUuid: validHeader.businessAttachmentUuid,
      techUuid: validHeader.techAttachmentUuid,
    };

    // 阶梯报价弹窗props
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      hideModal: this.hideLadderLevelModal,
      loading: fetchLadderLevelTableLoading,
      doubleUnitFlag,
    };

    return (
      <React.Fragment>
        <Header
          title={intl
            .get(`${promptCode}.view.message.title.findSourceResultQuery`)
            .d('寻源结果查询')}
          backPath={this.renderParent()}
        >
          {customizeBtnGroup(
            { code: 'SSRC.RESULTS_QUERY.DETAIL_HEADER_BUTTON' },
            this.getHeaderButtons()
          )}
        </Header>
        <Content>
          <Spin
            spinning={fetchresultsQueryLineLoading}
            wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Collapse className="form-collapse" onChange={this.onCollapseChange}>
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    {this.renderHeaderTitle(validHeader)}
                    <a>
                      {collapseKeys.includes('queryResults')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('queryResults') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="queryResults"
              >
                {this.resultsTitleForm(validHeader)}
              </Panel>
            </Collapse>
          </Spin>
          {/* <Collapse bordered={false}>
            <Panel
              header={this.renderHeaderTitle(header)}
              key="queryResults"
              style={customPanelStyle}
            >
              {this.resultsTitleForm()}
            </Panel>
          </Collapse> */}
          <Tabs animated={false} className={styles.tabStyle}>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.tab.allQuotationDetails`).d('全部报价明细')}
              key="allQuoteLine"
            >
              <DetailLineTable {...DetailLineTableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`${promptCode}.view.message.tab.attachmentInfo`).d('附件列表')}
              key="rfxAttachmentList"
            >
              <Attachment {...rfxAttachmentsProps} />
            </TabPane>
          </Tabs>
        </Content>
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}
