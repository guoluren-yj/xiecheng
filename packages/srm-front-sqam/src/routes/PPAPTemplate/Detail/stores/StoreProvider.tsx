import React, { useMemo, createContext, useCallback, useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { observer } from 'mobx-react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import type { ParsedUrlQuery } from 'querystring';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { parse, stringify } from 'querystring';
import { filterNullValueObject } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import { headerDS, approvalLineDS, deliverableLineDS, stageLineDS } from './indexDS';
import type { Operate } from '../../utils/type';
import { stepNameList, permissionCodeMap } from '../../utils/type';
import { notifyValidErrors } from '../../utils/utils';
import { permissionDS } from '../../../PPAPWorkbench/Detail/stores/indexDS';

export type CreateValueType = {
  history: any,
  headerDs: DataSet,
  approvalLineDs: DataSet,
  deliverableLineDs: DataSet,
  stageLineDs: DataSet,
  customizeForm: Function,
  customizeTable: Function,
  modal: any,
  viewFlag: boolean,
  defaultCurrent?: number,
  onQueryList?: Function,
}

export type StoreValueType = CreateValueType & {
  operate: Operate, // 路由操作
  templateId: string | number,
  editFlag: boolean, // 可编辑
  copyFlag: boolean,
  handleBackList: () => void; // 返回列表页
  handleToDetail: (templateId: string | number, operate: Operate, active?: string | undefined) => void, // 跳转详情页
  noBackFlag: boolean, // 如果是冲历史版本进来不要返回按钮 标志
  activeTabKey: any,
  viewVersion: any, // 查看历史版本标识
  handleTabChange: (key: any) => void,
  location: any,
  permissionMap: any,
}

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate
};

export const Store = createContext<any>({});

