import intl from 'utils/intl';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SDAP } from '_utils/config';

const isTenant = isTenantRoleLevel();
const organizationId = getCurrentOrganizationId();

const urlfix = `v1${isTenant ? `/${organizationId}` : ''}`;

export const getLexiconDs = () => ({
  autoQuery: false,
  fields: [
    { name: 'orderSeq', label: intl.get('hzero.common.view.serialNumber').d('序号') },
    {
      name: 'content',
      label: intl.get('sads.lexicon.view.wordsContent').d('词内容'),
      required: true,
      maxLength: 60,
    },
    {
      name: 'type',
      label: intl.get('sads.lexicon.view.wordsType').d('词类型'),
      required: true,
      lookupCode: 'SDAP.DICTIONARY.TYPE',
      defaultValue: 0,
      disabled: isTenant,
    },
    {
      name: 'sourceFrom',
      label: intl.get('sads.lexicon.view.wordsSource').d('词来源'),
      disabled: true,
      lookupCode: 'SDAP.DICTIONARY.FROM',
      defaultValue: isTenant ? 1 : 0,
    },
    { name: 'realName', label: intl.get('hzero.common.entity.creator').d('创建人') },
    { name: 'creationDate', type: 'dateTime', label: intl.get('hzero.common.date.creation').d('创建时间') },
  ],
  events: {
    load: ({ dataSet }) => {
      if (isTenant) {
        dataSet.forEach((f) => {
          if (f.get('sourceFrom') === 0) {
            Object.assign(f, { selectable: false });
          }
        });
      }
    },
  },
  transport: {
    read: {
      url: `${SRM_SDAP}/${urlfix}/extend-dictionarys`,
      method: 'GET',
    },
    destroy: {
      url: `${SRM_SDAP}/${urlfix}/extend-dictionarys`,
      method: 'DELETE',
    },
    submit({ data }) {
      return {
        url: `${SRM_SDAP}/${urlfix}/extend-dictionarys`,
        method: 'POST',
        data: data?.[0],
      };
    },
  },
});
