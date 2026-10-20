import React, { useState, useCallback } from 'react';
import intl from 'utils/intl';
import { throttle } from 'lodash';
import { Button } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

import { resendPassword } from '@/services/inquiryHallService';
import { batchSendMessage } from '@/services/inquiryHallNewService';

const ResendPassButton = (props) => {
  const { organizationId, rfxHeaderId, sectionBiddingRef = {} } = props;

  const [loading, setLoading] = useState(false);

  // 重发密码fun
  const resendPasswordFuc = useCallback(
    throttle(async () => {
      const { state: { checkedList = [] } = {} } = sectionBiddingRef.current || {};
      setLoading(true);
      try {
        let result;
        if (checkedList.length) {
          result = getResponse(
            await batchSendMessage({
              organizationId,
              rfxHeaderId,
              projectLineSectionList: checkedList,
            })
          );
        } else {
          result = getResponse(
            await resendPassword({
              rfxHeaderId,
            })
          );
        }
        if (result && !result.failed) {
          notification.success();
        }
      } catch (err) {
        throw err;
      } finally {
        setLoading(false);
      }
    }, 1200),
    [rfxHeaderId, organizationId, sectionBiddingRef]
  );

  return (
    <Button loading={loading} onClick={resendPasswordFuc}>
      {intl.get(`ssrc.inquiryHall.view.message.button.resendPassword`).d('重发密码')}
    </Button>
  );
};

export default ResendPassButton;
