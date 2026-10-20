import React, { Fragment, useEffect, useCallback } from 'react';
import { Form, NumberField, useDataSet } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { batchModifyDS } from './mainDS';
import styles from '../../ReconciliationWorkbench/DetailNew/index.less';

const BatchModifyModal = (props) => {
  const { modal, editFieldNameList = [], closeCallback, customizeForm, tableDs, formDs } = props;
  const { selected } = tableDs;
  const batchModifyDs = useDataSet(() => batchModifyDS(formDs, tableDs), [formDs, tableDs]);

  const handleOk = useCallback(async () => {
    const res = await batchModifyDs.submit();
    if (!res) return false;
    closeCallback();
  }, [batchModifyDs, closeCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  // 勾选为空代表全选批量编辑，只有可编辑的时候才可以修改标准字段,emptyLineEditFlag用于判断如果没选是否可编辑
  const isVisible = (name) =>
    (isEmpty(selected) && tableDs?.length > 1) || editFieldNameList.includes(name);

  return (
    <Fragment>
      <Alert
        showIcon
        closable
        className={styles['batch-modify-alert']}
        message={
          isEmpty(selected)
            ? intl.get('ssta.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑')
            : intl
                .get(`ssta.common.view.alert.batchAllMaintainData`, { num: selected.length })
                .d(`已勾选{num}条数据进行批量编辑`)
        }
      />
      {customizeForm(
        { code: 'SSTA.SUPPLIER_BILL_DETAIL.BATCH_MODIFY_LINE' },
        <Form columns={1} labelLayout="float" dataSet={batchModifyDs}>
          {isVisible('quantity') && <NumberField name="quantity" />}
          {isVisible('netPrice') && <NumberField name="netPrice" />}
          {isVisible('netAmount') && <NumberField name="netAmount" />}
          {isVisible('taxIncludedPrice') && <NumberField name="taxIncludedPrice" />}
          {isVisible('taxIncludedAmount') && <NumberField name="taxIncludedAmount" />}
        </Form>
      )}
    </Fragment>
  );
};

export default BatchModifyModal;
