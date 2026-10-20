import React, { useMemo, useCallback } from 'react';

import intl from 'utils/intl';
import { AFBasic, AFExtra } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';

import styles from './index.less';
import { formatNumber } from '../../../../utils/utils';


const tagFields = [];
const basicFields = ['createdUserName', 'creationDate'];
const extraFields = ['supplierCompanyName', 'createdUnitName', 'remark'];

const WorkflowCard = (props) =>
{

  const { headerBtns = [], formDs, customizeBtnGroup, customizeCommon } = props;

  const {
    billNum,
    supplierCompanyName,
    companyName,
    taxIncludedAmountMeaning,
    amountPrecision,
    currencyCode,
  } = formDs.current?.get([
    'billNum',
    'supplierCompanyName',
    'companyName',
    'taxIncludedAmountMeaning',
    'amountPrecision',
    'currencyCode',
  ]) || {};

  const basicFieldsConfig = useMemo(() =>
  {
    return {
      billAfBasicTitle: {
        render: () => `${billNum}-${companyName}->${supplierCompanyName}`,
      },
    };
  }, [billNum, companyName, supplierCompanyName]);

  const contentRemainRender = useCallback(() =>
  {
    return (
      <div className={styles['ssta-bill-workflow-basic-right']}>
        <div className='workflow-basic-right-label'>{intl.get('ssta.common.model.bill.thisBillTotalAmountInTax').d('汇总本次对账含税金额')}</div>
        <div className='workflow-basic-right-value'>
          <span>{formatNumber(taxIncludedAmountMeaning, amountPrecision)}</span>
          <span>{currencyCode}</span>
        </div>
      </div>
    );
  }, [
    taxIncludedAmountMeaning,
    currencyCode,
    amountPrecision,
  ]);

  const contentBottomRender = useCallback(() =>
  {
    return (
      <div className={styles['ssta-bill-workflow-basic-bottom']}>
        {customizeBtnGroup(
          { code: 'SSTA.PURCHASER_BILL_DETAIL.HEADER_BTNS', pro: true },
          <DynamicButtons defaultBtnType='c7n-pro' buttons={headerBtns} />
        )}
      </div>
    );
  }, [headerBtns, customizeBtnGroup]);

  return (
    <div className={styles['bill-workflow-card-wrapper']}>
      {customizeCommon(
        {
          code: 'SSTA.PURCHASER_BILL_DETAIL.FLOW_BASIC_CARD',
          processUnitTag: 'AF-BASIC',
        },
        <AFBasic
          dataSet={formDs}
          titleField="billAfBasicTitle"
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
          code: 'SSTA.PURCHASER_BILL_DETAIL.FLOW_EXTRA_CARD',
          processUnitTag: 'AF-EXTRA',
        },
        <AFExtra dataSet={formDs} fields={extraFields} />
      )}
    </div>
  );
};

export default WorkflowCard;
