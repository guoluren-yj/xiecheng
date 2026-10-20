import React, { useMemo, useContext } from 'react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../Components/EditorForm';
import { BasicCode } from '../stores/index';

const Basic = () => {
  const {
    headerDs,
    customizeForm,
    editFlag,
  } = useContext<StoreValueType>(Store);


  const editorColumns = useMemo(() => {
    return [
      'batchNum',
      'createdName',
      'creationDate',
      'settleType',
    ];
  }, []);

  return (
    <EditorForm
      // @ts-ignore
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: BasicCode, readOnly: !editFlag }}
    />
  );
};


export default Basic;
