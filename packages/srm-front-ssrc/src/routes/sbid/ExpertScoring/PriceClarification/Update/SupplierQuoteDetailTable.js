import React, { Component } from 'react';
import { Table, DataSet, Modal, Pagination } from 'choerodon-ui/pro';
import { Collapse, Row, Col, Tag, Tooltip } from 'choerodon-ui';
import { Bind, debounce } from 'lodash-decorators';
import { isEmpty, isNil } from 'lodash';
import querystring from 'querystring';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import { createC7nPagination } from '@/utils/utils';

import { INQUIRY, BID } from '@/utils/globalVariable';

import {
  // fetchPriceClarificationDetailSupplierItemList,
  fetchPriceClarificationDetailSupplierList,
} from '@/services/expertScoringService';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import moneyIcon from '@/assets/money.svg';
import styles from '../index.less';
import { SupplierQuotationTableDS, LadderLevelModalDS } from '../TableDS';
import LadderLevel from './LadderLevel';

const supplierImg = require('@/assets/supplier-icon.svg');
const eliminateIcon = require('@/assets/eliminate.svg');

const { Panel } = Collapse;

@observer
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

    this.LadderLevelModalDS = new DataSet(LadderLevelModalDS());
  }

  componentDidMount() {
    this.fetchSupplierLine();
  }

  getLocationSearch(key = null) {
    const { history } = this.props;
    const {
      location: { search = {} },
    } = history || {};
    const RouterParams = querystring.parse(search.substr(1)) || {};
    if (!key || typeof key !== 'string') {
      return RouterParams;
    }

    return RouterParams[key] || null;
  }

  // fetch supplier line
  async fetchSupplierLine(page = {}, params = {}) {
    const { organizationId, clarifyNotifyId } = this.props;
    const RouterParams = this.getLocationSearch();
    const { sourceFrom, sourceHeaderId } = RouterParams;

    try {
      let supplierLine = await fetchPriceClarificationDetailSupplierList({
        sourceFrom,
        sourceHeaderId,
        organizationId,
        clarifyNotifyId,
        ...page,
        ...params,
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

  /**
   * [永祥] 重写二开, 谨慎修改!!!
   * @protected
   */
  fetchQuoteLines(data = [], params = {}) {
    const { doubleUnitFlag = false, sourceKey, priceRemote, headerFormDS } = this.props;
    if (isEmpty(data)) {
      return;
    }

    const expandLines = {};
    const ids = [];
    const activeKeys = [];

    data.forEach((line) => {
      const {
        quotationHeaderId = null,
        supplierTotalAmount = null,
        supplierCompanyId = null,
        invalidFlag,
      } = line || {};

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

      const table = SupplierQuotationTableDS({
        editTable: true,
        doubleUnitFlag,
        invalidFlag,
        sourceKey: sourceKey || INQUIRY,
      });

      const tableDS = new DataSet(
        priceRemote
          ? priceRemote.process('SSRC_PRICE_CLARIFICATION_UPDATE_PROCESS_TABLE_LINE_DS', table, {
              headerFormDS,
            })
          : table
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
  tablePaginationChange(page, pageSize) {
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
  @debounce(2000)
  @Bind()
  viewLadderLevelPrepare(record = {}) {
    const {
      sourceHeaderId,
      organizationId,
      doubleUnitFlag,
      sourceKey,
      customizeTable,
    } = this.props;
    const recordData = record.toData() || {};
    const { quotationLineId } = recordData || {};

    const LadderCode = `SSRC.${sourceKey}_HALL.CLARIFICATION.QUOTATION_LADDER_LEVER_EDIT`;

    this.LadderLevelModalDS.setState('doubleUnitFlag', doubleUnitFlag);
    this.LadderLevelModalDS.setQueryParameter('commonProps', {
      organizationId,
      sourceHeaderId,
      quotationLineId,
      customizeUnitCode: LadderCode,
    });
    this.LadderLevelModalDS.query();

    const Props = {
      recordData,
      LadderCode,
      ladderLevelModalDS: this.LadderLevelModalDS,
      doubleUnitFlag,
      customizeTable,
    };

    const modalKey = Modal.key();

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
      priceRemote,
      headerFormDS,
    } = this.props;
    const { expandIds = {} } = this.state;
    const { quotationHeaderId = null } = item || {};

    if (!quotationHeaderId) {
      return;
    }

    let tableDS = (expandIds[quotationHeaderId] || {}).ds || null;
    const isRowOpenFlag = !!(expandIds[quotationHeaderId] || {}).isSelecteds;

    if (!isRowOpenFlag && !tableDS) {
      const table = SupplierQuotationTableDS({
        editTable: true,
        sourceKey: this.props.sourceKey || INQUIRY,
        doubleUnitFlag,
      });

      tableDS = new DataSet(
        priceRemote
          ? priceRemote.process('SSRC_PRICE_CLARIFICATION_UPDATE_PROCESS_TABLE_LINE_DS', table, {
              headerFormDS,
            })
          : table
      );
      tableDS.setQueryParameter('commonProps', {
        organizationId,
        quotationHeaderId,
        sourceFrom,
        clarifyNotifyId,
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

  renderHeader = (item = {}) => {
    const { headerFormDS = {}, japOrDutchBiddingTotalPrice, japanBiddingTotalPrice } = this.props;
    if (isEmpty(item)) {
      return null;
    }

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
      </Row>
    );
  };

  getTableColumns = () => {
    const { doubleUnitFlag, sourceKey = INQUIRY } = this.props;
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
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
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
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'quotationDetail',
        width: 100,
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
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
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
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validQuotationQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'model',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
            <>
              <a onClick={() => this.viewLadderLevelPrepare(record)}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
              </a>
            </>
          ) : null;
        },
      },
    ].filter(Boolean);

    return Columns;
  };

  renderTable(item = {}) {
    const { expandIds = {} } = this.state;
    const { customizeTable, sourceKey = INQUIRY } = this.props;
    const { quotationHeaderId = null } = item || {};
    if (!quotationHeaderId || isEmpty(item)) {
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
            code: `SSRC.${sourceKey}_HALL.CLARIFICATION.SUPPLIERQUOTATION_CREATE_EDIT`,
            dataSet: currentDS,
          },
          <Table dataSet={currentDS} columns={this.getTableColumns()} />
        )}
      </React.Fragment>
    );
  }

  /**
   * 二开埋点
   */
  cuxUpCollapse = () => {
    const { priceRemote, headerFormDS } = this.props;
    const { expandIds } = this.state;

    const cuxRender = priceRemote
      ? priceRemote.process('SSRC_PRICE_CLARIFICATION_UPDATE_PROCESS_UP_TABLE_CUX_RENDER', <></>, {
          expandIds,
          headerFormDS,
        })
      : '';

    return <>{cuxRender}</>;
  };

  render() {
    const { supplierList = [], supplierPagination = {}, activePanel = [] } = this.state;

    return (
      <div className={styles['ssrc-supplier-quote-table']}>
        {this.cuxUpCollapse()}

        <Collapse bordered={false} activeKey={activePanel} onChange={this.changeCollapse}>
          {supplierList &&
            supplierList.map((item = {}) => (
              <Panel
                disabled={!item?.quotationHeaderId || item?.allEliminate * 1}
                header={this.renderHeader(item)}
                key={item?.supplierCompanyId}
                // showArrow={false}
              >
                {this.renderTable(item)}
              </Panel>
            ))}
        </Collapse>
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
