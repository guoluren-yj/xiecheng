import React, { useMemo, useContext } from 'react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { StageAllPrepRuleCode } from '../../utils/type';

const PrepRule = () => {
  const {
    headerDs,
    customizeForm,
  } = useContext<StoreValueType>(Store);


  const editorColumns = useMemo(() => {
    return [
      'prepSource',
      'prefabRule',
      'prepProcess',
    ];
  }, []);

  return (
    <div>
      <EditorForm
        useWidthPercent
        columns={3}
        useColon={false}
        dataSet={headerDs}
        editorFlag={false}
        customizeForm={customizeForm}
        editorColumns={editorColumns}
        customizeOptions={{ code: StageAllPrepRuleCode, readOnly: true }}
      />
    </div>
  );
};


export default PrepRule;
