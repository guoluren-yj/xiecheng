import type { MouseEvent } from 'react';
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { DataSet, Table, Button, Modal, Tabs } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import type { TableProps } from 'choerodon-ui/pro/lib/table/interface';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { TableQueryBarType, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import type Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import type { modalChildrenProps, ModalProps } from 'choerodon-ui/pro/lib/modal/interface';
import { observer } from 'mobx-react';
import { runInAction, toJS } from 'mobx';
import isPromise from 'is-promise';
import { isEmpty, forIn } from 'lodash';

import { getResponse, filterNullValueObject } from 'utils/utils';
import SearchBar from '@/components/SearchBarTable/SearchBar';
import type { searchBarConfigProperties } from '@/components/SearchBarTable/util/common';
import {
  queryCommonSupplier,
  addCommonSupplier,
  removeCommonSupplier,
  queryFullSupplier,
} from '@/services/supplierService';
import intl from '@/utils/intl';
import {
  stylePrefix,
  tableDSConfig,
  renderLifeCycleTag,
  PRIMARY_FIELD,
  DEFAULT_TEXT_FIELD,
  DEFAULT_VALUE_FIELD,
  DEFAULT_COMMON_SUPPLIER_PARAM,
} from './store';
import Detail from './Detail';

const { TabPane } = Tabs;

interface ISupplierLovView {
  name: string;
  remote?: any;
  pageSource?:string;
  searchCode: string;
  tableCode: string;
  subTableCode: string;
  modalProps?: ModalProps;
  tableProps?: TableProps;
  searchBarProps?: searchBarConfigProperties;
  originDataSet: DataSet;
  originRecord: Record;
  modal?: modalChildrenProps;
  dataSet: DataSet;
  textField: string | undefined;
  valueField: string | undefined;
  multiple: boolean;
  searchBarData?: { [paramName: string]: any }; // 筛选器条件值
  queryParams?: { [paramName: string]: any }; // 查询条件query参数
  queryData?: { [paramName: string]: any }; // 查询条件body参数
  beforeQuery?: () => Promise<object>; // 查询之前回调
  customizeTable: Function;
  remoteProps?:{ [paramName: string]: any };// 埋点所需参数
}

const SupplierLovView = observer((props: ISupplierLovView) => {
  const {
    name,
    remote,
    pageSource,
    remoteProps,
    searchCode,
    tableCode,
    subTableCode,
    searchBarData,
    queryParams,
    queryData,
    modalProps,
    tableProps,
    searchBarProps,
    originDataSet,
    originRecord,
    modal,
    beforeQuery,
    textField = DEFAULT_TEXT_FIELD,
    valueField = DEFAULT_VALUE_FIELD,
    multiple = false,
    dataSet: lovDataSet,
    customizeTable = () => { },
  } = props;
  const { title, onOk, onCancel, onClose, afterClose, okProps = {}, cancelProps = {} } =
    modalProps || {};
  const allSearchBarRef: any = useRef();
  const commonSearchBarRef: any = useRef();
  const beforeQueryParmas: any = useRef();
  const defaultActiveTab = remote
  ?remote.process("SRM_COMMON_SUPPLIER_LOV_DEFAULT_ACTIVE_TAB_KEY","all",{pageSource})
  :'all';
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [commonSuppliers, setCommonSupplier] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]); // 存储跨页时的全量数据
  const commonTableDs: DataSet = useMemo(
    () =>{
      const dsProps = tableDSConfig({
        originRecord,
        originDataSet,
        name,
        textField,
        valueField,
        multiple,
        searchCode,
        queryParams,
        queryData,
        key: 'common',
        tableCode,
        subTableCode,
      });
      const dsRemoteProps={
        name,
        queryData,
        queryParams,
        pageSource, 
        remoteProps,
        originRecord,
        originDataSet,
        searchCode,
        tableCode,
        subTableCode,
      };
      const remoteDsProps = remote.process("SRM_COMMON_SUPPLIER_LOV_COMMON_TABLE_DS_PROPS", dsProps, {...dsRemoteProps});
      return new DataSet(remoteDsProps);
    },
    [originDataSet, name, valueField, textField, multiple, searchCode, queryParams, queryData, tableCode, subTableCode, pageSource, remoteProps]
  );
  const allTableDs: DataSet = useMemo(
    () =>{
      const dsProps = tableDSConfig({
        originRecord,
        originDataSet,
        name,
        textField,
        valueField,
        multiple,
        searchCode,
        key: 'all',
        queryParams,
        queryData,
        commonTableDs,
        tableCode,
        subTableCode,
      });
      const dsRemoteProps={
        name,
        queryData,
        queryParams,
        pageSource, 
        remoteProps,
        originRecord,
        originDataSet,
        searchCode,
        tableCode,
        subTableCode,
      };
      const remoteDsProps = remote.process("SRM_COMMON_SUPPLIER_LOV_ALL_TABLE_DS_PROPS", dsProps, {...dsRemoteProps});
      return new DataSet(remoteDsProps );
    },
    [originDataSet, name, valueField, textField, multiple, searchCode, commonTableDs, queryParams, queryData, tableCode, subTableCode, pageSource, remoteProps]
  );
  const originLovPara = useMemo(()=>originDataSet.getField(name)?toJS(originDataSet.getField(name)!.get('lovPara', originDataSet.current)):{}, [originDataSet, name]);

  useEffect(()=>{
    handleSelectAllPage();
  }, [allTableDs.isAllPageSelection, commonTableDs.isAllPageSelection ]);

  useEffect(()=>{
    if(!isEmpty(allData)){
      const curDataSet = activeTab === 'common'?commonTableDs:allTableDs;
      const unSelectedRowKeys = curDataSet.unSelected.map(record=>record.get(valueField));
          const newSelectedData = allData.filter(data => !unSelectedRowKeys.includes(data[valueField]));
          setSelectedData(newSelectedData);
    }
  }, [allData, allTableDs.unSelected, commonTableDs.unSelected]);

  useEffect(() => {
    if (!allTableDs.getState('notFirstLoadFlag')) {
      return;
    }
    if (activeTab !== 'all'||allTableDs.isAllPageSelection) {
      return;
    }
    const newSelectedData = !allTableDs.selected.length
      ? []
      : allTableDs.selected.map(record => record.toData());
    lovDataSet.loadData(newSelectedData);
    setSelectedData(newSelectedData);
  }, [allTableDs.selected]);

  useEffect(() => {
    if(commonTableDs.isAllPageSelection){
      return;
    }
    if (activeTab === 'common') {
      const newSelectedData = !commonTableDs.selected.length
        ? []
        : commonTableDs.selected.map(record => record.toData());
      lovDataSet.loadData(newSelectedData);
      setSelectedData(newSelectedData);
    }
  }, [commonTableDs.selected]);

  // 开启跨页全选时，处理全量数据
  const handleSelectAllPage = ()=>{
    const lovDs = originDataSet?.getField(name)?.getOptions(originDataSet.current);
    if(allTableDs.isAllPageSelection||commonTableDs.isAllPageSelection){
    const curDataSet = activeTab === 'common'?commonTableDs:allTableDs;
      // 查询时带上lovPara
      let lovPara = {};
      if (originDataSet.getField(name)) {
        lovPara = toJS(originDataSet.getField(name)!.get('lovPara', originDataSet.current)) || {};
      }
      const __customParam__ = curDataSet.getQueryParameter("__customParam__")||{};
      const searchBarParams = curDataSet?.queryDataSet?.current?.toData();
      const pathParams = {...queryParams, page: 0, size: 0, customizeUnitCode: `${searchCode},${tableCode},${subTableCode}` };
      const bodyParams = {
        ...searchBarParams,
        ...lovPara,
        ...queryData,
        ...__customParam__,
      };
      const extraBodyParams=activeTab === 'common'?{
        commonSupplierFlag: 1,
        supplierDetailDTOS: commonSuppliers.map(item => {
          const supplierId = item?.selectValue?.split('|')?.[0];
          const supplierCompanyId = item?.selectValue?.split('|')?.[1];
          const companyId = item?.selectValue?.split('|')?.[2];
          return { supplierId, supplierCompanyId, companyId };
        }),
      }:{};
      if (lovDs) {
        lovDs.setAllPageSelection(true);
      }
      curDataSet.status = DataSetStatus.loading;
      queryFullSupplier({pathParams, bodyParams: {
        ...bodyParams,
        ...extraBodyParams,
      }}).then(response=>{
        const res = getResponse(response);
        if(res){
          setAllData(res.content);
        }
      }).finally(()=>{curDataSet.status = DataSetStatus.ready;});
    }else if (lovDs) {
      lovDs.setAllPageSelection(false);
      }
  };

  const handleCommonTableDsLoad = useCallback(
    ({ dataSet }: { dataSet: DataSet }) => {
      if (lovDataSet?.records?.length && dataSet?.records?.length) {
        dataSet.records.forEach(r => {
          if (
            lovDataSet.records.some(
              record =>
                record.get(PRIMARY_FIELD) && record.get(PRIMARY_FIELD) === r.get(PRIMARY_FIELD)
            )
          ) {
            dataSet.select(r);
          } else if (multiple) {
            dataSet.unSelect(r);
          }
        });
      }
    },
    [lovDataSet]
  );

  const handleCommonTableDsQuery = useCallback(() => {
    if (!commonSuppliers.length) {
      return false;
    }
  }, [commonSuppliers]);

  const handleLovDataSetUnSelect = useCallback(
    ({ dataSet, record }) => {
      // 清空所有已选
      if (!dataSet.selected?.length) {
        allTableDs.unSelectAll();
        commonTableDs.unSelectAll();
        allTableDs.clearCachedSelected();
      } else {
        // 删掉单个已选
        const primitiveValue = record.get(PRIMARY_FIELD);
        const oldCommonSelected: Record | undefined = commonTableDs.records.find(
          r => r.get(PRIMARY_FIELD) === primitiveValue
        );
        if (oldCommonSelected) {
          oldCommonSelected.isSelected = false;
        } else {
          const cachedSelected: Record | undefined = commonTableDs.cachedSelected.find(
            r => r.get(PRIMARY_FIELD) === primitiveValue
          );
          if (cachedSelected) {
            cachedSelected.isSelected = false;
            cachedSelected.isCached = false;
          }
        }
        const oldSelected: Record | undefined = allTableDs.records.find(
          r => r.get(PRIMARY_FIELD) === primitiveValue
        );
        if (oldSelected) {
          oldSelected.isSelected = false;
        } else {
          const cachedSelected: Record | undefined = allTableDs.cachedSelected.find(
            r => r.get(PRIMARY_FIELD) === primitiveValue
          );
          if (cachedSelected) {
            cachedSelected.isSelected = false;
            cachedSelected.isCached = false;
          }
        }
      }
    },
    [allTableDs]
  );

  const handleLovDataSetLoad = useCallback(({ dataSet }: { dataSet: DataSet }) => {
    if (!allTableDs.getState('notFirstLoadFlag')) {
      return;
    }
    dataSet.batchUnSelect(dataSet.selected);
    dataSet.batchSelect(dataSet.records);
  }, []);


  const fetchCommonSupplier = async (callback?: Function) => {
    const result = await queryCommonSupplier(DEFAULT_COMMON_SUPPLIER_PARAM);
    if (getResponse(result)) {
      setCommonSupplier(result);
      if (callback) {
        callback(result);
      }
    }
  };

  useEffect(() => {
    // 常用供应商
    fetchCommonSupplier();
    // 设置不分页
    lovDataSet.paging = false;
    // lov 弹窗打开时禁用原 lov 输入框查询
    lovDataSet.setState('lovQueryStatus', false);
    return () => {
      // lov 弹窗卸载时还原原 lov 输入框查询
      lovDataSet.setState('lovQueryStatus', undefined);
    };
  }, []);

  useEffect(() => {
    lovDataSet.addEventListener('unSelect', handleLovDataSetUnSelect);
    lovDataSet.addEventListener('load', handleLovDataSetLoad);
    commonTableDs.addEventListener('load', handleCommonTableDsLoad);
    commonTableDs.addEventListener('query', handleCommonTableDsQuery);
    return () => {
      lovDataSet.removeEventListener('unSelect', handleLovDataSetUnSelect);
      lovDataSet.removeEventListener('load', handleLovDataSetLoad);
      commonTableDs.removeEventListener('load', handleCommonTableDsLoad);
      commonTableDs.removeEventListener('query', handleCommonTableDsQuery);
    };
  }, [multiple, lovDataSet, commonTableDs, handleLovDataSetUnSelect, handleLovDataSetLoad, handleCommonTableDsLoad, handleCommonTableDsQuery]);

  const renderLifeCycle = useCallback(({ record }) => {
    const { stageCode, stageName, toStageCode, toStageName } = record.get([
      'stageCode',
      'stageName',
      'toStageCode',
      'toStageName',
    ]);
    if (!stageCode && !stageName && !toStageCode && !toStageName) {
      return '-';
    }
    return (
      <div style={{ width: 120 }}>
        {stageName && stageCode && renderLifeCycleTag(stageCode, stageName)}
        {toStageCode && toStageName && (
          <>
            <Icon
              type="arrow_forward"
              style={{ color: 'rgba(0,0,0,0.4)', marginRight: '0.08rem', fontSize: '14px' }}
            />
            {renderLifeCycleTag(toStageCode, toStageName)}
          </>
        )}
      </div>
    );
  }, []);

  const renderYesOrNo = useCallback(value => {
    return value === 1
      ? intl.get('hzero.common.button.yes').d('是')
      : intl.get('hzero.common.button.no').d('否');
  }, []);

  const tableCols: any[] = useMemo(
    () => [
      {
        name: 'supplierName',
        width: 200,
        renderer: ({ record }) => {
          const { supplierCompanyName = '', supplierName = '' } = record.get([
            'supplierCompanyName',
            'supplierName',
          ]);
          if (!supplierCompanyName || !supplierName) {
            return supplierCompanyName || supplierName;
          }
          return `${supplierCompanyName}|${supplierName}`;
        },
      },
      {
        name: 'supplierNum',
        width: 150,
        renderer: ({ record }) => {
          const { supplierCompanyNum = '', supplierNum = '' } = record.get([
            'supplierCompanyNum',
            'supplierNum',
          ]);
          if (!supplierCompanyNum || !supplierNum) {
            return supplierCompanyNum || supplierNum;
          } else {
            return `${supplierCompanyNum}|${supplierNum}`;
          }
        },
      },
      {
        name: 'unifiedSocialCode',
        width: 160,
      },
      {
        name: 'businessRegistrationNumber',
        width: 150,
      },
      {
        name: 'dunsCode',
        width: 120,
      },
      {
        name: "supplierCompanyNum",
        width: 150,
      },
      {
        name: "supplierCompanyName",
        width: 200,
      },
      {
        name: "localSupplierNum",
        width: 120,
        renderer: ({record})=>record?.get("supplierNum")||"-",
      },
      {
        name: "localSupplierName",
        width: 150,
        renderer: ({record})=>record?.get("supplierName")||"_",
      },
      { name: 'companyName', width: 200 },
      { name: 'companyNum', width: 120 },
      { name: 'isElectronTagMeaning', width: 100 },
      { name: 'registeredCapital', width: 140, align: 'right' },
      { name: 'name', width: 150 },
      { name: 'mobilephone', width: 150 },
      {
        name: 'authorizeFlag',
        width: 100,
        renderer: ({ record }) => renderYesOrNo(record?.get('authorizeFlag')),
      },
      {
        name: 'blacklistFlag',
        width: 100,
        renderer: ({ record }) => renderYesOrNo(record?.get('blacklistFlag')),
      },
      {
        name: 'synergyFlag',
        width: 80,
        renderer: ({ record }) => renderYesOrNo(record?.get('synergyFlag')),
      },
      { name: 'businessNature', width: 150},
      { name: 'companyTypeMeaning', width: 150},
      {
        key: 'liftCycle',
        align: 'left',
        width: 100,
        header: intl.get('srm.common.table.header.supplier.liftCycle').d('生命周期'),
        renderer: renderLifeCycle,
      },
      {name: "supplierCategoryName", width: 200},
      {
        key: 'moreInfo',
        width: 100,
        header: intl.get('srm.common.table.header.supplier.moreInfo').d('更多信息'),
        renderer: ({ record }) => (
          <a onClick={(event) => showDetailModal(event, record)}>
            {intl.get('hzero.common.button.look').d('查看')}
          </a>
        ),
      },
      {
        key: 'star',
        header: intl.get('srm.common.table.header.supplier.SetAsCommon').d('设为常用'),
        lock: 'right',
        align: 'left',
        width: 100,
        renderer: ({ record }) => {
          const { companyId, supplierId, supplierCompanyId } = record.get([
            'companyId',
            'supplierId',
            'supplierCompanyId',
          ]);
          const commonSupplierTarget = commonSuppliers.find(
            item =>
              item.selectValue ===
              `${supplierId || ''}|${supplierCompanyId || ''}|${companyId || ''}`
          );
          const starFlag: boolean = !!commonSuppliers?.length && commonSupplierTarget;
          const icon = starFlag ? 'star' : 'star_border';
          return (
            <Icon
              className="star-icon"
              type={icon}
              onClick={(event) => handleStarSupplier(event, record, starFlag, commonSupplierTarget)}
            />
          );
        },
      },
    ],
    [commonSuppliers]
  );
  const remoteTableCols = remote?remote.process("SRM_COMMON_SUPPLIER_LOV_TABLE_COLUMNS", tableCols, {pageSource}):tableCols;

  const handleCommonSearchBarRef = useCallback(ref => {
    commonSearchBarRef.current = ref;
  }, []);

  const handleAllSearchBarRef = useCallback(ref => {
    allSearchBarRef.current = ref;
  }, []);

  const handleAllSearchBarLoad = useCallback(() => {
    if (allSearchBarRef.current?.setFields && searchBarData) {
      allSearchBarRef.current.setFields(searchBarData);
    }
  }, [searchBarData]);

  const handleStarSupplier = useCallback(
    (event: MouseEvent, record: Record, star: boolean, commonSupplierTarget?: any) => {
      event.stopPropagation();
      const { companyId, supplierId, supplierCompanyId } = record.get([
        'companyId',
        'supplierId',
        'supplierCompanyId',
      ]);
      // 设为常用
      if (!star) {
        runInAction(() => {
          allTableDs.status = DataSetStatus.loading;
        });
        addCommonSupplier({
          ...DEFAULT_COMMON_SUPPLIER_PARAM,
          selectValue: `${supplierId || ''}|${supplierCompanyId || ''}|${companyId || ''}`,
        })
          .then(res => {
            if (getResponse(res)) {
              fetchCommonSupplier();
            }
          })
          .finally(() => {
            runInAction(() => {
              allTableDs.status = DataSetStatus.ready;
            });
          });
      } else {
        const { id, selectValue } = commonSupplierTarget || {};
        // 取消设为常用
        if (id && selectValue) {
          runInAction(() => {
            allTableDs.status = DataSetStatus.loading;
          });
          removeCommonSupplier({
            ...DEFAULT_COMMON_SUPPLIER_PARAM,
            id,
            selectValue,
          })
            .then(res => {
              if (getResponse(res)) {
                fetchCommonSupplier(suppliers => {
                  if (!suppliers.length) {
                    commonTableDs.loadData([]);
                  } else {
                    const supplierDetailDTOS = suppliers.map(item => {
                      return {
                        supplierId: item?.selectValue?.split('|')?.[0],
                        supplierCompanyId: item?.selectValue?.split('|')?.[1],
                        companyId: item?.selectValue?.split('|')?.[2],
                      };
                    });
                    commonTableDs.setQueryParameter('supplierDetailDTOS', supplierDetailDTOS);
                    commonTableDs.setQueryParameter('commonSupplierFlag', 1);
                    commonTableDs.query(undefined, undefined, true);
                  }
                });
              }
            })
            .finally(() => {
              runInAction(() => {
                allTableDs.status = DataSetStatus.ready;
              });
            });
        }
      }
    },
    [commonSuppliers]
  );

  const showDetailModal = useCallback((event: MouseEvent, record: Record) => {
    event.stopPropagation();
    Modal.open({
      title: intl.get('hzero.common.more.information').d('更多信息'),
      drawer: true,
      className: `${stylePrefix}-detail-modal`,
      children: <Detail supplierRecord={record} remote={remote}/>,
      cancelText: intl.get('hzero.common.model.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
      footer: (_, cancelBtn) => cancelBtn,
    });
  }, []);

  const handleSubmit = async() => {
    if (remote && remote.event) {
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑 
      const res = await remote.event.fireEvent('cuxHandleSubmit', {
        onOk,
        activeTab,
        allTableDs,
        queryData,
        queryParams,
        remoteProps,
        commonTableDs,
        beforeQueryParmas,
        handleCloseView,
      });
      if (!res) {
        return;
      }
    }
    return new Promise((resolve) => {
      if (!selectedData || !selectedData.length) {
        resolve();
        Modal.warning({
          title: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
        });
        return;
      }
      const record = originRecord || originDataSet.current;
      if (record) {
        record.set(name, multiple ? selectedData : selectedData?.[0]);
      }
      if (typeof onOk === 'function') {
        const ret = onOk();
        const cb = result => {
          resolve();
          if (result !== false) {
            handleCloseView();
          }
        };
        if (isPromise(ret)) {
          ret.then(cb);
        } else {
          cb(ret);
        }
      } else {
        resolve();
        handleCloseView();
      }
    });
  };

  const handleCancle = useCallback(() => {
    commonTableDs.loadData([]);
    allTableDs.loadData([]);
    if (onCancel && typeof onCancel === 'function') {
      const ret = onCancel();
      const cb = result => {
        if (result !== false) {
          handleCloseView();
        }
      };
      if (isPromise(ret)) {
        ret.then(cb);
      } else {
        cb(ret);
      }
    } else {
      handleCloseView();
    }
  }, []);

  const handleCloseView = useCallback(() => {
    if (modal && modal.close()) {
      if (onClose && typeof onClose === 'function') {
        const ret = onClose();
        const cb = result => {
          if (result !== false) {
            modal.close();
            handleAfterClose();
          }
        };
        if (isPromise(ret)) {
          ret.then(cb);
        } else {
          cb(ret);
        }
      } else {
        modal.close();
        handleAfterClose();
      }
    }
  }, []);

  const handleAfterClose = useCallback(() => {
    if (typeof afterClose === 'function') {
      afterClose();
    }
  }, []);

  const handleTabChange = useCallback(
    key => {
      // eslint-disable-next-line no-lonely-if
      if (key === 'common') {
        fetchCommonSupplier(suppliers => {
          if (!suppliers.length) {
            commonTableDs.loadData([]);
          } else {
            const supplierDetailDTOS = suppliers.map(item => {
              const supplierId = item?.selectValue?.split('|')?.[0];
              const supplierCompanyId = item?.selectValue?.split('|')?.[1];
              const companyId = item?.selectValue?.split('|')?.[2];
              return { supplierId, supplierCompanyId, companyId };
            });
            if (commonSearchBarRef.current) {
              commonTableDs.queryDataSet?.loadData([filterNullValueObject(commonSearchBarRef.current.getQueryParameter())]);
            }
            commonTableDs.setQueryParameter('supplierDetailDTOS', supplierDetailDTOS);
            commonTableDs.setQueryParameter('commonSupplierFlag', 1);
            commonTableDs.query(undefined, undefined, true);
          }
        });
      } else {
        // 重置
        allTableDs.setState('notFirstLoadFlag', false);
        fetchCommonSupplier();
        if (allSearchBarRef.current) {
          allTableDs.queryDataSet?.loadData([filterNullValueObject(allSearchBarRef.current.getQueryParameter())]);
        }
        allTableDs.query(undefined, undefined, true);
      }
      // 单选模式下，切换tab时清空已选和缓存的已选
      if (!multiple) {
        // setSelectedData([]);
        // commonTableDs.unSelectAll();
        allTableDs.unSelectAll();
        // commonTableDs.clearCachedSelected();
        allTableDs.clearCachedSelected();
      }
      setActiveTab(key);
    },
    [allTableDs, commonTableDs]
  );

  const handleSearch = ({ params }) => {
    const searchParams = params;
    let otherParams: object = beforeQueryParmas.current;
    const query = () => {
      if (activeTab === 'common') {
        commonTableDs.status = DataSetStatus.loading;
        if (commonSuppliers.length > 0) {
          if (commonTableDs.queryDataSet) {
            commonTableDs.queryDataSet.loadData([searchParams]);
          }
          commonTableDs.query(undefined, undefined, true);
          handleSelectAllPage();
        } else {
          // 无常用供应商，不执行查询
          runInAction(() => {
            commonTableDs.status = DataSetStatus.ready;
          });
        }
      } else {
        allTableDs.status = DataSetStatus.loading;
        if (allTableDs.queryDataSet) {
          allTableDs.queryDataSet.loadData([searchParams]);
        }
        allTableDs.query(undefined, undefined, true);
        handleSelectAllPage();
      }
    };
    if (beforeQuery && !beforeQueryParmas.current) {
      const ret = beforeQuery();
      if (isPromise(ret)) {
        ret
          .then(res => {
            otherParams = res as object;
            beforeQueryParmas.current = otherParams;
            if (!isEmpty(otherParams)) {
              allTableDs.setQueryParameter('__customParam__', filterNullValueObject(otherParams));
              commonTableDs.setQueryParameter('__customParam__', filterNullValueObject(otherParams));
            }
          })
          .finally(() => {
            query();
          });
      } else {
        query();
      }
    } else {
      query();
    }
  };

  const handleDoubleClickRow = useCallback((rowProps) => {
    const { dataSet, record } = rowProps;
    // 单选时双击选择行
    if (!multiple) {
      setSubmitLoading(true);
      dataSet.unSelectAll();
      dataSet.select(record);
      const lovRecord = originRecord || originDataSet.current;
      if (lovRecord) {
        lovRecord.set(name, record?.data);
      }
      if (typeof onOk === 'function') {
        const ret = onOk();
        const cb = result => {
          setSubmitLoading(false);
          if (result !== false) {
            handleCloseView();
          }
        };
        if (isPromise(ret)) {
          ret.then(cb);
        } else {
          cb(ret);
        }
      } else {
        setSubmitLoading(false);
        handleCloseView();
      }
    }
  }, [originRecord, originDataSet, onOk, handleCloseView]);

  // 埋点增加二开初始化
  const handleCuxInit=()=>{
    if (remote && remote.event) {
      remote.event.fireEvent('cuxInitData', {
        activeTab,
        setActiveTab,
        handleTabChange,
      });
    }
  };

  useEffect(()=>{
    handleCuxInit();
  },[]);

  // 供应商分类为树形结构
  const { fieldProps = {}, ...otherSearchBarProps } = searchBarProps || {};
  const newSearchBarProps = {
    fieldProps: {
      querySupplierCategoryIds: {
        optionsProps: {
          paging: 'server',
          childrenField: 'children',
        },
      },
      queryCompanyId: {
        disabled: Boolean(queryData?.companyId||originLovPara?.companyId),
      },
      ...fieldProps,
    },
    ...otherSearchBarProps,
  };

  return (
    <div className={stylePrefix}>
      <div className={`${stylePrefix}-left`}>
        <div className={`${stylePrefix}-left-title`}>
          {title || intl.get('srm.common.view.title.selectSupplier').d('选择供应商')}
        </div>
        <div className={`${stylePrefix}-left-tab`}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane
              key="common"
              tab={intl.get('srm.common.view.title.commonSuppliers').d('常用供应商')}
            />
            <TabPane
              key="all"
              tab={intl.get('srm.common.view.title.allSuppliers').d('全部供应商')}
            />
          </Tabs>
        </div>
        <div
          className={`${stylePrefix}-left-search-bar`}
          style={{ display: activeTab === 'common' ? 'block' : 'none' }}
        >
          <SearchBar
            onRef={handleCommonSearchBarRef}
            searchCode={searchCode}
            dataSet={[commonTableDs]}
            {...newSearchBarProps}
            onQuery={handleSearch}
            autoQuery={false}
          />
        </div>
        <div
          className={`${stylePrefix}-left-table`}
          style={{ display: activeTab === 'common' ? 'block' : 'none' }}
        >
          {customizeTable(
            {
              code: tableCode,
            },
            <Table
              customizable
              showAllPageSelectionButton
              autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 60 }}
              customizedCode={tableCode}
              onRow={(rowProps) => ({
                onDoubleClick: () => handleDoubleClickRow(rowProps),
              })}
              queryBar={TableQueryBarType.none}
              dataSet={commonTableDs}
              columns={remoteTableCols}
              {...tableProps}
            />
          )}
        </div>
        <div
          className={`${stylePrefix}-left-search-bar`}
          style={{ display: activeTab === 'all' ? 'block' : 'none' }}
        >
          <SearchBar
            onRef={handleAllSearchBarRef}
            onLoad={handleAllSearchBarLoad}
            searchCode={searchCode}
            dataSet={[allTableDs]}
            {...newSearchBarProps}
            onQuery={handleSearch}
          />
        </div>
        <div
          className={`${stylePrefix}-left-table`}
          style={{ display: activeTab === 'all' ? 'block' : 'none' }}
        >
          {customizeTable(
            {
              code: tableCode,
            },
            <Table
              customizable
              showAllPageSelectionButton
              autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 60 }}
              customizedCode={tableCode}
              onRow={(rowProps) => ({
                onDoubleClick: () => handleDoubleClickRow(rowProps),
              })}
              queryBar={TableQueryBarType.none}
              dataSet={allTableDs}
              columns={remoteTableCols}
              {...tableProps}
            />
          )}
        </div>
        <div className={`${stylePrefix}-left-footer`}>
          <Button color={ButtonColor.primary} {...okProps} onClick={handleSubmit} loading={submitLoading}>
            {intl.get('hzero.common.button.sure').d('确定')}
          </Button>
          <Button {...cancelProps} onClick={handleCancle}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default SupplierLovView;
