import React, { useMemo } from 'react';
import { Icon } from 'choerodon-ui';
import moment from 'moment';
import { noop } from 'lodash';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { getOperationIcon, getOperationDesc, approvedList, rejectionList } from './utils';

import styles from './index.less';

const OperationRecordItem = (props) => {
  const { item, onViewDetail = noop, initTitle, fieldParam = {} } = props;
  const {
    actionCode = 'actionCode',
    actionId = 'actionId',
    actionDetail = 'actionDetail',
  } = fieldParam;

  const itemOperationDesc = useMemo(() => getOperationDesc(item, initTitle, fieldParam), [item]);

  return (
    <div className={styles['operation-record-item']} key={item[actionId]}>
      <div className={styles['operation-record-item-icon']}>
        <Icon type={getOperationIcon(item[actionCode])} />
      </div>
      <div className={styles['operation-record-item-content']}>
        <div>
          <span
            className={
              approvedList.includes(item[actionCode])
                ? styles['operation-record-item-content-success']
                : rejectionList.includes(item[actionCode])
                ? styles['operation-record-item-content-reject']
                : styles['operation-record-item-content-name']
            }
            onClick={() => onViewDetail(item)}
          >
            {itemOperationDesc?.[0]}
          </span>
          <span className={styles['operation-record-item-content-action']}>
            {itemOperationDesc?.[1]}
          </span>
          <span className={styles['operation-record-item-content-name']}>
            【{itemOperationDesc?.[2]}】
          </span>
          <span className={styles['operation-record-item-content-action']}>
            {itemOperationDesc?.[3]}
          </span>
        </div>
        {item[actionDetail] && (
          <div className={styles['operation-record-item-remark']}>{item[actionDetail]}</div>
        )}
        <div className={styles['operation-record-item-time']}>
          {item.creationDate && moment(item.creationDate).format(DEFAULT_DATETIME_FORMAT)}
        </div>
      </div>
    </div>
  );
};

export default OperationRecordItem;
