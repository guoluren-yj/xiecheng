import React from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';

const HeaderInfo = ({ formDs, reqStatus, customizeForm = () => {}, code = '' }) => {
  return customizeForm(
    {
      code,
    },
    <Form dataSet={formDs} columns={3} labelAlign="left">
      <Output name="reqNum" />
      <Output name="reqUserName" />
      <Output name="releaseDate" />
      <Output name="companyName" />
      <Output name="ouName" />
      <Output name="organizationName" />
      <Output name="typeCodeMeaning" />
      <Output name="urgencyDegreeMeaning" />
      <Output name="sampleSendAddress" />
      <Output name="recUserName" />
      <Output name="recUserPhone" />
      <Output name="reqUserPhone" />
      <Output name="reqStatus" />
      <Output name="receiveUnitName" />
      <Output name="needFeedbackFlag" renderer={({ value }) => yesOrNoRender(value)} />
      <Output name="remark" />
      {['CONFIRMED', 'RETURNED'].includes(reqStatus) && <Output name="confirmRemark" />}
    </Form>
  );
};
export default HeaderInfo;
