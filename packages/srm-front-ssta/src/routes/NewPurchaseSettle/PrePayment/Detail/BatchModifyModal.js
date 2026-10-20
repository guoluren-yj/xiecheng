import React, { Fragment, useEffect, useCallback } from 'react';
import { Form, NumberField, useDataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import { batchModifyDS } from './stores/detailDS';
import DynamicAlert from '@/routes/Components/DynamicAlert';

const BatchModifyModal = (props) => {
  const {
    modal,
    editFieldNameList = [],
    closeCallback,
    customizeForm,
    updateFlag,
    lineDS,
    headerDs,
  } = props;
  const { selected } = lineDS;
  const batchModifyDs = useDataSet(() => batchModifyDS(headerDs, lineDS), [headerDs, lineDS]);

  const handleOk = useCallback(async () => {
    const res = await batchModifyDs.submit();
    if (!res) return false;
    closeCallback();
  }, [batchModifyDs, closeCallback]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  // 勾选为空代表全选批量编辑，只有可编辑的时候才可以修改标准字段
  const isVisible = (name) => (isEmpty(selected) && updateFlag) || editFieldNameList.includes(name);

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
        { code: 'SSTA.PURCHASE_SETTLE_DETAIL.PRE__BATCH_MODIFY_LINE' },
        <Form columns={1} labelLayout="float" dataSet={batchModifyDs}>
          {isVisible('prepaymentAmount') && <NumberField name="prepaymentAmount" />}
        </Form>
      )}
    </Fragment>
  );
};

export default BatchModifyModal;
