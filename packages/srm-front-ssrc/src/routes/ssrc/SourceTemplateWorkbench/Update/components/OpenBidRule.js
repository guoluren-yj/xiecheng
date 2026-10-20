import React, { useContext } from 'react';
import { CheckBox, Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import Store from '../store/index';

const OpenBidRule = () => {
  const {
    commonDs: { openBidDs },
  } = useContext(Store);

  return (
    <Form dataSet={openBidDs} columns={3} labelLayout="float" useWidthPercent>
      <CheckBox name="passwordFlag" showHelp="tooltip" />
    </Form>
  );
};

export default observer(OpenBidRule);
