import React, { useContext } from 'react';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import EditorForm from '../../Components/EditorForm';

const editorColumns = [
  'invoiceRuleMeaning',
];

const CostRule = () => {

  const { serviceHeaderDs } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      editorFlag={false}
      dataSet={serviceHeaderDs}
      editorColumns={editorColumns}
    />
  );
};

export default CostRule;