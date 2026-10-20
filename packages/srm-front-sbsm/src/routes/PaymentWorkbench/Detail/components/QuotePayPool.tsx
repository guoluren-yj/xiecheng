import React, { useContext, useMemo, useCallback, useEffect, Fragment } from 'react';
import { isEmpty, isNil } from 'lodash';
import { observer } from'mobx-react';
import { DataSet } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../stores';
import { PaymentLineAddCodeMap } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';
import { viewPaymentPoolDetail } from '../../../PaymentPool/Detail';
import MultiTextFilter from '../../../../components/MultiTextFilter';
import { PendingCustCodeMap } from '../../../PaymentPool/utils/type';
import { pendingListDS } from '../../../PaymentPool/List/stores/listDS';

const QuotePayPool = observer((props) => {

  const { modal, payPoolDs: sourceDs } = props;
  const { remote, boolMap, history, headerDs, cuxProps, customizeTable } = useContext(Store);

  const payPoolDs = useMemo(() => {
    if (sourceDs) return sourceDs; // step中的ds通过父组件传递
    else return new DataSet(pendingListDS());
  }, [sourceDs]);

  const noSelected = isEmpty(payPoolDs.selected);
  const payHeaderId = headerDs.current?.get('payHeaderId');
  const addLineFlag = !isNil(payHeaderId);
  const cuszCodeMap = addLineFlag ? PaymentLineAddCodeMap : PendingCustCodeMap;

  useEffect(() => {
    // 有payHeaderId则为新增行
    if (payHeaderId) {
      payPoolDs.setQueryParameter('payHeaderId', payHeaderId);
      payPoolDs.setQueryParameter('customizeUnitCode', Object.values(PaymentLineAddCodeMap).join());
    };
  }, [payPoolDs, payHeaderId]);

  const handleOk = useCallback(async () => {
    const res = await payPoolDs
      .setState('submitType', 'addPayLine')
      .submit();
    if (!res) return;
    headerDs.query(undefined, undefined, true);
  }, [payPoolDs, headerDs]);

  useEffect(() => {
    if (!boolMap.stepFlag && modal) modal.handleOk(handleOk);
  }, [modal, handleOk, boolMap]);

  useEffect(() => {
    if (!boolMap.stepFlag && modal) {
      modal.update({ okProps: { disabled: noSelected } });
    }
  }, [modal, boolMap, noSelected]);

  const columns: ColumnProps[] = useMemo(() => {
    const normalColumns = [
      {
        name: 'payNum',
        width: 200,
        renderer: ({ value, record }) => (
          <a onClick={() => viewPaymentPoolDetail({ history, payId: record?.get('payId') })}>
            {value}
          </a>
        ),
      },
      { name: 'documentAndLineNum', width: 200 },
      { name: 'companyName', width: 250 },
      { name: 'displaySupplierName', width: 250 },
      { name: 'currencyCode', width: 100 },
      { name: 'itemCode', width: 120 },
      { name: 'itemName', width: 120 },
      { name: 'payAmount', width: 120 },
      { name: 'payStatus', width: 120, renderer: statusTagRender },
      { name: 'payOccupyAmount', width: 150 },
      { name: 'enablePayAmount', width: 150 },
      { name: 'paidAmount', width: 180 },
      { name: 'payingAmount', width: 200 },
      { name: 'payTypeName', width: 150 },
      { name: 'exPaymentDate', width: 150 },
    ];
    return remote
      ? remote.process('SBSM.PAYMENT_WORKBENCH_DETAIL_CUX.QUOTE_PAY_POOL_COLUMNS', normalColumns, {
        cuxProps,
        boolMap,
      })
      : normalColumns;
  }, [
    remote,
    history,
    boolMap,
    cuxProps,
  ]);

  return (
    <Fragment>
      {customizeTable(
        { code: cuszCodeMap.Grid },
        <SearchBarTable
          dataSet={payPoolDs}
          columns={columns}
          searchCode={cuszCodeMap.Filter}
          style={{ maxHeight: boolMap.stepFlag ? 'calc(100vh - 220px)' : 'calc(100vh - 170px)' }}
          searchBarConfig={{
            expandable: !addLineFlag,
            closeFilterSelector: addLineFlag,
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="payNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.paymentPool.view.placeholder.enterPayTransactionNumToQuery')
                    .d('请输入支付事务编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </Fragment>
  );
});

export default QuotePayPool;
