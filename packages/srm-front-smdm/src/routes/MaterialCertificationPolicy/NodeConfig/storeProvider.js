/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useEffect, useMemo } from 'react';
import querystring from 'querystring';
import { observer } from 'mobx-react-lite';
import remote from 'hzero-front/lib/utils/remote';
import { ModalProvider, useDataSet } from 'choerodon-ui/pro';
import { headerInfoDs, attachmentListDS } from '../stores/nodeConfigDs';

export const Store = createContext();

const StoreProvider = function StoreProvider(props) {
  const { nodeId, history, children, readOnly, remote, dispatch, location } = props;
  const params = querystring.parse(location.search.substr(1)) || {};
  const { source, version } = params;
  const { handleCuxCode = null, handleCuxReadColumns = null, handleCuxEditColumns = null } =
    remote?.props?.process || {};

  console.log(remote);

  const listDs = useDataSet(
    () =>
      attachmentListDS({
        nodeId,
        readOnly,
        handleCuxCode,
        isHistory: !!version,
      }),
    [handleCuxCode, nodeId, readOnly, version]
  );

  const formDs = useDataSet(
    () =>
      headerInfoDs({
        nodeId,
        isHistory: !!version,
      }),
    [nodeId, readOnly, version]
  );

  const header = formDs.current;

  const getDetailInfo = async () => {
    const formFlag = await formDs.validate();
    const listFlag = await listDs.validate();

    const listKey = 'itemAuthNodeAttachList';

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
    if (nodeId && nodeId !== 'new') {
      formDs.query();
      listDs.query();
    } else {
      formDs.loadData([]);
      formDs.create({});
    }
  }, [nodeId, formDs, listDs]);

  const value = useMemo(() => {
    return {
      version,
      source,
      header,
      nodeId,
      formDs,
      listDs,
      history,
      location,
      readOnly,
      dispatch,
      getDetailInfo,
      handleCuxCode,
      handleCuxEditColumns,
      handleCuxReadColumns,
    };
  }, [
    version,
    source,
    header,
    nodeId,
    formDs,
    listDs,
    history,
    location,
    readOnly,
    dispatch,
    getDetailInfo,
    handleCuxCode,
    handleCuxEditColumns,
    handleCuxReadColumns,
  ]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};

export default remote(
  {
    code: 'SMDM_MATERIAL_CA_POLICY', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      handleCuxCode: undefined,
      handleCuxReadColumns: undefined,
      handleCuxEditColumns: undefined,
    },
  }
)(observer(StoreProvider));
