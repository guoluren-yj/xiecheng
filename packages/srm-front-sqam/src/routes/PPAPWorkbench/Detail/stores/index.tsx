import React, { useMemo, createContext, useCallback, useEffect } from 'react';
import type { ReactElement } from 'react';
import { observer } from 'mobx-react';
import { DataSet, ModalProvider } from 'choerodon-ui/pro';
import type { ParsedUrlQuery } from 'querystring';
import { flow, isFunction } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { parse, stringify } from 'querystring';
import remote from 'hzero-front/lib/utils/remote';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import type { Record as RecordInstance } from 'choerodon-ui/dataset';

import { notifyValidErrors } from '../../../PPAPTemplate/utils/utils';
import type { Operate } from '../../utils/type';
import { DetailBtnCode, ActiveKeyDetail, DetailProjectFormCode, DetailProjectPartListCode, DetailProjectStageListCode, DetailProjectDocListCode, DetailDocumentCode, DetailDocumentAttachCode, DetailStageFormCode, DetailStageDocListCode, DetailProjectCollapse, DetailDocumentCollapse, DetailStageCollapse, flowBasicCardStageCode, flowBasicCardDocumentCode, DetailProjectDocListBatchEditCode } from '../../utils/type';
import { basicInfoDS, partLineDS, documentLineDS, documentInfoDS, stageLineDS, stageInfoDS, documentStageLineDS, checkInfoDS, permissionDS } from './indexDS';

export type StoreValueType = {
  history: any,
  customizeForm: Function,
  customizeTable: Function,
  customizeBtnGroup: Function,
  customizeCollapse: Function,
  customizeCommon: Function,
  modal: any,
  createFlag: boolean, // 新增
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
  checkInfoDs: DataSet,
  location: any,
  activeTabKey: string | undefined, // tab的默认值
  activeDocumentNum: any,
  activeStageNum: any,
  custConfig: any;
  projectType: string | undefined,
  fromId: string | undefined,
  permissionDs: DataSet,
  permissionMap: RecordInstance | undefined,
  num: any, // 如果阶段交付物从全部页签进来记录编号
  itemChangeFlag: boolean;
  remoteProps: any;
  newStageFlowFlag: boolean; // 新审批表单标识
  newDocumentFlowFlag: boolean; // 新审批表单标识
  pubEditProjectFlag: boolean; // 项目视图可编辑标识
  pubEditDocFlag: boolean; // 交付物视图可编辑标识
  pubEditStageFlag: boolean; // 阶段视图可编辑标识
}

type ParsedSearchType = ParsedUrlQuery & {
  operate: Operate,
  type?: string,
  projectType?: string,
  fromId?: string,
};

const permBtnCodePrefix = 'srm.sqam.ppap.workbench.button';

const permissionCodeMap = {
  changeBtn: `${permBtnCodePrefix}.change`,
  stageChangeBtn: `${permBtnCodePrefix}.stageChange`,
  projectChange: `${permBtnCodePrefix}.projectChange`,
  copyBtn: `${permBtnCodePrefix}.copy`,
  documentBatchEdit: `${permBtnCodePrefix}.document-batch-edit`,
};

export const Store = createContext<any>({});

