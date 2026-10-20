import React, { useContext } from 'react';
import { Form, SelectBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Store } from '../../Detail/stores';

const commonPrompt = 'sprm.forecastMgt.model.common';

const { Option } = SelectBox;
const BuyerInterConfigInfo = function BuyerInterConfigInfo() {
  const { headerDs } = useContext(Store);

  return (
    <Form dataSet={headerDs} labelAlign="left" columns={1} useColon={false} labelWidth={260}>
      <SelectBox name="needFeedback" vertical disabled showHelp="label">
        {[
          { value: 1, name: intl.get(`${commonPrompt}.need`).d('需要') },
          { value: 0, name: intl.get(`${commonPrompt}.notNeed`).d('不需要') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>

      <SelectBox name="feedbackAutoFill" vertical disabled showHelp="label">
        {[
          { value: 1, name: intl.get(`${commonPrompt}.equal`).d('等于') },
          { value: 0, name: intl.get(`${commonPrompt}.notEqual`).d('不等于') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>
      <SelectBox name="offlineInputFlag" vertical disabled showHelp="label">
        {[
          { value: 1, name: intl.get(`${commonPrompt}.need`).d('需要') },
          { value: 0, name: intl.get(`${commonPrompt}.notNeed`).d('不需要') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>
      <SelectBox name="detailFeedbackFlag" vertical disabled showHelp="label">
        {[
          { value: '1', name: intl.get('hzero.common.button.yes').d('是') },
          { value: '0', name: intl.get('hzero.common.button.no').d('否') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>

      <SelectBox name="feedbackChangeCnf" vertical disabled showHelp="label" />
      <SelectBox name="feedbackApprovalMethod" vertical disabled showHelp="label" />
      <SelectBox name="feedbackSyncFlag" vertical disabled showHelp="label">
        {[
          { value: '1', name: intl.get('hzero.common.button.yes').d('是') },
          { value: '0', name: intl.get('hzero.common.button.no').d('否') },
        ].map((ele) => (
          <Option value={ele.value}>{ele.name}</Option>
        ))}
      </SelectBox>
    </Form>
  );
};

export default BuyerInterConfigInfo;
