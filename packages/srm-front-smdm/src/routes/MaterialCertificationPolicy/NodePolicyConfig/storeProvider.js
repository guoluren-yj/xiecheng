/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useMemo } from 'react';
import querystring from 'querystring';
import { observer } from 'mobx-react-lite';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
import { headerInfoDs, policyListDS } from '../stores/nodePolicyConfigDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const { history, children, readOnly, location, strategyHeaderId, dispatch } = props;
  const params = querystring.parse(location.search.substr(1)) || {};
  const { source, version } = params;

  const listDs = useDataSet(
    () =>
      policyListDS({
        strategyHeaderId,
        isHistory: !!version,
        multiple: !readOnly,
      }),
    [strategyHeaderId, version]
  );

  const formDs = useDataSet(
    () =>
      headerInfoDs({
        strategyHeaderId,
        isHistory: !!version,
      }),
    [strategyHeaderId, version]
  );

  const header = formDs.current;

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();
    const listFlag = await listDs.validate();

    const listKey = 'itemAuthStrLineList';

    if (formFlag && listFlag) {
      return {
        ...formDs.current?.toData(),
        [listKey]: listDs.toData(),
      };
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (strategyHeaderId && strategyHeaderId !== 'new') {
      console.log(strategyHeaderId);
      formDs.query();
      listDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({});
    }
  }, [strategyHeaderId, formDs, listDs]);

  const value = useMemo(() => {
    return {
      version,
      source,
      header,
      formDs,
      listDs,
      history,
      location,
      readOnly,
      dispatch,
      strategyHeaderId,
      getDetailInfo,
    };
  }, [
    version,
    source,
    header,
    formDs,
    listDs,
    history,
    location,
    readOnly,
    dispatch,
    strategyHeaderId,
    getDetailInfo,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default observer(StoreProvider);
