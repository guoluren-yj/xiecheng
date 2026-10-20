import React, { useContext, useLayoutEffect, useRef } from 'react';
import { TextField, DatePicker, Select, Lov, Currency, TextArea, Form } from 'choerodon-ui/pro';
import cuxRemote from 'hzero-front/lib/utils/remote';
import { renderAmount } from '../hook';
import { Store } from '../stores';
import { AutoFillForm } from './AutoFillFormProvider';

const BaseInfo = function BaseInfo(props) {
  const { headerDs, customizeForm, prSourcePlatform, listDs } = useContext(Store);
  const { renderAutoFillTip } = useContext(AutoFillForm);
  const { handleAddField, handleCuxLov, handleCuxbeforeSelect, handleCuxUnitLov } =
    props?.remote?.props?.process ?? {};

  useLayoutEffect(() => {
    if (handleAddField && typeof handleAddField === 'function') {
      handleAddField(headerDs, listDs);
    }
  }, [handleAddField, headerDs, headerDs.current, listDs, listDs.status]);

  const formRef = useRef(null);

  const form = customizeForm(
    {
      code: 'SPRM.PURCHASE_PLAFORM_CREATE.BASE_HEADER',
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      ref={formRef}
      labelLayout="float"
      useColon={false}
      useWidthPercent
    >
      <TextField name="prNum" disabled />
      <TextField name="title" />
      <TextField name="createByName" disabled />
      <DatePicker name="creationDate" disabled mode="dateTime" />
      {typeof handleCuxbeforeSelect === 'function' ? (
        <Lov
          name="prTypeLov"
          onBeforeChange={() => {
            handleCuxbeforeSelect({ listDs });
          }}
        />
      ) : (
        <Lov name="prTypeLov" />
      )}
      <Select name="prSourcePlatform" disabled />
      <Lov name="originalCurrencyLov" />
      <Currency name="amount" disabled renderer={renderAmount} />
      <Lov name="localCurrencyLov" />
      <Currency name="localCurrencyNoTaxSum" renderer={renderAmount} />
      <Currency name="localCurrencyTaxSum" renderer={renderAmount} />
      {prSourcePlatform === 'E-COMMERCE' && (
        <Select
          name="paymentMethodCode"
          disabled
          renderer={({ record }) => record?.get('paymentMethodName')}
        />
      )}
      <TextField name="lotNum" disabled />
      <Currency name="lineAmount" />
      <Lov name="requestedByLov" />
      <DatePicker name="requestDate" />
      {typeof handleCuxUnitLov === 'function' ? (
        handleCuxUnitLov({ headerDs })
      ) : (
        <Lov name="unitLov" />
      )}
      <TextArea name="remark" />
      <TextField name="rpSourceFlag" disabled />
      {typeof handleCuxLov === 'function' ? handleCuxLov({ headerDs, pageForm: 'create' }) : <></>}
    </Form>
  );

  useLayoutEffect(() => {
    if (prSourcePlatform === 'SRM') {
      renderAutoFillTip(formRef?.current?.props);
    }
  }, [headerDs, formRef, prSourcePlatform]);

  return form;
};

export default cuxRemote(
  {
    code: 'SPRM_PURCHASE_DETAIL_CUSTOMLOV',
    name: 'remote',
  },
  {
    process: {
      handleAddField: undefined,
      handleCuxLov: undefined,
      handleCuxUnitLov: undefined,
      handleCuxbeforeSelect: undefined,
    },
  }
)(BaseInfo);
