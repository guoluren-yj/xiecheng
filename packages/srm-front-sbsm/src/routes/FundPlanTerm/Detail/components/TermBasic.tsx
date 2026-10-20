import React, { useMemo, useContext } from 'react';
import { IntlField, Select, CheckBox } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import { observer } from 'mobx-react';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { DetailCustomizeCode } from '../../utils/type';
import { statusTagRender } from '../../../../components/StatusTag';

const TermBasic = observer(() => {
  const {
    viewFlag,
    termHeaderDs,
    customizeForm,
    termLineDs,
    editFlag,
  } = useContext<StoreValueType>(Store);

  const lineLine = termLineDs?.length;
  const termStatus = termHeaderDs.current?.get('termStatus');


  const editorColumns = useMemo(() => {
    return [
      { name: 'termNum', disabled: editFlag },
      { name: 'termName', editor: IntlField },
      'dataSource',
      'versionNumber',
      { name: 'termStatus', disabled: true, renderer: viewFlag ? statusTagRender : ({ text }) => text },
      { name: 'defaultFlag', editor: CheckBox, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      { name: 'prepayStageFlag', editor: CheckBox, disabled: lineLine > 0, renderer: ({ value }) => yesOrNoRender(Number(value)) },
      // { name: 'priority', editor: NumberField },
      { name: 'amountComputeMode', editor: Select },
      // { name: 'remark', editor: TextArea },
      ['PUBLISHED', 'DISABLE'].includes(termStatus) && 'publishedByName',
      ['PUBLISHED', 'DISABLE'].includes(termStatus) && 'publishedDate',
    ];
  }, [viewFlag, lineLine, termStatus, editFlag]);

  return (
    <EditorForm
      useWidthPercent
      columns={3}
      useColon={false}
      dataSet={termHeaderDs}
      editorFlag={!viewFlag}
      customizeForm={customizeForm}
      editorColumns={editorColumns}
      customizeOptions={{ code: DetailCustomizeCode.BasicFormCode, readOnly: viewFlag }}
    />
  );
});


export default TermBasic;
