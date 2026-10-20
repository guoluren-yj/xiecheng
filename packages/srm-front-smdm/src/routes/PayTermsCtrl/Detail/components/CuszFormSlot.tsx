import React, { useContext } from 'react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../components/EditorForm';
import { DetailCustomizeCode } from '../../utils/type';

const CuszFormSlot = () => {
  const {
    viewFlag,
    termHeaderDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={termHeaderDs}
      editorFlag={!viewFlag}
      customizeForm={customizeForm}
      editorColumns={[]}
      customizeOptions={{ code: DetailCustomizeCode.CuszFormCode, readOnly: viewFlag }}
    />
  );
};

export default CuszFormSlot;