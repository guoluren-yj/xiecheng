import React, { useMemo, createContext, useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import type { ParsedUrlQuery } from 'querystring';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { parse, stringify } from 'querystring';

import type { Operate } from '../../utils/type';
import { DetailBtnCode, DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode, DetailProjectPartDetailCode, DetailDocumentCode, DetailDocumentAttachCode, DetailCollapse } from '../../utils/type';
import { basicInfoDS, partLineDS, documentLineDS, stageLineDS, documentInfoDS, checkInfoDS, partInventoryDS, permissionDS } from './indexDS';

export type StoreValueType = {
  history: any,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
  customizeCollapse: Function,
  modal: any,
  viewFlag: boolean,
  editFlag: boolean, // 编辑
  checkFlag: boolean, // 审核
  createFlag: boolean, // 新增
  pendingFlag: boolean, // 进行中
  operate: Operate, // 路由操作
  partLineDs: DataSet,
  documentLineDs: DataSet,
  stageLineDs: DataSet,
  headerDs: DataSet,
  documentInfoDs: DataSet,
  checkInfoDs: DataSet,
  partInventoryDs: DataSet,
  handleToList: Function,
  handleToDetail: Function,
  location: any,
  custConfig: any;
  permissionDs: DataSet,
}

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  type?: string,
};

export const Store = createContext<any>({});

const permBtnCodePrefix = 'srm.sqam.ppap.summary.workbench.button';

const permissionCodeMap = {
  copyBtn: `${permBtnCodePrefix}.copy`,
};

const StoreProvider = flow(withCustomize({
  unitCode: [
    DetailBtnCode,
    DetailProjectFormCode,
    DetailProjectPartListCode,
    DetailProjectStageListCode,
    DetailProjectDocListCode,
    DetailProjectPartDetailCode,
    DetailDocumentCode,
    DetailDocumentAttachCode,
    DetailCollapse,
  ],
}), formatterCollections({ code: ['sqam.ppap', 'sqam.common'] }))((props) => {
  const { history, match, children, customizeForm, customizeTable, modal, location, customizeBtnGroup, customizeCollapse, custConfig } = props;

  const { params } = match || {};
  const { search = '' } = location || {};
  const { projectHeaderId } = params;
  const { operate } = parse(search.substring(1)) as ParsedSearchType;
  const editFlag = operate === 'edit';
  const viewFlag = operate === 'view' || !operate;
  const checkFlag = operate === 'check';
  const createFlag = operate === 'create';
  const pendingFlag = operate === 'pending';

  const partLineDs = useMemo(() => new DataSet(partLineDS(projectHeaderId)), [projectHeaderId]);
  const documentLineDs = useMemo(() => new DataSet(documentLineDS(projectHeaderId)), [projectHeaderId]);
  const stageLineDs = useMemo(() => new DataSet(stageLineDS(projectHeaderId)), [projectHeaderId]);
  const documentInfoDs = useMemo(() => new DataSet(documentInfoDS()), []);
  const checkInfoDs = useMemo(() => new DataSet(checkInfoDS()), []);
  const partInventoryDs = useMemo(() => new DataSet(partInventoryDS(projectHeaderId)), [projectHeaderId]);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);

  const headerDs = useMemo(() => new DataSet({
    ...basicInfoDS(projectHeaderId),
    children: {
      accessItemList: partLineDs,
      accessDocumentList: documentLineDs,
      accessStagesList: stageLineDs,
    },
  }), [projectHeaderId, partLineDs, documentLineDs, stageLineDs]);

  const handleToList = useCallback(() => {
    history.push({
      pathname: '/sqam/PPAPWorkbenchSummary/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleToDetail = useCallback((id: string | number, operateType: Operate) => {
    if (!id) return;
    history.push({
      pathname: `/sqam/PPAPWorkbenchSummary/detail/${id}`,
      search: stringify({ operate: operateType }),
    });
  }, [history]);

  const value: StoreValueType = useMemo(() => {
    return {
      history,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      modal,
      viewFlag,
      operate,
      editFlag,
      checkFlag,
      createFlag,
      partLineDs,
      documentLineDs,
      stageLineDs,
      headerDs,
      handleToList,
      handleToDetail,
      pendingFlag,
      location,
      documentInfoDs,
      checkInfoDs,
      partInventoryDs,
      customizeCollapse,
      custConfig,
      permissionDs,
    };
  }, [createFlag, checkFlag, handleToDetail, handleToList, history, customizeForm, customizeBtnGroup, customizeTable, modal, viewFlag, editFlag, operate, partLineDs, documentLineDs, stageLineDs, headerDs, pendingFlag, location, documentInfoDs, checkInfoDs, partInventoryDs, customizeCollapse, custConfig, permissionDs]);

  const handleUpdate = useCallback(({ record, name }) => {
    if (name === 'partLov') {
      const partLov = record?.get('partLov');
      const { categoryId, categoryName, categoryCode } = partLov || {};
      if (categoryId) {
        record.set('categoryLov', { categoryId, categoryCode, categoryName });
      }
    }
  }, []);

  useEffect(() => {
    if (createFlag) {
      headerDs.create({});
    } else {
      headerDs.query();
      partLineDs.addEventListener('update', handleUpdate);
      return () => {
        partLineDs.removeEventListener('update', handleUpdate);
      };
    }
  }, [headerDs, partLineDs, handleUpdate, createFlag, editFlag, viewFlag]);

  const handleUpdateDocument = useCallback(({ record, name, value: val }) => {
    if (name === 'approveMethod' && val !== 'FUNCTION') {
      record.set({ approveType: null, roleNumLov: null });
    }
    if (name === 'approveType') {
      record.set({ roleNumLov: null });
    }
  }, []);


  useEffect(() => {
    documentLineDs.addEventListener('update', handleUpdateDocument);
    return () => {
      documentLineDs.removeEventListener('update', handleUpdateDocument);
    };
  }, [documentLineDs, handleUpdateDocument]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;
