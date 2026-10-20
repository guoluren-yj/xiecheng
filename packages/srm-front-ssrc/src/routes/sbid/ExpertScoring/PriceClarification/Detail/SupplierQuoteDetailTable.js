import React, { Component } from 'react';
import { Table, DataSet, Modal, ModalProvider, Pagination } from 'choerodon-ui/pro';
import { Collapse, Row, Col, Icon, Tooltip, Tag } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { createC7nPagination } from '@/utils/utils';

import Attachment from '@/routes/ssrc/components/Attachment/';
import { PRIVATE_BUCKET } from '_utils/config';

import { fetchPriceClarificationDetailSupplierList } from '@/services/expertScoringService';
import { INQUIRY, BID } from '@/utils/globalVariable';

import moneyIcon from '@/assets/money.svg';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import LadderLevel from '../Update/LadderLevel';
import styles from '../index.less';
import { SupplierQuotationTableDS } from './TableDS';
import { LadderLevelModalDS } from '../TableDS';

const supplierImg = require('@/assets/supplier-icon.svg');
const eliminateIcon = require('@/assets/eliminate.svg');

const { Panel } = Collapse;

export default class SupplierQuoteDetailTable extends Component {
  constructor(props) {
    super(props);
    const { onTableRef = null } = props;
    if (typeof onTableRef === 'function') {
      onTableRef(this);
    }

    this.state = {
      supplierList: [],
      supplierPagination: {},
      activePanel: [],
      expandIds: {}, // 打开的折叠面板
    };

    this.LadderLevelModalDS = new DataSet(
      LadderLevelModalDS({
        editTable: false,
      })
    );
  }

  componentDidMount() {
    this.fetchSupplierLine();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { clarifyNotifyId: prevClarifyNotifyId = null } = prevProps || {};
    const { clarifyNotifyId = null } = this.props;

    return clarifyNotifyId && clarifyNotifyId !== prevClarifyNotifyId;
  }

  componentDidUpdate(...params) {
    if (params[2]) {
      this.fetchSupplierLine();
    }
  }

  // fetch supplier line
  async fetchSupplierLine(page = {}) {
    const { sourceFrom, sourceHeaderId, organizationId, clarifyNotifyId } = this.props;

    try {
      let supplierLine = await fetchPriceClarificationDetailSupplierList({
        sourceFrom,
        sourceHeaderId,
        organizationId,
        clarifyNotifyId,
        ...page,
      });
      supplierLine = getResponse(supplierLine);
      if (!supplierLine) {
        return;
      }

      const data = supplierLine.content || [];
      const pagination = createC7nPagination(supplierLine || {}) || {};
      this.setState({
        expandIds: {},
        supplierList: data,
        supplierPagination: pagination,
      });

      this.fetchQuoteLines(data, {
        organizationId,
        sourceFrom,
        clarifyNotifyId,
        sourceHeaderId,
      });
    } catch (e) {
      throw e;
    }
  }

  fetchQuoteLines(data = [], params = {}) {
    const { quotationName, doubleUnitFlag } = this.props;

    if (isEmpty(data)) {
      return;
    }

    const expandLines = {};
    const ids = [];
    const activeKeys = [];

    data.forEach((line) => {
      const { quotationHeaderId = null, supplierTotalAmount = null, supplierCompanyId = null } =
        line || {};

      // 这是一步优化, 供应商报价总价不存在时, 不需要查询报价行表格，面板不用展开
      if (isNil(supplierTotalAmount)) {
        return;
      }
      if (quotationHeaderId) {
        ids.push(quotationHeaderId);
      }
      if (supplierCompanyId) {
        activeKeys.push(`${supplierCompanyId}`);
      }
    });

    ids.forEach((quotationHeaderId) => {
      const tableDS = new DataSet(
        SupplierQuotationTableDS({
          editTable: false,
          sourceKey: this.props.sourceKey || INQUIRY,
          quotationName,
          doubleUnitFlag,
        })
      );
      tableDS.setQueryParameter('commonProps', {
        ...params,
        quotationHeaderId,
      });
      tableDS.query();

      expandLines[quotationHeaderId] = {
        isSelecteds: true,
        ds: tableDS,
      };
    });

    this.setState({
      expandIds: expandLines,
      activePanel: activeKeys,
    });
    this.forceUpdate();
  }

