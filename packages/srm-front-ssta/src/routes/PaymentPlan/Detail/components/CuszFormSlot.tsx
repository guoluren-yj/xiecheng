import React, { useContext } from 'react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailCustomizeCode } from '../../utils/type';
import EditorForm from '../../../Components/EditorForm';

const CuszFormSlot = () => {
  const {
    editFlag,
    changeFlag,
    planHeaderDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);

  const editorFlag = editFlag || changeFlag;

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={planHeaderDs}
      editorFlag={editorFlag}
      customizeForm={customizeForm}
      editorColumns={[]}
      customizeOptions={{ code: DetailCustomizeCode.CuszFormCode, readOnly: !editorFlag }}
    />
  );
};

export default CuszFormSlot;