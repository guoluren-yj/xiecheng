import React, { useContext } from 'react';
import { Select, Form, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const WinRuleRule = () => {
  const {
    commonDs: { bidAnnouncementRuleDs },
  } = useContext(Store);

  return (
    <Form dataSet={bidAnnouncementRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <CheckBox name="enableBidAnnouncementFlag" />
      <Select
        name="bidAnnouncementType"
        clearButton={false}
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <Select
        name="bidAnnouncementContent"
        clearButton={false}
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <Select
        name="bidAnnouncementTarget"
        clearButton={false}
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <CheckBox
        name="showSupplierName"
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <CheckBox
        name="showHistoricalPriceVersion"
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
    </Form>
  );
};

export default observer(WinRuleRule);
