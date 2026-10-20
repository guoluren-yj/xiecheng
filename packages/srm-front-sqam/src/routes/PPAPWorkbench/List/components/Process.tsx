import React, { useEffect, useState, memo } from 'react';
import classnames from 'classnames';
import { Icon, Tooltip } from 'choerodon-ui/pro';
import { Steps } from 'choerodon-ui';
import uuidv4 from 'uuid/v4';
import style from './index.less';

const { Step } = Steps;
interface ProcessProps {
  stageProcess: any,
  hide?: boolean,
}

interface renderIconProps {
  status: string,
}

interface renderStepProps {
  flag: boolean,
  stepList: any,
}

const renderStatus = (status) => {
  if (['NOT_STARTED'].includes(status)) return 'wait';
  else if (['CLOSED'].includes(status)) return 'finish';
  return 'process';
};

const RenderIcon = memo((props: renderIconProps) => {
  const { status } = props;
  if (status === 'NOT_STARTED') {
    return (
      <div className="process-node-status-custom-icon process-wait">
        <Icon type="history_toggle_off" />
      </div>
    );
  } else if (status === 'CLOSED') {
    return (
      <div className="process-node-status-custom-icon process-wait">
        <Icon type="check" />
      </div>
    );
  } else {
    return (
      <div className="process-node-status-custom-icon c7n-steps-item-process">
        <Icon type="approval-o" />
      </div>
    );
  }
});

function RenderStep(props: renderStepProps) {
  const { stepList, flag } = props;
  return (
    <Steps>
      {stepList.map((item: any, index: number) => {
        if (flag && index > 2) return null;
        return (
          <Step
            className={classnames(
              stepList[index + 1] ? '' : 'least-process-node',
            )}
            key={item.id}
            icon={<RenderIcon status={item.status} />}
            title={<div className={classnames(flag ? 'process-most-text' : '')}>{item.stageNum}</div>}
            status={renderStatus(item.status)}
          />
        );
      })}
    </Steps>
  );
};


function RenderNode(props: renderStepProps) {
  const { stepList } = props;
  return (
    <div
      className={style['process-node-list']}
      style={{ marginLeft: '-9.5%', minWidth: `${140 * (stepList?.length || 0)}px` }}
    >
      {RenderStep(props)}
    </div>
  );
};


const Index = (props: ProcessProps) => {

  const { stageProcess, hide } = props;
  const [stepList, setStepList] = useState([]);

  useEffect(() => {
    if (stageProcess) {
      const list = stageProcess?.split(',') || [];
      const arr: any = [];
      // eslint-disable-next-line array-callback-return
      list.map((item) => {
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

  if (!stageProcess || hide) return (<span style={{marginLeft: '10px'}}>-</span>);

  return (
    <div style={{display: 'flex'}}>
      <div className={style['process-node-list']}>
        <Tooltip
          title={RenderNode({ flag: false, stepList })}
          theme="light"
          popupClassName={style['popup-process-node-list']}
        >
          {RenderStep({ flag: true, stepList })}
        </Tooltip>
      </div>
    </div>
  );
};

export default Index;

