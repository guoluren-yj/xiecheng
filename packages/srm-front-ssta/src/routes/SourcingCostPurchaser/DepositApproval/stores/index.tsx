

import { flow, isEmpty, isArray } from 'lodash'; 
import querystring from 'querystring';
import { observer } from 'mobx-react';
import React, { createContext, useMemo, useEffect, useState } from 'react';
import { ModalProvider, DataSet, Spin } from 'choerodon-ui/pro';
import type { Record as DSRecord } from 'choerodon-ui/dataset';

import type { ReactElement } from 'react';

import remote from 'utils/remote';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { filterCustomizeCodes } from '../../utils/utils';

import { permissionCodeMap } from '../../List/stores';
import permissionDS from '../../../../stores/permissionDS';
import { depositHeaderDS, payRecordDS, transferOutDS } from './storeDS';


export interface StoreValueType {
    remote: any,
    allFlag: boolean,
    pubFlag: boolean,
    loading: boolean,
    depositId: string | number,
    modalFlag: boolean,
    readOnlyFlag: boolean,
    approvePoint: string | number,
    approvePointMeaning: string,
    workflowBatch: string | number | undefined,
    permissionMap: DSRecord | undefined,
    transferOutDs: DataSet,
    payRecordDs: DataSet,
    depositHeaderDs: DataSet,
    customizeForm: Function,
    customizeTable: Function,
    customizeBtnGroup: Function,
    onLoad: Function,
    onFormLoaded: Function,
    getCustomizeUnitCode: Function,
    customizeCommon: Function,
    getHocInstance: Function,
};

export interface ParsedSearchType {
    templateCode: string | number,
    templateVersion: string | number,
    stageCode: string | number,
    pageCode: string | number,
    type?: 'all' | 'view',
    source?: string,
    approvePoint?: string,
    approvePointMeaning?: string,
    workflowBatch?: string | number,
};

export const Store = createContext<any>({});

// 设置ds参数
const setDsQueryParameter = ({ ds, params}) => {
    if (ds && isArray(ds)) {
        ds.forEach((_ds) => {
          Object.entries(params).map(([name, value]) => {
            _ds.setQueryParameter(name, value)
          })
        });
    } else if (ds) {
      Object.entries(params).map((name, value) => ds.setQueryParameter(name, value))
    }
};

  // 获取个性化编码
