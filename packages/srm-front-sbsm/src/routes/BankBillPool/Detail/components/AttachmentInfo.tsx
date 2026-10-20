import React, { useContext, useMemo } from 'react';
import { Attachment } from 'choerodon-ui/pro';

import { Store } from '../stores';
import { HeadCustCodeMap } from '../../utils/type';
import EditorForm from '../../../../components/EditorForm';

const AttachmentInfo = () => {

  const {
    boolMap,
    headerDs,
    customizeForm,
  } = useContext(Store);

  const editorColumns = useMemo(() => [
    { name: 'attachmentUuid', editor: Attachment },
  ], []);

  return (
    <EditorForm
      columns={3}
      useWidthPercent
      useColon={false}
      dataSet={headerDs}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      editorFlag={boolMap.createFlag || boolMap.editFlag}
      customizeOptions={{ code: HeadCustCodeMap.Attachment }}
    />
  );

};

export default AttachmentInfo;