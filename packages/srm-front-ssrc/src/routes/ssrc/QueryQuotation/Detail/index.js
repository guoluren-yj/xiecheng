/**
 * index - 报价查询页
 * @date: 2018-12-29
 * @author: njq <jiangqi.nan@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Col, Row, Spin, Tabs, Modal, Collapse, Icon, Tag, Popover, Table } from 'hzero-ui';
import uuidv4 from 'uuid/v4';
import { connect } from 'dva';
import querystring from 'querystring';
import { Bind, Debounce } from 'lodash-decorators';
// import moment from 'moment';
import { isNumber, sum, compose } from 'lodash';
import remoteHoc from 'hzero-front/lib/utils/remote';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { queryFileList } from 'services/api';
import { numberRender, yesOrNoRender, dateTimeRender, dateRender } from 'utils/renderer';
import {
  BID,
  getQuotationName,
  getDocumentTypeName,
  getCategoryCode,
} from '@/utils/globalVariable';
import {
  getCurrentOrganizationId,
  getResponse,
  tableScrollWidth,
  filterNullValueObject,
} from 'utils/utils';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';
import QuotationDirectLable from '@/utils/constants';
import { isPubPage, getTabKey } from '@/utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import classnames from 'classnames';
import { numberSeparatorRender, roundEliminate } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import styles from './index.less';
// import Iconfont from '../../components/Icons' // 下载至本地的icon
import Attachment from '../../components/Attachment';
import LadderLevel from '../../components/LadderLevel';
import FeedBackBarginHistoryModal from './FeedBackBarginHistoryModal';

const FormItem = Form.Item;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const promptCode = `ssrc.queryQuotation`;

class Detail extends PureComponent {
  constructor(props) {
    super(props);

    const routerParams = querystring.parse(props.location.search.substr(1));
    const {
      noBackFlag,
      historyTag = '',
      backRecommend = '',
      sourcePage = '',
      cachTabKey = '',
      sourceFrom = '',
      sourceHeaderId = '',
      quotationHeaderId = null,
      isPub = false,
      RFXDetail = null,
      sourceStatus = '',
    } = routerParams;

    /*
     **state.feedBackBarginHistoryStatus还比价历史模态框显示/隐藏
     **state.feedBackBarginHistorySearch还比价历史查询条件
     */
    this.state = {
      backRecommend, // 专家评分跳转标记
      historyTag, // 标记由查看历史评分页面跳入，控制按钮输入框不可填
      noBackFlag, // 判断是不是从寻源项目跳转到详情页
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      RFXDetail, // 寻源明细调准
      quotationHeaderId,
      previewVisible: false, // 打开查看附件模态框
      viewOnly: true, // 附件只读标识
      bucketDirectory: 'ssrc-rfx-quotationheader',
      rfxBucketDirectory: 'ssrc-rfx-rfxheader',
      feedBackBarginHistoryStatus: false,
      feedBackBarginHistorySearch: null,
      viewLadderLevelVisible: false, // 阶梯报价模态框
      LadderLevelHeaderData: {}, // 阶梯报价头部数据
      fileLength: 0, // 资格预审文件个数，用于付费情况下只读展示
      collapseKeys: [], // 打开的折叠面板key
      sourcePage, // 页面跳转来源
      isPub, // 工作流路径判断
      sourceStatus, // 评分状态
      loading: false, // page operation loading
    };
    this.bidFlag = props.sourceKey === BID;
    this.custKey = this.bidFlag ? 'BID_' : '';
    this.quotationName = getQuotationName(this.bidFlag);
    this.categoryCode = getCategoryCode(this.bidFlag);
    this.documentTypeName = getDocumentTypeName(this.bidFlag);
  }

  form;

  componentDidMount() {
    this.querySupplier();
  }

  componentWillUnmount() {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationRoundQuotationInfo: [],
      },
    });
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { supplierQutQueryList = {} },
      organizationId,
    } = nextProps;
    const { prequalAttachmentUuid = '' } = supplierQutQueryList || {};
    const pre = this.props && this.props[modelName]?.supplierQutQueryList?.prequalAttachmentUuid;
    if (prequalAttachmentUuid && prequalAttachmentUuid !== pre) {
      queryFileList({
        organizationId,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-prequal',
        attachmentUUID: prequalAttachmentUuid,
      }).then((fileList) => {
        if (getResponse(fileList)) {
          this.setState({
            fileLength: fileList?.length || 0,
          });
        }
      });
    }
  }

  toggleLoading = (loading = false) => {
    this.setState({
      loading,
    });
  };

  /**
   * 查询供应商-全部数据
   * @cux 乐成教育
   */
  @Bind()
  querySupplier(page = {}) {
    const {
      dispatch,
      organizationId,
      match: { params },
      modelName = 'supplierQuotation',
    } = this.props;
    const { quotationHeaderId = null } = this.state;
    const routerParams = querystring.parse(this.props.location.search.substr(1));

    const { supplierTenantId, switchUrl = 0 } = routerParams;
    const { rfxId, companyId = null } = params;
    dispatch({
      type: `${modelName}/fetchHeadDataList`,
      payload: {
        organizationId,
        rfxHeaderId: rfxId,
        routerFrom: 'quotationQuery',
        quotationHeaderId,
        supplierCompanyId: companyId,
        customizeUnitCode: `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.BASE_FORM,SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.OTHERS_FORM,SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.PRELIMINARY_QUALIFICATION`,
        switchUrl,
      },
    }).then((res) => {
      if (res) {
        this.fetchRoundQuotationInfo(res);
      }
    });

    const data = {
      page,
      organizationId,
      supplierTenantId,
      rfxHeaderId: rfxId,
      switchUrl,
      supplierCompanyId: companyId,
      quotationHeaderId,
      routerFrom: 'quotationQuery',
      customizeUnitCode:
        Number(switchUrl) === 1
          ? `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.QUOTATION_LINE`
          : `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.ITEM_LINE`,
    };
    if (companyId === 'null' || !companyId) {
      // router pass companyId is string null, not object
      delete data.supplierCompanyId;
    }
    dispatch({
      type: `${modelName}/fetchItemsDataList`,
      payload: data,
    });
  }

  /**
   * 查询多轮报价信息
   */
  @Bind()
  fetchRoundQuotationInfo() {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    const { quotationHeaderId } = this.state;

    dispatch({
      type: `${modelName}/quotationRoundQuotationInfo`,
      payload: {
        quotationHeaderId,
        purchaserRequestFlag: 1, // 采购方标识
        customizeUnitCode: `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.ROUND_QUOTATION_LINE`,
      },
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

  // 打开头附件模态框
  @Bind()
  checkAttachment() {
    this.setState({
      previewVisible: true,
    });
  }

  // 关闭头附件模态框
  @Bind()
  hideAttachmentsProps() {
    this.setState({
      previewVisible: false,
    });
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
      type: 'inquiryHall/fetchLadderLevelTable',
      payload: { quotationLineId, organizationId },
    });
  }

  /**
   * hideLadderLevelModal - 关闭阶梯报价弹窗
   */
  @Bind()
  hideLadderLevelModal() {
    this.setState({ viewLadderLevelVisible: false });
    this.props.dispatch({
      type: 'inquiryHall/updateState',
      payload: {
        quotaLadderLevelData: [],
      },
    });
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  // 还比价历史
  @Bind()
  onComparePriceHistory(record) {
    const {
      match: {
        params: { rfxId },
      },
    } = this.props;
    const { quotationLineId, supplierCompanyName, itemCode, itemName } = record;
    this.setState({
      feedBackBarginHistorySearch: {
        rfxId,
        quotationLineId,
        supplierCompanyName,
        itemCode,
        itemName,
      },
      feedBackBarginHistoryStatus: true,
    });
  }

  // 当前供应商分类表格
  categoryTable() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      organizationId,
      form,
      [modelName]: {
        supplierQutItemsList = [],
        supplierQutItemsPagination = {},
        supplierQutQueryList = {},
      },
      customizeTable = () => {},
      // eslint-disable-next-line no-shadow
      remote = false,
    } = this.props;
    const routerParams = querystring.parse(this.props.location.search.substr(1));
    const { switchUrl = 0 } = routerParams;

    const {
      roundQuotationRankFlag,
      currentQuotationRound,
      priceTypeCode = null,
      quotationRoundFlag = 0,
    } = supplierQutQueryList || {};
    const { getFieldDecorator = (e) => e } = form;
    const otherProps = {
      querySupplier: this.querySupplier,
      bidFlag: this.bidFlag,
      headerData: supplierQutQueryList,
      that: this,
    };
    const isPurchase = quotationRoundFlag && Number(switchUrl) === 2;
    const remoteColumns = [
      {
        title: intl.get(`${promptCode}.model.queryQuotation.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        fixed: 'left',
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 250,
        fixed: 'left',
        render: (val, record) => roundEliminate(val, record),
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.lastRank`).d('上一轮排名'),
            dataIndex: 'autoRoundRank',
            width: 120,
          }
        : null,
      {
        title: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      !isPurchase && {
        title: intl.get(`${promptCode}.model.queryQuotation.quotationDetail`).d('报价明细'),
        width: 100,
        dataIndex: 'quotationDetailFlag',
        render: (val, record) => (
          <React.Fragment>
            {
              <QuotationDetail
                rowData={record}
                sourceFrom="RFX"
                allowBuyerViewFlag
                bidFlag={this.bidFlag}
              />
            }
          </React.Fragment>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.rfxQuantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.availableQuantity`).d('可供数量'),
        dataIndex: 'validQuotationQuantity',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.completedFlag`).d('完成标识'),
        dataIndex: 'finishedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('finishedFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
            </Form.Item>
          ) : (
            <span>{yesOrNoRender(val)}</span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.cancelFlag`).d('取消标识'),
        dataIndex: 'abandonedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('abandonedFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
            </Form.Item>
          ) : (
            <span>{yesOrNoRender(val)}</span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.choose`).d('选用'),
        dataIndex: 'suggestedFlag',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('suggestedFlag', {
                initialValue: val,
              })(<Checkbox checkedValue={1} unCheckedValue={0} disabled />)}
            </Form.Item>
          ) : (
            <span>{yesOrNoRender(val)}</span>
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.sucBidQuantity`).d('中标数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: (
          <span>
            {priceTypeCode === 'NET_PRICE'
              ? intl
                  .get(`${promptCode}.model.queryQuotation.successfulBidAmountNet`)
                  .d('中标金额(不含税)')
              : intl
                  .get(`${promptCode}.model.queryQuotation.successfulBidAmountTaxIn`)
                  .d('中标金额(含税)')}
          </span>
        ),
        align: 'right',
        dataIndex: 'bidPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.completeRound`).d('完结轮次'),
        dataIndex: 'finishedRoundNumber',
        width: 100,
      },
      {
        title: intl
          .get(`${promptCode}.model.queryQuotation.commonBaojiaDescrible`, {
            quotationName: this.quotationName,
          })
          .d(`${this.quotationName}说明`),
        dataIndex: 'validQuotationRemark',
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
      !isPurchase && {
        title: intl.get(`${promptCode}.model.queryQuotation.ladderLevel`).d('阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 100,
        render: (_, record) =>
          record.ladderInquiryFlag === 1 ? (
            <a onClick={() => this.viewLadderLevelModal(record)}>
              {intl.get(`${promptCode}.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val) => (
          <FormItem>
            {getFieldDecorator('taxIncludedFlag', {
              initialValue: val,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: <span>{intl.get(`${promptCode}.model.queryQuotation.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        align: 'right',
        dataIndex: 'validQuotationPrice',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        align: 'right',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineAmount`).d('行金额'),
        dataIndex: 'totalAmount',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.netAmount`).d('行金额(不含税)'),
        dataIndex: 'netAmount',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.includingFreight`).d('是否含运费'),
        dataIndex: 'freightIncludedFlag',
        width: 150,
        render: (val) => (
          <FormItem>
            {getFieldDecorator('freightIncludedFlag', {
              initialValue: val,
            })(<Checkbox disabled />)}
          </FormItem>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.validCounterBid`).d('有效还价理由'),
        dataIndex: 'validBargainRemark',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get('ssrc.common.productionPlace').d('产地'),
        dataIndex: 'origin',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.validFrom`).d('报价有效期从'),
        dataIndex: 'validExpiryDateFrom',
        width: 150,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.quotationValidityTo`).d('报价有效期至'),
        dataIndex: 'validExpiryDateTo',
        width: 150,
        render: (value) => dateRender(value),
      },
      {
        title: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        dataIndex: 'validDeliveryCycle',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
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
        title: intl.get(`${promptCode}.model.queryQuotation.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
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
        title: intl
          .get(`${promptCode}.model.queryQuotation.commonRFxAttachment`, {
            documentTypeName: this.documentTypeName,
          })
          .d('{documentTypeName}附件'),
        dataIndex: 'attachmentUuid',
        width: 180,
        render: (val) =>
          val ? (
            <Upload
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              attachmentUUID={val}
              tenantId={organizationId}
              viewOnly
              filePreview
            />
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.supplierAttach`).d('供应商行附件'),
        dataIndex: 'supplierAttachmentUuid',
        width: 180,
        render: (val) =>
          val ? (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              attachmentUUID={val}
              tenantId={organizationId}
            />
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`${promptCode}.model.queryQuotation.history`).d('还比价历史'),
        dataIndex: 'comparePriceHistory',
        width: 150,
        render: (_, record) =>
          record.quotationLineId !== null ? (
            <a onClick={() => this.onComparePriceHistory(record)}>
              {intl.get(`${promptCode}.view.message.button.toView`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
      {
        title: intl
          .get(`${promptCode}.model.supQuo.commonQuotationHistory`, {
            quotationName: this.quotationName,
          })
          .d(`${this.quotationName}历史`),
        width: 100,
        dataIndex: 'quotationHistory',
        fixed: 'right',
        render: (_, record) => (
          <Popover
            trigger="click"
            placement="topLeft"
            onVisibleChange={this.onVisibleChange}
            content={this.renderHistoryTable(record)}
            title={intl
              .get(`${promptCode}.model.supQuo.commonQuotationHistory`, {
                quotationName: this.quotationName,
              })
              .d(`${this.quotationName}历史`)}
          >
            {Number(record.roundFlag) === 1 ? (
              <a onClick={() => this.fetchHistoryline(record.quotationLineId, record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ) : (
              ''
            )}
          </Popover>
        ),
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process('PROCESS_TABLE_COLUMNS', remoteColumns, otherProps)
      : remoteColumns;
    const scrollWidth = this.scrollWidth(columns, 80);
    return (
      <React.Fragment>
        {customizeTable(
          {
            code:
              Number(switchUrl) === 1
                ? `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.QUOTATION_LINE`
                : `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.ITEM_LINE`,
            readOnly: true,
          },
          <EditTable
            bordered
            scroll={{ x: scrollWidth, y: 450 }}
            rowKey="categoryId"
            columns={columns}
            dataSource={supplierQutItemsList}
            pagination={supplierQutItemsPagination}
            onChange={(page) => this.querySupplier(page)}
          />
        )}
      </React.Fragment>
    );
  }

  /**
   * renderHistoryTable -  多轮报价历史列表
   */
  @Bind()
  renderHistoryTable(record) {
    // const { roundFlag = '0' } = this.state;
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      queryRoundQuotationLineDetailLoading,
      [modelName]: { roundQuotationLineDetail = [], supplierQutQueryList = {} },
    } = this.props;
    const { roundQuotationRankFlag, currentQuotationRound } = supplierQutQueryList;
    const roundColumns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'quotationRoundNumber',
        width: 80,
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
            dataIndex: 'roundRank',
            width: 100,
          }
        : null,
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationTime`).d('报价时间'),
        dataIndex: 'quotedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotedByName`, {
            quotationName: this.quotationName,
          })
          .d(`${this.quotationName}人`),
        dataIndex: 'realName',
        width: 100,
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
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.taxQuotationAmount`).d('行金额(含税)'),
        dataIndex: 'quotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxQuotationAmount`)
          .d('行金额(不含税)'),
        dataIndex: 'netQuotationAmount',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationQuantity`).d('数量'),
        dataIndex: 'quotationQuantity',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.supplierQuotation.model.supplierBidQuery.taxPrice`).d('单价(含税)'),
        dataIndex: 'quotationPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supplierBidQuery.noTaxPrice`)
          .d('单价(不含税)'),
        dataIndex: 'validNetPrice',
        width: 100,
        align: 'right',
      },
    ].filter(Boolean);
    return (
      <Spin spinning={queryRoundQuotationLineDetailLoading}>
        {Number(record.roundFlag) === 1 ? (
          <div style={{ marginTop: '16px', marginBottom: '4px' }}>
            <span>
              {intl
                .get(`${promptCode}.model.queryQuotation.commonRoundHistory`, {
                  quotationName: this.quotationName,
                })
                .d(`多轮${this.quotationName}历史`)}
            </span>
            <Table
              bordered
              scroll={{ x: tableScrollWidth(roundColumns) }}
              columns={roundColumns}
              rowKey={uuidv4()}
              dataSource={roundQuotationLineDetail || []}
              pagination={false}
            />
          </div>
        ) : null}
      </Spin>
    );
  }

  /**
   * 关闭报价历史弹框
   *
   * @memberof InquiryPrice
   */
  @Bind()
  onVisibleChange = (visible = false) => {
    if (visible === true) {
      return;
    }

    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        quotationLineDetail: {},
        roundQuotationLineDetail: [],
      },
    });
  };

  /**
   * 查询单个物品报价历史
   */
  @Bind()
  fetchHistoryline(quotationLineId = '', record = {}) {
    // 查询多轮报价历史接口
    this.fetchRoundQuotationList(quotationLineId, record);
  }

  /**
   * 查找多轮报价
   *
   * @param {*} [data={}]
   * @memberof InquiryPrice
   */
  fetchRoundQuotationList = (quotationLineId = '', record = {}) => {
    const { dispatch, modelName = 'supplierQuotation' } = this.props;
    const { quotationHeaderId = null } = this.state;
    const { quotationRoundNumber = 0, purchaserRequestFlag = 0 } = record || {};
    dispatch({
      type: `${modelName}/queryRoundQuotationLineDetail`,
      payload: {
        quotationLineId,
        quotationHeaderId,
        quotationRoundNumber,
        purchaserRequestFlag,
      },
    });
  };

  getHeaderFormFields = (supplierQutQueryList = {}) => {
    const {
      form,
      form: { getFieldDecorator },
      remote,
    } = this.props;

    const currentFields = [
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`${promptCode}.model.queryQuotation.commonRFxNo.`, {
                categoryCode: this.categoryCode,
              })
              .d('{categoryCode}单号')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rfxNum', {
              initialValue: supplierQutQueryList.rfxNum,
            })(<span>{supplierQutQueryList.rfxNum}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`${promptCode}.model.queryQuotation.commonInquiryTitle`, {
                documentTypeName: this.documentTypeName,
              })
              .d('{documentTypeName}标题')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rfxTitle', {
              initialValue: supplierQutQueryList.rfxTitle,
            })(<span>{supplierQutQueryList.rfxTitle}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`${promptCode}.model.queryQuotation.customer`).d('客户')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('companyName', {
              initialValue: supplierQutQueryList.companyName,
            })(<span>{supplierQutQueryList.companyName}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`${promptCode}.model.queryQuotation.sourcingCategory`).d('寻源类别')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('sourceCategoryMeaning', {
              initialValue: supplierQutQueryList.sourceCategoryMeaning,
            })(
              <span>
                {supplierQutQueryList.secondarySourceCategoryMeaning ||
                  supplierQutQueryList.sourceCategoryMeaning}
              </span>
            )}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`${promptCode}.model.queryQuotation.currency`).d('币种')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('currencyCode', {
              initialValue: supplierQutQueryList.currencyCode,
            })(<span>{supplierQutQueryList.currencyCode}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`${promptCode}.model.queryQuotation.exchangeRate`).d('汇率')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('exchangeRate', {
              initialValue: supplierQutQueryList.exchangeRate,
            })(<span>{numberRender(supplierQutQueryList.exchangeRate, 8, false)}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem label={<QuotationDirectLable />} {...EDIT_FORM_ITEM_LAYOUT}>
            {getFieldDecorator('auctionDirectionMeaning', {
              initialValue: supplierQutQueryList.auctionDirectionMeaning,
            })(<span>{supplierQutQueryList.auctionDirectionMeaning}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`${promptCode}.model.queryQuotation.commonQuotationStartTime`, {
                quotationName: this.quotationName,
              })
              .d(`${this.quotationName}开始时间`)}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('quotationStartDate', {
              initialValue: supplierQutQueryList.quotationStartDate,
            })(<span>{dateTimeRender(supplierQutQueryList?.quotationStartDate)}</span>)}
          </FormItem>
        </Col>
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl
              .get(`${promptCode}.model.queryQuotation.commonQuotationDeadline`, {
                quotationName: this.quotationName,
              })
              .d('{quotationName}截止时间')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('quotationEndDate', {
              initialValue: supplierQutQueryList.quotationEndDate,
            })(<span>{dateTimeRender(supplierQutQueryList.quotationEndDate)}</span>)}
          </FormItem>
        </Col>
      </Row>,
      <Row gutter={48} className="read-row">
        <Col {...FORM_COL_3_LAYOUT}>
          <FormItem
            label={intl.get(`${promptCode}.model.queryQuotation.remarks`).d('备注')}
            {...EDIT_FORM_ITEM_LAYOUT}
          >
            {getFieldDecorator('rfxRemark', {
              initialValue: supplierQutQueryList.rfxRemark,
            })(<span>{supplierQutQueryList.rfxRemark}</span>)}
          </FormItem>
        </Col>
      </Row>,
    ].filter(Boolean);

    const fields = remote
      ? remote.process('SSRC_QUERY_QUOTATION_DETAIL_BASE_FORM_CUX_FIELDS_PROCESS', currentFields, {
          headerComponentThis: this,
          headerInfo: supplierQutQueryList,
          form,
        })
      : currentFields;
    return fields;
  };

  /**
   * 基本信息
   * @param {*} supplierQutQueryList
   */
  renderHeaderForm(supplierQutQueryList = {}) {
    const { customizeForm } = this.props;
    return customizeForm(
      {
        code: `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.BASE_FORM`,
        form: this.props.form,
        dataSource: supplierQutQueryList,
        readOnly: true,
      },
      <Form className={styles['inquiry-hall-basic-info-form']}>
        {this.getHeaderFormFields(supplierQutQueryList)}
      </Form>
    );
  }

  /**
   * 资格预审
   */
  renderPreQualificationForm(supplierQutQueryList = {}) {
    const {
      organizationId,
      customizeForm,
      form: { getFieldDecorator },
    } = this.props;
    const { fileLength } = this.state;
    return customizeForm(
      {
        code: `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.PRELIMINARY_QUALIFICATION`,
        form: this.props.form,
        dataSource: supplierQutQueryList,
        readOnly: true,
      },
      <Form className={styles['inquiry-hall-basic-info-form']}>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.queryQuotation.prequalEndDate`)
                .d('预审截止时间')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalEndDate', {
                initialValue: supplierQutQueryList.prequalEndDate,
              })(<span>{dateTimeRender(supplierQutQueryList.prequalEndDate)}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryQuotation.reviewMethod`).d('审查方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('reviewMethodMeaning', {
                initialValue: supplierQutQueryList.reviewMethodMeaning,
              })(<span>{supplierQutQueryList.reviewMethodMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryQuotation.qualifiedLimit`).d('合格上限')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('qualifiedLimit', {
                initialValue: supplierQutQueryList.qualifiedLimit,
              })(<span>{supplierQutQueryList.qualifiedLimit}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          {/* <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`${promptCode}.model.queryQuotation.fileFreeFlag`).d('预审文件免费')}
              value={yesOrNoRender(supplierQutQueryList.fileFreeFlag)}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`${promptCode}.model.queryQuotation.prequalFileExpense`)
                .d('预审文件费')}
              value={
                supplierQutQueryList.fileFreeFlag === 1
                  ? 0
                  : supplierQutQueryList.prequalFileExpense
              }
            />
          </Col> */}
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryQuotation.prequalUser`).d('审查员')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('realName', {
                initialValue: supplierQutQueryList.realName,
              })(<span>{supplierQutQueryList.realName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.queryQuotation.prequalLocation`)
                .d('申请提交地点')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalLocation', {
                initialValue: supplierQutQueryList.prequalLocation,
              })(<span>{supplierQutQueryList.prequalLocation}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl
                .get(`${promptCode}.model.queryQuotation.enableScoreFlag`)
                .d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('enableScoreFlag', {
                initialValue: supplierQutQueryList.enableScoreFlag,
              })(<span>{yesOrNoRender(supplierQutQueryList.enableScoreFlag)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <Row>
              <Col span={8} className="item-label">
                {intl.get(`${promptCode}.model.queryQuotation.preAttachment`).d('资格预审文件')}
              </Col>
              <Col span={16}>
                {supplierQutQueryList.fileFreeFlag === 0 ? (
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
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="ssrc-rfx-prequal"
                    attachmentUUID={supplierQutQueryList.prequalAttachmentUuid}
                    tenantId={organizationId}
                    viewOnly
                    filePreview
                    icon="download"
                  />
                )}
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`${promptCode}.model.queryQuotation.prequalRemark`).d('资格预审备注')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('prequalRemark', {
                initialValue: supplierQutQueryList.prequalRemark,
              })(<span>{supplierQutQueryList.prequalRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
        {/* <Row gutter={48} className="read-row">
        </Row> */}
      </Form>
    );
  }

  /**
   * 其他信息
   * @param {*} supplierQutQueryList
   */
  renderOtherInfosForm(supplierQutQueryList = {}) {
    const { form = {}, customizeForm = () => {}, remote } = this.props;
    const { getFieldDecorator = () => {} } = form;

    return (
      <React.Fragment>
        {customizeForm(
          {
            code: `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.OTHERS_FORM`,
            form,
            dataSource: supplierQutQueryList,
            readOnly: true,
          },
          <Form>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.queryQuotation.model.supQuo.sealedQuotation`).d('密封报价')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sealedQuotationFlag', {
                    initialValue: supplierQutQueryList.sealedQuotationFlag,
                  })(<span>{yesOrNoRender(supplierQutQueryList.sealedQuotationFlag)}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.queryQuotation.model.supQuo.sourcingType`).d('寻源类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('sourceTypeMeaning', {
                    initialValue: supplierQutQueryList.sourceTypeMeaning,
                  })(<span>{supplierQutQueryList.sourceTypeMeaning}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.queryQuotation.model.supQuo.priceCategory`).d('价格类型')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('priceCategoryMeaning', {
                    initialValue: supplierQutQueryList.priceCategoryMeaning,
                  })(<span>{supplierQutQueryList.priceCategoryMeaning}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.queryQuotation.model.supQuo.paymentTerms`).d('付款方式')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentTypeName', {
                    initialValue: supplierQutQueryList.paymentTypeName,
                  })(<span>{supplierQutQueryList.paymentTypeName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.common.model.common.termsOfPayment`).d('付款条款')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('paymentTermName', {
                    initialValue: supplierQutQueryList.paymentTermName,
                  })(<span>{supplierQutQueryList.paymentTermName}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get('ssrc.inquiryHall.model.inquiryHall.bidBondYuan').d('保证金(元)')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bidBond', {
                    initialValue: supplierQutQueryList.bidBond,
                  })(
                    <span>
                      {supplierQutQueryList.bidBond === 0 || supplierQutQueryList.bidBond === null
                        ? intl.get('ssrc.common.view.gratis').d('免费')
                        : numberSeparatorRender(supplierQutQueryList.bidBond) || null}
                    </span>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <FormItem
                  label={intl.get(`ssrc.queryQuotation.model.supQuo.round`).d('轮次')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('roundNumber', {
                    initialValue: supplierQutQueryList.roundNumber,
                  })(<span>{supplierQutQueryList.roundNumber}</span>)}
                </FormItem>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                {remote
                  ? remote.render('SSRC_QUERY_QUOTATION_DETAIL_RENDER_OTHER_FORM', <></>, {
                      getFieldDecorator,
                      bidFlag: this.bidFlag,
                      supplierQutQueryList,
                    })
                  : null}
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }

  /**
   * 返回路径渲染
   */
  @Bind()
  parentRender() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      historyTag,
      backRecommend,
      sourcePage = '',
      cachTabKey,
      sourceFrom,
      sourceHeaderId,
      isPub,
      noBackFlag,
      sourceStatus,
      RFXDetail = null, // 寻源明细跳转
    } = this.state;
    const {
      match: { params, path = null },
      location: { search },
      [modelName]: { supplierQutQueryList = {} },
    } = this.props;
    const {
      sourceProjectId,
      projectLineSectionId,
      backPath = null, // 上个页面完整路由
    } = querystring.parse(search);
    let url;
    const replyFlag = this.props.location.pathname.indexOf('supplier-reply') > -1;
    const activeKey = getTabKey();
    if (sourcePage) {
      if (sourcePage === 'confirm') {
        url = `/ssrc/expert-scoring/confirm-candidate/${params.rfxId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&historyTag=${historyTag}`;
        if (sourceProjectId && projectLineSectionId) {
          url += `&sourceProjectId=${sourceProjectId}&projectLineSectionId=${projectLineSectionId}`;
        }
      } else {
        url = `/ssrc/expert-scoring/rfx-evaluation/${params.rfxId}?backRecommend=${backRecommend}&cachTabKey=${cachTabKey}&sourceFrom=${sourceFrom}&sourceHeaderId=${sourceHeaderId}&historyTag=${historyTag}&sourceStatus=${sourceStatus}`;
      }
    } else if (isPub) {
      url = null;
    } else if (noBackFlag) {
      url = null;
    } else if (RFXDetail && !['null', 'undefined'].includes(RFXDetail)) {
      const searchParam = querystring.stringify(
        filterNullValueObject({
          rfxHeaderId: RFXDetail,
          projectLineSectionId,
          sourceCategory: supplierQutQueryList.sourceCategory,
        })
      );
      url = `${activeKey}/rfx-detail/${RFXDetail}?${searchParam}`;
    } else if (replyFlag) {
      url = `${activeKey}/list`;
    } else {
      url = isPubPage(path, `${activeKey}/list`);
    }

    if (backPath) {
      url = backPath;
    }
    return url;
  }

  /**
   * 打印
   */
  @Debounce(1000)
  @Bind()
  print() {
    const { dispatch, organizationId, modelName = 'supplierQuotation' } = this.props;
    const { quotationHeaderId = null } = this.state;
    dispatch({
      type: `${modelName}/queryPrint`,
      payload: { quotationHeaderId, organizationId, flag: true },
    }).then((res) => {
      if (res) {
        const file = new Blob([res], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const printWindow = window.open(fileURL);
        if (printWindow) {
          printWindow.print();
        }
      }
    });
  }

  @Bind()
  getColumns() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { supplierQutQueryList = {} },
    } = this.props;
    const { roundQuotationRankFlag, currentQuotationRound } = supplierQutQueryList;
    const columns = [
      {
        title: intl.get(`ssrc.supplierQuotation.model.supQuo.round`).d('轮次'),
        dataIndex: 'quotationRound',
        width: 60,
        render: (val, record) =>
          record.currentFlag ? <div style={{ color: 'green' }}> {val} </div> : <div> {val} </div>,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStatus`, {
            quotationName: this.quotationName,
          })
          .d(`${this.quotationName}状态`),
        dataIndex: 'quotationStatusMeaning',
        width: 100,
        render: (val, record) =>
          record.currentFlag ? <div style={{ color: 'green' }}> {val} </div> : <div> {val} </div>,
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationStartTime`, {
            quotationName: this.quotationName,
          })
          .d(`${this.quotationName}开始时间`),
        dataIndex: 'roundQuotationStartDate',
        width: 140,
        render: (val, record) => {
          const formatVal = dateTimeRender(val);
          return record.currentFlag ? (
            <div style={{ color: 'green' }}> {formatVal} </div>
          ) : (
            <div> {formatVal} </div>
          );
        },
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.commonQuotationEndTime`, {
            quotationName: this.quotationName,
          })
          .d(`${this.quotationName}截止时间`),
        dataIndex: 'roundQuotationEndDate',
        width: 140,
        render: (val, record) => {
          const formatVal = dateTimeRender(val);
          return record.currentFlag ? (
            <div style={{ color: 'green' }}> {formatVal} </div>
          ) : (
            <div> {formatVal} </div>
          );
        },
      },
      roundQuotationRankFlag && currentQuotationRound > 1
        ? {
            title: intl.get(`ssrc.supplierQuotation.model.supQuo.rank`).d('排名'),
            dataIndex: 'roundRank',
            width: 60,
            render: (val, record) =>
              record.currentFlag ? (
                <div style={{ color: 'green' }}> {val} </div>
              ) : (
                <div> {val} </div>
              ),
          }
        : null,
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.taxRateQuotationAmount`)
          .d('含税报价总金额'),
        dataIndex: 'quotationAmount',
        width: 120,
        render: (val, record) =>
          record.currentFlag ? (
            <div style={{ color: 'green' }}> {numberSeparatorRender(val)} </div>
          ) : (
            <div> {numberSeparatorRender(val)} </div>
          ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.noTaxRateQuotationAmount`)
          .d('报价总金额(不含税)'),
        dataIndex: 'netQuotationAmount',
        width: 120,
        render: (val, record) =>
          record.currentFlag ? (
            <div style={{ color: 'green' }}> {numberSeparatorRender(val)} </div>
          ) : (
            <div> {numberSeparatorRender(val)} </div>
          ),
      },
      {
        title: intl
          .get(`ssrc.supplierQuotation.model.supQuo.roundQutaionReson`)
          .d('发起本轮报价原因'),
        dataIndex: 'roundRemark',
        width: 160,
        render: (val, record) =>
          record.currentFlag ? <div style={{ color: 'green' }}> {val} </div> : <div> {val} </div>,
      },
    ].filter(Boolean);
    return columns;
  }

  /**
   * @deprecated 乐成
   */
  @Bind()
  getButtons() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      printLoading,
      remote,
      [modelName]: { supplierQutQueryList = {} },
      location: { search },
    } = this.props;
    const { quotationHeaderId = null, loading } = this.state;
    const routerParams = querystring.parse(search?.substr(1));
    const { switchUrl = 0 } = routerParams;

    const isPurchase = supplierQutQueryList?.quotationRoundFlag && Number(switchUrl) === 2;
    const currentButtons = [
      {
        name: 'checkAttachment',
        child: intl.get(`${promptCode}.view.message.button.viewAttachments`).d('查看附件'),
        btnProps: {
          onClick: this.checkAttachment,
          type: 'primary',
          icon: 'download',
          hidden: isPurchase,
        },
      },
      {
        name: 'print',
        child: intl.get(`${promptCode}.view.message.button.print`).d('打印'),
        btnProps: {
          onClick: this.print,
          type: 'primary',
          disabled: !quotationHeaderId,
          loading: printLoading,
          hidden: isPurchase,
          // style: {
          //   display: 'block',
          //   color: '#fff',
          //   backgroundColor: '#29BECE',
          // },
        },
      },
    ].filter(Boolean);

    const otherProps = {
      quotationHeaderInfo: supplierQutQueryList,
      loading,
      toggleLoading: this.toggleLoading,
      switchUrl,
    };

    const buttons = remote
      ? remote.process('SSRC_QUERY_QUOTATION_DETAIL_HEADER_BUTTONS', currentButtons, otherProps)
      : currentButtons;

    return buttons;
  }

  renderAttachment(AttachmentsProps) {
    const { remote, modelName = 'supplierQuotation' } = this.props;
    return remote ? (
      remote.render(
        'SSRC_QUERY_QUOTATION_DETAIL_RENDER_ATTACHMENT',
        <Attachment {...AttachmentsProps} />,
        {
          ...AttachmentsProps,
          modelName,
        }
      )
    ) : (
      <Attachment {...AttachmentsProps} />
    );
  }

  render() {
    const { modelName = 'supplierQuotation' } = this.props;
    const {
      [modelName]: { supplierQutQueryList = {}, quotationRoundQuotationInfo = [] },
      headerLoding,
      dispatch,
      organizationId,
      supplierQuotation,
      fetchLadderLevelTableLoading,
      fetchFeedBackBarginHistoryLoading,
      inquiryHall: { quotaLadderLevelData = [] },
      customizeBtnGroup = () => {},
      customizeTable = () => {},
    } = this.props;
    const {
      previewVisible,
      viewOnly,
      bucketDirectory,
      rfxBucketDirectory,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      collapseKeys = ['roundQuotation'],
    } = this.state;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal: this.hideLadderLevelModal,
      quotaLadderLevelData,
      LadderLevelHeaderData,
      loading: fetchLadderLevelTableLoading,
    };
    // 询价单头附件
    const rfxAttachmentsProps = {
      viewOnly,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: rfxBucketDirectory,
      businessUuid: supplierQutQueryList.businessAttachmentUuid,
      techUuid: supplierQutQueryList.techAttachmentUuid,
      businessAttachmentFlag: supplierQutQueryList.businessAttachmentFlag || true,
      techAttachmentFlag: supplierQutQueryList.techAttachmentFlag || true,
    };
    // 报价单头附件列表
    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory,
      viewOnly,
      businessUuid: supplierQutQueryList.supplierBusinessAttachmentUuid,
      techUuid: supplierQutQueryList.supplierTechAttachmentUuid,
      roundBusUuid: supplierQutQueryList.roundBusinessAttachmentUuid,
      roundTechUuid: supplierQutQueryList.roundTechAttachmentUuid,
      bargainBusUuid: supplierQutQueryList.bargainBusinessAttachmentUuid,
      bargainTechUuid: supplierQutQueryList.bargainTechAttachmentUuid,
      supplierQutQueryList,
    };
    const { feedBackBarginHistoryStatus, feedBackBarginHistorySearch } = this.state;
    // 还比价历史Props
    const feedBackBarginHistoryModalProps = {
      quotationName: this.quotationName,
      search: feedBackBarginHistorySearch,
      dispatch,
      organizationId,
      supplierQuotation,
      feedBackBarginHistoryStatus,
      fetchFeedBackBarginHistoryLoading,
      onCancel: () => this.setState({ feedBackBarginHistoryStatus: false }),
      onOk: () => this.setState({ feedBackBarginHistoryStatus: false }),
    };

    const { currentQuotationRound, roundQuotationRule } = supplierQutQueryList;

    const scrollX = sum(this.getColumns().map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <React.Fragment>
        <Header
          backPath={this.parentRender()}
          title={intl
            .get(`${promptCode}.view.message.title.commonQuotationInquiry`, {
              quotationName: this.quotationName,
            })
            .d('{quotationName}查询')}
        >
          {customizeBtnGroup(
            {
              code: !this.bidFlag
                ? 'SSRC.QUERY_QUOTATION_DETAIL.HEADER_BUTTONS'
                : 'SSRC.BID_QUERY_QUOTATION_DETAIL.HEADER_BUTTONS',
              pro: true,
            },
            <DynamicButtons buttons={this.getButtons()} />
          )}
        </Header>
        <Content>
          <Spin
            spinning={headerLoding}
            wrapperClassName={classnames(styles['page-content'], 'ued-detail-wrapper')}
          >
            <Collapse
              className="form-collapse"
              onChange={this.onCollapseChange}
              defaultActiveKey={collapseKeys}
            >
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>{intl.get(`${promptCode}.view.message.panel.baseInfos`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfos') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="baseInfos"
              >
                {this.renderHeaderForm(supplierQutQueryList)}
              </Panel>
              <Panel
                showArrow={false}
                header={
                  <React.Fragment>
                    <h3>
                      {intl.get(`${promptCode}.view.message.panel.otherInformation`).d('其他信息')}
                    </h3>
                    <a>
                      {collapseKeys.includes('otherInfos')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('otherInfos') ? 'up' : 'down'} />
                  </React.Fragment>
                }
                key="otherInfos"
              >
                {this.renderOtherInfosForm(supplierQutQueryList)}
              </Panel>
              {supplierQutQueryList.preQualificationFlag && (
                <Panel
                  showArrow={false}
                  header={
                    <React.Fragment>
                      <h3>
                        {intl
                          .get(`${promptCode}.view.message.panel.preQualification`)
                          .d('资格预审')}
                      </h3>
                      <a>
                        {collapseKeys.includes('preQualification')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('preQualification') ? 'up' : 'down'} />
                    </React.Fragment>
                  }
                  key="preQualification"
                >
                  {this.renderPreQualificationForm(supplierQutQueryList)}
                </Panel>
              )}
              {roundQuotationRule !== 'NONE' && currentQuotationRound > 0 ? (
                <React.Fragment>
                  <div
                    style={{
                      lineHeight: '16px',
                      fontSize: '14px',
                      marginBottom: '16px',
                      height: '16px',
                      display: 'flex',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#00BFBF',
                        width: '2px',
                        height: '16px',
                        marginRight: '8px',
                      }}
                    />
                    <div>
                      {intl
                        .get(`ssrc.inquiryHall.model.inquiryHall.roundQuotationInfoTable`)
                        .d('多轮报价信息表')}
                    </div>
                  </div>
                  {customizeTable(
                    {
                      code: `SSRC.${this.custKey}QUERY_QUOTATION_DETAIL.ROUND_QUOTATION_LINE`,
                      readOnly: true,
                    },
                    <EditTable
                      bordered
                      rowKey="roundHeaderDateId"
                      columns={this.getColumns()}
                      scroll={{ x: scrollX }}
                      dataSource={quotationRoundQuotationInfo}
                      pagination={false}
                    />
                  )}
                </React.Fragment>
              ) : null}
            </Collapse>
            <Tabs defaultActiveKey="1" animated={false}>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.tab.itemDetails`).d('物品明细')}
                key="1"
              >
                {this.categoryTable()}
              </TabPane>
              <TabPane
                tab={intl.get(`${promptCode}.view.message.tab.attachmentInfo`).d('附件列表')}
                key="2"
              >
                <Attachment {...rfxAttachmentsProps} />
              </TabPane>
            </Tabs>
          </Spin>
        </Content>
        <Modal
          destroyOnClose
          visible={previewVisible}
          footer={null}
          onCancel={this.hideAttachmentsProps}
          width={800}
        >
          {this.renderAttachment(AttachmentsProps)}
        </Modal>

        {feedBackBarginHistoryStatus ? (
          <FeedBackBarginHistoryModal {...feedBackBarginHistoryModalProps} />
        ) : null}
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
      </React.Fragment>
    );
  }
}

