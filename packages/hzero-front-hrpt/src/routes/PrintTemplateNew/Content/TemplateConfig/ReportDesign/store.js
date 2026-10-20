import React, { createContext, useRef, useState, useMemo } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { HZERO_RPT } from 'utils/config';
import {
  isTenantRoleLevel,
  getCurrentOrganizationId,
} from 'hzero-front/lib/utils/utils';

const Store = createContext({});

const StoreManageProvider = (props) => {
  const {
    templateId: originTemplateId,
    reportId: originReportId,
    datasetId,
    refreshReport,
    children,
    reportType,
    labelCode,
  } = props;
  const sheetPartRef = useRef();
  const sideRef = useRef();
  const [activeFieldCode, setActiveFieldCode] = useState();
  const [activeNodeId, setActiveNodeId] = useState();
  const [loading, setLoading] = useState(false);
  const [sideMoveFlag, setSideMoveFlag] = useState(false);
  const [sideWidth, setSideWidth] = useState(280);
  const [reportId, setReportId] = useState(originReportId);
  const [rightPaneVisible, setRightPaneVisible] = useState(false);
  const [rightPaneKey, setRightPaneKey] = useState();
  const [template, setTemplate] = useState({});
  const [templateName, setTemplateName] = useState({ value: [], meaning: '' });
  const [templateId, setTemplateId] = useState(originTemplateId);
  const [currentCell, setCurrentCell] = useState(null);
  const [selectRange, setSelectRange] = useState(null);
  const [createVersion, setCreateVersion] = useState('');
  const treeDs = useMemo(() => {
    return new DataSet(getTreeDsConfig());
  }, []);

  return (
    <Store.Provider
      value={{
        store: {
          reportType,
          sheetPartRef,
          sideRef,
          activeFieldCode,
          activeNodeId,
          currentCell,
          datasetId,
          loading,
          refreshReport,
          reportId,
          rightPaneKey,
          rightPaneVisible,
          sideMoveFlag,
          sideWidth,
          template,
          templateId,
          treeDs,
          selectRange,
          createVersion,
          setCreateVersion,
          setCurrentCell,
          setTemplate,
          setTemplateId,
          setReportId,
          setActiveFieldCode,
          setActiveNodeId,
          setLoading,
          setSideWidth,
          setSideMoveFlag,
          setRightPaneVisible,
          setRightPaneKey,
          setSelectRange,
          templateName,
          setTemplateName,
          labelCode,
        },
        ...props,
      }}
    >
      {children}
    </Store.Provider>
  );
};

const getTreeDsConfig = () => {
  return {
    primaryKey: 'id',
    parentField: 'parentId',
    idField: 'id',
    transport: {
      read: ({ data }) => {
        return {
          url: !isTenantRoleLevel()
            ? `${HZERO_RPT}/v1/print-datasets/${data.datasetId}`
            : `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-datasets/${data.datasetId}`,
          method: 'get',
        };
      },
    },
  };
};

export default Store;
export { StoreManageProvider };