const StoreProvider = flow(observer, withCustomize({
  unitCode: [],
}), formatterCollections({ code: ['sqam.ppap', 'sqam.common'] }))((props) => {
  const { history, match, children, customizeForm, customizeTable, modal, templateId: protemplateId, location } = props;
  const { params } = match || {};
  const { search = '' } = location || {};
  const { templateId = protemplateId } = params;
  const { operate, notBack, active, viewVersion } = parse(search.substring(1)) as ParsedSearchType;
  const editFlag = operate === 'edit';
  const viewFlag = (operate === 'view' || !operate) && templateId;
  const copyFlag = operate === 'copy';
  const noBackFlag = !!notBack;

  const approvalLineDs = useMemo(() => new DataSet(approvalLineDS(templateId)), [templateId]);
  const deliverableLineDs = useMemo(() => new DataSet(deliverableLineDS(templateId)), [templateId]);
  const stageLineDs = useMemo(() => new DataSet(stageLineDS(templateId)), [templateId]);
  const headerDs = useMemo(() => new DataSet({
    ...headerDS(templateId, copyFlag),
    children: {
      templateApproveList: approvalLineDs,
      templateDocumentList: deliverableLineDs,
      templateStageList: stageLineDs,
    },
  }), [templateId, approvalLineDs, deliverableLineDs, stageLineDs, copyFlag]);
  const [activeTabKey, setActiveTabKey] = useState(active || 'basic');
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const permissionMap = permissionDs.current;

  const handleBackList = useCallback(() => {
    history.push({
      pathname: `/sqam/PPAPTemplate/list`,
    });
  }, [history]);

  const handleToDetail = useCallback((id, operateType, activeKey) => {
    if (!id) return;
    history.push({
      pathname: `/sqam/PPAPTemplate/detail/${id}`,
      search: stringify(filterNullValueObject({ operate: operateType, active: activeKey })),
    });
  }, [history]);

  const handleTabChange = useCallback(async (key) => {
    // 如果从交付物切换到其他先保存
    if (activeTabKey === 'deliverable') {
      const validRes = await deliverableLineDs.validate();
      if (!validRes) {
        notifyValidErrors(deliverableLineDs);
        return;
      }
      const res = await deliverableLineDs.forceSubmit();
      if (!res?.failed) {
        setActiveTabKey(key);
      }
    } else setActiveTabKey(key);
  },
    [setActiveTabKey, activeTabKey, deliverableLineDs]
  );

  const valueStore: StoreValueType = useMemo(() => {
    return {
      headerDs,
      approvalLineDs,
      history,
      customizeForm,
      customizeTable,
      modal,
      viewFlag,
      deliverableLineDs,
      stageLineDs,
      handleBackList,
      handleToDetail,
      templateId,
      operate,
      editFlag,
      copyFlag,
      noBackFlag,
      activeTabKey,
      viewVersion,
      handleTabChange,
      location,
      permissionMap,
    };
  }, [headerDs, approvalLineDs, history, customizeForm, customizeTable, modal, viewFlag, deliverableLineDs, stageLineDs, handleBackList, handleToDetail, templateId, editFlag, operate, copyFlag, noBackFlag, activeTabKey, viewVersion, handleTabChange, location, permissionMap]);

  useEffect(() => {
    if (templateId && templateId !== 'create') headerDs.query();
  }, [templateId, headerDs]);

  const handleUpdateHeader = useCallback(({ record, name, value }) => {
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ approveRoleLov: null });
    }
  }, []);

  const handleUpdateDocument = useCallback(({ record, name, value }) => {
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ approveType: null, roleNumLov: null });
    }
    if (name === 'approveType') {
      record.set({ roleNumLov: null });
    }
  }, []);

  const handleUpdateStage = useCallback(({ record, name, value }) => {
    if (name === 'closeApproveMethod' && value !== 'FUNCTION') {
      record.set({ closeApproveType: null, roleNumLov: null });
    }
    if (name === 'closeApproveType') {
      record.set({ roleNumLov: null });
    }
    if (name === 'noDocumentStageFlag') {
      record.set({ documentLov: null });
    }
  }, []);

  useEffect(() => {
    deliverableLineDs.addEventListener('update', handleUpdateDocument);
    approvalLineDs.addEventListener('update', handleUpdateHeader);
    stageLineDs.addEventListener('update', handleUpdateStage);
    return () => {
      approvalLineDs.removeEventListener('update', handleUpdateHeader);
      deliverableLineDs.removeEventListener('update', handleUpdateDocument);
      stageLineDs.removeEventListener('update', handleUpdateStage);
    };
  }, [deliverableLineDs, approvalLineDs, stageLineDs, handleUpdateHeader, handleUpdateDocument, handleUpdateStage]);

  return (
    <Store.Provider value={valueStore}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export const DetailStore = StoreProvider;

const CreateStoreProvider = flow(observer, formatterCollections({ code: ['sqam.ppap', 'sqam.common'] }))((props) => {
  const { history, children, customizeForm, customizeTable, modal, templateId: protemplateId, onQueryList, step } = props;

  const headerDs = useMemo(() => new DataSet(headerDS(protemplateId, false)), [protemplateId]);

  const { templateId = protemplateId } = headerDs.current?.get(['templateId']) || {};

  const approvalLineDs = useMemo(() => new DataSet(approvalLineDS(templateId)), [templateId]);
  const deliverableLineDs = useMemo(() => new DataSet(deliverableLineDS(templateId)), [templateId]);
  const stageLineDs = useMemo(() => new DataSet(stageLineDS(templateId)), [templateId]);

  const defaultIndex = stepNameList.findIndex((item) => item === step);
  const defaultCurrent = defaultIndex > -1 ? defaultIndex : 0;
  const viewFlag = false;

  const valueStore: CreateValueType = useMemo(() => {
    return {
      headerDs,
      approvalLineDs,
      history,
      customizeForm,
      customizeTable,
      defaultCurrent,
      modal,
      viewFlag,
      deliverableLineDs,
      stageLineDs,
      onQueryList,
    };
  }, [headerDs, approvalLineDs, history, customizeForm, customizeTable, defaultCurrent, modal, viewFlag, deliverableLineDs, stageLineDs, onQueryList]);

  const handleUpdateHeader = useCallback(({ record, name, value }) => {
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ approveRoleLov: null });
    }
  }, []);

  const handleUpdateDocument = useCallback(({ record, name, value }) => {
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ approveType: null, roleNumLov: null });
    }
    if (name === 'approveType') {
      record.set({ roleNumLov: null });
    }
  }, []);

  const handleUpdateStage = useCallback(({ record, name, value }) => {
    if (name === 'approveMethod' && value !== 'FUNCTION') {
      record.set({ closeApproveType: null, roleNumLov: null });
    }
  }, []);

  useEffect(() => {
    if (protemplateId) {
      headerDs.query();
    }
  }, [protemplateId, headerDs]);

  useEffect(() => {
    deliverableLineDs.addEventListener('update', handleUpdateDocument);
    approvalLineDs.addEventListener('update', handleUpdateHeader);
    stageLineDs.addEventListener('update', handleUpdateStage);
    return () => {
      approvalLineDs.removeEventListener('update', handleUpdateHeader);
      deliverableLineDs.removeEventListener('update', handleUpdateDocument);
      stageLineDs.removeEventListener('update', handleUpdateStage);
    };
  }, [deliverableLineDs, approvalLineDs, stageLineDs, handleUpdateHeader, handleUpdateDocument, handleUpdateStage]);

  return (
    <Store.Provider value={valueStore}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
}) as (props: any) => ReactElement;

export const CreateStore = CreateStoreProvider;
