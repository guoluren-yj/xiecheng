import type { ReactNode } from 'react';
import React, { useMemo, useEffect, useCallback, useRef } from 'react';
import { Lov } from 'choerodon-ui/pro';
import type { LovProps } from 'choerodon-ui/pro/lib/lov/Lov';
import { TriggerViewMode } from 'choerodon-ui/pro/lib/trigger-field/enum';
import { toJS } from 'mobx';

import remotes from 'hzero-front/lib/utils/remote';
import { getCurrentOrganizationId, isPromise } from 'utils/utils';
import { SRM_SSLM } from '@/utils/config';
import formatterCollections from '@/utils/intl/formatterCollections';
import intl from '@/utils/intl';
import { lovDefineAxiosConfig } from '@/utils/c7nUiConfig';
import type { searchBarConfigProperties } from '@/components/SearchBarTable/util/common';
import { DEFAULT_SEARCH_BAR_CODE, DEFAULT_TABLE_CODE, DEFAULT_SUB_TABLE_CODE } from './store';
import LovView from './LovView';
import './index.less';

interface SupplierLovProps extends LovProps {
  remote?: any;
  pageSource?:string; // 页面来源
  searchCode?: string; // 筛选器单元编码
  tableCode?: string; // 表格单元编码
  subTableCode?: string; // 从表格单元编码
  searchBarProps?: searchBarConfigProperties; // 筛选器配置
  searchBarData?: { [paramName: string]: any }; // 筛选器条件值
  queryParams?: { [paramName: string]: any }; // 查询条件query参数
  queryData?: { [paramName: string]: any }; // 查询条件body参数
  beforeQuery?: () => Promise<object>; // 查询之前回调
  c7nCutomizeUtils: any;
  remoteProps?: { [paramName: string]: any }; // 埋点所需参数
}

const SupplierLov = (props: SupplierLovProps) => {
  const {
    pageSource,
    remoteProps,
    searchBarProps,
    searchCode = DEFAULT_SEARCH_BAR_CODE,
    tableCode = DEFAULT_TABLE_CODE,
    subTableCode = DEFAULT_SUB_TABLE_CODE,
    modalProps,
    searchBarData,
    queryParams,
    queryData,
    beforeQuery,
    c7nCutomizeUtils,
    ...rest
  } = props;
  const { dataSet, name, record, tableProps, remote } = rest;

  const beforeQueryParmasRef: any = useRef();

  const LovViewComp = useMemo(() => {
    if (!c7nCutomizeUtils) {
      return null;
    }
    return c7nCutomizeUtils.withCustomize({
      unitCode: ['SRM.COMMON.SUPPLIER_SELECT.TABLE'],
    })(LovView);
  }, [c7nCutomizeUtils]);

  const handleBeforeQuery = useCallback(() => {
    if (beforeQuery && !beforeQueryParmasRef.current) {
      beforeQueryParmasRef.current = beforeQuery();
      if (isPromise(beforeQueryParmasRef.current)) {
        beforeQueryParmasRef.current.then(ret => {
          beforeQueryParmasRef.current = ret;
        });
      }
    }
  }, [beforeQuery]);

  const initDataSetField = useCallback(async () => {
    await handleBeforeQuery();
    let field;
    if (record) {
      field = record.getField(name);
    } else if (dataSet) {
      field = dataSet.getField(name);
    }
    // 禁用原值集视图查询api
    if (field) {
      let textField = field.get('textField');
      // 默认是 meaning，等于 meaning 说明未设置 textField，此时应取 supplierName
      if (textField === 'meaning') {
        textField = 'supplierName';
      }
      // 覆盖lovCode,使用固定的lovCode,防止受个性化更改值集编码影响
      field.set('lovCode', 'SSLM.SUPPLIER');
      field.set('lovDefineAxiosConfig', (params) => {
        return lovDefineAxiosConfig(params);
      });
      field.set('optionsProps', {
        autoQuery: false,
        events: {
          query: ({ dataSet: options }) => {
            // 此处增加判断，防止 lov 弹窗打开时触发输入框的查询
            return options.getState('lovQueryStatus') !== false;
          },
        },
        transport: {
          read: ({ data, params }) => {
            if (data) {
              data.querySupplier = data[textField] || data.supplierName;
              delete data[textField];
              delete data.supplierName;
            }
            // 查询时带上lovPara
            let lovPara = {};
            if (dataSet && dataSet.getField(name)) {
              lovPara = toJS(dataSet.getField(name)!.get('lovPara', dataSet.current)) || {};
            }
            return {
              url: `${SRM_SSLM}/v1/${getCurrentOrganizationId()}/supplier-basics/find`,
              method: 'POST',
              data: {
                ...data,
                ...lovPara,
                ...(queryData || {}),
                ...(beforeQueryParmasRef.current || {}),
              },
              params: {
                ...(queryParams || {}),
                ...params,
                customizeUnitCode: `${searchCode},${tableCode},${subTableCode}`,
              },
            };
          },
        },
      });
    }
  }, [record, dataSet, name, beforeQuery, queryData, queryParams, searchCode, tableCode, subTableCode]);

  useEffect(() => {
    initDataSetField();
  }, [initDataSetField]);

  const viewRenderer = (viewRendererProps): ReactNode => {
    const { dataSet: lovDataSet } = viewRendererProps;
    // viewRenderer 在 lov query 之前，此处设置标识用于禁用lov自带的查询
    lovDataSet.setState('lovQueryStatus', false);
    const lovViewProps = {
      name,
      remote,
      pageSource,
      remoteProps,
      originDataSet: dataSet,
      originRecord: record,
      searchCode,
      tableCode,
      subTableCode,
      modalProps,
      tableProps,
      searchBarProps,
      searchBarData,
      queryParams,
      queryData,
      beforeQuery,
      ...viewRendererProps,
    };

    return !LovViewComp ? null : <LovViewComp {...lovViewProps} />;
  };

  const lovModalProps = useMemo(
    () => ({
      title: null,
      footer: null,
      closable: false,
      className: 'supplier-lov-modal',
    }),
    []
  );

  const selectionProps = useMemo(
    () => ({
      placeholder: intl.get('srm.common.supplierLov.selectDataFromLeft').d('请勾选左侧数据'),
      nodeRenderer: record => {
        return <span>{record?.get('supplierName') || record?.get('supplierCompanyName')}</span>;
      },
    }),
    []
  );

  const optionRenderer = useCallback(({ record }) => {
    return <span>{record?.get('supplierName') || record?.get('supplierCompanyName')}</span>;
  }, []);

  return (
    <Lov
      viewMode={TriggerViewMode.drawer}
      viewRenderer={viewRenderer}
      maxTagCount={3}
      modalProps={lovModalProps}
      selectionProps={selectionProps}
      optionRenderer={optionRenderer}
      {...rest}
    />
  );
};
export default remotes({
  code: "SRM_COMMON_SUPPLIER_LOV",
  name: "remote",
}, {
  events: {
    cuxHandleSubmit(){}, // 二开弹框的确定按钮回调
    cuxInitData(){}, // 二开弹框的初始化数据回调
  },
})(formatterCollections({ code: ['srm.common'] })(SupplierLov));
