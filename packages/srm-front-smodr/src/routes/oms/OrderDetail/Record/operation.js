import React, { useEffect, useState } from 'react';
import { Timeline, Icon, Spin } from 'choerodon-ui';

import { getResponse } from 'hzero-front/lib/utils/utils';
import { fetchOrderUpdateRecord } from '@/services/oms/applyWorkBenchService';

import { dateTimeRender } from 'utils/renderer';
import styles from './operation.less';

export default function OperationRecord(props) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flagObj, setFlagObj] = useState({});
  const { orderId } = props;
  async function fetchData() {
    setLoading(true);
    const res = getResponse(await fetchOrderUpdateRecord({ orderId, operationTypeCode: 'UPDATE' }));
    setLoading(false);
    if (res) {
      const initFlag = {};
      res.forEach(i => {
        initFlag[i.changeRecordId] = false;
      });
      setData(res);
      setFlagObj(initFlag);
    }
  }
  useEffect(() => {
    fetchData();
  }, [orderId]);

  const lineColor = (item) => {
    if (['CANCEL_FAILED', 'CONVERSION_FAILED', 'EXTERNAL_APPROVED_REJECTED', 'WORKFLOW_APPROVAL_REJECTED'].includes(item.operationType)) {
      return 'red';
    } else if (['CONVERSION', 'APPROVED', 'WORKFLOW_APPROVED'].includes(item.operationType)) {
      return 'green';
    } else {
      return '#E5E7EC ';
    }
  };
  // 记录icon
  // const lineIcon = (item) => {
  //   if (item.operationTypeCode === 'UPDATE') {
  //     return 'edit';
  //   }
  // };
  const handleCheck = (i) => {
    setFlagObj({ ...flagObj, [i.changeRecordId]: !flagObj[i.changeRecordId] });
  };
  return (
    <Spin spinning={loading}>
      <div className={styles['record-container']}>
        {data.length > 0 && (
          <Timeline>
            {
              data.map((item) => {
                return (
                  <Timeline.Item color={lineColor(item)}>
                    <div className='record-item'>
                      <div className='item-pic'><Icon type='mode_edit' /></div>
                      <div className='item-box'>
                        <div className='item-content'>
                          <div dangerouslySetInnerHTML={{ __html: `${item.message}` }} />
                          {
                            item.orderChangeRecordDetailList.length > 0
                            && (
                              <Icon
                                type={flagObj[item.changeRecordId]
                                  ? 'expand_less'
                                  : 'expand_more'}
                                onClick={() => handleCheck(item)}
                              />
                            )
                          }
                        </div>
                        {
                          item.orderChangeRecordDetailList.length > 0 && flagObj[item.changeRecordId] && (
                            <div className='item-detail'>
                              {item.orderChangeRecordDetailList.map(i => (
                                <div className='label-detail'>
                                  {i.message}
                                </div>
                              )
                              )}
                            </div>
                          )
                        }
                        <div className='item-time'>{dateTimeRender(item.creationDate)}</div>
                      </div>
                    </div>
                  </Timeline.Item>
                );
              })
            }
          </Timeline>
        )}
      </div>
    </Spin>
  );
}
