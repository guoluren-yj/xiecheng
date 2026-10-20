/*
 * QualificationDocuments - 调查表资质信息
 * @Date: 2023-12-20 13:55:38
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect, useCallback } from 'react';
import { map, camelCase, isArray, isEmpty } from 'lodash';
import { DataSet } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';

import { fetchQuestionnaireTmpl } from '@/services/supplierService';

import ComposeTable from './ComposeTable';
import { getInvestigationDS } from './stores/getInvestigationDS';

const QualificationDocuments = ({ supplierRecord }) => {
  const {
    supplierCompanyId,
    supplierTenantId,
    companyId,
    tenantId,
    supplierBasicId,
  } = supplierRecord.get([
    'supplierCompanyId',
    'supplierTenantId',
    'companyId',
    'tenantId',
    'supplierBasicId',
  ]);

  const [allState, setAllState] = useState({
    configObj: {}, // 调查表模版配置
    dsList: {}, // ds集合
  });

  const { dsList, configObj } = allState;

  // 整合state
  const setState = useCallback(
    (newState) => {
      setAllState((prevState) => ({ ...prevState, ...newState }));
    },
    [setAllState]
  );

  useEffect(() => {
    handleQuery();
  }, []);

  // 初始查询
  const handleQuery = async () => {
    if (companyId && supplierCompanyId) {
      // setLoading(true);
      await fetchQuestionnaireTmpl({
        tenantId,
        companyId,
        partnerTenantId: supplierTenantId,
        supplierBasicId: supplierBasicId || -1,
        partnerCompanyId: supplierCompanyId,
      }).then((investigationResponse) => {
        const investigationConfig = getResponse(investigationResponse);
        if (investigationConfig) {
          const config = handleConfig(investigationConfig);
          const newConfig = isArray(config) ? config[0] : {};
          handleDataSet(newConfig);
        }
      });
    }
  };

  // 处理调查表配置
  const handleConfig = (investigationConfig) => {
    return map(investigationConfig, (config) => {
      const { configName, investigateConfigLines, ...others } = config;
      // 处理成调查表组件所需的格式
      return {
        ...others,
        configName: camelCase(configName),
        lines: map(investigateConfigLines, (line) => {
          const { fieldCode, investigateConfigComponents, ...rest } = line;
          return {
            ...rest,
            fieldCode: camelCase(fieldCode),
            props: investigateConfigComponents,
          };
        }),
      };
    }).filter((n) => ['sslmInvestgAuth'].includes(n.configName));
  };

  // 生成ds
  const handleDataSet = (config = {}) => {
    if (!isEmpty(config)) {
      const ds = {};
      const dataSet = new DataSet(getInvestigationDS({ config }));
      dataSet.setQueryParameter('queryParam', {
        tenantId,
        supplierBasicId: supplierBasicId || -1,
        investgHeaderId: config.investgHeaderId,
      });
      dataSet.query();
      ds[config.configName] = dataSet;
      setState({
        dsList: ds,
        configObj: config,
      });
    }
  };

  return !isEmpty(configObj) ? (
    <ComposeTable
      dataSet={dsList.sslmInvestgAuth}
      columns={configObj.lines}
      configName={configObj.configName}
    />
  ) : null;
};

export default QualificationDocuments;