// @ts-ignore
const StoreProvider = flow(
  observer,
  withCustomize({
    unitCode: [
      DetailBtnCode,
      DetailProjectFormCode,
      DetailProjectPartListCode,
      DetailProjectStageListCode,
      DetailProjectDocListCode,
      DetailProjectDocListBatchEditCode,
      DetailDocumentCode,
      DetailDocumentAttachCode,
      DetailStageFormCode,
      DetailStageDocListCode,
      DetailProjectCollapse,
      DetailDocumentCollapse,
      DetailStageCollapse,
      flowBasicCardStageCode,
      flowBasicCardDocumentCode,
    ],
  }),
  remote({
    code: 'SQAM_PPAPWORKBENCH_DETAIL_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sqam.ppap', 'sqam.common'] })
)((props) => {
  const { history, match, children, customizeForm, customizeTable, modal, location, customizeBtnGroup, customizeCollapse, custConfig, remote: remoteProps, customizeCommon, onLoad, onFormLoaded } = props;

  const { pathname } = location;
  const notPub = pathname.split('/')[1] !== 'pub';

  const { params } = match || {};
  const { search = '' } = location || {};
  const { projectHeaderId } = params;
  const { operate, type = '', num, projectType, fromId, newStageFlow, newDocumentFlow } = parse(search.substring(1)) as ParsedSearchType;
  const typeArr = type.split('-') || [];
  const createFlag = operate === 'create';
  // projectType从汇总工作台跳转过来的  typeFlag用来标记是从全部页签还是从其他页签进来的，按钮是否显示通过状态来控制，因为操作后url未变状态可能编号
  const typeFlag = typeArr[1] === 'all' || operate === 'view';
  const itemChangeFlag = operate === 'change'; // 标识交付物列表显示新增删除按钮
  const activeTabKey = typeArr[0];
  const activeDocumentNum = activeTabKey === ActiveKeyDetail.DOCUMENT ? num : undefined;
  const activeStageNum = activeTabKey === ActiveKeyDetail.STAGE ? num : undefined;
  const newStageFlowFlag = !notPub && !!newStageFlow;
  const newDocumentFlowFlag = !notPub && !!newDocumentFlow;
  const pubEditProjectFlag = !notPub && operate === 'editProject';
  const pubEditDocFlag = !notPub && operate === 'editDoc';
  const pubEditStageFlag = !notPub && operate === 'editStage';

  const partLineDs = useMemo(() => new DataSet(partLineDS(projectHeaderId)), [projectHeaderId]);
  const documentLineDs = useMemo(() => new DataSet(documentLineDS(projectHeaderId)), [projectHeaderId]);
  const stageLineDs = useMemo(() => new DataSet(stageLineDS(projectHeaderId)), [projectHeaderId]);
  const documentInfoDs = useMemo(() => new DataSet(documentInfoDS()), []);
  const stageInfoDs = useMemo(() => new DataSet(stageInfoDS()), []);
  const checkInfoDs = useMemo(() => new DataSet(checkInfoDS()), []);
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
  // 在阶段内查询交付物
  const documentStageLineDs = useMemo(() => new DataSet(documentStageLineDS()), []);
  // 交付物tab 列表
  const documentListDs = useMemo(() => new DataSet(documentLineDS(projectHeaderId)), [projectHeaderId]);
  const stageListDs = useMemo(() => new DataSet(stageLineDS(projectHeaderId)), [projectHeaderId]);

  const permissionMap = permissionDs.current;

  const onHeaderUpdate = useCallback(({ name, record }) => {
    if (name === 'companLov') {
      record.set({
        supplierCompanyLov: null,
        invOrganizationLov: null,
      });
    }
  }, []);

  const headerDs = useMemo(() => new DataSet({
    ...basicInfoDS(projectHeaderId),
    children: {
      accessItemList: partLineDs,
      accessDocumentList: documentLineDs,
      accessStagesList: stageLineDs,
    },
    events: { update: onHeaderUpdate },
  }), [projectHeaderId, partLineDs, documentLineDs, stageLineDs, onHeaderUpdate]);

  const handleToList = useCallback(() => {
    history.push({
      pathname: '/sqam/PPAPWorkbench/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleToDetail = useCallback((id: string | number, operateType: Operate) => {
    if (!id) return;
    history.push({
      pathname: `/sqam/PPAPWorkbench/detail/${id}`,
      search: stringify({ operate: operateType }),
    });
  }, [history]);

  const value: StoreValueType = useMemo(() => {
    return {
      history,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      customizeCommon,
      newStageFlowFlag,
      newDocumentFlowFlag,
      modal,
      operate,
      createFlag,
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
      checkInfoDs,
      customizeCollapse,
      custConfig,
      projectType,
      fromId,
      permissionDs,
      permissionMap,
      num,
      itemChangeFlag,
      remoteProps,
      pubEditDocFlag,
      pubEditProjectFlag,
      pubEditStageFlag,
    };
  }, [documentListDs, stageListDs, stageInfoDs, createFlag, handleToDetail, handleToList, history, customizeForm, customizeBtnGroup, customizeTable, modal, operate, partLineDs, documentLineDs, stageLineDs, documentInfoDs, headerDs, notPub, documentStageLineDs, typeFlag, location, activeTabKey, activeDocumentNum, activeStageNum, checkInfoDs, customizeCollapse, custConfig, projectType, fromId, permissionDs, permissionMap, num, itemChangeFlag, remoteProps, customizeCommon, newStageFlowFlag, newDocumentFlowFlag, pubEditDocFlag, pubEditProjectFlag, pubEditStageFlag]);

  const handleUpdate = useCallback(({ record, name }) => {
    if (name === 'partLov') {
      const partLov = record?.get('partLov');
      const { categoryId, categoryName, categoryCode } = partLov || {};
      if (categoryId) {
        record.set('categoryLov', { categoryId, categoryCode, categoryName });
      }
    }
  }, []);

  const workFlowSubmitFunc = useCallback((param) => {
    // 工作流提交的回调函数
    return new Promise(async (resolve, reject) => {
      if (param === 'Approved') {
        if (pubEditProjectFlag) {
          const validRes = await headerDs.validate();
          if (!validRes) {
            notifyValidErrors(headerDs);
            return reject();
          };
          headerDs.status = DataSetStatus.loading;
          const res = await headerDs.setState('submitType', 'save').forceSubmit();
          headerDs.status = DataSetStatus.ready;
          if (!res) return reject();
          return resolve(undefined);
        }
        if (pubEditDocFlag) {
          const validRes = await headerDs.validate();
          if (!validRes) {
            notifyValidErrors(headerDs);
            return reject();
          };
          headerDs.status = DataSetStatus.loading;
          const res = await documentInfoDs.setState('submitType', 'save').forceSubmit();
          headerDs.status = DataSetStatus.ready;
          if (!res) return reject();
          return resolve(undefined);
        }
        if (pubEditStageFlag) {
          const validRes = await headerDs.validate();
          if (!validRes) {
            notifyValidErrors(headerDs);
            return reject();
          };
          headerDs.status = DataSetStatus.loading;
          const result = await documentStageLineDs.setState('accessStagesList', stageInfoDs?.current?.toData()).setState('headerData', headerDs?.current?.toData()).setState('submitType', 'saveStage').forceSubmit();
          headerDs.status = DataSetStatus.ready;
          if (!result) return reject();
          return resolve(undefined);
        }
        return resolve(undefined);
      } else {
        const { handleWorkFlowCheck } = remoteProps?.props?.process || {}; // 二开埋点
        if (handleWorkFlowCheck) {
          return handleWorkFlowCheck({
            resolve,
            reject,
            approveResult: param,
            documentInfoDs,
            location,
          });
        };
        return resolve(undefined);
      }
    });
  }, [location, headerDs, remoteProps, documentInfoDs, pubEditProjectFlag, pubEditDocFlag, pubEditStageFlag, stageInfoDs, documentStageLineDs]);

  useEffect(() => {
    if (projectHeaderId !== 'create') {
      headerDs.query();
      partLineDs.addEventListener('update', handleUpdate);
      return () => {
        partLineDs.removeEventListener('update', handleUpdate);
      };
    } else {
      headerDs.create({});
    }
  }, [headerDs, partLineDs, handleUpdate, projectHeaderId, typeFlag, createFlag, itemChangeFlag]);

  useEffect(() => {
    if (onLoad && isFunction(onLoad)) onLoad({ submit: workFlowSubmitFunc });
  }, [onLoad, workFlowSubmitFunc]);

  useEffect(() => {
    // 注册了submit回调函数，需传onFormLoaded
    if ((pubEditDocFlag || pubEditProjectFlag || pubEditStageFlag) && onFormLoaded && headerDs.current) onFormLoaded(true);
  }, [onFormLoaded, headerDs, pubEditDocFlag, pubEditProjectFlag, pubEditStageFlag]);

  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );

}) as (props: any) => ReactElement;

export default StoreProvider;
