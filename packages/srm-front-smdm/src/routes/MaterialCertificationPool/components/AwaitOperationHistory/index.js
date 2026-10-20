import React, { useEffect, useState } from 'react';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import { isArray } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchAwatitActionHistory } from '@/services/materialCertificationPoolService';

import styles from './index.less';

const commonPrompt = 'smdm.common.model.common';

const { Item } = Timeline;
// const { Panel } = Collapse;
const OperationHistory = ({ awaitAuthenticateId }) => {
  const [classifiedData, setClassified] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  const [operaLoading, setOperaLoading] = useState(false);
  useEffect(() => {
    // 操作记录
    setOperaLoading(true);
    fetchAwatitActionHistory({ awaitAuthenticateId })
      .then((res) => {
        if (res && isArray(res)) {
          const currentItem = [];
          const batchNoArray = Array.from(
            new Set(
              res.map((ele) => {
                if (ele.batchNo) {
                  return ele.batchNo;
                } else {
                  return ele.creationDate;
                }
              })
            )
          );
          batchNoArray.forEach((item) => {
            currentItem.push(
              res.filter((ele) => ele.batchNo === item || ele.creationDate === item)
            );
          });
          const classified = currentItem.map((ele, index) => {
            dataKey[index] = 'off';

            const { processType, processTypeMeaning } = ele[0];
            const iconAndProcessMeaning = currentStatus(processType, processTypeMeaning);
            return {
              processType: ele[0].processType,
              creationDate: ele[0].creationDate,
              processUserName: ele[0].processUserName,
              // lineNum: ele[0].lineNum,
              reason: ele[0].reason,
              icon: 'mode_edit',
              ...iconAndProcessMeaning,
              list: ele,
            };
          });
          setClassified(classified);
        }
      })
      .finally(() => setOperaLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitAuthenticateId]);

  const currentStatus = (type, processTypeMeaning) => {
    let icon = 'person_pin_circle';
    switch (true) {
      case ['PENDING'].includes(type):
        icon = 'add';
        break;
      case ['UPDATE'].includes(type):
        icon = 'mode_edit';
        break;
      case ['CLOSED'].includes(type):
        icon = 'close';
        break;
      default:
        break;
    }
    return { icon, processTypeMeaning };
  };

  return (
    <div className={styles.operating}>
      <Spin spinning={operaLoading}>
        <Timeline className="operating-timeline">
          {classifiedData.map((item, index) => (
            <Item
              color={item.color || '#E5E5E5'}
              onClick={() => {
                const [...current] = dataKey;
                current[index] = current[index] === 'on' ? 'off' : 'on';
                setDataKey(current);
              }}
            >
              <Icon type={item.icon} style={{ fontSize: 14 }} />
              <div className="operating-timeline-info">
                <span className="operator">{item.processUserName}</span>
                <span className="status gray">{item.processTypeMeaning}</span>
                <span className="result">
                  {intl.get(`${commonPrompt}.awaitAuthDoc`).d('待认证申请单')}
                </span>

                <div className="date gray">{dateTimeRender(item.creationDate)}</div>
              </div>
            </Item>
          ))}
        </Timeline>
      </Spin>
    </div>
  );
};

export default formatterCollections({
  code: ['hzero.common', 'smdm.common'],
})(OperationHistory);
