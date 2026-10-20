import React, { useMemo, useEffect, useCallback } from 'react';
import { Form, DataSet, Lov, TextField, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

// import type { StoreValueType } from '../stores';
// import { Store } from '../stores';
import { initGoodsInfoDS } from '../stores/listDS';

interface InitGoodsInfoProps {
  modal?: any,
  onOk: () => void,
  infoSearchRef,
}

const InitGoodsInfo = (props: InitGoodsInfoProps) => {

  const { modal, infoSearchRef, onOk } = props;
  // const { infoSearchRef, currentTableDs, getTotalCount } = useContext<StoreValueType>(Store);

  const initGoodsInfoDs = useMemo<DataSet>(() => new DataSet(initGoodsInfoDS()), []);

  const handleOk = useCallback(async () => {
    const validateFlag = await initGoodsInfoDs.validate();
    if (!validateFlag) return false;
    const res = await initGoodsInfoDs.submit();
    if (!res) return false;
    const companyLov = initGoodsInfoDs.current?.get('companyLov');
    if (infoSearchRef) {
      infoSearchRef.current.setFields({
        taxpayerNumber: companyLov,
      });
    }
    if (onOk) onOk();
  }, [infoSearchRef, initGoodsInfoDs, onOk]);

  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
  }, [modal, handleOk]);

  return (
    <Form dataSet={initGoodsInfoDs} labelLayout={LabelLayout.float}>
      <Lov name="customerLov" />
      <Lov name="companyLov" />
      <TextField name="projectCode" />
      <TextField name="projectName" />
      <Select name="taxRate" />
      <TextField name="model" />
    </Form>
  );
};

export default InitGoodsInfo;
