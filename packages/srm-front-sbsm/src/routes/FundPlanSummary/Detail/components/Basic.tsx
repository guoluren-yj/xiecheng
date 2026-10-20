import React, { useMemo, useContext } from 'react';
import { TextArea } from 'choerodon-ui/pro';

import { Store } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { DetailCustomizeCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

const Basic = () => {
  const {
    boolMap,
    headerDs,
    customizeForm,
  } = useContext(Store);


  const editorColumns = useMemo(() => {
    return [
      'balNum',
      { name: 'balStatus', disabled: true, renderer: boolMap.editFlag ? ({ text }) => text : statusTagRender },
      'createdByName',
      'creationDate',
      'prepViewTypeMeaning',
      'companyName',
      'companyNum',
      'autoSplitRuleMeaning',
      { name: 'remark', editor: TextArea, newLine: true, colSpan: 2, resize: 'vertical' },
    ];
  }, [boolMap.editFlag]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={boolMap.editFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: DetailCustomizeCode.BasicFormCode, readOnly: !boolMap.editFlag }}
    />
  );
};


export default Basic;
