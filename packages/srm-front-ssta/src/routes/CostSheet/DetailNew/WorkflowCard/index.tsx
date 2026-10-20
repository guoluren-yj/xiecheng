import React, { useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import { AFBasic, AFExtra } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';

import styles from './index.less';
import { formatNumber } from '../../../../utils/utils';

const tagFields = [];
const basicFields = ['createdByName', 'creationDate'];
const extraFields = ['supplierCompanyName', 'createdUnitName', 'remarks'];

const WorkflowCard = (props) =>
{

  const { headerBtns = [], formDs, customizeBtnGroup, customizeCommon } = props;


  const {
    chargeNum,
    companyName,
    currencyCode,
    amountPrecision,
    taxIncludedAmount,
  } = formDs.current?.get([
    'chargeNum',
    'companyName',
    'currencyCode',
    'amountPrecision',
    'taxIncludedAmount',
  ]) || {};

  const basicFieldsConfig = useMemo(() =>
  {
    return {
      chargeAfBasicTitle: {
        render: () => `${companyName}-${chargeNum}`,
      },
    };
  }, [chargeNum, companyName]);


  const contentRemainRender = useCallback(() =>
  {
    return (
      <div className={styles['ssta-settle-workflow-basic-right']}>
        <div className='workflow-basic-right-label'>{intl.get('ssta.common.model.settle.thisCostTotalAmountInTax').d('汇总本次费用含税金额')}</div>
        <div className='workflow-basic-right-value'>
          <span>{formatNumber(taxIncludedAmount, amountPrecision)}</span>
          <span>{currencyCode}</span>
        </div>
      </div>
    );
  }, [
    currencyCode,
    amountPrecision,
    taxIncludedAmount,
  ]);

  const contentBottomRender = useCallback(() =>
  {
    return (
      <div className={styles['ssta-settle-workflow-basic-bottom']}>
        {customizeBtnGroup(
          { code: 'SSTA.COST_SHEET_DETAIL.HEADER_BTNS', pro: true },
          <DynamicButtons defaultBtnType='c7n-pro' buttons={headerBtns} />
        )}
      </div>
    );
  }, [headerBtns, customizeBtnGroup]);

  return (
    <div className={styles['settle-workflow-card-wrapper']}>
      {customizeCommon(
        {
          code: 'SSTA.COST_SHEET_DETAIL.FLOW_BASIC_CARD',
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={formDs}
          titleField="chargeAfBasicTitle"
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
          code: 'SSTA.COST_SHEET_DETAIL.FLOW_EXTRA_CARD',
          processUnitTag: 'AF-EXTRA',
        },
        <AFExtra dataSet={formDs} fields={extraFields} />
      )}
    </div>
  );
};

export default WorkflowCard;
