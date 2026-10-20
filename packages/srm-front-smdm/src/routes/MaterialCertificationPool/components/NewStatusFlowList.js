import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Steps } from 'choerodon-ui';

const { Step } = Steps;
const Index = function Index({ record, isFeedback = false }) {
  const [nodeList, setNodeList] = useState([]);
  const [currrentIndex, setCurrrentIndex] = useState(0);

  useEffect(() => {
    const { itemAuthNodeVOList = [] } = record.toData() || {};
    setNodeList([...itemAuthNodeVOList]);
    setCurrrentIndex(itemAuthNodeVOList.findIndex((ele) => ele.authReqStatusCode));
  }, []);

  const renderStatus = (data, index, list) => {
    const { authReqStatusCode } = data;
    if (authReqStatusCode) {
      if (['REJECTED', 'AUTHENTICATION_REJECTED', 'CANCEL'].includes(authReqStatusCode)) {
        return 'error';
      } else if (list[index + 1]?.authReqStatusCode) {
        return 'finish';
      } else if (
        ['EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE'].includes(authReqStatusCode)
      ) {
        return 'finish';
      } else {
        return 'process';
      }
    } else {
      return 'wait';
    }
  };

  const renderTitle = (data) => {
    // if (!nodeList[index + 1]?.authReqStatusCode && data.authReqStatusCode) {
    //   return <div className={style['select-node']}> {data.nodeCodeMeaning} </div>;
    // } else {
    return data.nodeCodeMeaning;
    // }
  };

  const renderHeaderStatus = (data) => {
    const authReqStatusCode = data?.get('authReqStatusCode');
    if (authReqStatusCode) {
      if (['CANCEL', 'REJECTED', 'AUTHENTICATION_REJECTED', 'ERROR'].includes(authReqStatusCode)) {
        return 'error';
      } else if (
        ['EARLY_TERMINATION', 'FINAL_AUTHENTICATION_COMPLETE', 'SUCCESS'].includes(
          authReqStatusCode
        )
      ) {
        return 'finish';
      } else {
        return 'process';
      }
    } else {
      return 'wait';
    }
  };

  return (
    <div>
      <Steps
        type="popup"
        headerText={
          isFeedback
            ? record.get('authFeeStatusCodeMeaning')
            : record.get('authReqStatusCodeMeaning')
        }
        status={renderHeaderStatus(record, currrentIndex, nodeList)}
      >
        {nodeList.map((item, index) => (
          <Step
            key={item.nodeCode}
            title={renderTitle(item)}
            status={renderStatus(item, index, nodeList)}
          />
        ))}
      </Steps>
    </div>
  );
};

export default observer(Index);
