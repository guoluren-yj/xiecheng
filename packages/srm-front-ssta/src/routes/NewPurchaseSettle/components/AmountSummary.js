/*
 * @Description: file content
 * @Date: 2022-02-10 19:34:04
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useState, useCallback, Fragment, useMemo, useEffect } from 'react';
import { Modal, SelectBox } from 'choerodon-ui/pro';
import { Icon, Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react';
import IMChatDraggable from '_components/IMChatDraggable';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';

import pin from '@/assets/pin.svg';
import cancelPin from '@/assets/cancel_pin.svg';
import StatusTag from '@/routes/Components/StatusTag';
import { getSettleHeaderData } from '@/services/settlePoolServices';
import { decimalSum } from '@/utils/amountConfig';
import { recordPickValues, formatNumber } from '@/utils/utils';
import { Store } from '../Detail/StoreProvider';
import styles from '../Detail/index.less';

const cardCodes = {
  INVOICE: 'SSTA_SETTLE_INVOICE',
  PAYMENT: 'SSTA_SETTLE_PAYMENT',
};

const AmountCard = (defaultProps) => {
  const { remoteProps } = useContext(Store);
  const props = remoteProps
    ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.AMOUNT_CARD_PROPS', defaultProps)
    : defaultProps;
  const {
    col,
    title,
    iconColor,
    help,
    noDetail,
    netAmount,
    taxAmount,
    iconType,
    taxIncludedAmount,
    setTailDiffShow,
    operationType,
    operationFunc,
    operationHelp,
    isInvOnlyTailFlag = false,
  } = props;

  return (
    <div className={`amount-card amount-col-${col}`}>
      <div className="amount-total">
        <div>
          <Icon type={iconType} className="amount-icon" style={{ color: iconColor }} />
          <span className="amount-header">{title}</span>
          {help && (
            <Tooltip title={help}>
              <Icon type="help" />
            </Tooltip>
          )}
          {operationFunc && (
            <Tooltip title={operationHelp}>
              <Icon
                type={operationType}
                onClick={operationFunc}
                className="amount-card-operation-icon"
              />
            </Tooltip>
          )}
        </div>
        <div className="expand-card">
          <span className="amount-header">{taxIncludedAmount}</span>
          {setTailDiffShow && !isInvOnlyTailFlag && (
            <Icon type="expand_less" onClick={() => setTailDiffShow(false)} />
          )}
        </div>
      </div>
      {!noDetail && (
        <div className="amount-detail">
          <div>
            {intl.get('ssta.common.model.common.taxExcluded').d('不含税')}：{netAmount}
          </div>
          <div>
            {intl.get('ssta.common.model.common.taxAamount').d('税额')}：{taxAmount}
          </div>
        </div>
      )}
    </div>
  );
};

const InvTailPriceArea = (props) => {
  const {
    netAmount,
    taxAmount,
    settleStatus,
    taxIncludedAmount,
    invoiceNetAmount,
    invoiceTaxAmount,
    invoiceTaxIncludedAmount,
    updateFlag,
    permissionMap,
    handleInvAutoMatch,
    diffNetAmount,
    diffTaxAmount,
    invoiceDifferenceAmount,
    setTailDiffShow,
    tailDiffAmount,
    amountAdjustFlag,
    toleAdjustManualCuxFlag,
    handleConfirmToleranceAdjust,
    isInvOnlyTailFlag,
  } = props;

  return (
    <div className="amount-row">
      <AmountCard
        col="3"
        iconType="fact_check"
        iconColor="#FCA000"
        title={intl.get('ssta.common.model.common.invoiceApplyAmount').d('发票申请金额')}
        netAmount={netAmount}
        taxAmount={taxAmount}
        taxIncludedAmount={taxIncludedAmount}
        help={intl
          .get('ssta.common.view.help.settleLineInvApplyAmountTotal')
          .d('结算行发票申请金额汇总')}
      />
      <div className="amount-sign">-</div>
      <AmountCard
        col="3"
        iconType="featured_play_list"
        iconColor="#000000"
        title={intl.get('ssta.common.model.common.taxInvoiceAmount').d('税务发票金额')}
        netAmount={invoiceNetAmount}
        taxAmount={invoiceTaxAmount}
        taxIncludedAmount={invoiceTaxIncludedAmount}
        operationType="view_carousel"
        operationFunc={
          updateFlag &&
          !['INVOICE_EXCEPTION', 'INVOICE_SUCCESS'].includes(settleStatus) &&
          permissionMap.get(`invoiceAutoMatch`) &&
          handleInvAutoMatch
        }
        help={intl
          .get('ssta.common.view.help.taxInvoiceInfoAmountTotal')
          .d('税务发票金额信息汇总，其中税额为可抵扣税额汇总')}
        operationHelp={intl.get('ssta.common.view.help.taxInvoiceAutoMatch').d('税务发票自动匹配')}
      />
      <div className="amount-sign">=</div>
      <AmountCard
        col="2"
        iconType="database"
        iconColor="#F56349"
        title={intl.get('ssta.common.model.common.balanceAmount').d('尾差金额')}
        netAmount={diffNetAmount}
        taxAmount={diffTaxAmount}
        taxIncludedAmount={invoiceDifferenceAmount}
        setTailDiffShow={setTailDiffShow}
        operationType="swap_vertical_circle"
        operationFunc={
          updateFlag &&
          tailDiffAmount !== 0 &&
          toleAdjustManualCuxFlag &&
          Number(amountAdjustFlag) !== 0 &&
          settleStatus !== 'INVOICE_SUCCESS' &&
          permissionMap.get(`toleranceAdjust`) &&
          handleConfirmToleranceAdjust
        }
        isInvOnlyTailFlag={isInvOnlyTailFlag}
        help={intl
          .get('ssta.common.view.help.applyAndTaxInvoiceAmountVariance')
          .d('结算单发票申请金额与税务发票金额差异')}
        operationHelp={intl.get('ssta.common.view.help.adjustTailDiff').d('调整尾差')}
      />
    </div>
  );
};

const InvTailDetailArea = (props) => {
  const {
    settleStatus,
    tailDiffAmount,
    getUxTitleCss,
    invoiceTaxIncludedAmount,
    taxIncludedAmount,
    updateFlag,
    permissionMap,
    amountAdjustFlag,
    toleAdjustManualCuxFlag,
    handleConfirmToleranceAdjust,
  } = props;

  return (
    <div>
      {tailDiffAmount !== 0 ? (
        <StatusTag
          color="warn"
          value={intl.get('ssta.common.view.tag.tailedDifference').d('有尾差')}
        />
      ) : (
        <StatusTag
          color="success"
          value={intl.get('ssta.common.view.tag.taillessDifference').d('无尾差')}
        />
      )}
      <span>{intl.get('ssta.common.view.message.currentStatus').d('当前')}</span>
      <span {...getUxTitleCss('invoiceTaxIncludedAmount')}>
        {intl.get('ssta.common.view.message.taxInvoiceAmount').d('税务发票金额')}{' '}
      </span>
      <span className="amount-number" {...getUxTitleCss('invoiceTaxIncludedAmount')}>
        {invoiceTaxIncludedAmount}{' '}
      </span>
      <span> {intl.get('ssta.common.view.message.andTagText').d('和')} </span>
      <span {...getUxTitleCss('taxIncludedAmount')}>
        {intl.get('ssta.common.view.message.invApplyAmountTailSimple').d('发票申请金额')}{' '}
      </span>
      <span className="amount-number" {...getUxTitleCss('taxIncludedAmount')}>
        {taxIncludedAmount}{' '}
      </span>
      <span {...getUxTitleCss('tailDiffAmount')}>
        {' '}
        {intl.get('ssta.common.view.message.tailDiff').d('尾差')}{' '}
      </span>
      <span>{intl.get('ssta.common.view.message.isStatus').d('为')} </span>
      <span className="amount-number" {...getUxTitleCss('tailDiffAmount')}>
        {tailDiffAmount}{' '}
      </span>
      {tailDiffAmount !== 0 &&
        updateFlag &&
        toleAdjustManualCuxFlag &&
        settleStatus !== 'INVOICE_SUCCESS' &&
        permissionMap.get(`toleranceAdjust`) && [
          <span>{intl.get('ssta.common.view.message.please').d('请')} </span>,
          Number(amountAdjustFlag) !== 0 ? (
            <a onClick={handleConfirmToleranceAdjust}>
              {intl.get('ssta.common.view.button.adjustTailDiff').d('调整尾差')}
            </a>
          ) : (
            <span>{intl.get('ssta.common.view.button.adjustTailDiff').d('调整尾差')}</span>
          ),
        ]}
    </div>
  );
};

const AmountSummary = observer(() => {
  const {
    settleType = '',
    settleHeaderDs,
    settleHeaderId,
    documentType,
    updateFlag,
    settleLineDs,
    notPub = true,
    permissionMap,
    uxCssObj,
    isNewPub,
    toleAdjustManualCuxFlag,
    pathname,
    remoteProps,
  } = useContext(Store);

  const [pinFixed, setPinFixed] = useState(false);
  const [tailDiffShow, setTailDiffShow] = useState(false);
  const {
    settleNum = '',
    currencyCode = '',
    settleStatus,
    settleTypeMeaning = '',
    amountPrecision,
    amountAdjustFlag,
    invoiceUxFlag,
    paymentUxFlag,
    invoicePaymentUxFlag,
    companyName,
    companyId,
    supplierCompanyName,
    supplierCompanyId,
    supplierCompanyNum,
  } =
    settleHeaderDs.current?.get([
      'settleNum',
      'currencyCode',
      'settleStatus',
      'settleTypeMeaning',
      'amountPrecision',
      'amountAdjustFlag',
      'invoiceUxFlag',
      'paymentUxFlag',
      'invoicePaymentUxFlag',
      'companyName',
      'companyId',
      'supplierCompanyName',
      'supplierCompanyId',
      'supplierCompanyNum',
    ]) || {};
  const amountMap =
    settleHeaderDs.current?.get([
      'netAmount',
      'taxAmount',
      'taxIncludedAmount',
      'invoiceTaxIncludedAmount',
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'remainingPaymentAmount',
      'paymentAmount',
      'applyAmount',
      'invoiceDifferenceAmount',
      'diffNetAmount',
      'diffTaxAmount',
      'diffSourceTaxIncludedAmount',
      'diffSourceNetAmount',
      'diffSourceTaxAmount',
      'sourceTaxIncludedAmount',
      'sourceNetAmount',
      'sourceTaxAmount',
    ]) || {};

  const [
    netAmount,
    taxAmount,
    taxIncludedAmount,
    invoiceTaxIncludedAmount,
    invoiceNetAmount,
    invoiceTaxAmount,
    remainingPaymentAmount,
    paymentAmount,
    applyAmount,
    invoiceDifferenceAmount,
    diffNetAmount,
    diffTaxAmount,
    diffSourceTaxIncludedAmount,
    diffSourceNetAmount,
    diffSourceTaxAmount,
    sourceTaxIncludedAmount,
    sourceNetAmount,
    sourceTaxAmount,
  ] = Object.values(amountMap).map((item) => formatNumber(item || 0, amountPrecision));
  const { uxDisplayAreas = [] } = uxCssObj;
  const [
    isShowTitleFlag,
    isShowThisAmountTitleFlag,
    isShowPriceFlag,
    isShowTailFlag,
    isShowUnpaidFlag,
    isShowPayApplyAmountText,
    isShowThisTimeActualPayAmountText,
  ] = [
    uxDisplayAreas.includes('Number|Currency|TotalAmount|Title'), // 单号币种总额标题
    uxDisplayAreas.includes('Number|Currency|ThisAmount|Title'), // 标题：单号/币种/本次实际付款金额
    uxDisplayAreas.includes('Price Difference Equation'), // 发票价格差异等式
    uxDisplayAreas.includes('Tail Difference Equation'), // 尾差金额等式
    uxDisplayAreas.includes('Unpaid Amount Equation'), // 未付款金额等式
    uxDisplayAreas.includes('Number|PaymentTitle|Currency|PaymentAmount'), // 标题：单号/“付款申请金额”文字/币种/“付款申请金额”值
    uxDisplayAreas.includes('Number|ActualPaymentTitle|Currency|ActualAmount'), // 标题：单号/“本次实际付款金额 ”文字/币种/“本次实际付款金额”值
  ];

  const showCardFlagMap = {
    INVOICE: { inv: Boolean(invoiceUxFlag), pay: false },
    PAYMENT: { inv: false, pay: Boolean(paymentUxFlag) },
    INVOICE_PAYMENT: { inv: Boolean(invoiceUxFlag), pay: Boolean(invoicePaymentUxFlag) },
  };

  const { inv: showInvCardFlag, pay: showPayCardFlag } = showCardFlagMap[settleType] || {};

  const settleTotalAmount =
    (documentType === 'INVOICE' ? taxIncludedAmount : remainingPaymentAmount) || '';

  const paymentApplyAmount = formatNumber(
    decimalSum([amountMap.paymentAmount || 0, amountMap.applyAmount || 0]),
    amountPrecision
  );

  const unPaidAmount = formatNumber(
    decimalSum([
      documentType === 'INVOICE'
        ? amountMap.taxIncludedAmount || 0
        : amountMap.remainingPaymentAmount || 0,
      -(amountMap.paymentAmount || 0),
      -(amountMap.applyAmount || 0),
    ]),
    amountPrecision
  );

  // 显示标题的优先级按照值集的顺序在代码中写死
  const title = useMemo(() => {
    switch (true) {
      case isShowThisAmountTitleFlag:
        return `${settleNum} - ${settleTypeMeaning}  ${currencyCode}  ${paymentAmount}`;
      case isShowThisTimeActualPayAmountText:
        return `${settleNum} - ${settleTypeMeaning} - ${intl
          .get('ssta.common.view.title.thisTimeActualPayAmountText')
          .d('本次实际付款金额')}  ${currencyCode}  ${paymentAmount}`;
      case isShowPayApplyAmountText:
        return `${settleNum} - ${settleTypeMeaning} - ${intl
          .get('ssta.common.view.title.payApplyAmountIncWriteOffText')
          .d('付款申请金额（含预付款核销）')}  ${currencyCode}  ${paymentApplyAmount}`;
      case isShowTitleFlag:
        return `${settleNum} - ${settleTypeMeaning}  ${currencyCode}  ${
          documentType === 'INVOICE' ? taxIncludedAmount : paymentApplyAmount
        }`;
      default:
        return '';
    }
  }, [
    settleNum,
    currencyCode,
    documentType,
    paymentAmount,
    isShowTitleFlag,
    settleTypeMeaning,
    taxIncludedAmount,
    paymentApplyAmount,
    isShowPayApplyAmountText,
    isShowThisAmountTitleFlag,
    isShowThisTimeActualPayAmountText,
  ]);

  useEffect(() => {
    if (remoteProps && remoteProps.event) {
      remoteProps.event.fireEvent('onAmountSummaryEffect', {
        setPinFixed,
      });
    }
  }, [remoteProps]);

  const getUxTitleCss = useCallback(
    (fieldName) => {
      const { uxTitleCss: { uxFontWeigthFields = [] } = {} } = uxCssObj;
      return uxFontWeigthFields.includes(fieldName)
        ? { style: { fontWeight: 'bold', color: '#000' } }
        : {};
    },
    [uxCssObj]
  );

  const tailDiffAmount = invoiceDifferenceAmount || diffNetAmount;
  const isInvOnlyTailFlag = isShowTailFlag && !isShowPriceFlag;

  const handleInvAutoMatch = useCallback(async () => {
    Modal.confirm({
      title: intl.get('ssta.common.view.title.taxInvoiceAutoMatch').d('税务发票自动匹配'),
      children: <SelectBox name="invoiceSpliteRule" dataSet={settleHeaderDs} />,
      onOk: async () => {
        const res = await settleHeaderDs.setState('submitType', 'invAutoMatch').forceSubmit();
        if (!res) return;
        const newHeaderData = getResponse(
          await getSettleHeaderData({ settleHeaderId, documentType })
        );
        if (newHeaderData) {
          recordPickValues(settleHeaderDs.current, newHeaderData, [
            'netAmount',
            'taxAmount',
            'taxIncludedAmount',
            'invoiceSpliteRule',
            'diffNetAmount',
            'diffTaxAmount',
            'invoiceDifferenceAmount',
          ]);
        }
        settleLineDs.query();
        const cuszLineDs = settleHeaderDs.children?.attributeList;
        if (cuszLineDs) cuszLineDs.query();
      },
    });
  }, [settleHeaderDs, settleHeaderId, documentType, settleLineDs]);

  const handleConfirmToleranceAdjust = useCallback(() => {
    Modal.confirm({
      title: intl.get('ssta.common.view.button.adjustTailDiff').d('调整尾差'),
      children: (
        <div>
          <div>
            <span>{intl.get('ssta.common.view.message.current').d('当前')}</span>
            <span>{intl.get('ssta.common.model.common.taxInvoiceAmount').d('税务发票金额')} </span>
            <span>
              {intl.get('ssta.common.model.common.taxIncluded').d('含税')}：
              {invoiceTaxIncludedAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxExcluded').d('不含税')}：{invoiceNetAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxAamount').d('税额')}：{invoiceTaxAmount}{' '}
            </span>
          </div>
          <div>
            <span>{intl.get('ssta.common.view.message.current').d('当前')}</span>
            <span>{intl.get('ssta.common.model.common.balanceAmount').d('尾差金额')} </span>
            <span>
              {intl.get('ssta.common.model.common.taxIncluded').d('含税')}：
              {invoiceDifferenceAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxExcluded').d('不含税')}：{diffNetAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxAamount').d('税额')}：{diffTaxAmount}{' '}
            </span>
          </div>
        </div>
      ),
      onOk: handleToleranceAdjust,
    });
  }, [
    handleToleranceAdjust,
    invoiceTaxIncludedAmount,
    invoiceNetAmount,
    invoiceTaxAmount,
    diffNetAmount,
    diffTaxAmount,
    invoiceDifferenceAmount,
  ]);

  const handleToleranceAdjust = useCallback(async () => {
    const res = await settleHeaderDs.setState('submitType', 'toleranceAdjust').forceSubmit();
    if (!res) return;
    settleLineDs.query();
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    const newHeaderData = getResponse(await getSettleHeaderData({ settleHeaderId, documentType }));
    if (newHeaderData) {
      recordPickValues(settleHeaderDs.current, newHeaderData, [
        'netAmount',
        'taxAmount',
        'taxIncludedAmount',
        'invoiceSpliteRule',
        'diffNetAmount',
        'diffTaxAmount',
        'invoiceDifferenceAmount',
      ]);
    }
  }, [settleLineDs, settleHeaderDs, settleHeaderId, documentType]);

  const invTailPriceAreaProps = {
    netAmount,
    taxAmount,
    settleStatus,
    taxIncludedAmount,
    invoiceNetAmount,
    invoiceTaxAmount,
    invoiceTaxIncludedAmount,
    updateFlag,
    permissionMap,
    handleInvAutoMatch,
    diffNetAmount,
    diffTaxAmount,
    invoiceDifferenceAmount,
    setTailDiffShow,
    tailDiffAmount,
    amountAdjustFlag,
    toleAdjustManualCuxFlag,
    handleConfirmToleranceAdjust,
    isInvOnlyTailFlag,
  };

  const invTailDetailAreaProps = (() => {
    const normalProps = {
      settleStatus,
      tailDiffAmount,
      getUxTitleCss,
      invoiceTaxIncludedAmount,
      taxIncludedAmount,
      updateFlag,
      permissionMap,
      amountAdjustFlag,
      toleAdjustManualCuxFlag,
      handleConfirmToleranceAdjust,
    };
    return remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.INV_TAIL_DETAIL_AREA_PROPS', normalProps, {
          netAmount,
          invoiceNetAmount,
        })
      : normalProps;
  })();

  if ([invoiceUxFlag, paymentUxFlag, invoicePaymentUxFlag].includes(0)) return null;

  const isPurchase = pathname?.includes('new-purchase-settle');

  const showTitle = remoteProps
    ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.EXTRA_CUSTOM_TITLE', title, {
        isShowTitleFlag,
        isShowPayApplyAmountText,
        isShowThisAmountTitleFlag,
        isShowThisTimeActualPayAmountText,
        settleHeaderDs,
      })
    : title;

  return (
    <Content
      wrapperClassName={`amount-summary-notfix-content-wrapper ${
        pinFixed && 'fixed-content-wrapper'
      }`}
    >
      {!isNewPub && (
        <h3 className="ssta-form-title">
          <span>
            {isPurchase ? (
              <div style={{ display: 'flex' }}>
                <IMChatDraggable
                  cardCode={cardCodes[documentType]}
                  icon="baseline-drag_indicator"
                  tooltip=""
                  requestBody={() => ({
                    settleHeaderId,
                    settleNum,
                    companyName,
                    companyId,
                    supplierCompanyName,
                    supplierCompanyId,
                    supplierCompanyNum,
                    settleTypeMeaning,
                  })}
                  dragText={`${intl
                    .get('ssta.common.view.title.settleNum')
                    .d('结算单编号')}${settleNum}`}
                  showDetail
                />
                {showTitle}
              </div>
            ) : (
              <span>{showTitle}</span>
            )}
          </span>
          {notPub && (
            <div className="ssta-title-pin" onClick={() => setPinFixed(!pinFixed)}>
              <Tooltip
                placement="top"
                title={
                  pinFixed
                    ? intl.get('ssta.common.view.message.pinAreaCancel').d('取消固定此区域')
                    : intl.get('ssta.common.view.message.pinArea').d('固定此区域')
                }
              >
                <img src={pinFixed ? pin : cancelPin} className="push-pin" alt="" />
                {pinFixed
                  ? intl.get('ssta.common.view.message.cancelPin').d('取消钉住')
                  : intl.get('ssta.common.view.message.onTheTop').d('钉在顶部')}
              </Tooltip>
            </div>
          )}
        </h3>
      )}
      {showInvCardFlag && (
        <div className={styles['amount-summary-wrapper']}>
          <div className="settle-document-type" style={{ backgroundColor: '#FCA000' }}>
            <span className="document-type-name">
              <Tooltip title={intl.get('ssta.common.view.title.invoice').d('开票')}>
                {intl.get('ssta.common.view.title.invoice').d('开票')}
              </Tooltip>
            </span>
          </div>
          <div className="amount-content">
            {isShowPriceFlag && (
              <div className="amount-row">
                <AmountCard
                  col="3"
                  iconType="fact_check"
                  iconColor="#FCA000"
                  title={intl.get('ssta.common.model.common.invoiceApplyAmount').d('发票申请金额')}
                  netAmount={netAmount}
                  taxAmount={taxAmount}
                  taxIncludedAmount={taxIncludedAmount}
                  help={intl
                    .get('ssta.common.view.help.settleLineInvApplyAmountTotal')
                    .d('结算行发票申请金额汇总')}
                />
                <div className="amount-sign">-</div>
                <AmountCard
                  col="3"
                  iconType="menu_book"
                  iconColor="#FCA000"
                  title={intl
                    .get('ssta.common.model.common.contractOrderAmount')
                    .d('合同/订单金额')}
                  netAmount={sourceNetAmount}
                  taxAmount={sourceTaxAmount}
                  taxIncludedAmount={sourceTaxIncludedAmount}
                  help={intl
                    .get('ssta.common.view.help.settleAffairReceiptAmount')
                    .d('结算事务入库金额')}
                />
                <div className="amount-sign">=</div>
                <AmountCard
                  col="2"
                  type="invoicePriceVariance"
                  iconType="area_chart"
                  iconColor="#3095F2"
                  title={intl
                    .get('ssta.common.model.common.invoicePriceVariance')
                    .d('发票价格差异')}
                  netAmount={diffSourceNetAmount}
                  taxAmount={diffSourceTaxAmount}
                  taxIncludedAmount={diffSourceTaxIncludedAmount}
                  help={intl
                    .get('ssta.common.view.help.applyAndReceiptAmountVariance')
                    .d('结算行发票申请金额与入库金额差异汇总')}
                />
              </div>
            )}
            {isShowTailFlag &&
              (isInvOnlyTailFlag ? (
                <Fragment>
                  <InvTailPriceArea {...invTailPriceAreaProps} />
                  <div className="amount-row">
                    <InvTailDetailArea {...invTailDetailAreaProps} />
                  </div>
                </Fragment>
              ) : tailDiffShow ? (
                <InvTailPriceArea {...invTailPriceAreaProps} />
              ) : (
                <div className="amount-row">
                  <div className="amount-card">
                    <div className="amount-detail amount-detail-noborder">
                      <InvTailDetailArea {...invTailDetailAreaProps} />
                      {!isInvOnlyTailFlag && (
                        <div onClick={() => setTailDiffShow(true)}>
                          <a>{intl.get('ssta.common.view.button.tailDiffDetail').d('尾差明细')}</a>
                          <Icon type="expand_more" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {showPayCardFlag && isShowUnpaidFlag && (
        <div className={styles['amount-summary-wrapper']}>
          <div className="settle-document-type" style={{ backgroundColor: '#47B881' }}>
            <span className="document-type-name">
              <Tooltip title={intl.get('ssta.common.view.title.payment').d('付款')}>
                {intl.get('ssta.common.view.title.payment').d('付款')}
              </Tooltip>
            </span>
          </div>
          <div className="amount-content">
            <div className="amount-row">
              <AmountCard
                col="3"
                noDetail
                iconType="request_page"
                iconColor="#FCA000"
                title={intl.get('ssta.common.view.title.amountToBePaid').d('待付款金额')}
                taxIncludedAmount={settleTotalAmount}
                help={intl.get('ssta.common.view.help.settlePayableAmount').d('结算单可付款金额')}
              />
              <div className="amount-sign">-</div>
              <AmountCard
                col="3"
                noDetail
                iconType="test_chart"
                iconColor="#47B881"
                title={intl.get('ssta.common.view.title.paymentApplyAmount').d('付款申请金额')}
                taxIncludedAmount={paymentApplyAmount}
              />
              <div className="amount-sign">=</div>
              <AmountCard
                col="2"
                noDetail
                iconType="instance"
                iconColor="#F56349"
                title={intl.get('ssta.common.view.title.unPaidAmount').d('未付款金额')}
                taxIncludedAmount={unPaidAmount}
              />
            </div>
            <div className="amount-row">
              <div className="amount-card">
                <div className="amount-detail amount-detail-noborder">
                  <div>
                    <span {...getUxTitleCss('paymentApplyAmount')}>
                      {intl.get('ssta.common.model.common.paymentApplyAmount').d('付款申请金额')}{' '}
                    </span>
                    <span className="amount-number" {...getUxTitleCss('paymentApplyAmount')}>
                      {paymentApplyAmount}{' '}
                    </span>
                    <span>= </span>
                    <span {...getUxTitleCss('paymentAmount')}>
                      {intl
                        .get('ssta.common.model.common.actualPaymentAmountThisTime')
                        .d('本次实际付款金额')}{' '}
                    </span>
                    <span className="amount-number" {...getUxTitleCss('paymentAmount')}>
                      {paymentAmount}{' '}
                    </span>
                    <span>+ </span>
                    <span {...getUxTitleCss('applyAmount')}>
                      {intl
                        .get('ssta.common.model.common.prePayWriteOffAmountThisTime')
                        .d('本次预付款核销金额')}{' '}
                    </span>
                    <span className="amount-number" {...getUxTitleCss('applyAmount')}>
                      {applyAmount}{' '}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {remoteProps
              ? remoteProps.render('SSTA_PURCHASESETTLE_DETAIL.EXTRA_CUSTOM_TITLE_RENDER', '', {
                  settleHeaderDs,
                  paymentApplyAmount,
                  AmountCard,
                })
              : ''}
          </div>
        </div>
      )}
    </Content>
  );
});
export default AmountSummary;
