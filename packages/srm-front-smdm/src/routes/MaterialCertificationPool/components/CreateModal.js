import React, { useEffect, useState, useImperativeHandle } from 'react';
// import intl from 'utils/intl';
import { Form, Lov, TextField, useDataSet, DateTimePicker, Select } from 'choerodon-ui/pro';
import { headerInfoDS } from '../stores/listDs';

const Index = React.forwardRef(({ formData = {}, customizeForm, isFromSRM = false }, ref) => {
  const [itemAuthReqHeaderId, setItemAuthReqHeaderId] = useState(null);

  const [isSelectCreateFlag] = useState(!!formData?.sourcePlatform);

  const [awaitAuthConQuote, setAwaitAuthConQuote] = useState('0');

  const formDs = useDataSet(
    () =>
      headerInfoDS({
        itemAuthReqHeaderId,
        isFromSRM,
        isSelectCreateFlag,
        setAwaitAuthConQuote,
      }),
    [itemAuthReqHeaderId, isSelectCreateFlag, setAwaitAuthConQuote]
  );

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();

    if (formFlag) {
      return {
        ...formDs.current?.toData(),
      };
    } else {
      return false;
    }
  };

  const updateDetailInfo = (data) => {
    if (itemAuthReqHeaderId) {
      formDs.query();
    } else {
      setItemAuthReqHeaderId(data?.itemAuthReqHeaderId);
    }
  };

  useEffect(() => {
    formDs.setState('awaitAuthConQuote', awaitAuthConQuote);
  }, [formDs, awaitAuthConQuote]);

  useEffect(() => {
    if (itemAuthReqHeaderId) {
      formDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({ ...formData, isSelectCreateFlag });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDs, itemAuthReqHeaderId, isSelectCreateFlag]);

  // 函数组件调用到子组件的函数
  useImperativeHandle(ref, () => ({
    getDetailInfo,
    updateDetailInfo,
    ref: ref.current,
  }));

  return (
    <div>
      {customizeForm(
        {
          code: 'SMDM.ITEM_AUTH_CREATE_MODAL.FORM',
          __force_record_to_update__: true,
          dataSet: formDs,
        },
        <Form dataSet={formDs} showLines={6} columns={3} labelLayout="float" useColon={false}>
          <TextField name="reqHeaderNum" />
          <TextField name="createdByName" />
          <DateTimePicker name="creationDate" />

          <Lov name="companyId" />
          <Lov name="supplierId" />
          <Lov
            name="categoryId"
            tableProps={{
              mode: 'tree',
              selectionMode: 'rowbox',
              virtual: true,
              style: { maxHeight: '500px' },
            }}
          />

          <Lov name="unitId" />
          <Lov name="prTypeId" />
          <TextField name="sourcePlatform" />

          <Lov name="strategyName" />
          <Select name="autoMatchStrategyNumFlag" clearButton={false} />
          {isSelectCreateFlag && <Select name="awaitAuthConQuote" clearButton={false} />}
        </Form>
      )}
    </div>
  );
});

export default Index;
