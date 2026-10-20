import React, { useMemo, useEffect, useCallback } from 'react';
import { isFunction } from 'lodash';
import { DataSet, Form, TextArea } from 'choerodon-ui/pro';
import { formDS } from './storeDS';

const HoldInfo = (props) => {
  const { modal, listDs, queryCount } = props;

  const formDs = useMemo(() => new DataSet(formDS(listDs)), [listDs]);

  const handleSubmit = useCallback(async () => {
    const res = await formDs.submit();
    if (!res) return false;
    listDs.query(undefined, undefined, false);
    if (isFunction(queryCount)) queryCount();
  }, [formDs, listDs, queryCount]);

  useEffect(() => {
    if (modal) modal.handleOk(handleSubmit);
  }, [modal, handleSubmit]);

  return (
    <Form dataSet={formDs} useColon={false} labelLayout="float">
      <TextArea name="suspendRemark" resize="vertical" />
    </Form>
  );
};

export default HoldInfo;
