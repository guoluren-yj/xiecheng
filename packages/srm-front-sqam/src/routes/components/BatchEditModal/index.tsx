import React, { Fragment } from 'react';
import { isEmpty } from 'lodash';
import type { DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import DynamicAlert from '../DynamicAlert';
import EditorForm from '../EditorForm';

interface BatchEditProps {
  editorFormDs: DataSet;
  editorColumns: any[];
  selectedListDs: DataSet;
  customizeForm?: Function;
  customizeOptions?: object;
};

const BatchEditModal: React.FC<BatchEditProps> = formatterCollections({
  code: ['sqam.common'],
})((props: BatchEditProps) => {
  const { editorFormDs, editorColumns, selectedListDs, customizeForm, customizeOptions } = props;
  const { selected } = selectedListDs;

  return (
    <Fragment>
      <DynamicAlert
        placement="modal-top"
        message={
          isEmpty(selected)
            ? intl.get('sqam.common.view.alert.batchAllMaintain').d('针对全部数据进行批量编辑')
            : intl
              .get(`sqam.common.view.alert.batchAllMaintainData`, { num: selected.length })
              .d(`已勾选{num}条数据进行批量编辑`)
        }
      />
      <EditorForm
        editorFlag
        columns={1}
        useColon={false}
        dataSet={editorFormDs}
        editorColumns={editorColumns}
        customizeForm={customizeForm}
        customizeOptions={customizeOptions}
      />
    </Fragment>
  );
});

export default BatchEditModal;