  @Bind()
  changeCollapse(active = []) {
    this.setState({
      activePanel: active,
    });
  }

  // supplier line pagination change
  @Bind()
  tablePaginationChange(page = 0, pageSize = 10) {
    const { supplierPagination } = this.state;
    if (supplierPagination.pageSize !== pageSize) {
      // eslint-disable-next-line no-param-reassign
      page = 1;
    }
    const pagination = {
      page: page - 1,
      size: pageSize,
    };

    this.fetchSupplierLine(pagination);
  }

  // 查看阶梯报价
  @Bind()
  viewLadderLevelPrepare(record = {}) {
    const {
      sourceHeaderId,
      organizationId,
      doubleUnitFlag,
      customizeTable,
      sourceKey,
    } = this.props;
    const recordData = record.toData() || {};
    const { quotationLineId } = recordData || {};
    const LadderCode = `SSRC.${sourceKey}_HALL.CLARIFICATION.QUOTATION_LADDER_LEVER_DETAIL`;

    this.LadderLevelModalDS.setQueryParameter('commonProps', {
      organizationId,
      sourceHeaderId,
      quotationLineId,
      customizeUnitCode: LadderCode,
      customizeTable,
    });
    const modalKey = Modal.key();
    this.LadderLevelModalDS.query();

    const Props = {
      recordData,
      ladderLevelModalDS: this.LadderLevelModalDS,
      doubleUnitFlag,
      LadderCode,
      customizeTable,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.title.ladderLevelQuot`).d('阶梯报价'),
      children: <LadderLevel {...Props} />,
      footer: null,
    });
  }

  @debounce(1000)
  @Bind()
  handleChangeCollapse(e, item = {}) {
    e.preventDefault();

    const {
      sourceHeaderId,
      sourceFrom,
      organizationId,
      clarifyNotifyId,
      doubleUnitFlag = false,
    } = this.props;
    const { expandIds = {} } = this.state;
    const { quotationHeaderId = null } = item || {};

    if (!quotationHeaderId) {
      return;
    }

    let tableDS = (expandIds[quotationHeaderId] || {}).ds || null;
    const isRowOpenFlag = !!(expandIds[quotationHeaderId] || {}).isSelecteds;

    if (!isRowOpenFlag && !tableDS) {
      tableDS = new DataSet(
        SupplierQuotationTableDS({
          editTable: false,
          sourceKey: this.props.sourceKey || INQUIRY,
          doubleUnitFlag,
        })
      );
      tableDS.setQueryParameter('commonProps', {
        organizationId,
        clarifyNotifyId,
        quotationHeaderId,
        sourceFrom,
        sourceHeaderId,
      });
      tableDS.query();
    }

    this.setState({
      expandIds: {
        ...expandIds,
        [quotationHeaderId]: {
          isSelecteds: !isRowOpenFlag,
          ds: tableDS,
        },
      },
    });
  }

  @Bind()
  viewFile(e, item = {}) {
    e.stopPropagation();

    const AttachmentsProps = {
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationheader',
      viewOnly: true,
      businessUuid: item?.businessAttachmentUuid,
      techUuid: item?.techAttachmentUuid,
      data: item,
    };

    const modalKey = Modal.key();
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      title: intl.get(`ssrc.inquiryHall.view.message.quotationAttachment`).d('报价附件'),
      children: <Attachment {...AttachmentsProps} />,
      style: { width: '80%' },
    });
  }

  getCommonPriceTagRender = (data) => {
    const { valueText = '', tagProps = {}, showFlag = true } = data || {};

    if (!showFlag) {
      return '';
    }

    return (
      <Tooltip placement="topLeft" title={valueText}>
        <Tag style={{ fontWeight: 'normal' }} color="red" border={null} {...tagProps}>
          {valueText}
        </Tag>
      </Tooltip>
    );
  };

  renderHeader(item = {}) {
    const {
      headerFormDS,
      viewScoreDetail = () => {},
      japOrDutchBiddingTotalPrice,
      japanBiddingTotalPrice,
    } = this.props;
    // const { expandIds = {} } = this.state;

    const { current } = headerFormDS || {};

    const { benchmarkPriceType } = current ? current.get(['benchmarkPriceType']) : {};

    const taxIncluded = benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    const japanDutchTotalBidding = japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice();
    const japanTotalBidding = japanBiddingTotalPrice && japanBiddingTotalPrice();

    const {
      supplierCompanyNum = null,
      supplierCompanyName = null,
      supplierTotalAmount = null,
      // quotationHeaderId = null,
      allEliminate,
      acceptQtnNetAmount,
      acceptQtnTotalAmount,
      biddingRoundSupplierStatus = null,
      biddingRoundSupplierStatusMeaning,
      biddingAcceptCount,
      supplementQtnTotalAmount,
      supplementQtnNetAmount,
      biddingSupplierAcceptNumber,
    } = item || {};

    // 接受价格 - 日/荷兰竞价大厅
    const japanDutchAcceptAmountValue = taxIncluded ? acceptQtnTotalAmount : acceptQtnNetAmount;
    const japanDutchAcceptAmountFormatted = numberSeparatorRender(japanDutchAcceptAmountValue);
    const japanDutchAcceptAmount =
      japanDutchTotalBidding && !isNil(japanDutchAcceptAmountValue)
        ? [
            this.getCommonPriceTagRender({
              valueText: (
                <span>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.accepttedPriceAndRound`)
                    .d('接受价格/轮次')}
                  ：{japanDutchAcceptAmountFormatted} / {biddingSupplierAcceptNumber || '-'}
                </span>
              ),
            }),
          ]
        : '';

    const supplementAmountPrice = taxIncluded ? supplementQtnTotalAmount : supplementQtnNetAmount;
    const supplementAmountPriceFormatted = numberSeparatorRender(supplementAmountPrice);
    //  补充单价汇总金额
    const supplementAmount =
      japanDutchTotalBidding && !isNil(supplementAmountPrice)
        ? [
            this.getCommonPriceTagRender({
              valueText: (
                <span>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.supplementSummaryAmount`)
                    .d('补充单价汇总金额')}
                  ：{supplementAmountPriceFormatted}
                </span>
              ),
            }),
          ]
        : '';

    return (
      <Row
        gutter={8}
        onClick={(e) => this.handleChangeCollapse(e, item)}
        style={{ marginLeft: '20px' }}
      >
        <Col span={8}>
          <div>
            <img
              src={!allEliminate ? supplierImg : eliminateIcon}
              alt="icon"
              style={{ width: 22, height: 22 }}
            />
            {supplierCompanyNum ? `${supplierCompanyNum}-` : ''}
            {supplierCompanyName ?? ''}
          </div>
        </Col>
        <Col span={2} className="score">
          {item?.score != null && (
            <div>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.getScore').d('得分')}：
              <a onClick={(e) => viewScoreDetail(e, item)}>{item.score}</a>
            </div>
          )}
        </Col>
        <Col span={10}>
          {!japanDutchTotalBidding ? (
            <div>
              <img src={moneyIcon} alt="" style={{ marginRight: '4px' }} />
              {supplierTotalAmount ? numberSeparatorRender(supplierTotalAmount) : 0}
            </div>
          ) : (
            ''
          )}

          {/* 日式/荷兰 轮次状态 */}
          {this.getCommonPriceTagRender({
            valueText: biddingRoundSupplierStatusMeaning || '-',
            tagProps: {
              color: 'geekblue',
            },
            showFlag: japanDutchTotalBidding && biddingRoundSupplierStatus,
          })}

          {this.getCommonPriceTagRender({
            valueText: (
              <span>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.biddingAcceptCount`).d('接受次数')}：
                {biddingAcceptCount}
              </span>
            ),
            tagProps: {
              color: 'geekblue',
            },
            showFlag: !isNil(biddingAcceptCount) && japanTotalBidding,
          })}
          {japanDutchAcceptAmount}
          {supplementAmount}
        </Col>
        <Col span={3}>
          <a onClick={(e) => this.viewFile(e, item)}>
            <Icon type="attach_file" />
            {intl.get('hzero.common.title.checkAttach').d('查看附件')}
          </a>
        </Col>
      </Row>
    );
  }

  getTableColumns() {
    const { doubleUnitFlag, headerFormDS, sourceKey = INQUIRY } = this.props;
    const benchmarkPriceType = headerFormDS?.current?.get?.('benchmarkPriceType');
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';

    const Columns = [
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'model',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'newNetSecPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'validQuotationPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validNetPrice',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotationDetail',
        width: 100,
        align: 'left',
        renderer: ({ record }) => (
          <QuotationDetail
            rowData={record}
            sourceFrom="RFX"
            uiType="c7n-pro"
            allowBuyerViewFlag
            bidFlag={sourceKey === BID}
          />
        ),
      },
      // doubleUnitFlag
      //   ? {
      //       name: 'lastQuotationSecPrice',
      //       width: 120,
      //       renderer: ({ value }) => numberSeparatorRender(value),
      //     }
      //   : {
      //       name: 'lastQuotationPrice',
      //       width: 120,
      //       renderer: ({ value }) => numberSeparatorRender(value),
      //     },
      doubleUnitFlag
        ? !isUnTaxPriceFlag
          ? {
              name: 'lastQuotationSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'lastNetSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : !isUnTaxPriceFlag
        ? {
            name: 'lastQuotationPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'lastNetPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'validQuotationQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'origin',
        width: 100,
      },
      {
        name: 'validExpiryDateFrom',
      },
      {
        name: 'validExpiryDateTo',
      },
      {
        name: 'validPromisedDate',
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'validQuotationRemark',
      },
      {
        name: 'minPurchaseQuantity',
      },
      {
        name: 'minPackageQuantity',
      },
      {
        name: 'freightIncludedFlag',
      },
      {
        name: 'freightAmount',
      },
      {
        name: 'attachmentUuid',
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
            <a onClick={() => this.viewLadderLevelPrepare(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null;
        },
      },
    ];

    return Columns;
  }

  renderTable(item = {}) {
    const { expandIds = {} } = this.state;
    const { customizeTable, sourceKey = INQUIRY } = this.props;
    const { quotationHeaderId = null } = item || {};
    if (!quotationHeaderId) {
      return null;
    }

    const currentDS = (expandIds[quotationHeaderId] || {}).ds || null;
    if (!currentDS) {
      return null;
    }

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_DETAIL`,
            dataSet: currentDS,
          },
          <Table dataSet={currentDS} columns={this.getTableColumns()} rowKey="rfxLineItemId" />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { supplierList = [], supplierPagination = {}, activePanel = [] } = this.state;

    return (
      <div className={styles['ssrc-supplier-quote-table']}>
        <ModalProvider>
          <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
            {supplierList &&
              supplierList.map((item = {}) => (
                <Panel
                  disabled={!item?.quotationHeaderId}
                  header={this.renderHeader(item)}
                  key={item?.supplierCompanyId}
                  // showArrow={false}
                >
                  {this.renderTable(item)}
                </Panel>
              ))}
          </Collapse>
        </ModalProvider>
        {!isEmpty(supplierList) ? (
          <Pagination
            className={styles['ssrc-table-pagination']}
            onChange={this.tablePaginationChange}
            pageSize={supplierPagination.pageSize}
            page={supplierPagination.page}
            total={supplierPagination.total || 0}
          />
        ) : null}
      </div>
    );
  }
}
