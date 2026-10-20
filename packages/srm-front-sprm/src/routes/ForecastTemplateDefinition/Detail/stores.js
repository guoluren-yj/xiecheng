/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 15:36:50
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-15 11:42:38
 */

import React, { createContext, useMemo, useCallback, useState, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';

import { ModalProvider, useDataSet } from 'choerodon-ui/pro';

import { ListDs, HeaderDs, FsListDs, ComponetSeting } from './indexDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const { children, templateHeaderId, history } = props;
  const [queryLoading, setQueryLoading] = useState(false);

  const organizationId = getCurrentOrganizationId();

  const listDs = useDataSet(
    () =>
      ListDs({
        templateHeaderId,
        organizationId,
      }),
    [organizationId, templateHeaderId]
  );
  const fsListDs = useDataSet(
    () =>
      FsListDs({
        templateHeaderId,
        organizationId,
      }),
    [organizationId]
  );

  const headerDs = useDataSet(
    () =>
      HeaderDs({
        organizationId,
        templateHeaderId,
        listDs,
      }),
    [templateHeaderId, organizationId, listDs]
  );

  const componetSetingDs = useDataSet(
    () =>
      ComponetSeting({
        organizationId,
        templateHeaderId,
        listDs,
      }),
    []
  );

  const lookupAgain = useCallback(async () => {
    if (templateHeaderId) {
      setQueryLoading(true);
      headerDs
        .query()
        .then((res) => {
          if (res) {
            setQueryLoading(false);
            const { fcstTemplateDimensionList, fcstTemplateLineList } = res;
            fsListDs.loadData(fcstTemplateDimensionList);
            listDs.loadData(fcstTemplateLineList);
          }
        })
        .finally(() => {
          setQueryLoading(false);
        });
    }
  }, [templateHeaderId, headerDs, fsListDs, listDs]);

  useEffect(() => {
    lookupAgain();
  }, [templateHeaderId]);

  // 当前行信息
  // const header = headerDs.current;

  const value = useMemo(() => {
    return {
      organizationId,
      history,
      listDs,
      headerDs,
      templateHeaderId,
      fsListDs,
      lookupAgain,
      queryLoading,
      componetSetingDs,
    };
  }, [
    organizationId,
    history,
    listDs,
    headerDs,
    fsListDs,
    lookupAgain,
    componetSetingDs,
    queryLoading,
    templateHeaderId,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
