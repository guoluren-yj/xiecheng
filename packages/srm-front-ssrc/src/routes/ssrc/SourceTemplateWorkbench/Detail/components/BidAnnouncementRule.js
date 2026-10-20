import React, { useContext } from 'react';
import { Output, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const WinRuleRule = () => {
  const {
    commonDs: { bidAnnouncementRuleDs },
  } = useContext(Store);

  return (
    <Form dataSet={bidAnnouncementRuleDs} columns={3} labelLayout="float" useWidthPercent>
      <Output name="enableBidAnnouncementFlag" renderer={({ value }) => yesOrNoRender(value)} />
      <Output
        name="bidAnnouncementType"
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <Output
        name="bidAnnouncementContent"
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <Output
        name="bidAnnouncementTarget"
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <Output
        name="showSupplierName"
        renderer={({ value }) => yesOrNoRender(value)}
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
      <Output
        name="showHistoricalPriceVersion"
        renderer={({ value }) => yesOrNoRender(value)}
        hidden={!bidAnnouncementRuleDs?.current?.get('enableBidAnnouncementFlag')}
      />
    </Form>
  );
};

export default observer(WinRuleRule);
