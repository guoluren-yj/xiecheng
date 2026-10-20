import React, { useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { DataSet, Button } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { flow, isFunction, isEmpty } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import type { ReactElement } from 'react';

// import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { addDS } from './storeDS';
import { handleViewDetail } from './utils';


export const BatchAddCode = 'SSTA.PURCHASE_SETTLE_DETAIL.ADD_BATCH_SETTLE_LIST';
export const BatchAddSearchCode = 'SSTA.PURCHASE_SETTLE_DETAIL.ADD_BATCH_SETTLE_SEARCH';



interface AddSettleListProps {
  modal?: any,
  batchApproveId: any,
  okCallback: () => void,
  customizeTable?: any,
}

const AddSettleList = flow(
  observer,
  // @ts-ignore
  withCustomize({
    unitCode: [
      BatchAddCode,
      BatchAddSearchCode,
    ],
  }),
)((props: AddSettleListProps) => {

  const {
    modal,
    okCallback,
    batchApproveId,
    customizeTable,
  } = props;
  const addDs = useMemo(() => new DataSet(addDS(batchApproveId)), [batchApproveId]);
  const { selected } = addDs;

  const handleSubmit = useCallback(async () => {
    const res = await addDs.submit();
    if (!res) return false;
    if (modal) modal.close();
    if (isFunction(okCallback)) okCallback();
  }, [addDs, okCallback, modal]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleSubmit);
      modal.update({
        okProps: { disabled: isEmpty(selected) },
      });
    };

  }, [modal, handleSubmit, selected]);

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
  }, [handleViewDetail]);


  return (
    <div style={{ height: 'calc(100vh - 260px)', marginTop: '20px' }}>
      {customizeTable(
        { code: BatchAddCode },
        <SearchBarTable
          virtual
          customizable
          dataSet={addDs}
          columns={columns}
          searchCode={BatchAddSearchCode}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );
}) as (props: AddSettleListProps) => ReactElement;;

export default AddSettleList;