const hocComponent = (Com, options = {}) => {
  const { extraIntlCode = [] } = options || {};

  return compose(
    withCustomize({
      unitCode: [
        'SSRC.QUERY_QUOTATION_DETAIL.QUOTATION_LINE',
        'SSRC.QUERY_QUOTATION_DETAIL.ITEM_LINE',
        'SSRC.QUERY_QUOTATION_DETAIL.BASE_FORM',
        'SSRC.QUERY_QUOTATION_DETAIL.OTHERS_FORM',
        'SSRC.QUERY_QUOTATION_DETAIL.PRELIMINARY_QUALIFICATION', // 资格预审
        'SSRC.QUERY_QUOTATION_DETAIL.HEADER_BUTTONS', // 头部按钮组
        'SSRC.QUERY_QUOTATION_DETAIL.ROUND_QUOTATION_LINE',
      ],
    }),
    formatterCollections({
      code: [
        'ssrc.queryQuotation',
        'ssrc.common',
        'ssrc.inquiryHall',
        'ssrc.bidHall',
        'ssrc.supplierQuotation',
        'hzero.common',
        'ssrc.scux',
        'sscux.ssrc',
        ...(extraIntlCode || []),
      ],
    }),
    connect(({ inquiryHall, supplierQuotation, loading }) => ({
      inquiryHall,
      supplierQuotation,
      modelName: 'supplierQuotation',
      fetchFeedBackBarginHistoryLoading:
        loading.effects['supplierQuotation/fetchFeedBackBarginHistory'],
      organizationId: getCurrentOrganizationId(),
      headerLoding: loading.effects['supplierQuotation/fetchHeadDataList'],
      fetchLadderLevelTableLoading: loading.effects['inquiryHall/fetchLadderLevelTable'],
      queryRoundQuotationLineDetailLoading:
        loading.effects['supplierQuotation/queryRoundQuotationLineDetail'],
      printLoading: loading.effects['supplierQuotation/queryPrint'],
    })),
    Form.create({ fieldNameProp: null }),
    remoteHoc(
      {
        code: 'SSRC_QUERY_QUOTATION_DETAIL',
      },
      {
        events: {},
      }
    )
  )(Com);
};

export default hocComponent(Detail);

export { Detail, hocComponent };
