import React from 'react';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { useStore } from '../stores';

const StatCard: React.FC<{ record: DSRecord }> = observer(({ record }) => {
  const { value, changeValue, unit, name } = record.get(['value', 'changeValue', 'unit', 'name']);
  return (
    <div className="ai-workbench-stat-card">
      <div className="ai-workbench-stat-card-header">
        <span className="ai-workbench-stat-card-title">{name}</span>
      </div>
      <div className="ai-workbench-stat-card-body">
        <div className="ai-workbench-stat-card-value-row">
          <span className="ai-workbench-stat-card-value">{value}</span>
          {unit && <span className="ai-workbench-stat-card-unit">{unit}</span>}
        </div>
        {!isNil(changeValue) && (
          <div className="ai-workbench-stat-card-change">
            <span className="ai-workbench-stat-card-change-label">
              {intl.get('spfm.aiAssistant.view.stat.comparedToYesterday').d('较昨日')}
            </span>
            <span className="ai-workbench-stat-card-change-value" style={{ color: '#3BB346' }}>
              {math.gt(changeValue, 0) ? `+${changeValue}` : changeValue}
              {unit && <span className="ai-workbench-stat-card-change-unit">{unit}</span>}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

const StatCardGrid: React.FC = observer(() => {
  const { dashboardStatsDs } = useStore();

  return (
    <div className="ai-workbench-stat-row">
      {dashboardStatsDs.map((record) => (
        <StatCard key={record.key} record={record} />
      ))}
    </div>
  );
});

export default StatCardGrid;
