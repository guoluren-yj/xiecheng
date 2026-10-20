import React, { useMemo, useContext } from 'react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { DetailCustomizeCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

const Basic = () => {
  const {
    headerDs,
    customizeForm,
    editFlag,
  } = useContext<StoreValueType>(Store);


  const editorColumns = useMemo(() => {
    return [
      'prepNum',
      { name: 'prepReportStatus', disabled: true, renderer: !editFlag ? statusTagRender : ({ text }) => text },
      'createdUserName',
      'creationDate',
      'prepViewType',
      'companyName',
      'companyNum',
      'autoSplitRule',
      {name: 'remark'},
    ];
  }, [editFlag]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: DetailCustomizeCode.BasicFormCode, readOnly: !editFlag }}
    />
  );
};


export default Basic;
