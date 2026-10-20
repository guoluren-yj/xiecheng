import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { Form, Output } from 'choerodon-ui/pro';

import { fetchCategoryList } from '@/services/riskScanConfig/schemaConfigService';

import DynamicTable from './DynamicTable';
import styles from './index.less';

export default function ScanObject(props) {
  const {
    remote,
    localId,
    pageType,
    dispatch,
    selectType,
    scanWorkbench = {},
    scanSchemeDS,
    accountListDS,
    handListDS,
    selectHandListDS,
    categoryListDS,
    coopSupplierListDS,
    outerListDS,
    typeSupplierListDS,
    supplierListDS,
    onFetch = () => {},
    setSelectType = () => {},
    onCallBackToSave = () => {},
  } = props;
  const [expectSupplierCategoryIds, setCategoryIds] = useState([]);

  const { scanConfigDetail = {} } = scanWorkbench || {};

  const dsMap = {
    SUPPLIER_CATEGORY: categoryListDS,
    COOP_SUPPLIER: coopSupplierListDS,
    MANUAL_SUPPLIER: handListDS,
    PLATFORM_OUTER: outerListDS,
  };

  useEffect(() => {}, []);

  useEffect(() => {
    if (localId) {
      getDetailData(localId);
    }
  }, [localId]);

  const getDetailData = async (id) => {
    const { scanObjectType: scopeType } = scanConfigDetail;
    dsMap[selectType].setQueryParameter('riskPlanId', id);
    dsMap[selectType].setQueryParameter('scanObjectType', scopeType);
    dsMap[selectType].setQueryParameter('planContentType', 'object');
    dsMap[selectType].setQueryParameter('planType', 'SCAN');

    onFetch(true);
    const res = await dsMap[selectType].query();
    onFetch(false);

    if (getResponse(res)) {
      const { originData = {} } = res;
      const { scanObjectType = '' } = originData || {};

      scanSchemeDS.loadData([
        {
          scanObjectType,
        },
      ]);

      setSelectType(scanObjectType);

      dispatch({
        type: 'scanWorkbench/updateState',
        payload: {
          scanConfigDetail: { ...scanConfigDetail, ...originData },
        },
      });
    }
  };

  const getCategoryList = async () => {
    const res = await fetchCategoryList({
      riskPlanId: localId,
    });
    if (getResponse(res) && res.length) {
      setCategoryIds(res);
    }
  };

  useEffect(() => {
    // getCategoryList();
  }, []);

  return (
    <div className={styles['scan-config-object-panel']}>
      <div className={styles['risk-scan-config-edit-card-title']}>
        {intl.get('sdat.riskScanConfig.view.title.scanScheme').d('扫描方案')}
      </div>

      <div style={{ marginTop: '16px' }}>
        <Form dataSet={scanSchemeDS} columns={3} labelLayout="float">
          <Output name="scanObjectType" />
        </Form>
      </div>

      <div style={{ marginTop: '16px' }}>
        <DynamicTable
          localId={localId}
          remote={remote}
          pageType={pageType}
          dataSet={dsMap[selectType]}
          expectSupplierCategoryIds={expectSupplierCategoryIds}
          typeSupplierListDS={typeSupplierListDS}
          dynamicType={selectType}
          accountListDS={accountListDS}
          supplierListDS={supplierListDS}
          selectHandListDS={selectHandListDS}
          onGetDetailData={getDetailData}
          getCategoryList={getCategoryList}
          scanWorkbench={scanWorkbench}
          onCallBackToSave={onCallBackToSave}
        />
      </div>
    </div>
  );
}
