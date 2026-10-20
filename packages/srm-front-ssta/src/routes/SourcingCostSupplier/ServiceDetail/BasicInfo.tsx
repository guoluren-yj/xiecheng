import React, { useContext } from 'react';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { ServiceHeadUnitCode } from '../utils/type';
import EditorForm from '../../Components/EditorForm';

const editorColumns = [
  'serverFeesNum',
  'creationDate',
  'createdUserName',
  'sourceDocumentNum',
  'sourceDocumentTypeMeaning',
  'sourceDocumentTitle',
  'companyNum',
  'companyName',
  'supplierCompanyNum',
  'supplierCompanyName',
  'sourceCompanyNum',
  'sourceCompanyName',
];

const BasicInfo = () => {

  const { serviceHeaderDs, customizeForm } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      editorFlag={false}
      dataSet={serviceHeaderDs}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: ServiceHeadUnitCode.BASIC }}
    />
  );
};

export default BasicInfo;