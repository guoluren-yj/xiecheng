import React, { useMemo, useEffect, useContext, useCallback, Fragment } from 'react';
import { useDataSet } from 'choerodon-ui/pro';
import moment from 'moment';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import notification from 'utils/notification';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../Detail/StoreProvider';
import { multiPrePayWriteOffAddDS } from '@/stores/NewSupplySettleDS';

const MultiPrepaymentAddModal = (props) => {
  const { modal, topRecord, parentDs } = props;
  const { settleHeader, customizeTable } = useContext(Store);
  const multiPrePayWriteOffAddDs = useDataSet(
    () => multiPrePayWriteOffAddDS(settleHeader, topRecord, parentDs),
    [settleHeader, topRecord, parentDs]
  );
  const { selected } = multiPrePayWriteOffAddDs;
  useEffect(() => {
    modal.handleOk(handleSave);
    modal.update({ okProps: { disabled: isEmpty(selected) } });
  }, [modal, selected, handleSave]);

  const handleFieldChange = useCallback(({ name, record }) => {
    if (name === 'associateNum') {
      record.set('associateLineNum', undefined);
    }
  }, []);

  const columns = useMemo(
    () => [
      {
        width: 150,
        name: 'prepaymentRemainingAmount',
      },
      {
        width: 250,
        name: 'prepaymentTitle',
      },
      {
        width: 150,
        name: 'prepaymentTypeMeaning',
      },
      {
        width: 150,
        name: 'associateNum',
      },
      {
        width: 150,
        name: 'prepaymentCreatedBy',
      },
      {
        width: 150,
        name: 'prepaymentCreationDate',
      },
      {
        width: 150,
        name: 'associateLineNum',
      },
    ],
    []
  );

  const handleSave = useCallback(() => {
    const applyTotalAmount = parentDs
      .map((item) => item.get('applyAmount'))
      .reduce((a = 0, b = 0) => math.plus(a, b), 0);
    const paymentAmountInitList = topRecord.get('paymentAmountInitList');
    const { defaultMode } =
      paymentAmountInitList?.find((item) => item.initType === 'PRE_PAYMENT_AMOUNT') || {};
    if (['LINKAGE', 'LINKAGE_APPLY'].includes(defaultMode)) {
      selected.sort(
        (a, b) =>
          moment(a.get('prepaymentCreationDate')).valueOf() -
          moment(b.get('prepaymentCreationDate')).valueOf()
      );
      let applyAmountTotal = applyTotalAmount || 0;
      const paymentAmount = defaultMode === 'LINKAGE' ? topRecord.get('paymentAmount') : 0;
      selected.forEach((item) => {
        const preApplyAmount = math.minus(
          math.minus(topRecord.get('remainingPaymentAmount'), paymentAmount),
          applyAmountTotal
        );
        const remainApplyAmount = item.get('prepaymentRemainingAmount');
        const inputApplyAmount = math.lt(preApplyAmount, remainApplyAmount)
          ? math.lt(preApplyAmount, 0)
            ? 0
            : preApplyAmount
          : math.lt(remainApplyAmount, 0)
          ? 0
          : remainApplyAmount;
        applyAmountTotal = math.plus(applyAmountTotal, inputApplyAmount);
        item.set('applyAmount', inputApplyAmount);
      });
    }
    parentDs.push(...selected);
    notification.success();
  }, [parentDs, topRecord, selected]);

  return (
    <Fragment>
      {customizeTable(
        {
          code: 'SSTA.SUPPLY_SETTLE_DETAIL.INVOICE_INFO_BOX_ADD.LIST',
        },
        <SearchBarTable
          queryBar="none"
          columns={columns}
          dataSet={multiPrePayWriteOffAddDs}
          searchCode="SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_MULTI_PRE_OFF_ADD"
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          searchBarConfig={{
            expandable: false,
            closeFilterSelector: true,
            onFieldChange: handleFieldChange,
            fieldProps: {
              associateLineNum: {
                dynamicProps: {
                  disabled: ({ record }) => !record.get('associateNum'),
                },
              },
            },
          }}
        />
      )}
    </Fragment>
  );
};

export default observer(MultiPrepaymentAddModal);
