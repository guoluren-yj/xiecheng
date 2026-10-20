import React, { Fragment, useContext } from 'react';
import { Output } from 'choerodon-ui/pro';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { statusLabelTagRender } from '../utils/render';
import { statusTagRender } from '../../Components/StatusTag';
import styles from '../index.less';

const Summary = () => {

  const { modalFlag, serviceHeaderDs } = useContext<StoreValueType>(Store);

  return (
    <Fragment>
      <div className={styles['detail-summary-wrapper']}>
        <div className="detail-summary-total">
          <div className="detail-summary-total-left">
            <div className="summary-total-amount">
              <Output
                name="amount"
                dataSet={serviceHeaderDs}
                renderer={({ text, dataSet, name }) => `${dataSet?.getField(name)?.get('label')}：${text || '-'}`}
              />
              <Output name="currencyCode" dataSet={serviceHeaderDs} />
              <Output
                name="serverFeesStatus"
                dataSet={serviceHeaderDs}
                renderer={statusTagRender}
              />
            </div>
            <div className="summary-total-status">
              <Output
                name="serverFeesPaymentStatus"
                dataSet={serviceHeaderDs}
                renderer={statusLabelTagRender}
              />
              <Output
                name="serverFeesInvoiceStatus"
                dataSet={serviceHeaderDs}
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