import React, { createContext, useState, useMemo, useRef } from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { HZERO_RPT } from 'hzero-front/lib/utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

const store = createContext({});

const { Provider } = store;

export interface IState {
  loading: boolean;
  reportId: number | string;
  template: any;
  templateId: number | string;
  wpsOffice: {
    app?: any;
    jssdk?: any;
  };
  activeFieldCode?: string;
  templateName: {
    value: any[];
    meaning: string;
  }
}

export interface IStore {
  state: IState;
  updateState: (state: any) => void;
  treeDs: DataSet,
  refreshReport: any,
  datasetId: number | string;
  isPredefined?: boolean;
}

function StoreManageProvider(props) {
  const {
    templateId: originTemplateId,
    reportId: originReportId,
    datasetId,
    refreshReport,
    children,
    isPredefined,
  } = props;
  const [state, setState] = useState<IState>({
    loading: true,
    reportId: originReportId,
    template: {},
    templateName: {
      value: [],
      meaning: '',
    },
    templateId: originTemplateId,
    wpsOffice: {
      app: undefined,
      jssdk: undefined,
    },
    activeFieldCode: undefined,
  });
  const updateState = (newState) => {
    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  };

  const treeDs = useMemo(() => {
    return new DataSet(getTreeDsConfig() as DataSetProps);
  }, []);

  const store = {
    state,
    updateState,
    treeDs,
    refreshReport,
    datasetId,
    isPredefined,
  };

  return (
    <Provider
      value={{
        store,
        ...props,
      }}
    >
      {children}
    </Provider>
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

export default store;
export { StoreManageProvider };
