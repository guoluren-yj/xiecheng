import React, { useContext } from 'react';
import { Select, Form, NumberField, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const WinRuleRule = ({ scoreFlag = false }) => {
  const {
    commonDs: { winBidRuleDs },
  } = useContext(Store);

  return (
    <Form dataSet={winBidRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <CheckBox name="winMessageFlag" />
      <CheckBox
        name="autoSendBidNoticeFlag"
        hidden={!winBidRuleDs?.current?.get('winMessageFlag')}
      />
      <CheckBox name="loseMessageFlag" hidden={!winBidRuleDs?.current?.get('winMessageFlag')} />
      <NumberField
        name="noticeDays"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Select
        name="visibleRangeType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Select
        name="nameVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Select
        name="priceVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Select
        name="quantityVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Select
        name="expertVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag') || !scoreFlag}
      />
      <CheckBox name="expandResultsFlag" showHelp="tooltip" />
    </Form>
  );
};

export default observer(WinRuleRule);
