import React, { useContext } from 'react';

import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import { Tooltip } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import style from '../Detail/index.less';

import { Store } from '../Detail/storeProvider';
// 设置smdm国际化前缀 - common - model
const commonPrompt = 'smdm.common.model.common';

const { Step } = Steps;
const NodeInfo = function NodeInfo() {
  const { node, nodeList, history, setNodeList } = useContext(Store);
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
      return <div className={style['select-node']}> {data.nodeCodeMeaning} </div>;
    } else {
      return data.nodeCodeMeaning;
    }
  };

  const handleItemClick = (data) => {
    const { itemAuthFeeHeaderId, authFeeStatusCode, nodeCode, skipFlag } = data;
    if (node === nodeCode) return;
    if (itemAuthFeeHeaderId) {
      setNodeList([]);
      if (['WAIT_FEEDBACK', 'AUTHENTICATION_REJECTED'].includes(authFeeStatusCode)) {
        return history.push(
          `/smdm/material-certification-feedback/edit/${itemAuthFeeHeaderId}?node=${nodeCode}`
        );
      }
      // if (
      //   ['FINAL_AUTHENTICATION_COMPLETE', 'AUTHENTICATION_APPROVED', 'EARLY_TERMINATION'].includes(
      //     authFeeStatusCode
      //   )
      // ) {
      //   return history.push(
      //     `/smdm/material-certification-feedback/read/${itemAuthFeeHeaderId}?node=${nodeCode}&source=feedback`
      //   );
      // }
      return history.push(
        `/smdm/material-certification-feedback/read/${itemAuthFeeHeaderId}?node=${nodeCode}&source=feedback`
      );
      // return history.push(
      //   `/smdm/material-certification-feedback/read/${itemAuthFeeHeaderId}?node=${nodeCode}`
      // );
    } else if (skipFlag) {
      notification.error({
        message: intl
          .get(`${commonPrompt}.nodeSkipTip`, { label: data.nodeCodeMeaning })
          .d(`${data.nodeCodeMeaning}阶段执行过跳过操作，未生成反馈信息，因此无法查看`),
      });
    } else {
      notification.error({
        message: intl
          .get(`${commonPrompt}.nodeJumpTip`, { label: data.nodeCodeMeaning })
          .d(`尚未到${data.nodeCodeMeaning}阶段，不能查看`),
      });
    }
  };

  return (
    <div className={style['process-node-list']}>
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
