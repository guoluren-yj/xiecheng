/**
 * StartupRuleConfig
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Form, DataSet, Select } from 'choerodon-ui/pro';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { queryProcessAppoint, saveStartupRuleType } from '../processConfigurationService';
import StartupRule from './StartupRule';

export default function memoStartupRuleConfig(props = {}) {
  const { currentNode = {} } = props;
  const { categoryId = '', categoryCode = '', documentId = '', documentCode = '' } = currentNode;
  const [processAppoint, setProcessAppoint] = useState({});
  const [errorInfo, setErrorInfo] = useState({});
  const currentOrganizationId = getCurrentOrganizationId();

  useEffect(() => {
    queryProcessAppoint({
      processDocumentId: documentId,
      processCategoryId: categoryId,
    }).then((res) => {
      if (res.type === 'error') {
        setErrorInfo(res);
      } else {
        setErrorInfo({});
        setProcessAppoint({
          ...res,
          startupRuleType: res.startupRuleType || 'ENGINE',
        });
      }
    });
  }, [categoryId, documentId]);

  const startupRuleTypeDs = useMemo(() => {
    return new DataSet({
      fields: [
        {
          name: 'startupRuleType',
          type: 'string',
          lookupCode: 'HWFP.STARTUP_RULE_TYPE',
          required: true,
        },
      ],
      data: [{ startupRuleType: processAppoint.startupRuleType }],
    });
  }, [processAppoint]);

  const changeStartupRuleType = useCallback(
    (value) => {
      const { procAssignConfId, processCategoryId, processDocumentId } = processAppoint;
      saveStartupRuleType({
        procAssignConfId,
        processCategoryId,
        processDocumentId,
        startupRuleType: value,
        tenantId: currentOrganizationId,
      }).then((res) => {
        if (getResponse(res)) {
          notification.success();
          setProcessAppoint({
            ...processAppoint,
            startupRuleType: value,
          });
        }
      });
    },
    [processAppoint]
  );

  return (
    <div className="startup-rule">
      {errorInfo.type === 'error' ? (
        <div className="startup-rule-errorMessage">{errorInfo.message}</div>
      ) : (
        <>
          <Form
            className="startup-rule-type-select"
            dataSet={startupRuleTypeDs}
            labelLayout="vertical"
            columns={3}
          >
            <Select name="startupRuleType" onChange={changeStartupRuleType} colSpan={1} />
          </Form>
          <StartupRule
            // startupRuleType={startupRuleType}
            processAppoint={processAppoint}
            record={{ categoryId, categoryCode, documentId, documentCode }}
          />
        </>
      )}
    </div>
  );
}
