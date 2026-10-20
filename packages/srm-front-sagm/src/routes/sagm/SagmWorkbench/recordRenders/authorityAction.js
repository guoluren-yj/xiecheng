import React from 'react';
import intl from 'utils/intl';
import OverflowTip from '@/components/OverflowTip';
import styles from './styles.less';

// 240px
export default function authorityRender({ record }, authName) {
  const iconMap = {
    NEW: 'add',
    PUBLISHED: 'publish2',
    UPGRADE: 'arrow_circle_up-o',
    ENABLED: 'finished',
    DISABLED: 'not_interested',
  };
  const colorMap = {
    ENABLED: '#3AB344',
    DISABLED: '#F05434',
  };
  const { operateByName, operateDate, action, actionMeaning, remark, remarkMeaning } = record.get([
    'action',
    'remark',
    'operateDate',
    'actionMeaning',
    'remarkMeaning',
    'operateByName',
  ]);
  // EXECUTING
  const actionText =
    action === 'EXECUTING' ? intl.get('hzero.common.release').d('发布') : actionMeaning;
  const resultColor =
    action === 'EXECUTING' ? '#fca400' : remark === 'sagm.execute.success' ? '#47b883' : '#f56649';
  const resultText = action === 'EXECUTING' ? actionMeaning : remarkMeaning || remark;
  return {
    icon: iconMap[action],
    time: operateDate,
    color: colorMap[action] || (remark && remark?.includes('.fail') ? '#F05434' : ''),
    header: (
      <div className={styles['operate-action']}>
        {intl
          .getHTML('sagm.common.view.message.actionRecord', {
            name: operateByName,
            action: actionText,
            destination: authName,
          })
          .d(
            <div className="operate-wrapper">
              <span className="operate-name">{operateByName}</span>
              <span className="operate-action">{actionText}</span>
              <span className="operate-text">
                【<span className="record-text">{authName}</span>】
              </span>
            </div>
          )}
        <div className="operate-result" hidden={!resultText}>
          ，{intl.get('sagm.common.view.resultAs').d('结果为')}
          <span style={{ color: resultColor, fontWeight: 500, display: 'flex' }}>
            【<OverflowTip className="record-text">{resultText}</OverflowTip>】
          </span>
        </div>
      </div>
    ),
  };
}
