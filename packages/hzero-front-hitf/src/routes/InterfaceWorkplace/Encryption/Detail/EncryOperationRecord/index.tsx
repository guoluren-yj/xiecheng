import React, { useEffect, useState } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';

import { getOperationRecord } from '@/services/InterfaceWorkplaceService';
import offlineSvg from '@/assets/offline.svg';

import styles from './index.less';

const iconType = {
  NEW: 'add', // 新建
  SUBMIT: 'near_me', // 提交
  APPROVED: 'authorize',
  REJECTED: 'authorize',
  UPDATE: 'mode_edit', // 修改
  ENABLE: 'task_alt',
  DISABLED: 'do_not_disturb_alt',
  EDIT: 'mode_edit',
  PUBLISH: 'near_me',
};

const OperationRecord = (props) => {
  const { id } = props;
  const [recordArr, setRecordArr] = useState([]);

  useEffect(() => {
    getOperationRecord(id).then((res) => {
      const result = getResponse(res);
      if (result) {
        setRecordArr(result);
      }
    });
  }, []);

  return (
    <div className={styles['operation-record']}>
      <Timeline>
        {recordArr.map((item: any) => (
          <Timeline.Item>
            <div className={styles['operation-record-info']}>
              {
                item.status === 4 ? <img src={offlineSvg} alt='' /> : (
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
                )
              }
              <span className={styles['info-name']}>
                {item.creationName || ''}
                &nbsp;&nbsp;
              </span>
              <span className={styles['info-description']}>
                {item.statusMeaning}
                {intl.get('hitf.common.has').d('了')}
              </span>
              <span className={styles['info-type']}>
                【
                {intl.get('hitf.common.encryption.configuration').d('加密配置')}
                】
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
