/*
 * @Description: file content
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-08-18 11:14:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { createContext, useMemo, useCallback, useState, useRef } from 'react';
import { ModalProvider, useDataSet, useModal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { uniqBy, isArray } from 'lodash';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import querystring from 'querystring';

import { searchDS, synthesesDS, billHeaderDS, supplierDS, matterDS } from './searchDS';

export const Store = createContext();
/**
 * @synthesesDS  --综合
 * @billHeaderDS --单据
 * @supplierDS   --供应商
 * @matterDS     --物料
 * @param {*} props
 * @returns
 */
const StoreProvider = function StoreProvider(props) {
  const { children } = props;

  const { search = '' } = window?.location;
  const {
    linkType = null,
    tab = 'bill',
    docType = null,
    searchValue = null,
    // customizeFilterFields = null,
  } = querystring.parse(search?.substr(1)) ?? {};

  const queryParams = {
    tab,
    docType,
    searchValue,
    // customizeFilterFields,
  };

  const modal = useModal();
  const timerRef = useRef();
  const searchDs = useDataSet(() => searchDS(), []);
  const synthesesDs = useDataSet(() => synthesesDS(), []);
  const billSortDs = useDataSet(() => synthesesDS(), []);

  const supplierSortDs = useDataSet(() => synthesesDS(), []);
  const matterSortDs = useDataSet(() => synthesesDS(), []);

  const billHeaderDs = useDataSet(() => billHeaderDS(), []);
  const supplierDs = useDataSet(() => supplierDS(), []);
  const matterDs = useDataSet(() => matterDS(), []);
  const searchBarRef = useRef({});
  const [isFromSSO, setIsFromSSO] = useState(linkType === 'superQuery');
  const [keyword, setKeyword] = useState('');
  const [dsQueryParams, setQueryParams] = useState({});
  const [searchCode, setSearchCode] = useState('');
  const [initFlag, setInitFlag] = useState(true);
  const searchInputRef = useRef(null);
  const modalRef = useRef('');
  const [loading, setLoading] = useState(true);
  const [billDocType, setBillDocType] = useState([]); // 单据类型
  const [supplierDocType, setSupplierDocType] = useState([]); // 供应商类型
  // 物料
  const [useMatter, setUseMatter] = useState({
    matterData: [],
    matterDocType: [],
    matterTotal: 0,
  });
  const [seeMore, setSeeMore] = useState(true); // 查看更多
  // 单据-单据类型切换状态
  const [billDocumentType, setBillDocumentType] = useState({
    switchDocument: '',
    checked: false,
  });

  // 供应商-单据类型切换状态
  const [supplierDocumentType, setSupplierDocumentType] = useState({
    switchDocument: '',
    checked: false,
  });

  const [userRequest, setUserRequest] = useState({
    billTotal: 0, // 综合单据数量
    supplierTotal: 0, // 综合供应商数量
    itemTotal: 0, // 综合物料数量
    billData: [], // 综合单据
    supplierData: [], // 综合供应商
    itemData: [], // 综合物料
  });
  // 搜索历史存储key
  const LOCAL_STORAGE_KEY = 'searchHistoryCache';
  const localCache = isArray(JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)))
    ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
    : [];

  const [{ searchActive, searchDropDownHidden, historyRecord }, setState] = useState(() => ({
    searchDropDownHidden: true,
    searchActive: false,
    historyRecord: localCache,
  }));

  // const keyword = searchDs.current?.get('keyword') || '';

  const setChecked = (state = {}, type = 'bill') => {
    if (type === 'bill') {
      setBillDocumentType((preState) => ({ ...preState, ...state }));
    } else if (type === 'supplier') {
      setSupplierDocumentType((preState) => ({ ...preState, ...state }));
    }
  };

  const handleSearch = useCallback(
    (value) => {
      const val = value?.trim();
      setKeyword(val);
      handleQuery(val);
      handleLocalStorage(val);
    },
    [handleQuery, handleLocalStorage]
  );

  const handleQuery = useCallback(
    (value) => {
      const params = {
        keyword: value,
        size: value ? 3 : 10,
      };
      synthesesDs.setQueryParameter('params', params);
      synthesesQuery();
    },
    [synthesesDs, synthesesQuery]
  );
  /**
   * 存储搜索记录
   * @param {*} value
   */
  const handleLocalStorage = useCallback((value) => {
    if (isEmpty(value)) return;
    setState((prevState) => {
      const dataList = {
        id: new Date().getTime(),
        textValue: value,
      };
      const newHistoryRecord = uniqBy([dataList, ...prevState.historyRecord], (t) => t.textValue);
      if (newHistoryRecord.length > 10) {
        newHistoryRecord.pop();
      } else {
        newHistoryRecord.unshift();
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newHistoryRecord));
      return {
        ...prevState,
        historyRecord: newHistoryRecord,
      };
    });
  }, []);
  /**
   * 搜索历史记录-查询
   */
  const handleHistoryQuery = useCallback(
    (value) => {
      searchDs.current.set('keyword', value);
      setKeyword(value);
      handleQuery(value);
      handleLocalStorage(value);
      setSeeMore(true);
    },
    [handleQuery, handleLocalStorage, setSeeMore]
  );
  /**
   * 删除历史记录
   * @param {*} e
   * @param {*} id
   */
  const handleDeleteHistory = useCallback((deleteValue) => {
    localStorage.removeItem(LOCAL_STORAGE_KEY, JSON.stringify(deleteValue));
    setState((prevState) => ({
      ...prevState,
      historyRecord: deleteValue,
    }));
  }, []);

  /**
   * 综合单据分类查询数据
   */
  const synthesesQuery = useCallback(() => {
    setLoading(true);
    synthesesDs
      .query()
      .then((res) => {
        if (getResponse(res)) {
          const { esDocResponseResultDTO, esSupplierResponseResultDTO, esItemResponseResultDTO } =
            res || {};
          const billTotal = res.esDocResponseResultDTO ? esDocResponseResultDTO.totalElements : 0;
          const supplierTotal = res.esSupplierResponseResultDTO
            ? esSupplierResponseResultDTO.totalElements
            : 0;
          const itemTotal = res.esItemResponseResultDTO ? esItemResponseResultDTO.totalElements : 0;
          const billData = res.esDocResponseResultDTO ? esDocResponseResultDTO.content : [];
          const supplierData = res.esSupplierResponseResultDTO
            ? esSupplierResponseResultDTO.content
            : [];
          const itemData = res.esItemResponseResultDTO ? esItemResponseResultDTO.content : [];
          billSortDs.loadData(billData); // 单据
          supplierSortDs.loadData(supplierData); // 供应商
          matterSortDs.loadData(itemData); // 物料
          setUserRequest({ billTotal, supplierTotal, itemTotal, billData, supplierData, itemData });
        }
      })
      .finally(() => setLoading(false));
  }, [synthesesDs, billSortDs, supplierSortDs, matterSortDs, setLoading, setUserRequest]);

  /**
   * 获取焦点事件
   */
  const handleSearchActiveChange = useCallback(
    (active) =>
      setState((prevState) => {
        const newState = {
          ...prevState,
          searchActive: active,
        };
        return newState;
      }),
    []
  );
  /**
   * Dropdown隐藏
   */
  const handleHiddenChange = useCallback((hidden) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        searchDropDownHidden: hidden,
      }));
    }, 300);
  }, []);
  /**
   * 清空查询参数
   */
  const handleClear = useCallback(
    (value) => {
      handleQuery(value);
    },
    [handleQuery]
  );
  /**
   * 切换单据弹窗详情
   * @param {*} modalObj
   * @returns
   */
  const openModal = useCallback(
    (modalObj) => {
      if (modalRef.current) {
        modalRef.current.update(modalObj);
        return;
      }
      modalRef.current = modal.open(modalObj);
    },
    [modalRef, modal]
  );

  /**
   * @handleCleanFilter
   * ref绑定筛选器
   * 调用筛选器清空方法
   */
  const handleCleanFilter = (deleteKey = false) => {
    const dsRef = searchBarRef.current;
    if (dsRef && dsRef.handleQuery) {
      dsRef.handleCleanFilter();
    }
    if (deleteKey) {
      searchDs.current.set('keyword', '');
      setKeyword('');
    }
  };

  const value = useMemo(() => {
    return {
      searchDs,
      synthesesDs,
      billSortDs,
      supplierSortDs,
      matterSortDs,
      billHeaderDs,
      supplierDs,
      matterDs,
      historyRecord,
      searchBarRef,
      searchInputRef,
      modalRef,
      loading,
      keyword,
      setKeyword,
      billDocType,
      supplierDocType,
      userRequest,
      seeMore,
      setSeeMore,
      setBillDocType,
      setSupplierDocType,
      setLoading,
      openModal,
      handleSearch,
      handleClear,
      handleLocalStorage,
      handleDeleteHistory,
      handleHistoryQuery,
      searchCode,
      setSearchCode,
      handleCleanFilter,
      billDocumentType,
      supplierDocumentType,
      setChecked,
      useMatter,
      setUseMatter,
      searchActive,
      searchDropDownHidden,
      handleSearchActiveChange,
      handleHiddenChange,
      isFromSSO,
      setIsFromSSO,
      queryParams,
      initFlag,
      setInitFlag,
      linkType,
      docType,
      dsQueryParams,
      setQueryParams,
    };
  }, [
    searchDs,
    synthesesDs,
    billSortDs,
    supplierSortDs,
    matterSortDs,
    billHeaderDs,
    supplierDs,
    matterDs,
    historyRecord,
    searchBarRef,
    searchInputRef,
    modalRef,
    loading,
    keyword,
    setKeyword,
    billDocType,
    supplierDocType,
    userRequest,
    seeMore,
    setSeeMore,
    setBillDocType,
    setSupplierDocType,
    setLoading,
    openModal,
    handleSearch,
    handleClear,
    handleLocalStorage,
    handleDeleteHistory,
    handleHistoryQuery,
    searchCode,
    setSearchCode,
    handleCleanFilter,
    billDocumentType,
    supplierDocumentType,
    setChecked,
    useMatter,
    setUseMatter,
    searchActive,
    searchDropDownHidden,
    handleSearchActiveChange,
    handleHiddenChange,
    queryParams,
    initFlag,
    setInitFlag,
    linkType,
    docType,
    dsQueryParams,
    setQueryParams,
  ]);
  return (
    <Store.Provider value={value}>
      <ModalProvider>{children}</ModalProvider>
    </Store.Provider>
  );
};
export default observer(StoreProvider);
