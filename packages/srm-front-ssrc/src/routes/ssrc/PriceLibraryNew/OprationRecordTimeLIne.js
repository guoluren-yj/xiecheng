import React from 'react';
import { Timeline, Divider, Icon } from 'choerodon-ui';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import styles from './index.less';

const OprationRecordTimeLIne = ({ dataSource, text }) => {
  const selectStyle = (item) => {
    let iconType;
    let timeLineColor = 'rgb(229, 229, 229)';
    let color = 'black';
    switch (item.actionCode) {
      case 'NEW':
        iconType = 'add';
        break;
      case 'APPROVE_REJECT':
      case 'DISABLE':
        iconType = 'not_interested';
        color = 'red';
        timeLineColor = 'red';
        break;
      case 'INVALID':
        iconType = 'cancel_presentation';
        break;
      case 'APPROVE_SUCCESS':
      case 'ENABLE':
        iconType = 'finished';
        color = 'green';
        timeLineColor = 'green';
        break;
      case 'RELEASE':
        iconType = 'near_me';
        break;
      default:
    }
    return [
      <Icon
        type={iconType}
        style={{ 'font-size': '14px', 'vertical-align': 'top', margin: '3px 16px 0 0' }}
      />,
      color,
      timeLineColor,
    ];
  };
  return dataSource?.length ? (
    <div className={styles.TimeLineItemStyle}>
      <Timeline style={{ 'padding-top': '6px' }}>
        {dataSource.map((item) => {
          const style = selectStyle(item);
          return (
            <Timeline.Item color={style[2]}>
              {style[0]}
              <div style={{ display: 'inline-block', width: '80%' }}>
                <p style={{ fontWeight: 700, 'margin-bottom': '0.8em' }}>
                  <span className={styles.realName}>
                    {`${item.realName}`}&nbsp;&nbsp;&nbsp;
                    <span className={styles.actionName} style={{ 'font-weight': '400' }}>
                      {`${item.actionName}`}
                    </span>
                    &nbsp;&nbsp;&nbsp; 【{text}】
                  </span>
                </p>
                <p className={styles.creationDate}>{item.creationDate}</p>
              </div>
              {dataSource.length > 1 && <Divider style={{ margin: '2px' }} />}
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  ) : (
    <p style={{ 'text-align': 'center' }}>
      {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
    </p>
  );
};

export default (dataSource, text) => {
  Modal.open({
    key: Modal.key(),
    title: intl.get('hzero.common.view.message.operateHistory').d('操作记录'),
    style: {
      width: '742px',
    },
    drawer: true,
    children: <OprationRecordTimeLIne dataSource={dataSource} text={text} />,
    footer: (_okBtn) => _okBtn,
    closable: true,
    okText: intl.get('ssrc.common.view.button.close').d('关闭'),
  });
};
