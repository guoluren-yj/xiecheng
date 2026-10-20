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

  const editorColumns = useMemo(() => {
    return [
      { name: 'attachmentUuid', editor: Attachment },
    ];
  }, []);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={boolMap.editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: HeadCustCodeMap.Attachment, readOnly: !boolMap.editFlag }}
    />
  );
};

export default AttachmentInfo;