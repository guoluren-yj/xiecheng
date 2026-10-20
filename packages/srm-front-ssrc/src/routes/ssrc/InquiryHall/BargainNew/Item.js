import React, { Component } from 'react';
import { Icon } from 'hzero-ui';
import {
  Row,
  Col,
  Button,
  // Form,
  Spin,
  Pagination,
  Table,
  Attachment,
  Tooltip,
  CheckBox,
  Lov,
} from 'choerodon-ui/pro';
import { Tag, Popover, Collapse } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { noop, isNil } from 'lodash';
import classnames from 'classnames';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';
import { calculateBasicQty } from '@/utils/utils';

import goodsIcon from '@/assets/goodsIcon.svg';
// import fileIcon from '@/assets/file.svg';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { invalidSupplierSymbol, numberSeparatorRender } from '@/utils/renderer';
import { INQUIRY, getQuotationName, BID } from '@/utils/globalVariable';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';

import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import styles from './index.less';

const eliminateIcon = require('@/assets/eliminate.svg');

const { Panel } = Collapse;

@observer
export default class Item extends Component {
  @Bind()
  openItemCounter(event, record) {
    event.stopPropagation();

    const { bargainFlag, getCurrentSupplierOrItemDataMap, fillCounterItem } = this.props;

    const { rfxLineItemId } = record.get(['rfxLineItemId']);

    const { currentTableDS } =
      getCurrentSupplierOrItemDataMap({
        id: rfxLineItemId,
        category: 'item',
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
      fillCounterItem(rfxLineItemId);
    }
  }

  quotationName = getQuotationName(this.props.sourceKey === BID);

  /**
   * 渲染折叠框头
   */
  @Bind()
  renderCollapseHeader(record) {
    const { collapseItemActiveKeys } = this.props;

    const {
      allEliminate,
      itemCode,
      itemName,
      rfxLineItemId,
      attachmentUuid,
      rfxLineItemNum,
      secondaryQuantity,
      secondaryUomName,
      taxRate,
      // supplierTotalAmount,
      // bargainTotalAmount,
    } = record
      ? record.get([
          'allEliminate',
          'itemCode',
          'itemName',
          'rfxLineItemId',
          'attachmentUuid',
          'rfxLineItemNum',
          'secondaryQuantity',
          'secondaryUomName',
          'taxRate',
          // 'supplierTotalAmount',
          // 'bargainTotalAmount',
        ])
      : {};

    const codeAndName =
      itemCode && itemName ? `${itemCode}-${itemName}` : itemCode || itemName || '';

    return (
      <Row>
        <Col span={1}>
          {allEliminate ? (
            <img src={eliminateIcon} alt="icon" />
          ) : (
            <img src={goodsIcon} alt="icon" />
          )}
        </Col>
        <Col span={5}>
          <h3>
            <Popover content={codeAndName}>{codeAndName}</Popover>
            <Icon
              className={styles.arrowIcon}
              type={collapseItemActiveKeys.includes(rfxLineItemId) ? 'up' : 'down'}
            />
          </h3>
          <div onClick={(e) => e.stopPropagation()}>
            <Attachment
              viewMode="popup"
              funcType="link"
              value={attachmentUuid}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-rfxitem"
              readOnly
            >
              {intl.get('hzero.common.upload.modal.title').d('附件')}
            </Attachment>
          </div>
        </Col>
        <Col span={18}>
          <Tag
            // style={{ backgroundColor: 'rgba(6,135,255,0.1)', color: 'rgb(6,135,255)' }}
            style={{ fontWeight: 'normal' }}
            color="geekblue"
            className={classnames(styles['bargin-tag'])}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号')}：{rfxLineItemNum}
          </Tag>
          <Tooltip title={`${secondaryQuantity} ${secondaryUomName}`}>
            <Tag
              // style={{ backgroundColor: 'rgba(243,49,103,0.1)', color: 'rgb(243,49,103)' }}
              style={{ fontWeight: 'normal' }}
              color="red"
              className={classnames(styles['bargin-tag'])}
            >
              {secondaryQuantity}（{secondaryUomName}）
            </Tag>
          </Tooltip>
          <Tag
            // style={{ backgroundColor: 'rgba(255,188,0,0.1)', color: 'rgb(255,188,0)' }}
            style={{ fontWeight: 'normal' }}
            color="yellow"
            className={classnames(styles['bargin-tag'])}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）')}：
            {taxRate ?? '-'}
          </Tag>
        </Col>
        {/* {bargainFlag ? (
          <Col span={3}>
            <Button
              color="primary"
              // disabled={!flag}
              onClick={(event) => this.openItemCounter(event, record)}
            >
              {intl.get('ssrc.inquiryHall.view.message.button.fillCounteroffers').d('批量填写还价')}
            </Button>
          </Col>
        ) : (
          ''
        )} */}
      </Row>
    );
  }

  // 永祥二开
  @Bind()
  renderRowSelect(barSelectItemLine) {
    return barSelectItemLine;
  }

  @Bind()
  renderRedMinPrice({ value, record, name, isNeedSeparator = true }) {
    const { remote } = this.props;
    const formatValue = isNeedSeparator ? numberSeparatorRender(value) : value;
    if (isNil(value)) return value;
    const redField = record.get('redField');
    const itemOfflineFieldColorRemote = remote
      ? remote?.process('SSRC_BARGAIN_NEW_PROCESS_BARGAIN_ITEM_TABLE_COLOR', 'red')
      : 'red';

    return redField === name ? (
      <span style={{ color: itemOfflineFieldColorRemote }}>{formatValue}</span>
    ) : (
      formatValue
    );
  }

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

  getButtons = ({ record }) => {
    const { bargainFlag } = this.props;

    const buttons = [
      bargainFlag ? (
        <Button
          // color="primary"
          icon="auto_complete"
          funcType="flat"
          onClick={(event) => this.openItemCounter(event, record)}
        >
          {intl.get('ssrc.inquiryHall.view.message.button.fillCounteroffers').d('批量填写还价')}
        </Button>
      ) : (
        ''
      ),
    ];

    return buttons;
  };

  /**
   * 渲染第几轮淘汰
   * @param {Object} params 参数
   */
  roundEliminate({ value, record }) {
    const { supplierStatus } = record?.get(['supplierStatus']);

    return (
      <div className={styles['round-eliminate']}>
        <span className={styles['round-eliminate-supplier']}>{value}</span>
        <>
          {record.get('eliminateRoundNumber') ? (
            <div className={styles['round-quotation-container']}>
              <span className={styles['round-quotation']}>
                {Number(record.get('eliminateRoundNumber')) === 1
                  ? intl.get('ssrc.inquiryHall.model.inquiryHall.firstEliminate').d('首轮淘汰')
                  : `${intl.get('ssrc.inquiryHall.model.inquiryHall.theThird').d('第')}${record.get(
                      'eliminateRoundNumber'
                    )}${intl.get('ssrc.inquiryHall.model.inquiryHall.roundEliminate').d('轮淘汰')}`}
              </span>
            </div>
          ) : null}
        </>
        {invalidSupplierSymbol({ supplierStatus })}
      </div>
    );
  }

  getColumns = (data = {}) => {
    const {
      organizationId,
      bargainFlag,
      doubleUnitFlag,
      remote,
      bidFlag,
      newQuotationFlag,
      bargainHeader,
      ladderInquiryrender = noop,
      // viewLadderLevel = noop,
      getAllTabTableCommonFields = noop,
      fetchCurrentSupplierOrItemTableByLineId = noop,
      tableRenderQuotatyByUomPrecision = noop,
      dynamicChangePrice = noop,
    } = this.props;
    const { tableHeaderRecord, rfxLineItemId } = data || {};

    const commonFields = getAllTabTableCommonFields() || [];

    const itemOfflineFieldColorRemote = remote
      ? remote?.process('SSRC_BARGAIN_NEW_PROCESS_BARGAIN_ITEM_OFFLINE_TABLE_COLOR', 'red')
      : 'red';

    const preColumns = [
      {
        name: 'supplierCompanyName',
        width: 380,
        renderer: this.roundEliminate,
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
                color:
                  highlightField !== 'currentQuotationSecPrice' ? '' : itemOfflineFieldColorRemote,
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
                color: highlightField !== 'netSecondaryPrice' ? '' : itemOfflineFieldColorRemote,
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
                color:
                  highlightField !== 'currentQuotationPrice' ? '' : itemOfflineFieldColorRemote,
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
                color: highlightField !== 'netPrice' ? '' : itemOfflineFieldColorRemote,
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
        name: 'validQuotationPrice',
        width: 120,
        align: 'right',
        hidden: !bargainFlag,
        editor: false,
        renderer: ({ value, record }) => {
          const { redField } = record.get(['redField']);
          const valStr = numberSeparatorRender(value);

          return redField === 'validQuotationPrice' ? (
            <span
              style={{
                color: remote
                  ? remote?.process('SSRC_BARGAIN_NEW_PROCESS_BARGAIN_ITEM_TABLE_COLOR', 'red')
                  : 'red',
              }}
            >
              {valStr}
            </span>
          ) : (
            valStr
          );
        },
      },
      {
        name: 'validNetPrice',
        align: 'right',
        width: 120,
        editor: false,
        hidden: !bargainFlag,
        renderer: ({ value, record }) =>
          this.renderRedMinPrice({ value, record, name: 'validNetPrice', isNeedSeparator: false }),
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
        name: 'preQuotationPrice',
        width: 120,
        align: 'right',
        editor: false,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'priceFluctuation',
        width: 120,
        editor: false,
        align: 'right',
      },
      {
        name: 'currentBargainPrice',
        width: 140,
        // sortable: true,
        hidden: !bargainFlag,
        align: 'right',
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
        editor: bargainFlag,
        hidden: !bargainFlag,
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
            // editor: !bargainFlag,
            editor: (record) => {
              if (bargainFlag) {
                return false;
              }

              return <CheckBox onChange={() => dynamicChangePrice({ record })} />;
            },
          },
      {
        name: 'taxId',
        width: 140,
        hidden: bargainFlag,
        // editor: !bargainFlag,
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
        name: 'taxRate',
        width: 120,
        hidden: !bargainFlag,
        align: 'right',
        editor: false,
      },
      {
        name: 'ladderInquiryFlag',
        width: 140,
        renderer: ladderInquiryrender,
        editor: false,
      },
      {
        name: 'quotationDetailFlag',
        width: 140,
        renderer: ({ record }) => (
          <QuotationDetail
            rowData={record}
            sourceFrom="RFX"
            uiType="c7n-pro"
            allowBuyerViewFlag
            bidFlag={bidFlag}
          />
        ),
      },
      {
        name: 'totalPrice',
        width: 120,
        align: 'right',
        renderer: ({ value, record }) => {
          const { benchmarkPriceType } = bargainHeader || {};
          const { hiddenQuotationFlag, netAmount } = record.get([
            'hiddenQuotationFlag',
            'netAmount',
          ]);
          const valStr = numberSeparatorRender(value);

          const priceValue =
            hiddenQuotationFlag === 1
              ? '***'
              : benchmarkPriceType === 'TAX_INCLUDED_PRICE'
              ? valStr
              : numberSeparatorRender(netAmount);

          return priceValue;
        },
        editor: false,
      },
      {
        name: 'validQuotationRemark',
        width: 140,
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
        name: 'secondaryQuantity',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag,
        renderer: ({ value }) => numberSeparatorRender(value),
        editor: false,
      },
      {
        name: 'currentQuotationQuantity',
        width: 120,
        hidden: bargainFlag,
        align: 'right',
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
        name: 'currentQuotationSecQuantity',
        width: 120,
        hidden: bargainFlag || !doubleUnitFlag,
        align: 'right',
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
        name: 'secondaryQuantity',
        width: 120,
        hidden: !doubleUnitFlag,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validQuotationSecQuantity',
        width: 120,
        align: 'right',
        hidden: !doubleUnitFlag || !bargainFlag,
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
        name: 'validExpiryDateFrom',
        width: 120,
        editor: false,
        hidden: !bargainFlag,
      },
      {
        name: 'validExpiryDateTo',
        width: 120,
        editor: false,
        hidden: !bargainFlag,
      },
      {
        name: 'validPromisedDate',
        width: 120,
        editor: false,
        hidden: !bargainFlag,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
        editor: false,
        align: 'right',
        hidden: !bargainFlag,
      },
      {
        name: 'minPurchaseQuantity',
        align: 'right',
        width: 120,
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
        align: 'right',
        width: 120,
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
            renderer: ({ value }) => yesOrNoRender(value),
          }
        : {
            name: 'freightIncludedFlag',
            width: 120,
            editor: true,
          },
      bargainFlag
        ? {
            name: 'freightAmount',
            width: 120,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
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
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.minPrice`).d('最低价'),
        name: 'minPrice',
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
        ...commonFields,
      },
    ].filter(Boolean);

    const columns = remote
      ? remote.process('SSRC_BARGAIN_NEW_PROCESS_ITEM_ONLINE_COLUMN', preColumns, {
          bargainFlag,
          bidFlag,
          rfxLineItemId,
          tableHeaderRecord,
          fetchCurrentSupplierOrItemTableByLineId,
        })
      : preColumns;

    return columns;
  };

  /**
   * 渲染表格
   */
  @Bind()
  renderItemTable(data = {}) {
    const {
      // loadingFlag,
      itemMap,
      sourceKey = INQUIRY,
      customizeTable,
      bargainFlag = false,
    } = this.props;

    const { record } = data || {};

    if (!record || !itemMap) {
      return '';
    }

    const { rfxLineItemId } = record ? record.get(['rfxLineItemId']) : {};
    const { currentTableDS } = itemMap.get(rfxLineItemId) || {};

    if (!currentTableDS) {
      return '';
    }

    return (
      <div>
        {customizeTable(
          {
            code: bargainFlag
              ? `SSRC.${sourceKey}_HALL_BARGAIN.ITEMDETAILS`
              : `SSRC.${sourceKey}_HALL_BARGAIN.ITEMDETAILS_OFFLINE`,
          },
          <Table
            bordered
            dataSet={currentTableDS}
            rowKey="quotationLineId"
            columns={this.getColumns({ tableHeaderRecord: record, rfxLineItemId })}
            style={{
              maxHeight: '400px',
            }}
            buttons={this.getButtons({ record })}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      handleItemCallBack,
      collapseItemActiveKeys,
      // viewLadderLevelVisible,
      // hideModal,
      // barginLadderLevelData,
      // onSaveBarginLadderLine,
      // LadderLevelHeaderData,
      // saveLoading,
      // fetchLoading,
      // doubleUnitFlag,
      itemListDS,
      loadingFlag = {},
    } = this.props;

    return (
      <div className={styles['ssrc-customer-component']}>
        {itemListDS
          ? itemListDS.map((record) => {
              const { rfxLineItemId } = record ? record.get(['rfxLineItemId']) : {};

              return (
                <Collapse
                  className={styles.collapseAll}
                  activeKey={collapseItemActiveKeys}
                  onChange={(key) => handleItemCallBack(key, { rfxLineItemId })}
                >
                  <Panel
                    header={this.renderCollapseHeader(record)}
                    showArrow={false}
                    key={String(rfxLineItemId)}
                  >
                    <Spin spinning={loadingFlag?.[rfxLineItemId]} key={rfxLineItemId}>
                      {this.renderItemTable({ record })}
                    </Spin>
                  </Panel>
                </Collapse>
              );
            })
          : ''}
        {itemListDS?.totalCount > 10 ? (
          <Pagination dataSet={itemListDS} className={styles.pagination} />
        ) : (
          ''
        )}
      </div>
    );
  }
}
