import React, { useContext } from 'react';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import EditorForm from '../../Components/EditorForm';

const editorColumns = [
  'payRuleMeaning',
  'invoiceRuleMeaning',
  'downloadNodeMeaning',
  'paymentRuleMeaning',
  'returnRuleMeaning',
  'defaultDirectInvoiceTypeMeaning',
];

const CostRule = () => {

  const { tenderHeaderDs } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      editorFlag={false}
      dataSet={tenderHeaderDs}
      editorColumns={editorColumns}
    />
  );
};

export default CostRule;