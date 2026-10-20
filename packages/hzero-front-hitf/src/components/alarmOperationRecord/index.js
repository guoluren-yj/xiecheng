import React, { useEffect, useState } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';

import { getAppRecord } from '@/services/alarmapplicationManageService';

import styles from './index.less';

const OperationRecord = (props) => {
  const { id } = props;
  const [recordArr, setRecordArr] = useState([]);
  useEffect(() => {
    // 查询接口定义详情页记录
    getAppRecord(id).then((res) => {
      const result = getResponse(res);
      if (result) {
        setRecordArr(result);
      }
    });
  }, []);

  const iconType = {
    NEW: 'add', // 新建应用
    SUBMIT: 'near_me', // 提交应用
    APPROVED: 'authorize',
    REJECTED: 'authorize',
    UPDATE: 'mode_edit', // 修改应用
    ENABLE: 'task_alt',
    DISABLED: 'do_not_disturb_alt',
    EDIT: 'mode_edit',
    PUBLISH: 'near_me',
    DELETE: 'delete', // 删除
    REPLY: 'reply', // 撤销
  };

  return (
    <div className={styles['operation-record']}>
      <Timeline>
        {recordArr.map((item) => (
          <Timeline.Item>
            <div className={styles['operation-record-info']}>
              <Icon
                type={
                  iconType[
                    item.status === 2
                      ? 'PUBLISH'
                      : item.status === 1
                      ? 'NEW'
                      : item.status === 3
                      ? 'EDIT'
                      : item.status
                  ]
                }
              />
              <span className={styles['info-name']}>
                {item.creationName || ''}
                &nbsp;&nbsp;
              </span>
              <span className={styles['info-description']}>
                {item.statusMeaning}
                {intl.get('hitf.common.has').d('了')}
              </span>
              <span className={styles['info-type']}>
                【{intl.get('hitf.common.alarm').d('告警')}】
              </span>
            </div>
            <div className={styles['operation-record-date']}>{item.creationDate}</div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};
export default OperationRecord;
