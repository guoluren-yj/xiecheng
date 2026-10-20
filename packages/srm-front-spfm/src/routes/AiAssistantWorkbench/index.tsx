import React from 'react';
import { observer } from 'mobx-react';
import formatterCollections from 'utils/intl/formatterCollections';

import Banner from './components/Banner';
import AssistantCardGrid from './components/AssistantCardGrid';
import PendingTaskTable from './components/PendingTaskTable';
import StatCardGrid from './components/StatCardGird';
// import ExceptionStats from './components/ExceptionStats';
import HeadBgIcon from '../../assets/aiAssistant/head_bg.svg';
import { StoreProvider } from './stores';

import styles from './index.less';

const AiAssistantWorkbench: React.FC = (props: any) => (
  <div
    style={{ backgroundImage: `url(${HeadBgIcon})` }}
    className={styles['ai-workbench-container']}
  >
    <StoreProvider {...props}>
      <div className="ai-workbench">
        {/* Banner 区域 */}
        <Banner />
        {/* 统计卡片区 */}
        <StatCardGrid />
        {/* 智能采购助手卡片网格 */}
        <AssistantCardGrid />

        {/* 底部两栏 */}
        <div className="ai-workbench-bottom">
          <div className="ai-workbench-bottom-left">
            <PendingTaskTable />
          </div>
          {/* <div className="ai-workbench-bottom-right">
            <ExceptionStats
              total={exceptionStats.total}
              dataException={exceptionStats.dataException}
              confirming={exceptionStats.confirming}
              otherException={exceptionStats.otherException}
              onViewMore={handleViewMore}
            />
          </div> */}
        </div>
      </div>
    </StoreProvider>
  </div>
);

export default formatterCollections({
  code: ['hzero.common', 'spfm.aiAssistant'],
})(observer(AiAssistantWorkbench));
