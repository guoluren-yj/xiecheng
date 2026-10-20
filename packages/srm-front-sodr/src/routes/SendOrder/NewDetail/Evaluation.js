import React, { useContext } from 'react';
import { Form, Output, Rate } from 'choerodon-ui/pro';
import { Store } from './stores';

const Evaluation = function Evaluation() {
  const { evaluationDs } = useContext(Store);
  return (
    <Form dataSet={evaluationDs}>
      <Rate name="poScore" />
      <Output name="poEvaluation" />
    </Form>
  );
};

export default Evaluation;
