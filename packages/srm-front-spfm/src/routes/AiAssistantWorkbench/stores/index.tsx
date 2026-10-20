import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { dashboardStatsDS, assistantListDS, pendingTaskDS } from './storeDS';

const StoreContext = createContext<any>(null);

export const useStore = () => useContext(StoreContext);

export const StoreProvider: React.FC<{ children: React.ReactNode, history: any }> = ({ children, history }) => {
  const dashboardStatsDs = useMemo(() => new DataSet(dashboardStatsDS()), []);
  const assistantListDs = useMemo(() => new DataSet(assistantListDS()), []);
  const pendingTaskDs = useMemo(() => new DataSet(pendingTaskDS()), []);

  const handleToDetail = useCallback(
    (record: any) => {
      const digitalEmployeeInfoId = record.get('digitalEmployeeInfoId');
      if (!digitalEmployeeInfoId) return;
      const chatId = record.get('chatId');
      const pushRoute: any = {
        pathname: `/spfm/ai-assistant-workbench/detail/${digitalEmployeeInfoId}`
      };
      if (chatId) {
        pushRoute.search = `?chatId=${chatId}`
      }
      history.push(pushRoute);
    },
    []
  );

  const store = useMemo(
    () => ({
      dashboardStatsDs,
      assistantListDs,
      pendingTaskDs,
      handleToDetail,
    }),
    [dashboardStatsDs, assistantListDs, pendingTaskDs, handleToDetail]
  );

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
