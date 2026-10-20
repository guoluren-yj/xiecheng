import React, { Fragment, useEffect, useCallback } from 'react';
import { Form, useDataSet, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { batchModifyInvoiceDS } from '../storeDS';
import DynamicAlert from '../../Components/DynamicAlert';

const BatchModifyInvoiceModal = (props) => {
  const { modal, closeCallback, selected, applyHeaderId } = props;
  const batchModifyInvoiceDs = useDataSet(() => batchModifyInvoiceDS(applyHeaderId), [applyHeaderId]);

  const handleOk = useCallback(async () => {
    const validateRes = await batchModifyInvoiceDs.validate();
    if (!validateRes) return false;
    const applyLineIdList = selected?.map((item) => item?.get('applyLineId'));
    const res = await batchModifyInvoiceDs.setState('applyLineIdList', applyLineIdList).submit();
    if (!res) return false;
    closeCallback();
  }, [batchModifyInvoiceDs, closeCallback, selected]);

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
      <Form columns={1} labelLayout={LabelLayout.float} dataSet={batchModifyInvoiceDs}>
        <Select name='applyLineType' />
      </Form>
    </Fragment>
  );
};

export default BatchModifyInvoiceModal;
