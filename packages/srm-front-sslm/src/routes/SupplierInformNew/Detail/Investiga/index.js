/*
 * Investiga - 调查表
 * @Date: 2023-04-18 17:11:53
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { useCallback } from 'react';
import Investigation from '@/routes/components/Investigation';

const Index = ({
  investigRef,
  isEdit,
  investgHeaderId,
  investigateTemplateId,
  changeReqId,
  setActiveKey,
  headerQueryFinished,
  supplierInformRemote,
  headerInfo: { defaultBankCompanyName, configNames = [] },
  headerInfo,
}) => {
  // 处理父级tab的activeKey
  const setParentActiveKey = useCallback(() => {
    setActiveKey('investigation');
  }, []);

  // 处理埋点
  const handleBurialPoint = () => {
    const result = {
      type: 'supplierInformNew',
      otherProps: {
        headerInfo: { ...headerInfo },
      },
    };
    return result;
  };
  // 头查询完成的情况下加载调查表，解决调查表cuxInvestgTabInit埋点，拿不到最新editable问题
  return (
    headerQueryFinished && (
      <Investigation
        fullQueryFlag
        showTag={false}
        ref={investigRef}
        editable={isEdit}
        showTabBar={false}
        configNames={configNames}
        changeReqId={changeReqId}
        investgHeaderId={investgHeaderId}
        setParentActiveKey={setParentActiveKey}
        investigateTemplateId={investigateTemplateId}
        tableStyle={{ maxHeight: 'calc(100vh - 400px)' }}
        defaultBankCompanyName={defaultBankCompanyName}
        allowDeleteAllLineFlag={false}
        investgRemote={supplierInformRemote}
        otherRemoteProps={handleBurialPoint()}
      />
    )
  );
};

export default Index;
