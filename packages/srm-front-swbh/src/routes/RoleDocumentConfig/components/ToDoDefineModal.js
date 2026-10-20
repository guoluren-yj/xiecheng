import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
// import intl from 'utils/intl';

export default function DynamicDefineFrom(props) {
  const { formDs, isTenant } = props;
  return (
    <Form dataSet={formDs} useColon columns={3}>
      {!isTenant && <Output name="tenantLov" />}
      <Output name="combineCode" />
      <Output name="dynamicTitle" />
      {/* <Select name="dynamicType" /> */}
      <Output name="dynamicColor" />
      {!isTenant && <Output name="triggerMode" />}
      <Output name="dynamicDescription" />
      <Output name="executionFrequency" />
      <Output name="degreeUrgency" />
      <Output name="displayOrder" precision={0} step={2} />
    </Form>
  );
}
