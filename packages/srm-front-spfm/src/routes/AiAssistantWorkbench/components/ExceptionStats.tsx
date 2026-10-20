import React from 'react';
import intl from 'utils/intl';

interface ExceptionStatsProps {
  total: number;
  dataException: { count: number; percentage: string };
  confirming: { count: number; percentage: string };
  otherException: { count: number; percentage: string };
  onViewMore?: () => void;
}

const ExceptionStats: React.FC<ExceptionStatsProps> = ({
  total,
  dataException,
  confirming,
  otherException,
  onViewMore,
}) => {
  // 计算环形图各段角度
  const dataExceptionAngle = parseFloat(dataException?.percentage) * 3.6;
  const pendingManualAngle = parseFloat(confirming?.percentage) * 3.6;
  // otherException 填满剩余

  const radius = 32;
  const circumference = 2 * Math.PI * radius;

  // 各段的 dash 值
  const dataExceptionDash = (dataExceptionAngle / 360) * circumference;
  const pendingManualDash = (pendingManualAngle / 360) * circumference;
  const otherExceptionDash = circumference - dataExceptionDash - pendingManualDash;

  // 各段的 offset（从顶部 -90度开始）
  const dataExceptionOffset = 0;
  const pendingManualOffset = dataExceptionDash;
  const otherExceptionOffset = dataExceptionDash + pendingManualDash;

  return (
    <div className="ai-workbench-exception-stats">
      <div className="ai-workbench-section-header">
        <h3 className="ai-workbench-section-title">
          {intl.get('spfm.aiAssistant.view.title.exceptionStats').d('异常任务统计')}
        </h3>
        <a className="ai-workbench-exception-stats-more" onClick={onViewMore}>
          {intl.get('spfm.aiAssistant.view.button.viewMore').d('查看更多')}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginLeft: 4 }}>
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.68364 7.00005L4.79614 4.11255L5.62098 3.28772L9.33331 7.00005L5.62098 10.7124L4.79614 9.88755L7.68364 7.00005Z"
              fill="#1D62F5"
            />
          </svg>
        </a>
      </div>
      <div className="ai-workbench-exception-stats-body">
        <div className="ai-workbench-exception-chart">
          <svg width="80" height="80" viewBox="0 0 80 80">
            {/* 背景环 */}
            <circle cx="40" cy="40" r={radius} fill="none" stroke="#F2F3F5" strokeWidth="8" />
            {/* 数据异常 - 红橙色 */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#ED5300"
              strokeWidth="8"
              strokeDasharray={`${dataExceptionDash} ${circumference - dataExceptionDash}`}
              strokeDashoffset={-dataExceptionOffset}
              transform="rotate(-90 40 40)"
              strokeLinecap="round"
            />
            {/* 待人工确认 - 琥珀色 */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#FFAB03"
              strokeWidth="8"
              strokeDasharray={`${pendingManualDash} ${circumference - pendingManualDash}`}
              strokeDashoffset={-pendingManualOffset}
              transform="rotate(-90 40 40)"
              strokeLinecap="round"
            />
            {/* 其他异常 - 浅灰色 */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              fill="none"
              stroke="#DADFE6"
              strokeWidth="8"
              strokeDasharray={`${otherExceptionDash} ${circumference - otherExceptionDash}`}
              strokeDashoffset={-otherExceptionOffset}
              transform="rotate(-90 40 40)"
              strokeLinecap="round"
            />
            {/* 中心数字 */}
            <text
              x="40"
              y="45"
              textAnchor="middle"
              fill="#2B2D34"
              fontSize="20"
              fontWeight="700"
              fontFamily="Plus Jakarta Sans"
            >
              {total}
            </text>
          </svg>
        </div>
        <div className="ai-workbench-exception-legend">
          <div className="ai-workbench-exception-legend-item">
            <span
              className="ai-workbench-exception-legend-dot"
              style={{ backgroundColor: '#ED5300' }}
            />
            <span className="ai-workbench-exception-legend-label">
              {intl.get('spfm.aiAssistant.exception.dataException').d('数据异常')}
            </span>
            <span className="ai-workbench-exception-legend-value">
              {dataException?.count}{' '}
              <span className="ai-workbench-exception-legend-pct">
                ({dataException?.percentage})
              </span>
            </span>
          </div>
          <div className="ai-workbench-exception-legend-item">
            <span
              className="ai-workbench-exception-legend-dot"
              style={{ backgroundColor: '#FFAB03' }}
            />
            <span className="ai-workbench-exception-legend-label">
              {intl.get('spfm.aiAssistant.exception.confirming').d('待人工确认')}
            </span>
            <span className="ai-workbench-exception-legend-value">
              {confirming?.count}{' '}
              <span className="ai-workbench-exception-legend-pct">({confirming?.percentage})</span>
            </span>
          </div>
          <div className="ai-workbench-exception-legend-item">
            <span
              className="ai-workbench-exception-legend-dot"
              style={{ backgroundColor: '#DADFE6' }}
            />
            <span className="ai-workbench-exception-legend-label">
              {intl.get('spfm.aiAssistant.exception.otherException').d('其他异常')}
            </span>
            <span className="ai-workbench-exception-legend-value">
              {otherException?.count}{' '}
              <span className="ai-workbench-exception-legend-pct">
                ({otherException?.percentage})
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExceptionStats;
