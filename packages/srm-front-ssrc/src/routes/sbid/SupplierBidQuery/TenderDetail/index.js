/**
 * index - 查看招标书
 * @date: 2019-5-18
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import querystring from 'querystring';
import { Form, Col, Row, Spin, Icon, Tag, Tabs, Popover, Tooltip, Table } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import Upload from 'srm-front-boot/lib/components/Upload';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import { getCurrentOrganizationId } from 'utils/utils';
import { map, sum, isNumber, isEmpty } from 'lodash';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT, DEFAULT_DATE_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import classnames from 'classnames';
import common from '@/routes/sbid/common.less';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import TenderNoticeForm from '@/routes/sbid/components/Detail/TenderNoticeForm';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

const FormItem = Form.Item;
const formsLayouts = { labelCol: { span: 3 }, wrapperCol: { span: 20 } };
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
const promptCode = 'ssrc.supplierBidQuery';

@withCustomize({
  unitCode: [
    'SSRC.BID_QUERY_TENDER_DETAIL.HEADER',
    'SSRC.BID_QUERY_TENDER_DETAIL.ITEM_LINE',
    'SSRC.BID_QUERY_TENDER_DETAIL.ITEM_LINE_NONE',
    'SSRC.BID_QUERY_TENDER_DETAIL.OTHER_INFO',
  ],
})
@connect(({ supplierBidQuery, loading }) => ({
  supplierBidQuery,
  organizationId: getCurrentOrganizationId(),
  headerLoding: loading.effects['supplierBidQuery/fetchHeadDataList'],
  fetchQuotationDetailLoading: loading.effects['supplierBidQuery/fetchQuotationDetail'],
}))
@formatterCollections({
  code: ['ssrc.supplierBidQuery', 'ssrc.common', 'ssrc.supplierQuotation'],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
      sectionFlag: 0,
    };
  }

  form;

  componentDidMount() {
    this.querySupplier();
  }

  // 组件卸载清空数据
  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierBidQuery/updateState',
      payload: {
        supplierHolderList: {},
        quotationLines: [],
        itemQuotationDetail: [],
        QuotationDetailDataSource: {},
        itemQuotationPagination: {},
      },
    });
  }

  @Bind()
  querySupplier() {
    const {
      dispatch,
      organizationId,
      match: { params },
      location: { search = {} },
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    const { subjectMatterRule = '', quotationHeaderId } = routerParams;
    const { bidHeaderId, supplierCompanyId } = params;

    dispatch({
      type: 'supplierBidQuery/fetchHeadDataList',
      payload: {
        organizationId,
        bidHeaderId,
        quotationHeaderId,
        customizeUnitCode:
          'SSRC.BID_QUERY_TENDER_DETAIL.HEADER,SSRC.BID_QUERY_TENDER_DETAIL.OTHER_INFO',
      },
    });
    dispatch({
      type: 'supplierBidQuery/fetchItemsDataList',
      payload: {
        organizationId,
        bidHeaderId,
        supplierCompanyId,
        customizeUnitCode:
          subjectMatterRule === 'PACK'
            ? 'SSRC.BID_QUERY_TENDER_DETAIL.ITEM_LINE'
            : 'SSRC.BID_QUERY_TENDER_DETAIL.ITEM_LINE_NONE',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          sectionFlag: res.sectionFlag,
        });
      }
    });
  }

  @Bind()
  onExpand() {
    //
  }

  /**
   *  renderBidLineItemNum -  渲染物料行号
   *  @description 物料行号区分标段
   */
  @Bind()
  renderBidLineItemNum(val, record) {
    // 判断是否存在父标段行号
    if (record.parentSectionNum) {
      return `${record.parentSectionNum}.${val}`;
    } else {
      return val;
    }
  }

  /**
   * 基本信息
   * @param {*} supplierHolderList
   */
  @Bind()
  renderHeaderForm(supplierHolderList) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.BID_QUERY_TENDER_DETAIL.HEADER',
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidNum.`).d('招标编号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidNum', {
                initialValue: supplierHolderList.bidNum,
              })(<span>{supplierHolderList.bidNum}</span>)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidTitle`).d('招标事项')}
              {...formsLayouts}
            >
              {getFieldDecorator('bidTitle', {
                initialValue: supplierHolderList.bidTitle,
              })(<span>{supplierHolderList.bidTitle}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
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
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...EDIT_FORM_ITEM_LAYOUT}>
              {getFieldDecorator('companyName', {
                initialValue: supplierHolderList.companyName,
              })(<span>{supplierHolderList.companyName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBid.OrganizationName`).d('采购组织名称')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('purOrganizationName', {
                initialValue: supplierHolderList.purOrganizationName,
              })(<span>{supplierHolderList.purOrganizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
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
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidBond`).d('保证金')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidBond', {
                initialValue: supplierHolderList.bidBond,
              })(
                <span>
                  {numberSeparatorRender(supplierHolderList.bidBond) ||
                    intl.get(`${promptCode}.model.supplierBidQuery.free`).d('免费')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.bidOpenDate`).d('开标时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('bidOpenDate', {
                initialValue: supplierHolderList.bidOpenDate,
              })(<span>{supplierHolderList.bidOpenDate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
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
          {supplierHolderList.totalBudgetFlag === 1 && (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                label={intl.get('ssrc.bidHall.model.bidHall.totalBudget').d('预算金额')}
                {...EDIT_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('totalBudget', {
                  initialValue: supplierHolderList.totalBudget,
                })(<span>{supplierHolderList.totalBudget}</span>)}
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
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(supplierHolderList.businessAttachmentUuid)
                        ? undefined
                        : supplierHolderList.businessAttachmentUuid
                    }
                    tenantId={organizationId}
                    icon="download"
                    viewOnly
                    filePreview
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
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-bid-header"
                    attachmentUUID={
                      isEmpty(supplierHolderList.techAttachmentUuid)
                        ? undefined
                        : supplierHolderList.techAttachmentUuid
                    }
                    tenantId={organizationId}
                    icon="download"
                    viewOnly
                    filePreview
                  />
                )}
              </FormItem>
            </Col>
          )}
        </Row>
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderPreQualificationForm(supplierHolderList) {
    const { organizationId } = this.props;
    const { fileLength } = this.state;
    return (
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.supplierBidQuery.prequalEndDate`)
                .d('预审截止时间')}
              value={supplierHolderList.prequalEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.reviewMethod`).d('审查方式')}
              value={supplierHolderList.reviewMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.qualifiedLimit`).d('合格上限')}
              value={supplierHolderList.qualifiedLimit}
            />
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBid.preFileFee`).d('预审文件费')}
              value={
                supplierHolderList.fileFreeFlag === 1 ? 0 : supplierHolderList.prequalFileExpense
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.preFiles`).d('资格预审文件')}
              value={
                supplierHolderList.fileFreeFlag === 0 ? (
                  <React.Fragment>
                    <a onClick={this.openUploadModal} style={{ pointerEvents: 'none' }} disabled>
                      <Icon type="download" />
                      {intl.get('hzero.common.upload.view').d('查看附件')}
                    </a>
                    {fileLength > 0 ? (
                      <Tag
                        color="#108ee9"
                        style={{ height: 'auto', lineHeight: '15px', marginLeft: '4px' }}
                      >
                        {fileLength}
                      </Tag>
                    ) : null}
                  </React.Fragment>
                ) : (
                  <Upload
                    filePreview
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-prequal"
                    attachmentUUID={supplierHolderList.prequalAttachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    icon="download"
                  />
                )
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.supplierBidQuery.prequalRemark`)
                .d('资格预审备注')}
              value={supplierHolderList.prequalRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 其他信息
   * @param {*} supplierHolderList
   */
  renderOtherInfosForm(supplierHolderList) {
    const {
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    return customizeForm(
      {
        code: 'SSRC.BID_QUERY_TENDER_DETAIL.OTHER_INFO',
        form: this.props.form,
        dataSource: supplierHolderList,
      },
      <Form className="writable-row-custom">
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.projectNum`).d('项目编码')}
            >
              {getFieldDecorator('projectNum', {
                initialValue: supplierHolderList.projectNum,
              })(<span>{supplierHolderList.projectNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.projectName`).d('项目名称')}
            >
              {getFieldDecorator('projectName', {
                initialValue: supplierHolderList.projectName,
              })(<span>{supplierHolderList.projectName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.projectAddress`).d('项目地点')}
            >
              {getFieldDecorator('projectAddress', {
                initialValue: supplierHolderList.projectAddress,
              })(<span>{supplierHolderList.projectAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.paymentType`).d('付款方式')}
            >
              {getFieldDecorator('paymentType', {
                initialValue: supplierHolderList.paymentTypeName,
              })(<span>{supplierHolderList.paymentTypeName}</span>)}
            </FormItem>
          </Col>
          <Col span={16}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.paymentTerm`).d('付款条款')}
              {...formsLayouts}
            >
              {getFieldDecorator('paymentTerm', {
                initialValue: supplierHolderList.paymentTerm,
              })(<span style={{ marginLeft: '6%' }}>{supplierHolderList.paymentTerm}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.sourceStage`).d('招标阶段')}
            >
              {getFieldDecorator('sourceStage', {
                initialValue: supplierHolderList.sourceStage,
              })(<span>{supplierHolderList.sourceStageMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.currencyCode`).d('币种')}
            >
              {getFieldDecorator('currencyCode', {
                initialValue: supplierHolderList.currencyCode,
              })(<span>{supplierHolderList.currencyCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.exchangeRate`).d('汇率')}
            >
              {getFieldDecorator('exchangeRate', {
                initialValue: supplierHolderList.exchangeRate,
              })(<span>{supplierHolderList.exchangeRate}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.roundNumber`).d('轮次')}
            >
              {getFieldDecorator('roundNumber', {
                initialValue: supplierHolderList.roundNumber,
              })(<span>{supplierHolderList.roundNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.versionNumber`).d('版本')}
            >
              {getFieldDecorator('versionNumber', {
                initialValue: supplierHolderList.versionNumber,
              })(<span>{supplierHolderList.versionNumber}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.supplierBidQuery.maxBidNumber`).d('最大中标数')}
            >
              {getFieldDecorator('maxBidNumber', {
                initialValue: supplierHolderList.maxBidNumber,
              })(<span>{supplierHolderList.maxBidNumber}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.supplierBidQuery.explorationFlag`)
                .d('是否需要现场踏勘')}
            >
              {getFieldDecorator('explorationFlag', {
                initialValue: supplierHolderList.explorationFlag,
              })(<span>{yesOrNoRender(supplierHolderList.explorationFlag)}</span>)}
            </FormItem>
          </Col>
          {supplierHolderList.explorationFlag ? (
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem label={intl.get(`ssrc.common.explorationDate`).d('踏勘时间')}>
                {getFieldDecorator('explorationDate', {
                  initialValue: supplierHolderList.explorationDate,
                })(<span>{supplierHolderList.explorationDate}</span>)}
              </FormItem>
            </Col>
          ) : (
            ''
          )}
        </Row>
      </Form>
    );
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 渲染标段只读行信息
   * sectionItemLine
   */
  @Bind()
  renderSectionItemLine(children = []) {
    const { customizeTable = () => {} } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
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
        title: intl.get(`${promptCode}.model.supplierBidQuery.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.supplierBidQuery.inventoryOrg`).d('标底单价'),
      //   dataIndex: 'invOrganizationName',
      //   width: 100,
      //   align: 'right',
      // },
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
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_QUERY_TENDER_DETAIL.ITEM_LINE', // 单元编码，必传
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
   * 关闭报价模板
   *
   * @memberof Update
   */
  @Bind()
  closeQuotationData() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierBidQuery/updateState',
      payload: {
        QuotationDetailDataSource: {},
        itemQuotationDetail: [],
        itemQuotationPagination: {},
      },
    });
  }

  /**
   * 浮动文字tabs
   */
  @Bind()
  tooTipTabs = (item) => {
    return (
      <Tooltip title={`${item.sectionNum}--${item.sectionName}`} placement="topLeft">
        {intl.get(`${promptCode}.view.message.section`).d('标段')}
        {item.bidLineItemNum}
      </Tooltip>
    );
  };

  /**
   * 渲染标段tabs
   */
  @Bind()
  renderTabs() {
    const {
      supplierBidQuery: { supplierItemsList = [] },
    } = this.props;
    return (
      <div>
        <Tabs onChange={this.changeTabs} animated={false}>
          {/* 循环标段数据,渲染tabs标段 */}
          {map(supplierItemsList, (item) => {
            return (
              <Tabs.TabPane tab={this.tooTipTabs(item)} key={[item.bidLineItemId]}>
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
   * 供应商物品明细列表
   */
  categoryTable() {
    const {
      supplierBidQuery: { supplierItemsList = [] },
      customizeTable = () => {},
    } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.lineNo.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
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
        title: intl.get('ssrc.supplierQuotation.view.message.button.quotationTitle').d('报价明细'),
        dataIndex: 'quotationDetailFlag',
        width: 100,
        render: (val, record) => (
          <QuotationDetail rowData={record} sourceFrom="BID" allowSupplierViewFlag />
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
      },
      {
        title: intl.get(`${promptCode}.model.supplierBidQuery.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.supplierBidQuery.inventoryOrg`).d('标底单价'),
      //   dataIndex: 'invOrganizationName',
      //   width: 100,
      //   align: 'right',
      // },
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
    ];
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_QUERY_TENDER_DETAIL.ITEM_LINE_NONE', // 单元编码，必传
          },
          <EditTable
            bordered
            scroll={{ x: scrollWidth }}
            rowKey="bidLineItemId"
            columns={columns}
            dataSource={supplierItemsList}
            pagination={false}
            onExpand={this.onExpand}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const {
      supplierBidQuery: { supplierHolderList = {} },
      headerLoding,
    } = this.props;
    const { sectionFlag } = this.state;

    const tenderNoticeForm = {
      header: {
        ...supplierHolderList,
      },
      organizationId: supplierHolderList.tenantId,
    };

    return (
      <React.Fragment>
        <Header
          backPath="/ssrc/supplier-bid-query/list"
          title={intl.get(`${promptCode}.view.message.title.viewTenderBook`).d('查看招标书')}
        >
          <React.Fragment />
        </Header>
        <Content className={classnames(common['page-content-custom'], 'ued-detail-wrapper')}>
          <Spin
            spinning={headerLoding}
            // wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Tabs defaultActiveKey="baseInfos" animated={false}>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.baseInfos`).d('基本信息')}
                key="baseInfos"
              >
                {this.renderHeaderForm(supplierHolderList)}
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get(`${promptCode}.view.message.tab.otherInfos`).d('其他信息')}
                key="otherInfos"
                forceRender
              >
                {this.renderOtherInfosForm(supplierHolderList)}
              </Tabs.TabPane>
              {supplierHolderList.preQualificationFlag && (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.message.tab.preQualification`).d('资格预审')}
                  key="preQualification"
                  forceRender
                >
                  {this.renderPreQualificationForm(supplierHolderList)}
                </Tabs.TabPane>
              )}
              {(supplierHolderList.sourceMethod && supplierHolderList.sourceMethod === 'OPEN') ||
              supplierHolderList.sourceMethod === 'ALL_OPEN' ? (
                <Tabs.TabPane
                  tab={intl.get(`${promptCode}.view.tab.tenderNotice`).d('招标公告')}
                  key="tenderNotice"
                  forceRender
                >
                  <TenderNoticeForm {...tenderNoticeForm} />
                </Tabs.TabPane>
              ) : (
                ''
              )}
            </Tabs>
            <div style={{ marginTop: '24px' }}>
              {sectionFlag ? this.renderTabs() : this.renderNormalTabs()}
            </div>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
