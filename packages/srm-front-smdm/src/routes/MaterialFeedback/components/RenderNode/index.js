import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Steps } from 'choerodon-ui';
import style from './index.less';

const { Step } = Steps;
const Index = function Index({ record }) {
  const [current, setCurrent] = useState(0);

  const renderStatus = () => {
    // const authFeeStatusCode = record.get('authFeeStatusCode');
    // if (authFeeStatusCode) {
    // if (['REJECTED', 'AUTHENTICATION_REJECTED', 'CANCEL'].includes(authFeeStatusCode)) {
    //   return 'error';
    // } else {
    // return 'process';
    // }
    return 'process';
    // } else {
    //   return 'wait';
    // }
  };

  useEffect(() => {
    const { itemAuthNodeVOList = [] } = record.toData() || {};
    const newCurrent = itemAuthNodeVOList.findIndex(
      (ele) => ele.nodeCode === record.get('nodeCode')
    );
    setCurrent(newCurrent + 1);
  }, []);

  const renderIcon = () => {
    if (current !== 1) {
      return <span>{current}</span>;
    } else {
      return undefined;
    }
  };

  return (
    <div className={style['process-node-list']}>
      <Steps size="default">
        <Step
          title={record.get('nodeCodeMeaning')}
          status={renderStatus()}
          size="default"
          icon={renderIcon()}
        />
      </Steps>
    </div>
  );
};

export default observer(Index);
