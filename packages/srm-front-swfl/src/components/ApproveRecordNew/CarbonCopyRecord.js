import React, { Component } from 'react';
import { Popover, Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import styles from './index.less';

@formatterCollections({
  code: ['hzero.common'],
})
export default class CarbonCopyRecord extends Component {
  render() {
    const { ccList } = this.props;
    const content = (
      <div className={styles['approve-record-ccRecord']}>
        <p className={styles['approve-record-ccRecord-title']}>
          {intl.get('hzero.common.record.ccRecord').d('传阅记录')}
        </p>
        {ccList.map((item) => (
          <div className={styles['approve-record-ccRecord-content']}>
            <div className={styles.record}>
              <div className={styles['record-title']}>
                {intl.get('hzero.common.record.circulate').d('传阅')}
              </div>
              <div className={styles['record-content']}>{item.comment}</div>
            </div>
            <div className={styles.record}>
              <div className={styles['record-title']}>
                {intl.get('hzero.common.view.message.cron.date').d('日期')}
              </div>
              <div className={styles['record-content']}>{item.startTime}</div>
            </div>
            {item.appendComment && (
              <div className={styles.record}>
                <div className={styles['record-title']}>
                  {intl.get('hwfp.common.model.process.appendComment').d('传阅意见')}
                </div>
                <div className={styles['record-content']}>{item.appendComment}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
    return (
      <Popover content={content} placement="rightBottom" trigger="hover">
        <span style={{ cursor: 'pointer', height: '0.18rem' }}>
          <Icon type="person_add-o" />
        </span>
      </Popover>
    );
  }
}
