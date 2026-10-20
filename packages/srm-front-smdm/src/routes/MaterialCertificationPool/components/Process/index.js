import React, { useEffect, useState } from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Steps } from 'choerodon-ui';
import style from './index.less';

const { Step } = Steps;
const Index = function Index({ record }) {
  const [nodeList, setNodeList] = useState([]);
  const [current, setCurrent] = useState(0);
  const [allCurrent, setAllCurrent] = useState(0);

  useEffect(() => {
    const { itemAuthNodeVOList = [] } = record.toData() || {};
    const newAllCurrent = itemAuthNodeVOList.findIndex(
      (ele) => ele.nodeCode === record.get('nodeCode')
    );
    setAllCurrent(newAllCurrent);
    const index =
      itemAuthNodeVOList.findIndex((ele) => !ele.authReqStatusCode) === -1
        ? itemAuthNodeVOList.length - 1
        : itemAuthNodeVOList.findIndex((ele) => !ele.authReqStatusCode) - 1;

    if (itemAuthNodeVOList.length > 3) {
      if (index === 0) {
        setNodeList([...itemAuthNodeVOList.slice(0, 3)]);
        setCurrent(newAllCurrent);
      } else if (index === itemAuthNodeVOList.length - 1) {
        setNodeList([...itemAuthNodeVOList.slice(index - 2)]);
        setCurrent(newAllCurrent - index + 2);
      } else {
        setNodeList(itemAuthNodeVOList.slice(index - 1, index + 2));
        setCurrent(newAllCurrent - index + 1);
      }
    } else {
      setNodeList([...itemAuthNodeVOList]);
      setCurrent(newAllCurrent);
    }
  }, []);

  const renderTitle = (data) => {
    // if (!nodeList[index + 1]?.authReqStatusCode && data.authReqStatusCode) {
    //   return <div className={style['select-node']}> {data.nodeCodeMeaning} </div>;
    // } else {
    return data.nodeCodeMeaning;
    // }
  };

  const renderAllNode = () => {
    const { itemAuthNodeVOList = [] } = record.toData() || {};
    return (
      <div
        className={style['process-node-list']}
        style={{ marginLeft: '-9.5%', minWidth: `${140 * (itemAuthNodeVOList?.length || 0)}px` }}
      >
        <Steps current={allCurrent}>
          {itemAuthNodeVOList.map((item) => (
            <Step
              key={item.nodeCode}
              title={renderTitle(item)}
              // status={renderStatus(item, index, itemAuthNodeVOList)}
              // icon={renderIcon(item, index, itemAuthNodeVOList)}
            />
          ))}
        </Steps>
      </div>
    );
  };

  const renderIcon = (index) => {
    if (current <= index) {
      return <span>{allCurrent + index - current + 1}</span>;
    } else {
      return undefined;
    }
  };

  return (
    <div className={style['process-node-list']}>
      <Tooltip title={renderAllNode()} theme="light">
        <Steps current={current} size="default">
          {/* {frontBlank.map((item) => (
            <Step
              style={{ visibility: 'hidden' }}
              key={item.nodeCode}
            />
          ))} */}
          {nodeList.map((item, index) => (
            <Step key={item.nodeCode} title={renderTitle(item, index)} icon={renderIcon(index)} />
          ))}
          {/* {backBlank.map((item) => (
            <Step
              style={{ visibility: 'hidden' }}
              key={item.nodeCode}
            />
          ))} */}
        </Steps>
      </Tooltip>
    </div>
  );
};

export default observer(Index);
