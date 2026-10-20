import React, { useEffect, useState } from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { getResponse } from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';

import { getAppRecord } from '@/services/applicationManageService';
import { queryRecords } from '@/services/interfaceDefinitionService';

import styles from './index.less';

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
};

const OperationRecord = (props) => {
  const { id } = props;
  const [recordArr, setRecordArr] = useState([]);

  useEffect(() => {
    if (window.location.href.includes('interface-definition/detail')) {
      // 查询接口定义详情页记录
      queryRecords(id).then((res) => {
        const result = getResponse(res);
        if (result) {
          setRecordArr(result);
        }
      });
    } else {
      // 查询审批记录
      getAppRecord(id).then((res) => {
        const result = getResponse(res);
        if (result) {
          setRecordArr(result);
        }
      });
    }
  }, []);

  // const itemColor = {
  //   NEW: '',
  //   SUBMIT: '',
  //   APPROVED: 'green',
  //   REJECTED: 'red',
  //   UPDATE: '',
  //   ENABLE: '',
  //   DISABLED: '',
  //   EDIT: '',
  //   PUBLISH: 'green',
  // };
  return (
    <div className={styles['operation-record']}>
      <Timeline>
        {recordArr.map((item) => (
          // <Timeline.Item color={itemColor[item.operate] || 'blue'}>
          <Timeline.Item>
            <div className={styles['operation-record-info']}>
              <Icon
                type={
                  iconType[
                    item.operate === 2
                      ? 'PUBLISH'
                      : item.operate === 1
                      ? 'NEW'
                      : item.operate === 3
                      ? 'EDIT'
                      : item.operate
                  ]
                }
              />
              <span className={styles['info-name']}>
                {item.creationName || ''}
                &nbsp;&nbsp;
              </span>
              <span className={styles['info-description']}>
                {window.location.href.includes('interface-definition/detail')
                  ? item.statusMeaning
                  : item.operateMeaning}
                {intl.get('hitf.common.has').d('了')}
              </span>
              <span className={styles['info-type']}>
                【
                {window.location.href.includes('interface-definition/detail')
                  ? intl.get('hitf.common.interface').d('接口')
                  : intl.get('hitf.common.application').d('应用')}
                】
              </span>
              {item.comments && (
                <>
                  <span className={styles['info-description']}>
                    ,{intl.get('hitf.common.comments').d('审批意见为')}
                  </span>
                  <span>【{item.comments}】</span>
                </>
              )}
            </div>
            <div className={styles['operation-record-date']}>{item.creationDate}</div>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );
};
export default OperationRecord;
