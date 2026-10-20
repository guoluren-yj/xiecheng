import React, { useMemo, useEffect, useCallback, Fragment } from 'react';
import { Form, DataSet, Lov, TextField, Switch, Select } from 'choerodon-ui/pro';
import type { Record } from 'choerodon-ui/dataset';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/interface';

import { modifyGoodsInfoDS } from '../stores/listDS';

interface ModifyGoodsMappingProps {
  modal?: any,
  record?: Record,
  action: 'modify' | 'create',
  onOk: Function,
}

const ModifyGoodsMapping = (props: ModifyGoodsMappingProps) => {

  const { modal, record, action, onOk } = props;

  const modifyFlag = action === 'modify';
  const modifyGoodsInfoDs = useMemo<DataSet>(() => new DataSet(modifyGoodsInfoDS()), []);

  const handleOk = useCallback(async () => {
    const validateFlag = await modifyGoodsInfoDs.validate();
    if (!validateFlag) return false;
    const res = await modifyGoodsInfoDs.submit();
    if (!res) return false;
    if (onOk) onOk();
  }, [modifyGoodsInfoDs, onOk]);


  useEffect(() => {
    if (modal) modal.handleOk(handleOk);
    if (record && modifyFlag) modifyGoodsInfoDs.loadData([record.toData()]);
  }, [modal, handleOk, record, modifyFlag, modifyGoodsInfoDs]);

  return (
    <Fragment>
      <Form dataSet={modifyGoodsInfoDs} labelLayout={LabelLayout.float}>
        <TextField name="commodityCode" />
        <TextField name="commodityName" />
        <TextField name="commodityServiceCateCode" />
        <Select name="taxRate" />
        <Select name="preferentialPolicyFlag" />
        <Select name="freeTaxMark" />
        <TextField name="percent" />
        <TextField name="keyWord" />
        <TextField name="remark" />
        <Lov name='supUnifiedSocialCodeLov' />
        <Select name="summaryFlag" />
        <Switch name="enabledFlag" />
      </Form>
    </Fragment>

  );
};

export default ModifyGoodsMapping;
