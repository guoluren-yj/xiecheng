import React, { useEffect, useState } from 'react';
import { Timeline } from 'choerodon-ui';
// import { Tooltip } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { queryMapIdpValue } from 'services/api';

import styles from './index.less';

export default function OperationRecord(props) {
  const { operationList = [] } = props;

  const [data, setData] = useState([]);
  const [approveMap, setApproveMap] = useState({});
  // const [feedMap, setFeedMap] = useState({}); // 反馈
  const [actionMap, setActionMap] = useState({}); // 处置动作

  useEffect(() => {
    queryMapIdpValue({
      actionArr: 'SDAT.PROCESS_ACTION',
      feedBackList: 'SDAT.PROCESS_FEEDBACK',
      approveList: 'SDAT.PROCESS_STATUS',
    }).then(res => {
      if (getResponse(res)) {
        const obj1 = {};
        // const obj2 = {};
        const obj3 = {};

        if (res.actionArr && res.actionArr.length) {
          res.actionArr.forEach(item => {
            obj1[item.value] = item.meaning;
          });
        }

        if (res.approveList && res.approveList.length) {
          res.approveList.forEach(item => {
            obj3[item.value] = item.meaning;
          });
        }

        // if (res.feedBackList && res.feedBackList.length) {
        //   res.feedBackList.forEach(item => {
        //     obj2[item.value] = item.meaning;
        //   });
        // }

        setActionMap(obj1);
        // setFeedMap(obj2);
        setApproveMap(obj3);
      }
    });
  }, []);

  useEffect(() => {
    setData(operationList || []);
  }, [operationList]);

  const switchClass = {
    0: styles['incident-item-tag-recall'], // 已撤回
    1: styles['incident-item-tag-approving'], // 审批中
    2: styles['incident-item-tag-approved'], // 审批通过
    3: styles['incident-item-tag-refuse'], // 审批拒绝
  };

  const drawTimeLine = (list = []) => {
    return (list || []).map(item => {
      const approveNames = switchClass[item.stastus];

      const codeList = item?.processAction?.split(',') ?? [];
      const str = codeList.map(rcd => `${actionMap[rcd]} `);

      return (
        <Timeline.Item key={item.workflowId}>
          <div className={styles['timeLine-common-row']}>
            <span style={{ color: 'rgba(0,0,0,0.85)', fontWeight: '600' }}>{str.join('，')}</span>
            <span
              className={approveNames}
              style={{
                display: 'inline-block',
                marginLeft: '10px',
                lineHeight: '18px',
              }}
            >
              {approveMap[String(item.stastus)]}
            </span>
          </div>

          <div className={styles['timeLine-common-row']}>
            <span style={{ color: '#868D9C' }}>
              {intl.get(`sdat.riskControl.model.disposalReason`).d('处置理由')}
            </span>

            {/* <Tooltip title={item?.processReason ?? ''}> */}
            <div
              style={{
                display: 'inline-block',
                marginLeft: '26px',
                lineHeight: '18px',
                // height: '18px',
                width: '500px',
                // overflow: 'hidden',
                // textOverflow: 'ellipsis',
                // whiteSpace: 'nowrap',
                fontWeight: '400',
              }}
            >
              {item?.processReason ?? ''}
            </div>
            {/* </Tooltip> */}
          </div>

          {/* <div className={styles['timeLine-common-row']}>
            <span style={{ color: '#868D9C' }}>
              {intl.get(`sdat.riskControl.model.disposalFeedback`).d('处置反馈')}
            </span>
            <span style={{ marginLeft: '26px' }}>{feedMap[item.processFeedback]}</span>
          </div> */}

          <div className={styles['timeLine-common-row']}>
            <span style={{ color: '#868D9C' }}>
              {intl.get(`sdat.riskControl.model.creationDate`).d('创建日期')}
            </span>
            <span style={{ marginLeft: '26px' }}>{item.creationDate}</span>
          </div>
        </Timeline.Item>
      );
    });
  };

  return (
    <>
      <Timeline>{drawTimeLine(data)}</Timeline>
    </>
  );
}
