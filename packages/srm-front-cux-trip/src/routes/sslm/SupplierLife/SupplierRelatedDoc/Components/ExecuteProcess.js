import React, { useEffect, useState, memo, useCallback } from 'react';
import { Steps } from 'choerodon-ui';
import uuidv4 from 'uuid/v4';
import { findLastIndex, findIndex } from 'lodash';

const { Step } = Steps;

const renderStatus = status => {
  if (['NOT_STARTED'].includes(status)) return 'wait';
  else if (['CLOSED'].includes(status)) return 'finish';
  return 'process';
};

const Index = memo(props => {
  const { stageProcess, hide } = props;
  const [stepList, setStepList] = useState([]);

  useEffect(() => {
    if (stageProcess) {
      const list = stageProcess?.split(',') || [];
      const arr = [];
      // eslint-disable-next-line array-callback-return
      list.map(item => {
        const nums = item?.split('#') || [];
        arr.push({
          status: nums[0],
          stageNum: nums[1],
          id: uuidv4(),
        });
      });
      setStepList(arr);
    }
  }, [stageProcess]);

  const RenderShowStep = useCallback(() => {
    let info = stepList[0];
    const notStartLastIndex = findIndex(stepList, v => v.status === 'NOT_STARTED');
    const endLastIndex = findLastIndex(stepList, v => v.status === 'CLOSED');
    const progressLastIndex = findLastIndex(
      stepList,
      v => v.status !== 'CLOSED' && v.status !== 'NOT_STARTED'
    );
    if (notStartLastIndex > -1) info = stepList[notStartLastIndex];
    if (endLastIndex > -1) info = stepList[endLastIndex];
    if (progressLastIndex > -1) info = stepList[progressLastIndex];
    if (info) {
      const status = renderStatus(info.status);
      return (
        <Steps type="popup" headerText={info.stageNum} status={status}>
          {stepList.map(item => {
            return <Step key={item.id} title={item.stageNum} status={renderStatus(item.status)} />;
          })}
        </Steps>
      );
    }
    return null;
  }, [stepList]);

  if (!stageProcess || hide) return <span>-</span>;

  return <div>{RenderShowStep()}</div>;
});

export default Index;
