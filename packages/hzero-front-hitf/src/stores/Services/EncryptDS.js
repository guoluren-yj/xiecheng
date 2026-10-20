import React from 'react';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  PACKET_ENCRYPT_POLICY,
  PACKET_ENCRYPT_ALGORITHM,
  PACKET_ENCRYPT_DIRECTION,
} from '@/constants/CodeConstants';
import getLang from '@/langs/serviceLang';
import QuestionPopover from '@/components/QuestionPopover';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

const basicFormDS = () => {
  return {
    autoQuery: false,
    selection: false,
    paging: false,
    autoCreate: false,
    fields: [
      {
        name: 'encryptDirection',
        label: (
          <QuestionPopover
            text={getLang('ENCRYPT_DIRECTION')}
            code="HITF.SERVICES.ENCRYPT_DIRECT"
          />
        ),
        type: 'string',
        required: true,
        disabled: true,
        lookupCode: PACKET_ENCRYPT_DIRECTION,
      },
      {
        name: 'encryptPolicy',
        label: (
          <QuestionPopover
            text={getLang('ENCRYPT_POLICY')}
            message={getLang('ENCRYPT_POLICY_TIP')}
          />
        ),
        type: 'string',
        required: true,
        lookupCode: PACKET_ENCRYPT_POLICY,
      },
      {
        name: 'encryptAlgorithm',
        label: getLang('ENCRYPY_ALGORITHM'),
        type: 'string',
        required: true,
        lookupCode: PACKET_ENCRYPT_ALGORITHM,
      },
      {
        name: 'encryptKey',
        label: <QuestionPopover text={getLang('ENCRYPT_KEY')} code="HITF.SERVICES.ENCRYPT_KEY" />,
        type: 'string',
        required: true,
      },
      {
        name: 'enabledFlag',
        label: getLang('ENABLE_FLAG'),
        type: 'boolean',
        required: true,
        defaultValue: true,
      },
    ],
  };
};

const fetchEncryKeyDS = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    transport: {
      create: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/packet-encrypts/regen-key`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

export { basicFormDS, fetchEncryKeyDS };
