import React, { useContext, useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Spin } from 'choerodon-ui/pro';
import { TopSection } from '_components/Section';

import AFBasicCard from './CardList/AFBasicCard';
import { StoreContext } from './store/StoreProvider';

import OnlyChangePage from './OnlyChangePage';
import TotalChangePage from './TotalChangePage';

import Style from './index.less';

const Page = () => {
  const {
    commonDs: { headerDs, itemLineDs } = {},
    getHocInstance,
    getCustomizeUnitCode,
    pageLoading,
    fetchPageData,
    onLoad,
    remote,
  } = useContext(StoreContext);

  const [activeKey, setActiveKey] = useState('allChange'); // 当前显示tab页面

  useEffect(() => {
    // 使用 onLoad 函数注册 submit 回调函数
    if (typeof onLoad === 'function') {
      onLoad({
        submit: handleApproveSubmit,
      });
    }
  }, []);

  // 审批通过
  const handleApproveSubmit = (approveResult) => {
    const submitCallBack = () => {
      // submit 函数需返回一个 Promise 对象
      return new Promise((resolve) => {
        resolve();
      });
    };
    if (remote && remote.event) {
      return remote.event.fireEvent('handleRemoteApproveSubmit', {
        submitCallBack,
        approveResult,
        activeKey,
        headerDs,
        itemLineDs,
      });
    } else {
      return submitCallBack();
    }
  };

  // 切换变更仅变更tab
  const handleChangeTab = (key) => {
    setActiveKey(key);
    fetchPageData({ changeType: key });
  };

  return (
    <div className={Style['ssrc-sp-wrapper']}>
      <Spin spinning={pageLoading}>
        <TopSection
          code={getCustomizeUnitCode('headerInfoCard')}
          getHocInstance={getHocInstance}
          className={`${Style['sp-common-top-section-card']} ${Style['ssrc-source-project-approval-af-basic-card']}`}
          titleProps={{ style: { display: 'none' } }}
        >
          <AFBasicCard handleChangeTab={handleChangeTab} />
        </TopSection>
        {activeKey === 'allChange' && <TotalChangePage />}
        {activeKey === 'onlyChange' && <OnlyChangePage />}
      </Spin>
    </div>
  );
};

export default observer(Page);
