import React, { useMemo, useCallback } from 'react';
import { Table, useDataSet } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';
import { stringify } from 'querystring';
import { findMenuName } from '@/utils/utils';

import { prePayWriteOffDS } from '../../stores/PurchaseSettlePoolDS';

const PrePayWriteOffModal = (props) => {
  const { settleHeaderId, customizeTable, history, settleLineId } = props;
  const settleUxFlag = findMenuName('srm.settle-account.jsd.ux-purchase');
  const prePayWriteOffDs = useDataSet(() => prePayWriteOffDS(settleHeaderId, settleLineId), [
    settleHeaderId,
    settleLineId,
  ]);

  const viewPrePayModal = useCallback((record) => {
    const id = record?.get('prepaymentHeaderId');
    if (!id) return;
    const search = {
      source: 'detail',
      documentType: 'PREPAYMENT',
      settleHeaderId: id,
      type: 'NUM',
    };
    if (settleUxFlag) {
      history.push({
        pathname: `/ssta/new-purchase-settle/pre-payment`,
        search: stringify(search),
      });
    } else {
      history.push({
        pathname: '/ssta/purchase-settle/pre-payment',
        search: stringify(search),
      });
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        width: 250,
        name: 'prepaymentTitle',
      },
      {
        width: 250,
        name: 'preHeadAndLineLink',
        renderer: ({ value, record }) => {
          return <a onClick={() => viewPrePayModal(record)}>{value}</a>;
        },
      },
      {
        width: 200,
        name: 'prepaymentRemainingAmount',
      },
      {
        width: 150,
        name: 'applyAmount',
      },
      {
        width: 150,
        name: 'prepaymentAmount',
      },
      {
        width: 150,
        name: 'prepaymentTypeMeaning',
      },
      {
        width: 150,
        name: 'associateNum',
        renderer: ({ value, record }) => {
          const associateLineNum = record?.get('associateLineNum');
          if (!isNil(associateLineNum) && !isNil(value) && !value.includes('-')) {
            return `${value}-${associateLineNum}`;
          }
          return value;
        },
      },
      {
        width: 150,
        name: 'prepaymentCreatedBy',
      },
      {
        width: 150,
        name: 'prepaymentCreationDate',
      },
    ],
    [history]
  );

  return (
    <div>
      {customizeTable(
        { code: 'SSTA.PURCHASE_POOL_RECORD.PEYPAYMENT_BOX' },
        <Table
          columns={columns}
          dataSet={prePayWriteOffDs}
          selectionMode="none"
          style={{ maxHeight: `calc(100vh - 240px)` }}
        />
      )}
    </div>
  );
};
export default observer(PrePayWriteOffModal);
