import React, { useMemo, useContext } from 'react';
import { NumberField } from 'choerodon-ui/pro';

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
      {
        name: 'documentNum',
        disabled: true,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      'prepSource',
      {name: 'prepSourceAmount', disabled: true, editor: NumberField},
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
