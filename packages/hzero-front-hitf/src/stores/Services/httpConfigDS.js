import { HTTP_CONFIG_PROPERTY } from '@/constants/CodeConstants';
import getLang from '@/langs/serviceLang';

const editTableDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: false,
    fields: [
      {
        name: 'propertyCode',
        label: getLang('PROPERTY_CODE'),
        type: 'string',
        lookupCode: HTTP_CONFIG_PROPERTY,
        required: true,
      },
      {
        name: 'propertyValue',
        label: getLang('PROPERTY_VALUE'),
        type: 'number',
        defaultValue: 5000,
        required: true,
        min: 0,
        max: 2147483647,
      },
    ],
  };
};

export { editTableDS };
