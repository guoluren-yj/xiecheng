import React, { useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import { AFBasic, AFExtra } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';

import styles from './index.less';
import { formatNumber } from '../../../../../utils/utils';

const tagFields = [];
const basicFields = ['createdUserName', 'creationDate'];
const extraFields = ['supplierCompanyName', 'unitName', 'remark'];

const WorkflowCard = (props) =>
{

  const { headerBtns = [], headerDS, customizeCommon, customizeBtnGroup } = props;


  const {
    settleNum,
    companyName,
    currencyCode,
    amountPrecision,
    prepaymentAmount,
  } = headerDS?.current?.get([
    'settleNum',
    'companyName',
    'currencyCode',
    'amountPrecision',
    'prepaymentAmount',
  ]) || {};

  const basicFieldsConfig = useMemo(() =>
  {
    return {
      settleAfBasicTitle: {
        render: () => `${companyName}-${settleNum}`,
      },
    };
  }, [settleNum, companyName]);

  const contentRemainRender = useCallback(() =>
  {
    const label = intl.get('ssta.common.model.settle.thisInvTotalPreAmountInTax').d('汇总本次预付款含税金额');

    return (
      <div className={styles['ssta-settle-workflow-basic-right']}>
        <div className='workflow-basic-right-label'>{label}</div>
        <div className='workflow-basic-right-value'>
          <span>{formatNumber(prepaymentAmount, amountPrecision)}</span>
          <span>{currencyCode}</span>
        </div>
      </div>
    );
  }, [
    prepaymentAmount,
    currencyCode,
    amountPrecision,
  ]);

  const contentBottomRender = useCallback(() =>
  {
    return (
      <div className={styles['ssta-settle-workflow-basic-bottom']}>
        {customizeBtnGroup(
          { code: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_HEAD_BTNS', pro: true },
          <DynamicButtons defaultBtnType='c7n-pro' buttons={headerBtns} />
        )}
      </div>
    );
  }, [headerBtns, customizeBtnGroup]);

  return (
    <div className={styles['settle-workflow-card-wrapper']}>
      {customizeCommon(
        {
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_FLOW_BASIC_CARD',
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={headerDS}
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
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_FLOW_EXTRA_CARD',
          processUnitTag: 'AF-EXTRA',
        },
        <AFExtra dataSet={headerDS} fields={extraFields} />
      )}
    </div>
  );
};

export default WorkflowCard;
