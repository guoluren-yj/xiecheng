import React, { Fragment, useEffect, useCallback, useContext } from 'react';
import { Form, useDataSet } from 'choerodon-ui/pro';

import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { batchModifyInvoiceDS } from '@/stores/NewPurchaseSettleDS';
import { Store } from '../Detail/StoreProvider';
import DynamicAlert from '@/routes/Components/DynamicAlert';

const BatchModifyInvoiceModal = (props) => {
  const { taxInvoiceDs, customizeForm, settleHeaderDs } = useContext(Store);
  const { modal, closeCallback } = props;
  const { selected } = taxInvoiceDs;
  const batchModifyInvoiceDs = useDataSet(() => batchModifyInvoiceDS(taxInvoiceDs, settleHeaderDs), [taxInvoiceDs, settleHeaderDs]);

  const handleOk = useCallback(async () => {
    const res = await batchModifyInvoiceDs.submit();
    if (!res) return false;
    closeCallback();
  }, [batchModifyInvoiceDs, closeCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  return (
    <Fragment>
      <DynamicAlert
        placement="modal-top"
        message={
          isEmpty(selected)
            ? intl.get('ssta.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑')
            : intl
                .get(`ssta.common.view.alert.batchAllMaintainData`, { num: selected.length })
                .d(`已勾选{num}条数据进行批量编辑`)
        }
      />
      {customizeForm(
        {
          code: 'SSTA.PURCHASE_SETTLE_DETAIL.TAXINVOICE_BATCH_MODIFY_LINE',
        },
        <Form columns={1} labelLayout="float" dataSet={batchModifyInvoiceDs} />
      )}
    </Fragment>
  );
};

export default BatchModifyInvoiceModal;
