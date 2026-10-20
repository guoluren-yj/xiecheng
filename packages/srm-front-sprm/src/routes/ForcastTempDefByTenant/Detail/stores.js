/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 15:36:50
 * @LastEditors: yanglin
 * @LastEditTime: 2023-07-20 14:34:52
 */

import React, { createContext, useMemo, useState, useCallback, useEffect } from 'react';

import { observer } from 'mobx-react-lite';
import { getCurrentOrganizationId } from 'utils/utils';

import { ModalProvider, useDataSet } from 'choerodon-ui/pro';

import { ListDs, HeaderDs, FsListDs, ComponetSeting } from './indexDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const { children, templateHeaderId, location, history, changeFlag } = props;
  const { pathname = '' } = location;
  const [queryLoading, setQueryLoading] = useState(false);
  const organizationId = getCurrentOrganizationId();

  const listDs = useDataSet(
    () =>
      ListDs({
        templateHeaderId,
        organizationId,
        readOnly: pathname.includes('/forecast-dimension-org/read-detail/'),
      }),
    [organizationId]
  );
  const fsListDs = useDataSet(
    () =>
      FsListDs({
        templateHeaderId,
        organizationId,
        readOnly: pathname.includes('/forecast-dimension-org/read-detail/'),
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
        .then(res => {
          if (res) {
            const { fcstTemplateDimensionList, fcstTemplateLineList } = res;
            fsListDs.loadData(fcstTemplateDimensionList);
            listDs.loadData(fcstTemplateLineList);
            setQueryLoading(false);
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

  const value = useMemo(() => {
    return {
      organizationId,
      history,
      listDs,
      headerDs,
      templateHeaderId,
      fsListDs,
      lookupAgain,
      changeFlag,
      queryLoading,
      componetSetingDs,
    };
  }, [
    organizationId,
    history,
    listDs,
    headerDs,
    fsListDs,
    queryLoading,
    lookupAgain,
    changeFlag,
    componetSetingDs,
    templateHeaderId,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
