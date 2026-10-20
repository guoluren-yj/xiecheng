/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-10 16:37:41
 */
import React, { useContext } from 'react';
import { Form, Select, SelectBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../stores';

const commonPrompt = 'sprm.forecastMgt.model.common';

const { Option } = Select;
const BuyerInterConfigInfo = function BuyerInterConfigInfo() {
  const { headerDs } = useContext(Store);

  return (
    <Form dataSet={headerDs} labelAlign="left" columns={1} useColon={false} labelWidth={260}>
      <SelectBox name="needFeedback" vertical showHelp="label">
        {[
          { value: 1, name: intl.get(`${commonPrompt}.need`).d('需要') },
          { value: 0, name: intl.get(`${commonPrompt}.notNeed`).d('不需要') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>

      <SelectBox name="feedbackAutoFill" vertical showHelp="label">
        {[
          { value: 1, name: intl.get(`${commonPrompt}.equal`).d('等于') },
          { value: 0, name: intl.get(`${commonPrompt}.notEqual`).d('不等于') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>
      <SelectBox name="offlineInputFlag" vertical showHelp="label">
        {[
          { value: 1, name: intl.get(`${commonPrompt}.need`).d('需要') },
          { value: 0, name: intl.get(`${commonPrompt}.notNeed`).d('不需要') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>
      <SelectBox name="detailFeedbackFlag" vertical showHelp="label" />
      <SelectBox name="feedbackChangeCnf" vertical showHelp="label" />
      <SelectBox name="feedbackApprovalMethod" vertical showHelp="label" />
      <SelectBox name="feedbackSyncFlag" vertical showHelp="label" />
    </Form>
  );
};

export default BuyerInterConfigInfo;
