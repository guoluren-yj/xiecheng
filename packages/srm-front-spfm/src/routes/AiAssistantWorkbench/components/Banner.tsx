import React from 'react';
import intl from 'utils/intl';
import avatar from '../../../assets/aiAssistant/avatar.png';

const Banner: React.FC = () => {
  return (
    <div className="ai-workbench-banner">
      <div className="ai-workbench-banner-content">
        <div className="ai-workbench-banner-left">
          <div className="ai-workbench-banner-icon">
            <img src={avatar} alt="" width={48} height={48} />
          </div>
          <div className="ai-workbench-banner-text">
            <h2 className="ai-workbench-banner-title">
              {intl.get('spfm.aiAssistant.view.title.workbench').d('智能采购助手工作台')}
            </h2>
            <p className="ai-workbench-banner-desc">
              {intl
                .get('spfm.aiAssistant.view.title.workbenchDesc')
                .d('多维度监控数字员工运行状态，智能协同，高效执行')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
