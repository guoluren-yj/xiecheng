import React, { useContext } from 'react';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { DepositHeadUnitCode } from '../utils/type';
import EditorForm from '../../Components/EditorForm';

const editorColumns = [
  'depositNum',
  'creationDate',
  'createdUserName',
  'sourceDocumentTypeMeaning',
  'sourceDocumentNum',
  'sourceDocumentTitle',
  'companyNum',
  'companyName',
  'supplierCompanyNum',
  'supplierCompanyName',
  'supplierQuoteFlag',
];

const BasicInfo = () => {

  const { depositHeaderDs, customizeForm } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      editorFlag={false}
      dataSet={depositHeaderDs}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: DepositHeadUnitCode.BASIC }}
    />
  );
};

export default BasicInfo;