import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

import { Store } from '../../StoreProvider';
import { amountHideSubDS } from '@/stores/SettleStrategyDS';

const AllocateOrg = (props) => {
  const { modal, innerRecord } = props;
  const { editFlag, platModalFlag } = useContext(Store);
  const shieldId = innerRecord.get('shieldId');
  const tableDs = useMemo(
    () => new DataSet(amountHideSubDS({ shieldId, editFlag, platModalFlag })),
    [shieldId, editFlag, platModalFlag]
  );

  const columns = useMemo(() => {
    return [{ name: 'companyName' }, { name: 'companyNum', width: 110 }];
  }, []);

  const handleInit = useCallback(async () => {
    await tableDs.query();
    innerRecord.set('initSelectRecords', tableDs.toJSONData());
  }, [tableDs, innerRecord]);

  const handleSubmit = useCallback(() => {
    innerRecord.set('selectRecords', tableDs.toJSONData());
  }, [tableDs, innerRecord]);

  useEffect(() => {
    handleInit();
    if (modal) {
      modal.handleOk(handleSubmit);
    }
  }, [modal, handleInit, handleSubmit]);

  return (
    <Table
      dataSet={tableDs}
      columns={columns}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      customizedCode="SSTA_STRATEGY_DETAIL.AMOUNT_HIDE_ALLOCATE_ORG"
    />
  );
};

export default AllocateOrg;
