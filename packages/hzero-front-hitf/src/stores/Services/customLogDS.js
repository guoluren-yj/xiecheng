import React from 'react';
import getLang from '@/langs/serviceLang';
import QuestionPopover from '@/components/QuestionPopover';

const basicFormDS = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    autoCreate: false,
    fields: [
      {
        name: 'sourceSystem',
        label: getLang('SOURCE_SYSTEM'),
        type: 'string',
      },
      {
        name: 'sourceDocumentNum',
        label: getLang('SOURCE_DOCUMENT_NUM'),
        type: 'string',
      },
      {
        name: 'sourceDocumentId',
        label: (
          <QuestionPopover
            text={getLang('SOURCE_DOCUMENT_ID')}
            message={getLang('SOURCE_DOCUMENT_ID_TIP')}
          />
        ),
        type: 'string',
      },
    ],
  };
};

export { basicFormDS };
