import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { Form, Select } from 'choerodon-ui/pro';

// import { fetchCategoryList } from '@/services/riskScanConfig/schemaConfigService';

import DynamicTable from './DynamicTable';
import styles from './index.less';

const ScanObject = observer((props) => {
  const {
    localId,
    remote,
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

  const [objectNumLimit, setNumLimit] = useState(200);

  const { scanConfigDetail = {} } = scanWorkbench || {};
  const { planCompanyType = '' } = scanConfigDetail || {};

  const dsMap = {
    SUPPLIER_CATEGORY: categoryListDS,
    COOP_SUPPLIER: coopSupplierListDS,
    MANUAL_SUPPLIER: handListDS,
    PLATFORM_OUTER: outerListDS,
  };

  useEffect(() => {
    if (localId) {
      getDetailData(localId);
    }
  }, [localId]);

  const getDetailData = async (id) => {
    const { scanObjectType: scopeType } = scanConfigDetail;

    if (!dsMap[selectType]) return;

    dsMap[selectType].setQueryParameter('riskPlanId', id);
    dsMap[selectType].setQueryParameter('scanObjectType', scopeType);
    dsMap[selectType].setQueryParameter('planContentType', 'object');
    dsMap[selectType].setQueryParameter('planType', 'SCAN');

    onFetch(true);
    const res = await dsMap[selectType].query();
    onFetch(false);

    if (getResponse(res)) {
      const { originData = {} } = res;
      const { scanObjectType = '', scanObjectNumLimit = 200 } = originData || {};

      setNumLimit(scanObjectNumLimit);

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

  const handleChangeType = async (type) => {
    if (type && selectType !== type) {
      Object.keys(dsMap).forEach((key) => {
        if (key !== type && dsMap[key]) {
          dsMap[key].reset();
          dsMap[key].loadData([]);
          dsMap[key].totalCount = 0;
        }
      });
    }
    setSelectType(type);
  };

  return (
    <div className={styles['scan-config-object-panel']}>
      <div
        className={styles['risk-scan-config-edit-card-title']}
        style={{ display: 'flex', justifyContent: 'space-between' }}
      >
        <span>{intl.get('sdat.riskScanConfig.view.title.scanScheme').d('扫描对象')}</span>
        <span style={{ fontSize: '12px', fontWeight: '400' }}>
          <span style={{ color: '#4e5769' }}>
            {intl.get('sdat.riskScanConfig.view.title.canAddCount').d('可添加数量')}
          </span>
          :&nbsp;&nbsp;
          <span style={{ color: '#000', fontWeight: '600' }}>
            {dsMap[selectType]?.totalCount || 0}
          </span>
          &nbsp;&nbsp;
          <span style={{ color: '#4e5769' }}>/ {objectNumLimit}</span>
        </span>
      </div>

      <div style={{ marginTop: '16px' }}>
        <Form dataSet={scanSchemeDS} columns={3} labelLayout="float">
          <Select name="scanObjectType" onChange={handleChangeType} />
        </Form>
      </div>

      <div style={{ marginTop: '16px' }}>
        <DynamicTable
          localId={localId}
          remote={remote}
          dataSet={dsMap[selectType]}
          domesticForeignRelation={planCompanyType === 'DOMESTIC' ? 1 : 0}
          typeSupplierListDS={typeSupplierListDS}
          dynamicType={selectType}
          accountListDS={accountListDS}
          supplierListDS={supplierListDS}
          selectHandListDS={selectHandListDS}
          onGetDetailData={getDetailData}
          scanWorkbench={scanWorkbench}
          onCallBackToSave={onCallBackToSave}
          addedCount={dsMap[selectType]?.totalCount || 0}
          scanObjectNumLimit={objectNumLimit}
        />
      </div>
    </div>
  );
});

export default ScanObject;
