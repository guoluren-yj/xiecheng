import React from 'react';
import { observer } from 'mobx-react-lite';
import { DataSet } from 'choerodon-ui/pro';

import { IModelManagerStore } from '@/routes/Modeler/ModelDesigner/stores';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import CreateModel from '../CreateModelModal/CreateModel';

interface IProps {
  step: number;
  fieldSwitchRef: any;
  refDataSourceType: string;
  editModelDataSet: DataSet;
  baseTableFieldDataSet: DataSet;
  dataModelFieldDataSet: DataSet;
  refTableCode: any;
  resourceUponRoleHierarchy: string;
  modelManagerStore: IModelManagerStore;
}

export default observer((props: IProps) => {
  // const modelManagerStore = useContext<IModelManagerStore>(_store as any).store;

  const {
    step,
    fieldSwitchRef,
    refDataSourceType,
    editModelDataSet,
    baseTableFieldDataSet,
    dataModelFieldDataSet,
    resourceUponRoleHierarchy,
    modelManagerStore,
  } = props;
  // const step = stepRef.current === -1 ? 0 : stepRef.current;
  const fieldSwitch = fieldSwitchRef.current;

  return (
    <div
      style={{ height: '60vh' }}
      className={`${globalStyles['model-body']} ${globalStyles['header-border-no']}`}
    >
      <div>
        {fieldSwitch === 'TABLE_FIELD' && (
          <CreateModel
            modelManagerStore={modelManagerStore}
            editModelDataSet={editModelDataSet}
            step={step}
            refDataSourceType={refDataSourceType}
            baseTableFieldDataSet={baseTableFieldDataSet}
            dataModelFieldDataSet={dataModelFieldDataSet}
            resourceUponRoleHierarchy={resourceUponRoleHierarchy}
          />
        )}
      </div>
    </div>
  );
});