const getCustomizeUnitCode = (codeName) => {
if (!codeName || isEmpty(codeName)) return null;

// 个性化编码集合
const codeMap = new Map([
    ['headerBtn', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.HEADER_BTNS'], // 头按钮组
    ['headerInfo', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.AFBASIC'],// 头信息表单
    ['extraCard', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.EXTRA.BASIC'], // 基础信息表单
    // ['summary', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.HEADER_BTNS'], // 金额
    ['payRecord', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.PAY_RECORD'], // 缴费记录卡片
    ['payRecordCard', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.PAY_RECORD_CARD'], // 缴费记录
    ['transferOutRecord', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.TRANS_OUT_RECORD'], // 转出记录
    ['transferOutRecordCard', 'SSTA.DEPOSIT_APPROVAL_DETAIL_PUR.TRANS_OUT_RECORD_CARD'], // 转出记录卡片
]);
return filterCustomizeCodes(codeMap, codeName);
};

export const Page = (props) => {
    const {
        modal,
        match,
        remote,
        location,
        children,
        customizeForm,
        customizeTable,
        customizeBtnGroup,
        queryUnitConfig,
        queryTemplateConfig,
        onLoad,
        onFormLoaded,
      } = props;
      
      const modalFlag = Boolean(modal);
      const { params } = match || {};
      const { depositId } = params;
      const { search = '', pathname = '' } = location || {};
      const {        
        type,
        workflowBatch, 
        templateCode,
        templateVersion,
        stageCode,
        pageCode, 
        approvePoint,
        approvePointMeaning,
      } = querystring.parse(search.substr(1)) as unknown as ParsedSearchType;
      const [pageLoading, setPageLoading] = useState(false); // 全局loading
      const templateInfo = useMemo(() => {
        return {
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode: stageCode,
          cuszTplPageCode: pageCode,
        };
      }, [
        templateCode,
        templateVersion,
        stageCode,
        pageCode,
      ]);

      const allFlag = type === 'all';
      const pubFlag = pathname?.startsWith('/pub/');
      const readOnlyFlag = !type || type === 'view';

      const payRecordDs = useMemo<DataSet>(() => new DataSet(payRecordDS(getCustomizeUnitCode(['payRecord']))), []);
      const transferOutDs = useMemo<DataSet>(() => new DataSet(transferOutDS(getCustomizeUnitCode(['transferOutRecord']))), []);
      const depositHeaderDs = useMemo<DataSet>(() => new DataSet({
        ...depositHeaderDS(depositId, getCustomizeUnitCode(['headerInfo', 'extraCard'])),
        children: {
          payRecordDs,
          transferOutDs,
        },
      }), [payRecordDs, transferOutDs, depositId]);
      const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(permissionCodeMap)), []);
      const permissionMap = permissionDs.current;
      const loading = depositHeaderDs.status !== 'ready';
      
      const value = useMemo(() => {
        return {
            remote,
            allFlag,
            pubFlag,
            loading,
            depositId,
            modalFlag,
            readOnlyFlag,
            approvePoint,
            workflowBatch,
            permissionMap,
            transferOutDs,
            payRecordDs,
            depositHeaderDs,
            customizeForm,
            customizeTable,
            customizeBtnGroup,
            onLoad,
            templateInfo,
            onFormLoaded,
            approvePointMeaning,
            getCustomizeUnitCode,
        }
      }, [
        remote,
        allFlag,
        pubFlag,
        loading,
        depositId,
        modalFlag,
        readOnlyFlag,
        approvePoint,
        workflowBatch,
        permissionMap,
        transferOutDs,
        payRecordDs,
        depositHeaderDs,
        customizeForm,
        customizeTable,
        customizeBtnGroup,
        approvePointMeaning,
        onLoad,
        templateInfo,
        onFormLoaded,
      ])

      const initQuery =  async () => {
        setPageLoading(true);
        setDsQueryParameter({ ds: [payRecordDs, transferOutDs, depositHeaderDs], params: templateInfo});
        setDsQueryParameter({ ds: [depositHeaderDs], params: { approvePoint, workflowBatch }});
        const queryParams = new Promise((resolve) => {
        resolve({
            templateCode: templateInfo?.cuszTplTemplateCode,
            templateVersion: templateInfo?.cuszTplVersion,
        });
        });
        if (
        templateInfo?.cuszTplTemplateCode &&
        templateInfo?.cuszTplVersion &&
        templateInfo?.cuszTplStageCode &&
        templateInfo?.cuszTplPageCode
        ) {
        try {
            await queryTemplateConfig(queryParams, {
                // 阶段编码，页面编码
                stageCode: templateInfo?.cuszTplStageCode,
                pageCode: templateInfo?.cuszTplPageCode,
            });
            } catch (e) {
            setPageLoading(false);
            throw e;
            }
        } else {
        const unitCode = getCustomizeUnitCode(['headerBtn', 'headerInfo', 'extraCard', 'payRecord', 'payRecordCard', 'transferOutRecord', 'transferOutRecordCard']);
          try {
            await queryUnitConfig(undefined, undefined, unitCode);
          } catch (e) {
            setPageLoading(false);
            throw e;
          }
        };
        depositHeaderDs.query().finally(() => {
          if (onFormLoaded && typeof onFormLoaded === 'function') {
            onFormLoaded(true);
          }
          setPageLoading(false);
        });
      };

      useEffect(() => {
        initQuery();
      }, [depositId, templateInfo, templateCode, templateVersion, stageCode, pageCode]);

      if (depositId && !depositHeaderDs.current) return <Spin />;
      return (
        <Store.Provider value={{...value, ...props}}>
            <ModalProvider>{children}</ModalProvider>
        </Store.Provider>
      )
};

const StoreProvider = flow(
    observer,
    WithCustomize({
        isTemplate: true,
      }),
    remote({
        code: 'SSTA.DEPOSIT_DETAIL_PUR_CUX',
        name: 'remote',
      },{
        events: {
          onLoad: () => {},
          beforeReturnSupplier: () => true,
          handleConfirmPayCallback: () => {},
          handleReturnSupplierCallback: () => {},
        },
      }),
      formatterCollections({ code: ['ssta.sourcingCost', 'ssta.common'] }),
)(Page) as (props: any) => ReactElement;

export default StoreProvider;