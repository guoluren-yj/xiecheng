import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import { yesOrNoRender } from 'utils/renderer';

import Store from '../store/index';

const WinRuleRule = ({ scoreFlag = false }) => {
  const {
    commonDs: { winBidRuleDs },
  } = useContext(Store);

  return (
    <Form
      dataSet={winBidRuleDs}
      columns={3}
      labelLayout="vertical"
      className="c7n-pro-vertical-form-display"
      labelAlign="left"
      useWidthPercent
    >
      <Output name="winMessageFlag" renderer={({ value }) => yesOrNoRender(value)} />
      <Output
        name="autoSendBidNoticeFlag"
        renderer={({ value }) => yesOrNoRender(value)}
        hidden={!winBidRuleDs?.current?.get('winMessageFlag')}
      />
      <Output
        name="loseMessageFlag"
        renderer={({ value }) => yesOrNoRender(value)}
        hidden={!winBidRuleDs?.current?.get('winMessageFlag')}
      />
      <Output name="noticeDays" hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')} />
      <Output
        name="visibleRangeType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Output
        name="nameVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Output
        name="priceVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Output
        name="quantityVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag')}
      />
      <Output
        name="expertVisibleType"
        hidden={!winBidRuleDs?.current?.get('autoSendBidNoticeFlag') || !scoreFlag}
      />
      <Output
        name="expandResultsFlag"
        showHelp="label"
        renderer={({ value }) => yesOrNoRender(value)}
      />
    </Form>
  );
};

export default observer(WinRuleRule);
