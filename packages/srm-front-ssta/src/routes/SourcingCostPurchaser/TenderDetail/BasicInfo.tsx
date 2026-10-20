import React, { useContext } from 'react';

import type { StoreValueType } from './stores';
import { Store } from './stores';
import { TenderHeadUnitCode } from '../utils/type';
import EditorForm from '../../Components/EditorForm';

const editorColumns = [
  'tenderFeesNum',
  'creationDate',
  'createdUserName',
  'sourceDocumentNum',
  'sourceDocumentTypeMeaning',
  'companyNum',
  'companyName',
  'supplierCompanyNum',
  'supplierCompanyName',
  'sourceCompanyNum',
  'sourceCompanyName',
  'uuidDownloadFlag',
  'supplierParticipationFlag',
];

const BasicInfo = () => {

  const { tenderHeaderDs, customizeForm } = useContext<StoreValueType>(Store);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      editorFlag={false}
      dataSet={tenderHeaderDs}
      editorColumns={editorColumns}
      customizeForm={customizeForm}
      customizeOptions={{ code: TenderHeadUnitCode.BASIC }}
    />
  );
};

export default BasicInfo;