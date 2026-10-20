import React, { useContext } from 'react';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { Tooltip } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import styles from '../Detail/index.less';

import { Store } from '../Detail/storeProvider';
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const { Step } = Steps;
const NodeInfo = function NodeInfo() {
  const { node, nodeList, history, setNodeList, source } = useContext(Store);

  const current = nodeList.findIndex((ele) => ele.nodeCode === node);

  const renderTitle = (data) => {
    const { queryFlag } = data;
    if (!queryFlag) {
      return (
        <Tooltip title={intl.get(`${commonPrompt}.roleLimitTip`).d('该角色没有查看该阶段的权限')}>
          <div> {data.nodeCodeMeaning} </div>
        </Tooltip>
      );
    }

    if (node === data.nodeCode) {
      return <div> {data.nodeCodeMeaning} </div>;
    } else {
      return data.nodeCodeMeaning;
    }
  };

  const handleItemClick = (data) => {
    const { itemAuthReqHeaderId, authReqStatusCode, nodeCode } = data;
    if (node === nodeCode) return;
    if (itemAuthReqHeaderId) {
      setNodeList([]);
      if (['PENDING', 'REJECTED'].includes(authReqStatusCode)) {
        return history.push(
          `/smdm/material-certification-pool/edit/${itemAuthReqHeaderId}?node=${nodeCode}`
        );
      }
      if (['EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE'].includes(authReqStatusCode)) {
        return history.push(
          `/smdm/material-certification-pool/read/${itemAuthReqHeaderId}?node=${nodeCode}&source=certified`
        );
      }
      return history.push(
        `/smdm/material-certification-pool/read/${itemAuthReqHeaderId}?node=${nodeCode}&source=${source}`
      );
    } else {
      notification.error({
        message: intl
          .get(`${commonPrompt}.nodeJumpTip`, { label: data.nodeCodeMeaning })
          .d(`尚未到${data.nodeCodeMeaning}阶段，不能查看`),
      });
    }
  };

  return (
    <div className={styles['process-node-list']}>
      <Steps current={current === -1 ? 0 : current} size="default">
        {nodeList.map((item) => (
          <Step
            key={item.nodeCode}
            title={renderTitle(item)}
            onClick={() => handleItemClick(item)}
          />
        ))}
      </Steps>
    </div>
  );
};

export default observer(NodeInfo);
