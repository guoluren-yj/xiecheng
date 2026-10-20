import React, { memo } from 'react';

import EditorForm from '@/routes/Components/EditorForm';

export default memo((props) => {
  const { dataSet, editorColumns = [], customizeForm, customizeCode } = props;

  return (
    <EditorForm
      useWidthPercent
      labelAlign="left"
      columns={3}
      dataSet={dataSet}
      editorFlag={false}
      editorColumns={editorColumns}
      className="c7n-pro-vertical-form-display"
      useColon={false}
      customizeOptions={{ code: customizeCode }}
      customizeForm={customizeForm}
    />
  );
});
