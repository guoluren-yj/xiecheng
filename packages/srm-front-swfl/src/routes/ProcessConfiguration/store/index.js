/**
 * store - 工作流单据整合 - store
 * @date: 2022-06-29
 * @author: Lokya <kan.li01@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { createContext, useState, useRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';

import {
  getProcessCategoriesConfig,
  getProcessDocumentConfig,
  getProcessCategoriesEditConfig,
  getDocumentInfoFormConfig,
  getProcessVariableConfig,
  getProcessFormConfig,
  getEmailApproveFormConfig,
  getApprovalGroupConfig,
  getConditionFieldConfig,
  getApprovalGroupFieldConfig,
  getTotalSettingConfig,
  getQuotePredefinedConfig,
  getProcessConfigTable,
  getProcessConfigForm,
  getServiceConfigTable,
  getServiceConfigForm,
  getVariableConfigConfig,
  getCategoryAttributeForm,
  getCategoryAttributeDetailTable,
  getExternalSystemApproveConfigDs,
} from './storeDs';

const Context = createContext({});

const StoreProvider = (props) => {
  const {
    children,
    processDocumentDs,
    processCategoriesDs,
    processCategoriesEditDs,
    documentInfoDs,
    processVariableDs,
    processFormDs,
    emailApproveFormDs,
    approvalGroupDs,
    conditionFieldDs,
    approvalGroupFieldDs,
    totalSettingDs,
    quotePredefinedDs,
    processConfigTableDs,
    processConfigFormDs,
    processConfigImportFormDs,
    serviceConfigTableDs,
    serviceConfigFormDs,
    variableConfigDs,
    categoryAttributeFormDs,
    categoryAttributeDetailTableDs,
    externalSystemApproveConfigDs,
  } = props;
  const [currentNode, setCurrentNode] = useState({});
  const [emptyFlag, changeEmptyFlag] = useState(true);
  const [leftTreeWidth, setLeftTreeWidth] = useState(260);
  const searchTreeRef = useRef({});

  const value = {
    children,
    processDocumentDs,
    processCategoriesDs,
    processCategoriesEditDs,
    currentNode,
    setCurrentNode,
    documentInfoDs,
    processVariableDs,
    processFormDs,
    emailApproveFormDs,
    approvalGroupDs,
    conditionFieldDs,
    approvalGroupFieldDs,
    totalSettingDs,
    quotePredefinedDs,
    searchTreeRef,
    processConfigTableDs,
    processConfigFormDs,
    processConfigImportFormDs,
    emptyFlag,
    changeEmptyFlag,
    serviceConfigTableDs,
    serviceConfigFormDs,
    variableConfigDs,
    categoryAttributeFormDs,
    categoryAttributeDetailTableDs,
    externalSystemApproveConfigDs,
    leftTreeWidth,
    setLeftTreeWidth,
    ...props,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export { Context };

export default formatterCollections({
  code: [
    'hzero.common',
    'hwfp.common',
    'hwfp.documents',
    'hwfp.categories',
    'hwfp.serviceDefinition',
    'hpfm.valueList',
    'hwfp.processDefine',
    'entity.tenant',
    'hpfm.permission',
    'hwfp.interfaceMap',
    'swfl.processAppoint',
    'swfl.processConfiguration',
    'spfm.button',
  ],
})(
  withProps(
    () => {
      const processDocumentDs = new DataSet(getProcessDocumentConfig());
      const processCategoriesDs = new DataSet(getProcessCategoriesConfig());
      const processCategoriesEditDs = new DataSet(getProcessCategoriesEditConfig());
      const documentInfoDs = new DataSet(getDocumentInfoFormConfig());
      const processVariableDs = new DataSet(getProcessVariableConfig());
      const processFormDs = new DataSet(getProcessFormConfig());
      const emailApproveFormDs = new DataSet(getEmailApproveFormConfig());
      const approvalGroupDs = new DataSet(getApprovalGroupConfig());
      const conditionFieldDs = new DataSet(getConditionFieldConfig());
      const approvalGroupFieldDs = new DataSet(getApprovalGroupFieldConfig());
      const totalSettingDs = new DataSet(getTotalSettingConfig());
      const quotePredefinedDs = new DataSet(getQuotePredefinedConfig());
      const processConfigTableDs = new DataSet(getProcessConfigTable());
      const processConfigFormDs = new DataSet(getProcessConfigForm());
      const processConfigImportFormDs = new DataSet(getProcessConfigForm('import'));
      const serviceConfigTableDs = new DataSet(getServiceConfigTable());
      const serviceConfigFormDs = new DataSet(getServiceConfigForm());
      const variableConfigDs = new DataSet(getVariableConfigConfig());
      const categoryAttributeFormDs = new DataSet(getCategoryAttributeForm());
      const categoryAttributeDetailTableDs = new DataSet(getCategoryAttributeDetailTable());
      const externalSystemApproveConfigDs = new DataSet(getExternalSystemApproveConfigDs());

      return {
        processDocumentDs,
        processCategoriesDs,
        processCategoriesEditDs,
        documentInfoDs,
        processVariableDs,
        processFormDs,
        emailApproveFormDs,
        approvalGroupDs,
        conditionFieldDs,
        approvalGroupFieldDs,
        totalSettingDs,
        quotePredefinedDs,
        processConfigTableDs,
        processConfigFormDs,
        processConfigImportFormDs,
        serviceConfigTableDs,
        serviceConfigFormDs,
        variableConfigDs,
        categoryAttributeFormDs,
        categoryAttributeDetailTableDs,
        externalSystemApproveConfigDs,
      };
    },
    { cacheState: true }
  )(StoreProvider)
);
