import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const indexDataSet = ({ id, unitCode }) => ({
  dataToJSON: 'dirty-field',
  selection: 'multiple',
  primaryKey: id,
  modifiedCheck: false,
  forceValidate: true,
  cacheSelection: true,
  fields: [],
  transport: {
    read: ({ data, params: _p }) => {
      const { nodeTemplateCode, nodeConfigId, campKey, isForm, ...other } = data.params || {};
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } =
        data.tplInfo || {};
      let params;
      if (unitCode) {
        params = {
          ..._p,
          customizeUnitCode: unitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      const url = isForm ? 'header' : 'line';
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/${url}/ext?campKey=${campKey}`,
        method: 'GET',
        params,
        data: other,
      };
    },
  },
});

export { indexDataSet };
