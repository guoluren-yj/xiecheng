import React, { Component } from 'react';
import { Icon } from 'hzero-ui';
import {
  Row,
  Col,
  Button,
  // Form,
  Spin,
  Pagination,
  Tooltip,
  Table,
  Attachment,
  CheckBox,
  Lov,
} from 'choerodon-ui/pro';
import { Tag, Popover, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import { noop, isNil } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { calculateBasicQty } from '@/utils/utils';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { phoneRender, roundEliminate, numberSeparatorRender } from '@/utils/renderer';
import supplierIcon from '@/assets/supplierIcon.svg';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';

import styles from './index.less';

const eliminateIcon = require('@/assets/eliminate.svg');

const { Panel } = Collapse;

class SupplierComponnet extends Component {
  quotationName = getQuotationName(this.props?.sourceKey === BID);

  @Bind()
  openFillCounter(event, record) {
    const { bargainFlag, getCurrentSupplierOrItemDataMap, fillCounterSupplier } = this.props;
    event.stopPropagation();

    const { rfxLineSupplierId } = record.get(['rfxLineSupplierId']);

    const { currentTableDS } =
      getCurrentSupplierOrItemDataMap({
        id: rfxLineSupplierId,
        category: 'supplier',
      }) || {};

    const selectedLength = currentTableDS?.selected?.length;
    const needSelectedLineInBargain = bargainFlag && !selectedLength;

    if (needSelectedLineInBargain) {
      notification.warning({
        message: intl
          .get(`ssrc.inquiryHall.model.bargain.pleaseTickTheLine`)
          .d('请勾选要批量填写还价的行'),
      });
    } else {
      fillCounterSupplier(rfxLineSupplierId);
    }
  }

  getCommonPriceTagRender = (data) => {
    const { valueText = '', tagProps = {}, showFlag = true } = data || {};

    if (!showFlag) {
      return '';
    }

    return (
      <Tooltip placement="topLeft" title={valueText}>
        <Tag
          style={{ fontWeight: 'normal' }}
          color="red"
          className={classnames(styles['bargin-tag'], styles['bargin-tag-width'])}
          border={null}
          {...tagProps}
        >
          {valueText}
        </Tag>
      </Tooltip>
    );
  };

  /**
   * 渲染折叠面板头信息
   */
  renderCollapseHeader = (record) => {
    const {
      // supplierSelectKeys,
      // dataSource,
      collapseSupplierActiveKeys,
      viewScoreDetail = noop,
      remote,
      bargainHeader,
      bargainFlag,
      japOrDutchBiddingTotalPrice = () => {},
      japanBiddingTotalPrice = () => {},
    } = this.props;
    const { benchmarkPriceType } = bargainHeader || {};

    const japanDutchTotalBidding = japOrDutchBiddingTotalPrice && japOrDutchBiddingTotalPrice();
    const japanTotalBidding = japanBiddingTotalPrice && japanBiddingTotalPrice();

    const {
      allEliminate,
      supplierCompanyName,
      rfxLineSupplierId,
      contactName,
      internationalTelCodeMeaning,
      contactMobilephone,
      contactMail,
      score,
      feedbackStatusMeaning,
      supplierTotalAmount,
      bargainTotalAmount,
      acceptQtnNetAmount,
      acceptQtnTotalAmount,
      biddingRoundSupplierStatus = null,
      biddingRoundSupplierStatusMeaning,
      biddingAcceptCount,
      supplementQtnTotalAmount,
      supplementQtnNetAmount,
      biddingSupplierAcceptNumber,
    } = record
      ? record.get([
          'allEliminate',
          'supplierCompanyName',
          'rfxLineSupplierId',
          'contactName',
          'internationalTelCodeMeaning',
          'contactMobilephone',
          'contactMail',
          'score',
          'feedbackStatusMeaning',
          'supplierTotalAmount',
          'bargainTotalAmount',
          'acceptQtnNetAmount',
          'acceptQtnTotalAmount',
          'biddingRoundSupplierStatus',
          'biddingRoundSupplierStatusMeaning',
          'biddingAcceptCount',
          'supplementQtnTotalAmount',
          'supplementQtnNetAmount',
          'biddingSupplierAcceptNumber',
        ])
      : {};

    const taxIncluded = benchmarkPriceType === 'TAX_INCLUDED_PRICE';

    const supplierTotalAmountShowFlag = remote
      ? remote.process('SSRC_BARGAIN_NEW_PROCESS_SUPPLIER_TO_TOTAL_AMOUNT_SHOW_FLAG', true, {
          header: bargainHeader,
          record,
        })
      : true;

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
              showFlag: japanDutchTotalBidding && !isNil(supplementAmountPrice),
            }),
          ]
        : '';

    return (
      <Row>
        <Col span={1}>
          {allEliminate ? (
            <img src={eliminateIcon} alt="icon" />
          ) : (
            <img src={supplierIcon} alt="icon" />
          )}
        </Col>
        <Col span={11}>
          <h3>
            <Popover content={supplierCompanyName}>{supplierCompanyName}</Popover>
            <Icon
              className={styles.arrowIcon}
              type={collapseSupplierActiveKeys.includes(rfxLineSupplierId) ? 'up' : 'down'}
            />
          </h3>
          <div>
            <span>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.contacts`).d('联系人')}：{contactName}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.tel`).d('联系电话')}：
              {phoneRender(internationalTelCodeMeaning, contactMobilephone)}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.email`).d('电子邮件')}：{contactMail}
            </span>
          </div>
        </Col>
        <Col span={2} className="score">
          {!isNil(score) ? (
            <div>
              {intl.get('ssrc.inquiryHall.model.inquiryHall.getScore').d('得分')}：
              <a onClick={(e) => viewScoreDetail(e, record)}>{score}</a>
            </div>
          ) : (
            ''
          )}
        </Col>
        <Col span={10} style={{ marginTop: '14px' }}>
          {!japanDutchTotalBidding ? (
            <Tooltip placement="topLeft" title={feedbackStatusMeaning}>
              <Tag
                style={{ fontWeight: 'normal' }}
                color="geekblue"
                className={classnames(styles['bargin-tag'])}
              >
                {feedbackStatusMeaning}
              </Tag>
            </Tooltip>
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

          {supplierTotalAmountShowFlag && !japanDutchTotalBidding ? (
            <Tooltip
              placement="topLeft"
              title={
                <span>
                  {intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.commonAlreadyQuotationAmn`, {
                      quotationName: this.quotationName,
                    })
                    .d('{quotationName}金额')}
                  ：{supplierTotalAmount}
                </span>
              }
            >
              <Tag
                // style={{
                //   backgroundColor: 'rgba(243,49,103,0.1)',
                //   color: 'rgb(243,49,103)',
                //   border: 'none',
                // }}
                style={{ fontWeight: 'normal' }}
                color="red"
                className={classnames(styles['bargin-tag'])}
              >
                {intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.commonAlreadyQuotationAmn`, {
                    quotationName: this.quotationName,
                  })
                  .d('{quotationName}金额')}
                ：{supplierTotalAmount}
              </Tag>
            </Tooltip>
          ) : (
            ''
          )}
          {bargainFlag && !japanDutchTotalBidding ? (
            <Tooltip
              placement="topLeft"
              title={
                <span>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainQu0tationAmn`).d('还价金额')}
                  ：{bargainTotalAmount}
                </span>
              }
            >
              <Tag
                // style={{
                //   backgroundColor: 'rgba(255,188,0,0.1)',
                //   color: 'rgb(255,188,0)',
                //   border: 'none',
                // }}
                style={{ fontWeight: 'normal' }}
                color="yellow"
                className={classnames(styles['bargin-tag'])}
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.bargainQu0tationAmn`).d('还价金额')}：
                {bargainTotalAmount}
              </Tag>
            </Tooltip>
          ) : (
            ''
          )}

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
        {/* <Col span={3} style={{ marginTop: '14px' }}>
          <Button color="primary" onClick={(event) => this.openFillCounter(event, record)}>
            {intl.get('ssrc.inquiryHall.view.message.button.fillCounteroffers').d('批量填写还价')}
          </Button>
        </Col> */}
      </Row>
    );
  };

  getButtons = ({ record }) => {
    const { bargainFlag } = this.props;

    const buttons = [
      bargainFlag ? (
        <Button
          color="primary"
          icon="auto_complete"
          funcType="flat"
          onClick={(event) => this.openFillCounter(event, record)}
        >
          {intl.get('ssrc.inquiryHall.view.message.button.fillCounteroffers').d('批量填写还价')}
        </Button>
      ) : (
        ''
      ),
    ];

    return buttons;
  };

  changeCurrentQuotationSecondaryQuantity(value, record) {
    const { doubleUnitFlag, dynamicChangePrice = noop } = this.props;
    const { itemId, quotationLineId, uomId, secondaryUomId } = record.get([
      'itemId',
      'quotationLineId',
      'uomId',
      'secondaryUomId',
    ]);

    if (value) {
      if (doubleUnitFlag && itemId) {
        calculateBasicQty({
          secondaryQuantity: value,
          itemId,
          businessKey: quotationLineId,
          doublePrimaryUomId: uomId,
          secondaryUomId,
        }).then((res) => {
          record.set({ currentQuotationQuantity: res });
        });
      } else {
        record.set({ currentQuotationQuantity: value });
      }
    } else if (value === 0) {
      record.set({ currentQuotationQuantity: value });
    }

    if (typeof dynamicChangePrice === 'function') {
      dynamicChangePrice({ record });
    }
  }

  getColumns = (data = {}) => {
    const {
      organizationId,
      bargainFlag,
      doubleUnitFlag,
      remote,
      sourceKey = INQUIRY,
      newQuotationFlag,
      ladderInquiryrender = noop,
      getAllTabTableCommonFields = noop,
      fetchCurrentSupplierOrItemTableByLineId = noop,
      tableRenderQuotatyByUomPrecision = noop,
      dynamicChangePrice = noop,
    } = this.props;
    const { tableHeaderRecord, rfxLineSupplierId } = data || {};

    const commonFields = getAllTabTableCommonFields() || [];

    const colorRemote = remote
      ? remote?.process('SSRC_BARGAIN_NEW_PROCESS_BARGAIN_SUPPLIER_OFFLINE_TABLE_COLOR', 'red')
      : 'red';

    const preColumns = [
      {
        name: 'rfxLineItemNum',
        width: 60,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 250,
        renderer: ({ value, record }) => roundEliminate(value, record, { uiType: 'c7n-pro' }),
      },
      {
        name: 'specs',
        width: 120,
      },
      {
        name: 'quotationLineStatusMeaning',
        width: 120,
        renderer: ({ record }) => {
          const { quotationLineStatusMeaning, quotationLineStatus } = record.get([
            'quotationLineStatusMeaning',
            'quotationLineStatus',
          ]);

          return renderStatusTag({
            status: quotationLineStatus,
            statusMeaning: quotationLineStatusMeaning,
          });
        },
      },
      {
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        hidden: !bargainFlag,
        editor: false,
        renderer: ({ value }) => {
          const valStr = numberSeparatorRender(value);
          return valStr;
        },
      },
      {
        name: 'validNetPrice',
        align: 'right',
        width: 120,
        hidden: !bargainFlag,
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validQuotationSecPrice',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag || !bargainFlag,
        editor: false,
        renderer: ({ value }) => {
          const valStr = numberSeparatorRender(value);
          return valStr;
        },
      },
      {
        name: 'validNetSecondaryPrice',
        align: 'right',
        width: 120,
        hidden: !doubleUnitFlag || !bargainFlag,
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'currentQuotationSecPrice',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag || bargainFlag,
        editor: (line) => {
          const { highlightField } = line.get(['highlightField']);

          if (!doubleUnitFlag || bargainFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              name="currentQuotationSecPrice"
              currency="quotationCurrencyCode"
              record={line}
              omitZeroFlag
              style={{
                width: '120%',
                color: highlightField !== 'currentQuotationSecPrice' ? '' : colorRemote,
              }}
              onChange={() => dynamicChangePrice({ record: line })}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'netSecondaryPrice',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag || bargainFlag,
        editor: (line) => {
          const { highlightField } = line.get(['highlightField']);

          if (!doubleUnitFlag || bargainFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              name="netSecondaryPrice"
              currency="quotationCurrencyCode"
              record={line}
              omitZeroFlag
              style={{
                width: '120%',
                color: highlightField !== 'netSecondaryPrice' ? '' : colorRemote,
              }}
              onChange={() => dynamicChangePrice({ record: line })}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'currentQuotationPrice',
        width: 120,
        align: 'right',
        hidden: bargainFlag,
        editor: (line) => {
          const { highlightField } = line.get(['highlightField']);

          if (doubleUnitFlag || bargainFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              name="currentQuotationPrice"
              currency="quotationCurrencyCode"
              record={line}
              omitZeroFlag
              style={{
                width: '120%',
                color: highlightField !== 'currentQuotationPrice' ? '' : colorRemote,
              }}
              onChange={() => dynamicChangePrice({ record: line })}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'netPrice',
        width: 120,
        align: 'right',
        hidden: bargainFlag,
        editor: (line) => {
          const { highlightField } = line.get(['highlightField']);

          if (doubleUnitFlag || bargainFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              name="netPrice"
              currency="quotationCurrencyCode"
              record={line}
              omitZeroFlag
              style={{
                width: '120%',
                color: highlightField !== 'netPrice' ? '' : colorRemote,
              }}
              onChange={() => dynamicChangePrice({ record: line })}
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'preQuotationPrice',
        width: 120,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'priceFluctuation',
        width: 120,
        align: 'right',
      },
      {
        name: 'currentBargainPrice',
        width: 140,
        align: 'right',
        hidden: !bargainFlag,
        // sortable: true,
        editor: (line) => {
          if (!bargainFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              name="currentBargainPrice"
              currency="quotationCurrencyCode"
              record={line}
              omitZeroFlag
            />
          );
        },
        renderer: ({ record, value }) =>
          numberSeparatorRender(value, record.getState('currency_precision'), {
            omitZeroFlag: true,
          }),
      },
      {
        name: 'currentBargainRemark',
        width: 140,
        hidden: !bargainFlag,
        editor: bargainFlag,
      },
      {
        name: 'validBargainPrice',
        width: 120,
        hidden: !bargainFlag,
        editor: false,
        align: 'right',
        renderer: ({ value }) => {
          const valStr = numberSeparatorRender(value);
          return valStr;
        },
      },
      {
        name: 'validBargainRemark',
        width: 120,
        hidden: !bargainFlag,
        editor: false,
      },
      bargainFlag
        ? {
            name: 'taxIncludedFlag',
            width: 120,
            editor: false,
            renderer: ({ value }) => yesOrNoRender(value),
          }
        : {
            name: 'taxIncludedFlag',
            width: 120,
            editor: (record) => {
              if (bargainFlag) {
                return false;
              }

              return <CheckBox onChange={() => dynamicChangePrice({ record })} />;
            },
          },
      {
        name: 'taxRate',
        width: 120,
        align: 'right',
        hidden: !bargainFlag,
      },
      {
        name: 'taxId',
        width: 140,
        hidden: bargainFlag,
        editor: (record) => {
          if (bargainFlag) {
            return false;
          }

          return (
            <Lov
              paramMatcher={({ text }) => {
                return !isNaN(text) ? { taxRate: text } : { taxCode: text };
              }}
              onChange={() => dynamicChangePrice({ record })}
            />
          );
        },
      },
      {
        name: 'ladderInquiryFlag',
        width: 140,
        renderer: ladderInquiryrender,
        editor: false,
      },
      // 此列二开，禁止修改字段名
      {
        name: 'quotationDetailFlag',
        width: 140,
        renderer: ({ record }) => (
          <QuotationDetail
            rowData={record}
            sourceFrom="RFX"
            uiType="c7n-pro"
            allowBuyerViewFlag
            bidFlag={sourceKey === 'BID'}
          />
        ),
      },
      {
        name: 'validQuotationRemark',
        width: 120,
        editor: false,
      },
      {
        name: 'currentQuotationRemark',
        width: 140,
        hidden: bargainFlag,
        editor: !bargainFlag,
      },
      {
        name: 'rfxQuantity',
        width: 120,
        align: 'right',
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validQuotationQuantity',
        width: 120,
        align: 'right',
        hidden: !bargainFlag,
        editor: false,
      },
      {
        name: 'uomName',
        width: 140,
      },
      {
        name: 'secondaryQuantity',
        width: 120,
        hidden: !doubleUnitFlag,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'currentQuotationSecQuantity',
        width: 120,
        align: 'right',
        hidden: bargainFlag || !doubleUnitFlag,
        editor: (record) => {
          if (bargainFlag || !doubleUnitFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              record={record}
              uom="secondaryUomId"
              name="currentQuotationSecQuantity"
              onChange={(val) => this.changeCurrentQuotationSecondaryQuantity(val, record)}
            />
          );
        },
        renderer: tableRenderQuotatyByUomPrecision,
      },
      {
        name: 'currentQuotationQuantity',
        width: 120,
        align: 'right',
        hidden: bargainFlag,
        editor: (record) => {
          if (bargainFlag || doubleUnitFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              record={record}
              uom="uomId"
              name="currentQuotationQuantity"
              onChange={() => dynamicChangePrice({ record })}
            />
          );
        },
        renderer: tableRenderQuotatyByUomPrecision,
      },
      {
        name: 'validQuotationSecQuantity',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag,
      },
      {
        name: 'secondaryUomName',
        width: 140,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'validExpiryDateFrom',
        width: 120,
        hidden: !bargainFlag,
      },
      {
        name: 'validExpiryDateTo',
        width: 120,
        hidden: !bargainFlag,
      },
      {
        name: 'validPromisedDate',
        width: 120,
        hidden: !bargainFlag,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
        hidden: !bargainFlag,
        align: 'right',
      },
      {
        name: 'currentExpiryDateFrom',
        width: 120,
        editor: !bargainFlag,
        hidden: bargainFlag,
      },
      {
        name: 'currentExpiryDateTo',
        width: 120,
        editor: !bargainFlag,
        hidden: bargainFlag,
      },
      {
        name: 'currentPromisedDate',
        width: 120,
        editor: !bargainFlag,
        hidden: bargainFlag,
      },
      {
        name: 'currentDeliveryCycle',
        width: 120,
        editor: !bargainFlag,
        hidden: bargainFlag,
      },
      {
        name: 'priceBatchQuantity',
        width: 130,
        hidden: !bargainFlag,
        align: 'right',
      },
      {
        name: 'minPurchaseQuantity',
        width: 120,
        align: 'right',
        editor: (record) => {
          if (bargainFlag) {
            return false;
          }
          return <C7nPrecisionInputNumber record={record} uom="uomId" name="minPurchaseQuantity" />;
        },
        renderer: tableRenderQuotatyByUomPrecision,
      },
      {
        name: 'minPackageQuantity',
        width: 120,
        align: 'right',
        editor: (record) => {
          if (bargainFlag) {
            return false;
          }

          return <C7nPrecisionInputNumber record={record} uom="uomId" name="minPurchaseQuantity" />;
        },
        renderer: tableRenderQuotatyByUomPrecision,
      },
      bargainFlag
        ? {
            name: 'freightIncludedFlag',
            width: 120,
            editor: false,
            renderer: ({ value }) => yesOrNoRender(value),
          }
        : {
            name: 'freightIncludedFlag',
            width: 120,
            editor: !bargainFlag,
          },
      {
        name: 'freightAmount',
        width: 120,
        align: 'right',
        editor: (record) => {
          if (bargainFlag) {
            return false;
          }

          return (
            <C7nPrecisionInputNumber
              record={record}
              name="freightAmount"
              financial="quotationCurrencyCode"
              omitZeroFlag
            />
          );
        },
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'minPrice',
        width: 150,
        hidden: bargainFlag,
      },
      {
        width: 120,
        name: 'newPrice',
        align: 'right',
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'companyName',
        width: 140,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 140,
        renderer: ({ record }) => {
          return !newQuotationFlag ? (
            <Attachment
              name="attachmentUuid"
              readOnly
              filePreview
              viewMode="popup"
              record={record}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationline"
              data={{
                tenantId: organizationId,
              }}
              funcType="link"
            />
          ) : (
            <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
          );
        },
      },
      ...commonFields,
    ].filter(Boolean);

    const columns = remote
      ? remote.process('SSRC_BARGAIN_NEW_PROCESS_SUPPLIER_ONLINE_COLUMN', preColumns, {
          // supplierId,
          bargainFlag,
          rfxLineSupplierId,
          // proSupplierPagination,
          tableHeaderRecord,
          bidFlag: sourceKey === 'BID',
          fetchCurrentSupplierOrItemTableByLineId,
          // changePage: this.changePage,
        })
      : preColumns;

    return columns;
  };

  /**
   * 渲染供应商表格
   */
  renderSupplierTable = (data = {}) => {
    const {
      supplierMap,
      sourceKey = INQUIRY,
      // loadingFlag,
      // barSelectSupplierLine,
      // organizationId,
      // pageSize,
      // viewLadderLevel,
      customizeTable,
      // doubleUnitFlag = false,
      // newQuotationFlag = 0,
      bargainFlag = false,
      // remote,
    } = this.props;
    const { record } = data || {};

    if (!record || !supplierMap) {
      return '';
    }

    const { rfxLineSupplierId } = record ? record.get(['rfxLineSupplierId']) : {};
    const { currentTableDS } = supplierMap.get(rfxLineSupplierId) || {};

    if (!currentTableDS) {
      return '';
    }

    return (
      <div>
        {customizeTable(
          {
            code: bargainFlag
              ? `SSRC.${sourceKey}_HALL_BARGAIN.SUPPLIER`
              : `SSRC.${sourceKey}_HALL_BARGAIN.SUPPLIER_OFFLINE`,
          },
          <Table
            bordered
            dataSet={currentTableDS}
            rowKey="quotationLineId"
            columns={this.getColumns({ tableHeaderRecord: record, rfxLineSupplierId })}
            style={{
              maxHeight: '400px',
            }}
            buttons={this.getButtons({ record })}
          />
        )}
      </div>
    );
  };

  render() {
    const {
      supplierListDS,
      // headerPagination,
      handleCollBack,
      // dataSource,
      // pagination,
      // onChangePagination,
      collapseSupplierActiveKeys,
      // fetchSupplierLineBargainLoading,
      // doubleUnitFlag,
      loadingFlag = {},
    } = this.props;

    return (
      <div className={styles['ssrc-customer-component']}>
        {supplierListDS?.length
          ? supplierListDS.map((record) => {
              const { rfxLineSupplierId } = record ? record.get(['rfxLineSupplierId']) : {};

              return (
                <Collapse
                  className={styles.collapseAll}
                  activeKey={collapseSupplierActiveKeys}
                  onChange={(key) =>
                    handleCollBack(key, {
                      rfxLineSupplierId,
                    })
                  }
                >
                  <Panel
                    header={this.renderCollapseHeader(record)}
                    showArrow={false}
                    key={String(rfxLineSupplierId)}
                  >
                    <Spin
                      spinning={loadingFlag?.[rfxLineSupplierId] === true}
                      key={rfxLineSupplierId}
                    >
                      {this.renderSupplierTable({
                        record,
                      })}
                    </Spin>
                  </Panel>
                </Collapse>
              );
            })
          : ''}

        {supplierListDS?.totalCount > 10 ? (
          <Pagination dataSet={supplierListDS} className={styles.pagination} />
        ) : (
          ''
        )}
      </div>
    );
  }
}

const hocComponent = (Com) => {
  return observer(Com);
};

export default hocComponent(SupplierComponnet);

export { hocComponent, SupplierComponnet };
