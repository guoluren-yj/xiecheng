import React, { useContext, useMemo, useCallback } from 'react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { AFBasic, AFExtra } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';

import styles from './index.less';
import { formatNumber } from '../../../../utils/utils';
import { Store } from '../../Detail/StoreProvider';

const flowBasicCardCodes = {
  INVOICE: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_FLOW_BASIC_CARD',
  PAYMENT: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_FLOW_BASIC_CARD',
};

const flowExtraCardCodes = {
  INVOICE: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_FLOW_EXTRA_CARD',
  PAYMENT: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_FLOW_EXTRA_CARD',
};

const tagFields = ['settleTypeMeaning'];
const basicFields = ['campMeaning', 'createdUserName', 'creationDate'];
const extraFields = ['supplierCompanyName', 'taxIncludedAmount', 'remark'];

const WorkflowCard = (props) => {

  const { headerBtns = [] } = props;
  const {
    settleType,
    documentType,
    settleHeaderDs,
    customizeCommon,
    customizeBtnGroup,
  } = useContext(Store);

  const {
    settleNum,
    companyName,
    applyAmount,
    currencyCode,
    paymentAmount,
    amountPrecision,
    taxIncludedAmount,
  } = settleHeaderDs.current?.get([
    'settleNum',
    'companyName',
    'applyAmount',
    'currencyCode',
    'paymentAmount',
    'amountPrecision',
    'taxIncludedAmount',
  ]) || {};

  const basicFieldsConfig = useMemo(() => {
    return {
      settleAfBasicTitle: {
        render: () => `${settleNum}-${companyName}`,
      },
    };
  }, [settleNum, companyName]);

  const extraFieldsConfig = useMemo(() => {
    return {
      taxIncludedAmount: {
        label: intl.get('ssta.common.model.settle.thisInvTotalAmountInTax').d('本次开票含税总金额'),
        renderValue: () => formatNumber(taxIncludedAmount, amountPrecision),
        hidden: settleType !== 'INVOICE_PAYMENT',
      },
    };
  }, [settleType, amountPrecision, taxIncludedAmount]);

  const contentRemainRender = useCallback(() => {
    const label = settleType === 'INVOICE'
      ? intl.get('ssta.common.model.settle.thisInvTotalAmountInTax').d('本次开票含税总金额')
      : intl.get('ssta.common.model.settle.thisPayTotalAmountInTax').d('本次付款含税总金额');
    const totalAmount = settleType === 'INVOICE'
      ? taxIncludedAmount
      : math.sum(paymentAmount || 0, applyAmount || 0);
    return (
      <div className={styles['ssta-settle-workflow-basic-right']}>
        <div className='workflow-basic-right-label'>{label}</div>
        <div className='workflow-basic-right-value'>
          <span>{formatNumber(totalAmount, amountPrecision)}</span>
          <span>{currencyCode}</span>
        </div>
      </div>
    );
  }, [
    settleType,
    applyAmount,
    currencyCode,
    paymentAmount,
    amountPrecision,
    taxIncludedAmount,
  ]);

  const contentBottomRender = useCallback(() => {
    return (
      <div className={styles['ssta-settle-workflow-basic-bottom']}>
        {customizeBtnGroup(
          { code: 'SSTA.PURCHASE_SETTLE_DETAIL.HEAD_BTNS', pro: true },
          <DynamicButtons defaultBtnType='c7n-pro' buttons={headerBtns} />
        )}
      </div>
    );
  }, [headerBtns, customizeBtnGroup]);

  return (
    <div className={styles['settle-workflow-card-wrapper']}>
      {customizeCommon(
        {
          code: flowBasicCardCodes[documentType],
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={settleHeaderDs}
          titleField="settleAfBasicTitle"
          tagFields={tagFields}
          normalFields={basicFields}
          fieldsConfig={basicFieldsConfig}
          maxTagCount={3}
          contentRemainWidth="25%"
          contentRemainRender={contentRemainRender}
          contentBottomRender={contentBottomRender}
        />
      )}
      {customizeCommon(
        {
          code: flowExtraCardCodes[documentType],
          processUnitTag: 'AF-EXTRA',
        },
        <AFExtra dataSet={settleHeaderDs} fields={extraFields} fieldsConfig={extraFieldsConfig} />
      )}
    </div>
  );
};

export default WorkflowCard;
