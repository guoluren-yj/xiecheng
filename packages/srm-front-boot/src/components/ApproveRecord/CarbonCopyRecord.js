import React, { Component } from 'react';
import { Popover, Icon, Text, Tag } from 'choerodon-ui';
import classnames from 'classnames';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import { dateTimeRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import ApprovalComment from '../ApprovalComment';
import styles from './index.less';

@formatterCollections({
  code: ['hzero.common'],
})
export default class CarbonCopyRecord extends Component {
  render() {
    const { ccList } = this.props;
    const content = (
      <div className={styles['approve-record-ccRecord']}>
        <p
          className={classnames(
            styles['approve-record-ccRecord-title'],
            'boot-component-approve-record-ccRecord-title'
          )}
        >
          {intl.get('hzero.common.record.ccRecord').d('传阅记录')}
        </p>
        {ccList.map((item) => (
          <div className={styles['approve-record-ccRecord-content']}>
            <div className={styles.record}>
              <div className={styles['record-title']}>
                <Text>{intl.get('hzero.common.record.circulate').d('传阅')}</Text>
              </div>
              <div className={styles['record-content']}>
                {item.abbrComment}
                {item.ccList
                  ? item.ccList.map((i, index) => (
                    <Tooltip
                      title={
                          i.readFlag === 0
                            ? intl.get('hzero.common.process.readFlagN').d('未读')
                            : intl.get('hzero.common.process.readFlagY').d('已读')
                        }
                    >
                      <span
                        className={styles['cc-record-read-tag']}
                        style={{ borderLeftColor: i.readFlag === 0 ? '#F25535' : '#3AB545' }}
                      >
                        {i.assigneeName}
                      </span>
                    </Tooltip>
                    ))
                  : null}
              </div>
            </div>
            <div className={styles.record}>
              <div className={styles['record-title']}>
                <Text>{intl.get('hzero.common.view.message.cron.date').d('日期')}</Text>
              </div>
              <div className={styles['record-content']}>{dateTimeRender(item.startTime)}</div>
            </div>
            {item.appendComment && (
              <div className={styles.record}>
                <div className={styles['record-title']}>
                  <Text>{intl.get('hwfp.common.model.process.appendComment').d('传阅意见')}</Text>
                </div>
                <div className={styles['record-content']}>
                  <ApprovalComment data={item.appendComment} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
    return (
      <Popover
        content={content}
        placement="rightBottom"
        trigger="hover"
        overlayClassName={styles['cc-record-container']}
      >
        <span style={{ cursor: 'pointer', height: '0.18rem' }}>
          <Icon type="person_add-o" />
        </span>
      </Popover>
    );
  }
}
