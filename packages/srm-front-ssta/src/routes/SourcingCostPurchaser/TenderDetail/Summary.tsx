import React, { Fragment, useContext } from 'react';
import { Output } from 'choerodon-ui/pro';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { statusLabelTagRender } from '../utils/render';
import { statusTagRender } from '../../Components/StatusTag';
import styles from '../index.less';

const Summary = () => {

  const { modalFlag, tenderHeaderDs } = useContext<StoreValueType>(Store);

  return (
    <Fragment>
      <div className={styles['detail-summary-wrapper']}>
        <div className="detail-summary-total">
          <div className="detail-summary-total-left">
            <div className="summary-total-amount">
              <Output
                name="amount"
                dataSet={tenderHeaderDs}
                renderer={({ text, dataSet, name }) => `${dataSet?.getField(name)?.get('label')}：${text || '-'}`}
              />
              <Output name="currencyCode" dataSet={tenderHeaderDs} />
              <Output
                name="tenderFeesStatus"
                dataSet={tenderHeaderDs}
                renderer={statusTagRender}
              />
            </div>
            <div className="summary-total-status">
              <Output
                name="tenderFeesPaymentStatus"
                dataSet={tenderHeaderDs}
                renderer={statusLabelTagRender}
              />
              <Output
                name="tenderFeesInvoiceStatus"
                dataSet={tenderHeaderDs}
                renderer={statusLabelTagRender}
              />
            </div>
          </div>
        </div>
      </div>
      {!modalFlag && <div className={styles["ssta-detail-horizontal-line"]} />}
    </Fragment>
  );
};

export default Summary;