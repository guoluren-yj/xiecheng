import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import styles from './styles.less';

// 240px
export default function agmStrategyRender({ record }, strategyName) {
  const iconMap = {
    NEW: 'add',
    EXECUTED: 'add_task-o',
    EXECUTE_UPDATE: 'add_task-o',
    RESTORED: 'replay',
    EXEFAIL: 'add_task-o',
    RESFAIL: 'add_task-o',
  };
  const { operateByName, operateDate, action, actionMeaning, remark, remarkMeaning } = record.get([
    'action',
    'remark',
    'operateDate',
    'actionMeaning',
    'remarkMeaning',
    'operateByName',
  ]);
  const isSuccess = ['sagm.execute.success', 'sagm.info.execute.update.success'].includes(remark);
  const resultColor = isSuccess ? '#47b883' : '#f56649';
  const resultText = remarkMeaning || remark;
  return {
    icon: iconMap[action],
    time: operateDate,
    header: (
      <div className={styles['operate-action']}>
        {intl
          .getHTML('sagm.common.view.message.actionRecord', {
            name: operateByName,
            action: actionMeaning,
            destination: strategyName,
          })
          .d(
            <div className="operate-wrapper">
              <span className="operate-name">{operateByName}</span>
              <span className="operate-action">{actionMeaning}了</span>
              <span className="operate-text">
                【<span className="record-text">{strategyName}</span>】
              </span>
            </div>
          )}
        <div className="operate-result" hidden={!(remarkMeaning || remark)}>
          ，{intl.get('sagm.common.view.resultAs').d('结果为')}
          <span style={{ color: resultColor, fontWeight: 500, display: 'flex' }}>
            【
            {
              <Tooltip title={isSuccess ? null : resultText}>
                <span className="record-text">{resultText}</span>
              </Tooltip>
            }
            】
          </span>
        </div>
      </div>
    ),
  };
}
