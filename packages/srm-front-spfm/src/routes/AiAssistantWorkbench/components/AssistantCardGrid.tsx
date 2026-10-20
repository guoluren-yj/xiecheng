import React, { useCallback } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import type { Record as DSRecord } from 'choerodon-ui/dataset';
import { math } from 'choerodon-ui/dataset';
import { useStore } from '../stores';
import orderTransferIcon from '../../../assets/aiAssistant/order-transfer.png';
import orderFollowingIcon from '../../../assets/aiAssistant/order-following.png';
import billIcon from '../../../assets/aiAssistant/bill.png';
import accountReconciliationIcon from '../../../assets/aiAssistant/account-reconciliation.png';
import supplierManagementIcon from '../../../assets/aiAssistant/supplier_management.png';
import contractIcon from '../../../assets/aiAssistant/contract.png';
import priceIcon from '../../../assets/aiAssistant/price.png';
import prAnalyzeIcon from '../../../assets/aiAssistant/pr-analyze.png';
// import StatusTag from './StatusTag';

const assistantIconMap: Record<string, string> = {
  'pr-analyze': prAnalyzeIcon,
  price: priceIcon,
  contract: contractIcon,
  'supplier-management': supplierManagementIcon,
  'account-reconciliation': accountReconciliationIcon,
  bill: billIcon,
  'order-following': orderFollowingIcon,
  'order-transfer': orderTransferIcon,
};

interface AssistantCardProps {
  record: DSRecord;
}

const AssistantCard: React.FC<AssistantCardProps> = observer(({ record }) => {
  const { handleToDetail } = useStore();

  const onClick = useCallback(() => {
    handleToDetail(record);
  }, [handleToDetail, record]);

  const {
    name,
    icon,
    description,
    pendingManualCount,
    pendingCount,
    processingCount,
  } = record.get([
    'icon',
    'name',
    'description',
    'pendingManualCount',
    'pendingCount',
    'processingCount',
  ]);

  return (
    <div className="ai-workbench-assistant-card" onClick={onClick} role="button" tabIndex={0}>
      {/* <StatusTag status={status} className="ai-workbench-assistant-card-status" /> */}
      <div className="ai-workbench-assistant-card-header">
        <div className="ai-workbench-assistant-card-icon">
          {assistantIconMap[icon] ? (
            <img src={assistantIconMap[icon]} alt={name} width={40} height={40} />
          ) : (
            <span className="ai-workbench-assistant-icon" />
          )}
        </div>
        <div className="ai-workbench-assistant-card-info">
          <div className="ai-workbench-assistant-card-name-row">
            <span className="ai-workbench-assistant-card-name">{name}</span>
          </div>
          <p className="ai-workbench-assistant-card-desc">{description}</p>
        </div>
      </div>
      <div className="ai-workbench-assistant-card-stats">
        <div className="ai-workbench-assistant-card-stat-item">
          <span className="ai-workbench-assistant-card-stat-label">
            {intl.get('spfm.aiAssistant.view.stat.confirming').d('待人工确认')}
          </span>
          <span
            className="ai-workbench-assistant-card-stat-value"
            style={math.gt(pendingManualCount, 0) ? { color: '#ED2F00' } : {}}
          >
            {pendingManualCount}
          </span>
        </div>
        <div className="ai-workbench-assistant-card-stat-item">
          <span className="ai-workbench-assistant-card-stat-label">
            {intl.get('spfm.aiAssistant.view.stat.pending').d('待处理')}
          </span>
          <span className="ai-workbench-assistant-card-stat-value">{pendingCount}</span>
        </div>
        <div className="ai-workbench-assistant-card-stat-item">
          <span className="ai-workbench-assistant-card-stat-label">
            {intl.get('spfm.aiAssistant.view.stat.processing').d('处理中')}
          </span>
          <span className="ai-workbench-assistant-card-stat-value">{processingCount}</span>
        </div>
      </div>
    </div>
  );
});

const AssistantCardGrid: React.FC = observer(() => {
  const { assistantListDs } = useStore();

  return (
    <div className="ai-workbench-section">
      <div className="ai-workbench-section-header">
        <h3 className="ai-workbench-section-title">
          {intl.get('spfm.aiAssistant.view.title.assistantList').d('智能采购助手')}
        </h3>
        <span className="ai-workbench-section-count">({assistantListDs.length})</span>
      </div>
      <div className="ai-workbench-assistant-grid">
        {assistantListDs.map((record) => (
          <AssistantCard key={record.key} record={record} />
        ))}
      </div>
    </div>
  );
});

export default AssistantCardGrid;
