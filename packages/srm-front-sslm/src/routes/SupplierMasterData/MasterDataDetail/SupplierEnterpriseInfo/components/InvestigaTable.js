/*
 * InvestigaTable - 平台重合调查表页签
 * @Date: 2023-08-16 13:55:38
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import React, { useEffect, useContext } from 'react';

import { Context } from '@/routes/SupplierMasterData/Context';
import { useSetState } from '@/routes/components/utils';
import ComposeTable from '@/routes/components/Investigation/Compose/ComposeTable';
import { getInvestigationDS } from '@/routes/components/Investigation/stores/getInvestigationDS';

const InvestigaTable = ({ config = {} }) => {
  const context = useContext(Context);
  const {
    enterpriseBasicInfo = {},
    tableMaxHeight,
    purchaserCompanyInfo: { tenantId } = {},
  } = context;
  const { basic: { supplierBasicId } = {} } = enterpriseBasicInfo;

  const [state, setState] = useSetState({
    tableDs: {},
    investgHeaderId: '', // 调查表头id
  });
  const { tableDs } = state;

  useEffect(() => {
    handleDataSet();
  }, [config]);

  // 生成ds
  const handleDataSet = () => {
    const ds = new DataSet(getInvestigationDS({ config, type: '360QUERY' }));
    const { investgHeaderId: headerId } = config;
    ds.setQueryParameter('queryParam', {
      tenantId,
      supplierBasicId,
      investgHeaderId: headerId,
    });
    ds.query();
    setState({
      tableDs: ds,
      investgHeaderId: headerId,
    });
  };

  const componentProps = {
    configName: config.configName,
    columns: config.lines,
    editable: false,
    dataSet: tableDs,
    tableStyle: { maxHeight: tableMaxHeight },
  };

  return !isEmpty(tableDs) ? <ComposeTable {...componentProps} /> : null;
};

export default InvestigaTable;
