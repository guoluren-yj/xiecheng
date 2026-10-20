import React, { useEffect, useState } from 'react';
import { Form, Lov, Select, TextField, NumberField } from 'choerodon-ui/pro';

export default function (props = {}) {
  const { record } = props;
  const [showLeftLov, setShowLeftLov] = useState(false);
  const [showRightLov, setShowRightLov] = useState(false);

  const changeSourceMeaning = (item) => {
    if (item && item.value === 'VARIABLE') {
      setShowLeftLov(true);
    } else {
      setShowLeftLov(false);
      record.set('parameterDescription', '');
    }
    record.set('operator', undefined);
  };
  const changeRightSourceMeaning = (item) => {
    if (item && item.value === 'VARIABLE') {
      setShowRightLov(true);
    } else {
      setShowRightLov(false);
      record.set('rightParameterDescription', '');
    }
  };

  const changeParameterValueLov = (item) => {
    if (item && item.variableType) {
      record.set('parameterType', item.variableType);
    } else {
      record.set('parameterType', '');
    }
  };

  useEffect(() => {
    if (record) {
      if (record.get('parameterSource') === 'VARIABLE') {
        setShowLeftLov(true);
      } else {
        setShowLeftLov(false);
      }
      if (record.get('rightParameterSource') === 'VARIABLE') {
        setShowRightLov(true);
      } else {
        setShowRightLov(false);
      }
    } else {
      setShowLeftLov(false);
      setShowRightLov(false);
    }
  }, [record]);

  const optionsFilter = (optionRecord) => {
    if (!record) {
      return true;
    }
    const parameterSource = record.get('parameterSourceMeaningObj');
    if (parameterSource && parameterSource.value === 'VARIABLE' && optionRecord) {
      return !['>', '<', '>=', '<='].includes(optionRecord.get('value'));
    }
    return true;
  };

  return (
    <Form record={record} labelLayout="float">
      <NumberField step={1} min={0} name="parameterName" />
      <Select name="parameterSourceMeaningObj" onChange={changeSourceMeaning} />
      {showLeftLov ? (
        <Lov name="parameterValueObj" onChange={changeParameterValueLov} />
      ) : (
        <TextField name="parameterValueObj" />
      )}
      <TextField name="parameterDescription" />
      <Select
        name="operator"
        onChange={() => setShowRightLov(false)}
        optionsFilter={optionsFilter}
      />
      <Select name="rightParameterSourceMeaningObj" onChange={changeRightSourceMeaning} />
      {showRightLov ? (
        <Lov name="rightParameterValueObj" />
      ) : (
        <TextField name="rightParameterValueObj" />
      )}
      <TextField name="rightParameterDescription" />
    </Form>
  );
}
