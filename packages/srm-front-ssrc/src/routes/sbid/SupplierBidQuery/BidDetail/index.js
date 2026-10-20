/**
 * index - 查看投标书
 * @date: 20189-05-18
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Col, Row, Spin, Collapse, Icon, Popover, Tabs, Tooltip, Table } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { connect } from 'dva';
import moment from 'moment';
import classnames from 'classnames';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import querystring from 'querystring';
import { map, sum, isNumber, isEmpty, compose } from 'lodash';
import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  DEFAULT_DATE_FORMAT,
  EDIT_FORM_ROW_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import { PRIVATE_BUCKET } from '_utils/config';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { numberSeparatorRender } from '@/utils/renderer';
import TenderNoticeForm from '../../components/Detail/TenderNoticeForm';
import styles from './index.less';

const FormItem = Form.Item;
const { Panel } = Collapse;

const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

const promptCode = 'ssrc.supplierBidQuery';

class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const { supplierTenantId = '', subjectMatterRule } = querystring.parse(
      this.props.location.search.substr(1)
    );
    this.state = {
      collapseKeys: ['sectionInfo'], // 打开的折叠面板key
      HeaderCollapseKeys: ['baseInfos'], // 打开头不折叠面板Key
      sectionFlag: subjectMatterRule === 'PACK' ? 1 : 0,
      supplierTenantId,
    };
  }

  form;

  componentDidMount() {
    this.querySupplier();
  }

  // 组件卸载清空数据
  componentWillUnmount() {
    const { dispatch, modelName = 'supplierBidQuery' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationHeader: {},
        quotationLines: [],
      },
    });
  }

  @Bind()
  querySupplier(page = {}) {
    const { modelName = 'supplierBidQuery' } = this.props;
    const {
      dispatch,
      match: { params },
      [modelName]: { bidQuoPagination = {} },
      history: {
        location: { search = {} },
      },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { subjectMatterRule = '' } = routerParams;
    const { supplierTenantId } = this.state;
    const { quotationHeaderId } = params;
    // 投标头
    dispatch({
      type: `${modelName}/queryQuotationHeader`,
      payload: {
        supplierTenantId,
        quotationHeaderId,
        customizeUnitCode: 'SSRC.BID_QUERY_BID_DETAIL.HEADER_INFO',
      },
    });
    dispatch({
      type: `${modelName}/queryQuotationLines`,
      payload: {
        page: page || bidQuoPagination,
        quotationHeaderId,
        supplierTenantId,
        customizeUnitCode:
          subjectMatterRule === 'PACK'
            ? 'SSRC.BID_QUERY_BID_DETAIL.LINE'
            : 'SSRC.BID_QUERY_BID_DETAIL.LINE_NONE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          sectionFlag: res.sectionFlag,
        });
      }
    });
  }

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
   * onheaderCollapseChange - 头折叠面板onChange
   * @param {Array<string>} HeaderCollapseKeys - Panels key
   */
  @Bind()
  onheaderCollapseChange(HeaderCollapseKeys) {
    this.setState({
      HeaderCollapseKeys,
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 澄清答疑
   */
  @Bind()
  questionAnswer(supplierHolderList) {
    const {
      history,
      history: {
        location: { search = {} },
      },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { subjectMatterRule = '' } = routerParams;
    const searchData = querystring.stringify({
      bidNum: supplierHolderList.bidNum,
      bidTitle: supplierHolderList.bidTitle,
      bidHeaderId: supplierHolderList.bidHeaderId,
      flag: 1,
      subjectMatterRule,
    });
    history.push(
      `/ssrc/supplier-bid-query/question-answer/${supplierHolderList.quotationHeaderId}?${searchData}`
    );
  }

  /**
   * 只读物料行不分标段表格渲染
   * @returns {*}
   */
  @Bind()
  categoryTable() {
    const { modelName = 'supplierBidQuery' } = this.props;
    const {
      [modelName]: { quotationLines = [], bidQuoPagination = {} },
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.sbidStatus`).d('投标状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
          .d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        width: 100,
        render: (_, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.Quantitys`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.promdDate`).d('承诺交付日期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: <span>{intl.get(`${promptCode}.model.supplierBidQuery.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 100,
        render: (val) => {
          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-bidItem"
              attachmentUUID={val}
            />
          );
        },
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxExcludedPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.netAmount`).d('不含税总金额'),
        dataIndex: 'netAmount',
        width: 150,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.totalAmount`).d('总金额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_QUERY_BID_DETAIL.LINE_NONE', // 单元编码，必传
          },
          <Table
            bordered
            rowKey="bidLineItemId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={quotationLines}
            pagination={bidQuoPagination}
            onChange={(page) => this.querySupplier(page)}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 基本信息
   * @param {*} supplierHolderList
   */
  renderHeaderForm(supplierHolderList) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.BID_QUERY_BID_DETAIL.HEADER_INFO',
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidNum.`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', { initialValue: supplierHolderList.bidNum })(
                <span>{supplierHolderList.bidNum}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidTitle`).d('招标事项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTitle', { initialValue: supplierHolderList.bidTitle })(
                <span>{supplierHolderList.bidTitle}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidCompanyName`).d('招标公司')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('companyName', { initialValue: supplierHolderList.companyName })(
                <span>{supplierHolderList.companyName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidType`).d('招标类别')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidTypeMeaning', {
                initialValue: supplierHolderList.bidTypeMeaning,
              })(<span>{supplierHolderList.bidTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.startDates`).d('投标开始时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationStartDate', {
                initialValue: supplierHolderList.quotationStartDate,
              })(<span>{supplierHolderList.quotationStartDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.EndDate`).d('投标截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotationEndDate', {
                initialValue: supplierHolderList.quotationEndDate,
              })(<span>{supplierHolderList.quotationEndDate}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.currencyCode`).d('币种')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currencyCode', { initialValue: supplierHolderList.currencyCode })(
                <span>{supplierHolderList.currencyCode}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.evalMethod`).d('评标办法')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('evalMethodName', {
                initialValue: supplierHolderList.evalMethodName,
              })(<span>{supplierHolderList.evalMethodName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className={classnames(styles.rowNew, 'read-row')}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.paymentType`).d('付款方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTypeName', {
                initialValue: supplierHolderList.paymentTypeName,
              })(<span>{supplierHolderList.paymentTypeName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.paymentTerm`).d('付款条款')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('paymentTerm', { initialValue: supplierHolderList.paymentTerm })(
                <span>{supplierHolderList.paymentTerm}</span>
              )}
            </FormItem>
          </Col>
          {supplierHolderList.totalBudgetFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`${promptCode}.model.supplierBidQuery.totalBudget`).d('预算金额')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('totalBudget', { initialValue: supplierHolderList.totalBudget })(
                  <span>{numberSeparatorRender(supplierHolderList.totalBudget)}</span>
                )}
              </FormItem>
            </Col>
          )}
          {supplierHolderList.businessAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.bidusinessFile`).d('招标商务文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('businessAttachmentUuid', {
                  initialValue: supplierHolderList.businessAttachmentUuid,
                })(
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(supplierHolderList.businessAttachmentUuid)
                        ? undefined
                        : supplierHolderList.businessAttachmentUuid
                    }
                    tenantId={organizationId}
                    viewOnly
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          )}
          {supplierHolderList.techAttachmentFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.bidHall.model.bidHall.bidTechFile`).d('招标技术文件')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('techAttachmentUuid', {
                  initialValue: supplierHolderList.techAttachmentUuid,
                })(
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(supplierHolderList.techAttachmentUuid)
                        ? undefined
                        : supplierHolderList.techAttachmentUuid
                    }
                    tenantId={organizationId}
                    viewOnly
                    icon="download"
                  />
                )}
              </FormItem>
            </Col>
          )}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.supplierBidQuery.techAttachments`)
                .d('投标技术文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currentTechAttachmentUuid', {
                initialValue: supplierHolderList.currentTechAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={supplierHolderList.currentTechAttachmentUuid}
                  tenantId={organizationId}
                  viewOnly
                  icon="download"
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.supplierBidQuery.BusinessAttachment`)
                .d('投标商务文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('currentBusinessAttachmentUuid', {
                initialValue: supplierHolderList.currentBusinessAttachmentUuid,
              })(
                <Upload
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-quotationheader"
                  attachmentUUID={supplierHolderList.currentBusinessAttachmentUuid}
                  tenantId={organizationId}
                  viewOnly
                  icon="download"
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.supplierBidQuery.preAttachments`)
                .d('资格预审文件')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalAttachmentUuid', {
                initialValue: supplierHolderList.prequalAttachmentUuid,
              })(
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-prequal"
                  attachmentUUID={supplierHolderList.prequalAttachmentUuid}
                  tenantId={organizationId}
                  viewOnly
                  icon="download"
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.clearAnswer`).d('澄清答疑')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('clearAnswer')(
                <a onClick={() => this.questionAnswer(supplierHolderList)}>
                  {intl.get('hzero.common.button.view').d('查看')}
                </a>
              )}
            </FormItem>
          </Col>
          {supplierHolderList.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.supplierExplorationStatus`).d('是否踏勘')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('supplierExplorationStatusMeaning', {
                  initialValue: supplierHolderList.supplierExplorationStatusMeaning,
                })(<span>{supplierHolderList.supplierExplorationStatusMeaning}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
          {supplierHolderList.supplierExplorationStatus === 'EXPLORED' ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get(`ssrc.common.supplierExplorationDate`).d('踏勘日期')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('supplierExplorationDate', {
                  initialValue: supplierHolderList.supplierExplorationDate,
                })(<span>{supplierHolderList.supplierExplorationDate}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('quotationRemark', {
                initialValue: supplierHolderList.quotationRemark,
              })(<span>{supplierHolderList.quotationRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const { modelName = 'supplierBidQuery' } = this.props;
    const {
      [modelName]: { quotationLines = [] },
    } = this.props;
    return (
      <div>
        <Tabs onChange={this.changeTabs} animated={false}>
          {/* 循环标段数据,渲染tabs标段 */}
          {map(quotationLines, (item) => {
            return (
              <Tabs.TabPane tab={this.tooTipTabs(item)} key={[item.bidLineItemId]}>
                {/* 渲染标段头只读信息 */}
                {this.renderSectionHeader(item)}
                {/* 渲染标段物料行只读信息 */}
                <div>{this.renderSectionItemLine(item.children)}</div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    );
  }

  /**
   * 渲染不区分标段tabs
   */
  @Bind()
  renderNormalTabs() {
    return <div>{this.categoryTable()}</div>;
  }

  /**
   * 渲染标段只读头信息
   * sectionHeader
   */
  @Bind()
  renderSectionHeader(item) {
    const { collapseKeys } = this.state;
    const { organizationId } = this.props;
    return (
      <Collapse
        className="form-collapse"
        defaultActiveKey={['sectionInfo']}
        onChange={this.onCollapseChange}
      >
        <Panel
          showArrow={false}
          header={
            <Fragment>
              <h3>
                {intl.get(`${promptCode}.view.message.panel.sectionItemLineInfo`).d('标段信息')}
              </h3>
              <a>
                {collapseKeys.includes('sectionInfo')
                  ? intl.get(`hzero.common.button.up`).d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
              </a>
              <Icon type={collapseKeys.includes('sectionInfo') ? 'up' : 'down'} />
            </Fragment>
          }
          key="sectionInfo"
        >
          <Form>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.sectionNum`)
                    .d('标段/包编号')}
                  value={item.sectionNum}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.sectionName`)
                    .d('标段/包名称')}
                  value={item.sectionName}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`${promptCode}.model.supplierBidQuery.demandDate`).d('需求日期')}
                  value={item.demandDate && moment(item.demandDate).format(DEFAULT_DATE_FORMAT)}
                />
              </Col>
            </Row>
            <Row gutter={48} className="read-row" {...EDIT_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.sectionAmount`)
                    .d('标段/包总金额')}
                  value={item.sectionAmount}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.Attachmenting`)
                    .d('标段/包投标文件')}
                  value={
                    <Upload
                      filePreview
                      bucketName={PRIVATE_BUCKET}
                      bucketDirectory="ssrc-rfx-quotationline"
                      attachmentUUID={item.currentAttachmentUuid}
                      tenantId={organizationId}
                      viewOnly
                      icon="download"
                    />
                  }
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl
                    .get(`${promptCode}.model.supplierBidQuery.abandonedFlag`)
                    .d('是否放弃')}
                  value={yesOrNoRender(item.abandonedFlag)}
                />
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>
    );
  }

  /**
   * 渲染标段只读行信息
   * sectionItemLine
   */
  @Bind()
  renderSectionItemLine(children = []) {
    const { customizeTable } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.sbidStatus`).d('投标状态'),
        dataIndex: 'quotationLineStatusMeaning',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationStartValidTime`)
          .d('报价有效日期从'),
        dataIndex: 'quotationExpiryDateFrom',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        title: intl
          .get(`${promptCode}.model.supplierBid.quotationEndValidTime`)
          .d('报价有效日期至'),
        dataIndex: 'quotationExpiryDateTo',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATETIME_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemCategory`).d('物品分类'),
        dataIndex: 'categoryName',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
        width: 100,
        render: (_, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowBuyerViewFlag />
        ),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.Quantitys`).d('可供数量'),
        dataIndex: 'currentQuotationQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxIncludedPrice`).d('单价(含税)'),
        dataIndex: 'currentQuotationPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.deliveryDay`).d('供货周期(天)'),
        dataIndex: 'currentDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.promdDate`).d('承诺交付日期'),
        dataIndex: 'currentPromisedDate',
        width: 150,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => yesOrNoRender(val),
      },
      {
        title: <span>{intl.get(`${promptCode}.model.supplierBidQuery.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxExcludedPrice`).d('单价(不含税)'),
        dataIndex: 'netPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.netAmount`).d('不含税总金额'),
        dataIndex: 'netAmount',
        width: 180,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.taxAmount`).d('税额'),
        dataIndex: 'taxAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.totalAmount`).d('总金额'),
        dataIndex: 'totalAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'currentQuotationRemark',
        width: 200,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_QUERY_BID_DETAIL.LINE', // 单元编码，必传
          },
          <Table
            bordered
            rowKey="bidLineItemId"
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={children}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  tooTipTabs = (item) => {
    return (
      <Tooltip title={`${item?.sectionNum}--${item?.sectionName}`} placement="topLeft">
        {intl.get(`${promptCode}.view.message.section`).d('标段')}
        {item.bidLineItemNum}
      </Tooltip>
    );
  };

  /**
   * 返还路径渲染
   */
  @Bind()
  parentRender() {
    const {
      location: { search },
    } = this.props;
    const {
      source,
      bidId,
      isPub,
      historyTag,
      cachTabKey,
      backRecommend,
      RFXDetail,
      sourceType,
    } = querystring.parse(search.substr(1));
    let url;
    if (source === 'bid-hall') {
      url = `/ssrc/expert-scoring/confirm-bid-candidate/${bidId}?historyTag=${historyTag}&cachTabKey=${cachTabKey}&backRecommend=${backRecommend}`;
    } else if (isPub) {
      url = null;
    } else if (source === 'expert-scoring.bid-detail') {
      // 这是人能设计出来的???
      url = `/ssrc/expert-scoring/bid-detail/${RFXDetail}?backRecommend=${backRecommend}&source=${sourceType}`;
    } else {
      url = '/ssrc/supplier-bid-query/list';
    }
    return url;
  }

  render() {
    const { modelName = 'supplierBidQuery' } = this.props;
    const {
      [modelName]: { supplierHolderList = {} },
      headerLoding,
    } = this.props;
    const { HeaderCollapseKeys = [], sectionFlag } = this.state;
    const tenderNoticeForm = {
      header: {
        ...supplierHolderList,
      },
      organizationId: supplierHolderList.tenantId,
    };

    return (
      <React.Fragment>
        <Header
          backPath={this.parentRender()}
          title={intl.get(`${promptCode}.view.message.title.viewBidBook`).d('查看投标书')}
        >
          <React.Fragment />
        </Header>
        <Content>
          <Spin spinning={headerLoding} wrapperClassName={classnames('ued-detail-wrapper')}>
            <Collapse
              className="form-collapse"
              onChange={this.onheaderCollapseChange}
              defaultActiveKey={['baseInfos']}
            >
              <Panel
                showArrow={false}
                header={
                  <Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.info`).d('基本信息')}</h3>
                    <a>
                      {HeaderCollapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={HeaderCollapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </Fragment>
                }
                key="baseInfos"
              >
                {this.renderHeaderForm(supplierHolderList)}
              </Panel>
              {(supplierHolderList.sourceMethod && supplierHolderList.sourceMethod === 'OPEN') ||
              supplierHolderList.sourceMethod === 'ALL_OPEN' ? (
                <Panel
                  showArrow={false}
                  header={
                    <Fragment>
                      <h3>{intl.get(`${promptCode}.view.tab.tenderNotice`).d('招标公告')}</h3>
                      <a>
                        {HeaderCollapseKeys.includes('noticeInfos')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={HeaderCollapseKeys.includes('noticeInfos') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="noticeInfos"
                >
                  <TenderNoticeForm {...tenderNoticeForm} />
                </Panel>
              ) : (
                ''
              )}
            </Collapse>
            <div>{sectionFlag ? this.renderTabs() : this.renderNormalTabs()}</div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}

const hocComponent = (com) =>
  compose(
    withCustomize({
      unitCode: [
        'SSRC.BID_QUERY_BID_DETAIL.LINE',
        'SSRC.BID_QUERY_BID_DETAIL.LINE_NONE',
        'SSRC.BID_QUERY_BID_DETAIL.HEADER_INFO',
      ],
    }),
    connect(({ supplierBidQuery, loading }) => ({
      supplierBidQuery,
      modelName: 'supplierBidQuery',
      organizationId: getCurrentOrganizationId(),
      headerLoding: loading.effects['supplierBidQuery/queryQuotationHeader'],
    })),
    formatterCollections({
      code: ['ssrc.supplierBidQuery', 'ssrc.bidHall', 'ssrc.supplierQuotation'],
    }),
    Form.create({ fieldNameProp: null })
  )(com);
export default hocComponent(Detail);
export { hocComponent, Detail };
