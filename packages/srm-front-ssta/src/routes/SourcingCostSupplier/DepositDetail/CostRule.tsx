import React, { useContext } from 'react';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import EditorForm from '../../Components/EditorForm';

const editorColumns = [
  'paymentRuleMeaning',
  'returnRuleMeaning',
];

const CostRule = () => {

  const { depositHeaderDs } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      editorFlag={false}
      dataSet={depositHeaderDs}
      editorColumns={editorColumns}
    />
  );
};

export default CostRule;