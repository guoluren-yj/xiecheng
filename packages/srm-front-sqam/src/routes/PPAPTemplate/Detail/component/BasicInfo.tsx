import React, { useMemo, useContext } from 'react';
import { IntlField, CheckBox } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { yesOrNoRender } from 'utils/renderer';
// import intl from 'utils/intl';

import { Store } from '../stores/StoreProvider';
import type { StoreValueType } from '../stores/StoreProvider';
import EditorForm from '../../../components/EditorForm';
import StatusTag from '../../components/StatusTag';
import { TemplateStatusCode } from '../../utils/type';

const BasicInfo = () => {
  const {
    viewFlag,
    headerDs,
    editFlag,
  } = useContext<StoreValueType>(Store);

  const { templateId, templateStatus } = headerDs.current?.get(['templateId', 'templateStatus']) || {};

  const editorColumns = useMemo(() => {
    return [
      { name: 'templateNum' },
      { name: 'templateName', editor: IntlField },
      {
        name: 'enableSingleItemFlag',
        editor: CheckBox,
        renderer: ({ value }) => !(editFlag || !templateId) && yesOrNoRender(value),
      },
      'versionNumber',
      {
        name: 'displayStatus',
        disabled: true,
        renderer: ({ value, text }) => {
          return (<StatusTag value={text} renderTextFlag={editFlag || !templateId} flag color={TemplateStatusCode[value]} />);
        },
      },
      'createdByName',
      'lastUpdatedByName',
      'lastUpdateDate',
      templateStatus === 'PUBLISHED' && 'publishedByName',
      templateStatus === 'PUBLISHED' && 'publishedDate',
    ];
  }, [editFlag, templateId, templateStatus]);

  return (
    <EditorForm
      columns={3}
      useColon={false}
      dataSet={headerDs}
      editorFlag={!viewFlag}
      editorColumns={editorColumns}
      useWidthPercent
    />
  );
};


export default observer(BasicInfo);
