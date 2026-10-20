import type { ReactElement } from 'react';
import React, { useCallback, useEffect, Fragment, useState } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { isUndefined, flow } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { formatNumber } from '../../../../utils/utils';
import { getTenderFeePayUrl, queryTenderHeaderData } from '../../utils/api';
import styles from './index.less';

interface TenderPayProps {
  modal?: any,
  tenderFeesId?: string | number,
  tenderFeesNum?: string,
  returnUrl?: string,
};

const TenderPay = flow(
  formatterCollections({ code: ['ssta.invoice', 'ssta.common', 'ssta.sourcingCost'] }),
)((props) => {

  const { modal, tenderFeesId, tenderFeesNum: dirTenderFeesNum, returnUrl } = props;
  const [tenderHeaderData, setTenderHeaderData] = useState<Record<string, any>>();
  const { tenderFeesNum = dirTenderFeesNum, amount, amountPrecision } = tenderHeaderData || {};

  const handleInit = useCallback(async () => {
    if (!tenderFeesId && !dirTenderFeesNum) return;
    const res = getResponse(await queryTenderHeaderData({ tenderFeesId, tenderFeesNum: dirTenderFeesNum }));
    if (!res) return;
    setTenderHeaderData(res);
    if (modal) {
      modal.update({
        okProps: { disabled: false },
        title: intl.get('ssta.sourcingCost.view.button.pay').d('缴纳') + res.tenderFeesNum,
      });
    }
  }, [tenderFeesId, modal, dirTenderFeesNum]);

  const handleSubmit = useCallback(async () => {
    const res = getResponse(await getTenderFeePayUrl({ tenderFeesId, tenderFeesNum, returnUrl: returnUrl || window.location.href }));
    const { cashierUri, companyCode } = res || {};
    if (cashierUri && companyCode) {
      const linkDom = document.createElement('a');
      // companyCode：公司编码；cashierFlag：公司维度
      const hrefPrefix = window.location.pathname.split('/')[1] === 'app' ? '/app' : '';
      linkDom.href = `${hrefPrefix}${cashierUri}&companyCode=${companyCode}&cashierFlag=1&cashierConfigSource=SSRC_WORKBENCH`;
      linkDom.target = '_blank';
      linkDom.click();
    };
  }, [tenderFeesId, tenderFeesNum, returnUrl]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleSubmit);
      modal.update({ okProps: { disabled: true } });
    }
  }, [modal, handleSubmit]);

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  return (
    <Fragment>
      <Spin spinning={isUndefined(tenderHeaderData)}>
        <div className={styles['ssta-amount-card-tenderFeePay']}>
          <div className="amount-card-left">
            <div className="amount-card-desc">
              {intl.get('ssta.sourcingCost.view.message.onlinePaymentFeeIs').d('线上缴纳费用为')}
            </div>
            <div className="amount-card-num">
              {intl.get('ssta.sourcingCost.model.sourcingCost.tendeFilerFeeNumber').d('招标文件费编号')}：{' '}
              {tenderFeesNum || '-'}
            </div>
          </div>
          <div className="amount-card-right">
            {formatNumber(amount, amountPrecision)}
          </div>
        </div>
      </Spin>
    </Fragment>
  );
}) as (props: TenderPayProps) => ReactElement;

export default TenderPay;