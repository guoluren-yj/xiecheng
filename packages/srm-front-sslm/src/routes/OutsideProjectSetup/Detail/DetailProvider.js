/*
 * @Description: 外部寻源-Store
 * @Date: 2025-05-21 16:12:54
 * @Author: zuoxiangyu <xiangyu.zuo@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2025, Hand
 */
import qs from 'querystring';
import { compose, isArray, isEmpty } from 'lodash';
import React, { createContext, useMemo, useEffect, useState, useRef } from 'react';
import { useDataSet } from 'choerodon-ui/pro';

import remote from 'hzero-front/lib/utils/remote';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import { fetchLovData } from '@/services/commonService';
import { fetchSourceType } from '@/services/outsideProjectSetupService';
import { detailColumns } from './utils';
import { basicDS } from './stores/getBasicDS';
import { itemDS } from './stores/getItemDS';
import { quotaDS } from './stores/getQuotaDS';
import { supplierRequireDS } from './stores/getSupplierRequireDS';

// 创建 Context 对象
export const StoreContext = createContext();

/**
 * StoreProvider
 * @delivery {*} props
 * @returns
 */
const StoreProvider = props => {
  const {
    dispatch,
    children,
    location: { search },
    customizeForm,
    customizeCollapse,
    customizeBtnGroup,
    match: {
      params: { status },
    },
  } = props;

  const { tabKey, extSourceReqId } = qs.parse(search.substr(1));

  const [reqStatus, setReqStatus] = useState('NEW');
  const [loading, setLoading] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [countryId, setCountryId] = useState(null);
  const [queryFinish, setQueryFinish] = useState(false);
  // 等配置查询完成再加载页面，使页面切换更丝滑
  const [configLoading, setConfigLoading] = useState(false);

  const basicDs = useDataSet(() => basicDS({ extSourceReqId }), [extSourceReqId]);
  const itemDs = useDataSet(() => itemDS({ extSourceReqId }), [extSourceReqId]);
  const quotaDs = useDataSet(() => quotaDS({ extSourceReqId }), [extSourceReqId]);
  const supplierRequireDs = useDataSet(() => supplierRequireDS({ extSourceReqId }), [
    extSourceReqId,
  ]);

  // 可编辑状态
  const editor = useMemo(() => status !== 'read', [status]);
  const isEdit = editor && ['NEW', 'CONFIRM_EXT_REJECTED'].includes(reqStatus);
  const columns = useMemo(() => detailColumns({ reqStatus, isEdit, quotaDs }), [
    reqStatus,
    isEdit,
    quotaDs.current,
    queryFinish,
  ]);

  // 供应商响应卡片ref
  const responseRef = useRef(null);

  const lineDataSet = {
    basicInfo: basicDs,
    itemInfo: itemDs,
    quotationInfo: quotaDs,
    supplierRequired: supplierRequireDs,
  };

  useEffect(() => {
    handleQuery();
  }, [extSourceReqId]);

  useEffect(() => {
    handleConfig();
  }, []);

  useEffect(() => {
    if (quotaDs.current) {
      quotaDs.current.set('countryId', countryId);
    }
    if (supplierRequireDs.current) {
      supplierRequireDs.current.set('countryId', countryId);
    }
  }, [countryId, queryFinish, quotaDs.current, supplierRequireDs.current]);

  // 查询相关配置
  const handleConfig = () => {
    setConfigLoading(true);
    Promise.all([fetchSourceType(), fetchLovData()])
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const [sourceType, chinaCoutry] = res;
          if (chinaCoutry && isArray(chinaCoutry.content)) {
            const content = chinaCoutry.content[0] || {};
            setCountryId(content.countryId);
          }
          setShowBtn(!isEmpty(sourceType));
        }
      })
      .finally(() => {
        setConfigLoading(false);
      });
  };

  // 全量查询
  const handleQuery = () => {
    if (extSourceReqId) {
      setLoading(true);
      setQueryFinish(false);
      Promise.all([
        basicDs.query().then(res => setReqStatus(res.reqStatus)),
        quotaDs.query(),
        supplierRequireDs.query(),
        itemDs.query(itemDs.currentPage),
      ]).finally(() => {
        setLoading(false);
        setQueryFinish(true);
      });
    }
  };

  const storeValue = {
    status,
    tabKey,
    editor,
    showBtn,
    columns,
    dispatch,
    loading,
    reqStatus,
    lineDataSet,
    setLoading,
    handleQuery,
    responseRef,
    configLoading,
    extSourceReqId,
    customizeForm,
    customizeCollapse,
    customizeBtnGroup,
  };

  return <StoreContext.Provider value={storeValue}>{children}</StoreContext.Provider>;
};

/**
 * DetailProvider
 * @delivery {*} props
 * @returns
 */
export const DetailProvider = compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierInvite', 'sslm.outsideProjectSetup'],
  }),
  withCustomize({ unitCode: [] }),
  remote({ code: 'SSLM_OUTSIEDPROJECTSETUP_DETAIL' })
)(StoreProvider);
