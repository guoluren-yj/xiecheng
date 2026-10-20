import React, { Fragment, useContext } from 'react';
import { isNil } from 'lodash';
import { Tooltip } from 'choerodon-ui';
import { Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { formatNumber } from '../../../utils/utils';
import { statusLabelTagRender } from '../utils/render';
import { statusTagRender } from '../../Components/StatusTag';
import styles from '../index.less';

const Summary = () => {

  const { modalFlag, serviceHeaderDs } = useContext<StoreValueType>(Store);

  const { amountPrecision, amountBeforeChange } = serviceHeaderDs.current?.get(['amountPrecision', 'amountBeforeChange']) || {};

  return (
    <Fragment>
      <div className={styles['detail-summary-wrapper']}>
        <div className="detail-summary-total">
          <div className="detail-summary-total-left">
            <div className="summary-total-amount">
              <Output
                name="amount"
                dataSet={serviceHeaderDs}
                renderer={({ text, dataSet, name }) => {
                  const amountText = text || '-';
                  return (
                    <Fragment>
                      <span>{dataSet?.getField(name)?.get('label')}： </span>
                      {isNil(amountBeforeChange)
                        ? (
                          <span>{amountText}</span>
                        ) : (
                          <Tooltip title={intl.get('ssta.sourcingCost.view.tooltip.beforeChange', { beforeChange: formatNumber(amountBeforeChange, amountPrecision) }).d('变更前：{beforeChange}')}>
                            <span style={{ color: 'red' }}>{amountText}</span>
                          </Tooltip>
                        )
                      }
                    </Fragment>
                  );
                }}
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