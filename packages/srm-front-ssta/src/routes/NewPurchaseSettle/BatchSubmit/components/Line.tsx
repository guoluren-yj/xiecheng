import React, { useMemo, useContext } from 'react';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';
import { Button } from 'choerodon-ui/pro';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';

import { LineSearchCode, LineCode } from '../stores/index';
import { handleViewDetail } from '../../components/BatchSettlePayment/utils';

export default observer(() => {
  const {
    remote,
    lineDs,
    headerDs,
    editFlag,
    customizeTable,
  } = useContext<StoreValueType>(Store);
  const { selected } = lineDs;

  const columns: any = useMemo(() => {
    return [
      {
        name: 'settleNum',
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleViewDetail(record?.get('settleHeaderId'))}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'companyName',
      },
      {
        name: 'supplierCompanyName',
      },
      {
        name: 'paymentApplyAmount',
      },
      {
        name: 'paymentAmount',
      },
      {
        name: 'applyAmount',
      },
    ];
  }, []);

  const buttons = useMemo<Buttons[]>(() => {
    const normarlBtns = [];
    const processBtns = remote
      ? remote.process('SSTA.PURCHASE_SETTLE_BATCH_SUBMIT_CUX.LINE_BTNS', normarlBtns, {
        lineDs,
        headerDs,
        selected,
        editFlag,
      })
      : normarlBtns;
    return processBtns;
  }, [
    remote,
    lineDs,
    headerDs,
    selected,
    editFlag,
  ]);

  return (
    <div>
      {customizeTable(
        { code: LineCode, readOnly: true },
        <SearchBarTable
          virtual
          customizable
          dataSet={lineDs}
          columns={columns}
          buttons={buttons}
          searchCode={LineSearchCode}
          style={{ maxHeight: 'calc(100vh - 380px)' }}
          searchBarConfig={{
            closeFilterSelector: true,
          }}
        />
      )}
    </div>
  );
});
