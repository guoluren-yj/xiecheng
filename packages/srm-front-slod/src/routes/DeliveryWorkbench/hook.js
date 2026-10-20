// 改造自定义C7nPopover
import React, { useState, useCallback } from 'react';
import { Popover, Icon, Spin, Badge } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import { isNil } from 'lodash';

import { fetchModal } from '@/services/DeliveryWorkbenchServices';

const C7nPopover = (props) => {
  const { record = {} } = props;
  const [executeStatusContent, setExecuteStatusContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const iconStyle = {
    fontSize: 12,
    lineHeight: '18px',
    paddingLeft: '5px',
  };

  const modalClickList = useCallback((re) => {
    const { sourceHeaderNum, sourceLineNum, strategyHeaderId } = re;
    setLoading(true);
    getResponse(fetchModal({ sourceHeaderNum, sourceLineNum, strategyHeaderId })).then((res) => {
      if (res) {
        setExecuteStatusContent([...res]);
        setLoading(false);
      }
    });
    setLoading(false);
  }, []);

  return (
    <Popover
      style={{ marginBottom: 0 }}
      content={
        <Spin spinning={loading} size="small">
          {(executeStatusContent || []).map((item) => {
            return (
              <p style={{ marginBottom: 4, display: 'flex', alignItems: 'center' }}>
                <Badge status="success" />
                {item.nodeConfigName}
                {/* {`(${item.quantity})`} */}
                {isNil(item.quantity) ? `(${0})` : `(${item.quantity})`}
              </p>
            );
          })}
        </Spin>
      }
      placement="rightTop"
      trigger="hover"
    >
      <Icon type="call_split" style={iconStyle} onMouseEnter={() => modalClickList(record)} />
    </Popover>
  );
};

export default C7nPopover;
