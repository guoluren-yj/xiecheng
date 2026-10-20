import React, { useMemo, createContext, useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import type { ParsedUrlQuery } from 'querystring';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { parse, stringify } from 'querystring';
import remote from 'hzero-front/lib/utils/remote';

import type { Operate } from '../../utils/type';
import { DetailBtnCode, ActiveKeyDetail, DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode, DetailDocumentCode, DetailDocumentAttachCode, DetailStageFormCode, DetailStageDocListCode, DetailProjectCollapse, DetailDocumentCollapse, DetailStageCollapse } from '../../utils/type';
import { basicInfoDS, partLineDS, documentLineDS, documentInfoDS, stageLineDS, stageInfoDS, documentStageLineDS, permissionDS, checkInfoDS } from './indexDS';

export type StoreValueType = {
  history: any,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
  customizeCollapse: Function,
  modal: any,
  typeFlag: boolean, // 是否是从全部点单号进到详情
  operate: Operate, // 路由操作
  partLineDs: DataSet,
  documentLineDs: DataSet,
  stageLineDs: DataSet,
  documentInfoDs: DataSet,
  headerDs: DataSet,
  handleToList: Function,
  handleToDetail: Function,
  stageInfoDs: DataSet,
  documentListDs: DataSet,
  stageListDs: DataSet,
  notPub: boolean,
  documentStageLineDs: DataSet,
  location: any,
  activeTabKey: string | undefined, // tab的默认值
  activeDocumentNum: any,
  activeStageNum: any,
  custConfig: any,
  projectType: string | undefined,
  fromId: string | undefined,
  num: any, // 如果阶段交付物从全部页签进来记录编号
  permissionDs: DataSet,
  checkInfoDs: DataSet,
  remoteProps: any,
}

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  type?: string,
  projectType?: string,
  fromId?: string,
};

const permBtnCodePrefix = 'srm.sqam.ppap.supworkbench.button';

const permissionCodeMap = {
  docChangeBtn: `${permBtnCodePrefix}.documentChange`,
};

export const Store = createContext<any>({});

const StoreProvider = flow(withCustomize({
  unitCode: [
    DetailBtnCode,
    DetailProjectFormCode,
    DetailProjectPartListCode,
    DetailProjectStageListCode,
    DetailProjectDocListCode,
    DetailDocumentCode,
    DetailDocumentAttachCode,
    DetailStageFormCode,
    DetailStageDocListCode,
    DetailProjectCollapse,
    DetailDocumentCollapse,
    DetailStageCollapse,
  ],
}), remote({
  code: 'SQAM_PPAPWORKBENCH_SUP_DETAIL_CUX',
  name: 'remote',
}), formatterCollections({ code: ['sqam.ppap', 'sqam.common'] }))((props) => {
  const { history, match, children, customizeForm, customizeTable, modal, location, customizeBtnGroup, customizeCollapse, custConfig, remote: remoteProps } = props;

  const { pathname } = location;
  const notPub = pathname.split('/')[1] !== 'pub';

  const { params } = match || {};
  const { search = '' } = location || {};
  const { projectHeaderId } = params;
  const { operate, type = '', num, projectType, fromId } = parse(search.substring(1)) as ParsedSearchType;
  const typeArr = type.split('-') || [];
  const typeFlag = typeArr[1] === 'all' || operate === 'view';
  const activeTabKey = typeArr[0];
  const activeDocumentNum = activeTabKey === ActiveKeyDetail.DOCUMENT ? num : undefined;
  const activeStageNum = activeTabKey === ActiveKeyDetail.STAGE ? num : undefined;

  const partLineDs = useMemo(() => new DataSet(partLineDS(projectHeaderId)), [projectHeaderId]);
  const documentLineDs = useMemo(() => new DataSet(documentLineDS(projectHeaderId)), [projectHeaderId]);
  const stageLineDs = useMemo(() => new DataSet(stageLineDS(projectHeaderId)), [projectHeaderId]);
  const documentInfoDs = useMemo(() => new DataSet(documentInfoDS()), []);
  const stageInfoDs = useMemo(() => new DataSet(stageInfoDS()), []);
  // 在阶段内查询交付物
  const documentStageLineDs = useMemo(() => new DataSet(documentStageLineDS()), []);
  // 交付物tab 列表
  const documentListDs = useMemo(() => new DataSet(documentLineDS(projectHeaderId)), [projectHeaderId]);
  const stageListDs = useMemo(() => new DataSet(stageLineDS(projectHeaderId)), [projectHeaderId]);

  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  const checkInfoDs = useMemo(() => new DataSet(checkInfoDS()), []);

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
      pathname: '/sqam/PPAPWorkbenchSup/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleToDetail = useCallback((id: string | number, operateType: Operate) => {
    if (!id) return;
    history.push({
      pathname: `/sqam/PPAPWorkbenchSup/detail/${id}`,
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
      operate,
      partLineDs,
      documentLineDs,
      stageLineDs,
      documentInfoDs,
      headerDs,
      handleToList,
      handleToDetail,
      stageInfoDs,
      stageListDs,
      documentListDs,
      notPub,
      documentStageLineDs,
      typeFlag,
      location,
      activeTabKey,
      activeDocumentNum,
      activeStageNum,
      customizeCollapse,
      custConfig,
      projectType,
      fromId,
      num,
      remoteProps,
      permissionDs,
      checkInfoDs,
    };
  }, [documentListDs, stageListDs, stageInfoDs, handleToDetail, handleToList, history, customizeForm, customizeBtnGroup, customizeTable, modal, operate, partLineDs, documentLineDs, stageLineDs, documentInfoDs, headerDs, notPub, documentStageLineDs, typeFlag, location, activeTabKey, activeDocumentNum, activeStageNum, customizeCollapse, custConfig, projectType, fromId, num, remoteProps, permissionDs, checkInfoDs]);

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
    headerDs.query();
    partLineDs.addEventListener('update', handleUpdate);
    return () => {
      partLineDs.removeEventListener('update', handleUpdate);
    };
  }, [headerDs, partLineDs, handleUpdate]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;
