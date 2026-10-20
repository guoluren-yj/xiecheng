/**
 * 操作记录列表
 */
import React from 'react';
import { Timeline, Icon } from 'choerodon-ui';
import { map } from 'lodash';
import classnames from 'classnames';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import intl from 'utils/intl';

//  import OperationRecordItem from './OperationRecordItem';

import styles from './index.less';

export default function OperationList(props) {
  const { goDetail, dataSource, isSupplements } = props;
  return (
    <div className={classnames(styles['common-list-wrap'], styles['operation-list-wrap'])}>
      <Timeline>
        {map(dataSource, (item) => {
          return (
            <Timeline.Item color="#E5E5E5" key={item.pcHeaderId}>
              <div className={styles['operation-record-item']}>
                <div className={styles['operation-record-item-icon']}>
                  <Icon type="publish2" />
                </div>
                <div className={styles['operation-record-item-conent']}>
                  <div className={styles['operation-record-item-conent-desc']}>
                    <span
                      style={{
                        marginRight: '8px',
                      }}
                      className={styles['operation-record-item-conent-desc-name']}
                    >
                      {item.createByRealName || item.createdName}({item.loginName})
                    </span>
                    {intl.get('spcm.common.view.message.releaseAction').d('发布了')}
                    <span
                      style={{
                        marginLeft: '8px',
                      }}
                      className={styles['operation-record-item-conent-desc-name']}
                    >
                      {item.pcName}
                    </span>
                  </div>
                  <div className={styles['operation-record-item-conent-remark']}>
                    <span className={styles['operation-record-item-conent-remark-name']}>
                      {isSupplements
                        ? intl.get(`spcm.common.model.common.supplements.version`).d('补充协议号')
                        : intl.get(`spcm.common.model.common.version`).d('版本号')}
                      &nbsp;{item.version}
                    </span>
                    <a
                      style={{
                        marginLeft: '16px',
                      }}
                      onClick={() => {
                        const myMap = new Map();
                        myMap.set('pcHeaderId', item.pcHeaderId);
                        goDetail(myMap);
                      }}
                    >
                      {intl.get('spcm.common.view.message.view.detail').d('查看详情')}
                    </a>
                  </div>
                  <span className={styles['operation-record-item-conent-time']}>
                    {item.creationDate && moment(item.creationDate).format(DEFAULT_DATETIME_FORMAT)}
                  </span>
                </div>
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
