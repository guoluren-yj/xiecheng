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
        name: 'customParamsFlag',
        label: (
          <QuestionPopover text={getLang('CUSTOM_PARAMS_FLAG')} code="HITF.SERVICES.CUSTOM_ATTR" />
        ),
        type: 'boolean',
        required: true,
        defaultValue: true,
      },
    ],
  };
};

const paramFormDS = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    autoCreate: false,
  };
};

export { basicFormDS, paramFormDS };
