import React, { Fragment, useEffect, useCallback, useContext, useMemo } from 'react';
import { Form, Lov, NumberField, TextField, useDataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { batchModifyDS } from '@/stores/NewSupplySettleDS';
import { Store } from '../Detail/StoreProvider';
import DynamicAlert from '@/routes/Components/DynamicAlert';

const BatchModifyModal = (props) => {
  const { settleLineDs, settleHeaderDs, customizeForm, updateFlag, settleType } = useContext(Store);
  const { modal, editFieldNameList = [], closeCallback, emptyLineEditFlag } = props;
  const { selected } = settleLineDs;
  const batchModifyDs = useDataSet(() => batchModifyDS(settleHeaderDs, settleLineDs), [
    settleHeaderDs,
    settleLineDs,
  ]);

  const handleOk = useCallback(async () => {
    const res = await batchModifyDs.submit();
    if (!res) return false;
    closeCallback();
  }, [batchModifyDs, closeCallback]);
  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  const isPayment = useMemo(() => {
    return settleType === 'PAYMENT';
  }, [settleType]);

  // 勾选为空代表全选批量编辑，只有可编辑的时候才可以修改标准字段
  const isVisible = (name) =>
    (isEmpty(selected) && updateFlag && emptyLineEditFlag) || editFieldNameList.includes(name);

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
          code: isPayment
            ? 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT_BATCH_MODIFY_LINE'
            : 'SSTA.SUPPLY_SETTLE_DETAIL.INV_BATCH_MODIFY_LINE',
        },
        <Form columns={1} labelLayout="float" dataSet={batchModifyDs}>
          {!isPayment && isVisible('quantity') && <NumberField name="quantity" />}
          {!isPayment && isVisible('netPrice') && <NumberField name="netPrice" />}
          {!isPayment && isVisible('netAmount') && <NumberField name="netAmount" />}
          {!isPayment && isVisible('taxRateLov') && <Lov name="taxRateLov" />}
          {!isPayment && isVisible('taxAmount') && <NumberField name="taxAmount" />}
          {!isPayment && isVisible('taxIncludedPrice') && <NumberField name="taxIncludedPrice" />}
          {!isPayment && isVisible('taxIncludedAmount') && <NumberField name="taxIncludedAmount" />}
          {!isPayment && isVisible('lineRemark') && <TextField name="lineRemark" />}
          {isPayment && isVisible('paymentAmount') && <NumberField name="paymentAmount" />}
        </Form>
      )}
    </Fragment>
  );
};

export default BatchModifyModal;
