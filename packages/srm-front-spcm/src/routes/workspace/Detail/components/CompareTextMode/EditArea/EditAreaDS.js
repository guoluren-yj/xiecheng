/**
 * 协议详情-选定文本区域
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPCM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 共享对象
const EditAreaDS = (pcHeaderId) => ({
  primaryKey: 'pcHeaderId',
  fields: [
    {
      name: 'pcHeaderEditArea',
      label: intl.get('spcm.workspace.model.common.version').d('版本'),
      lookupCode: 'SPCM.PC_EDIT_AREA',
      required: true,
    },
    {
      name: 'pcHeaderQueryArea',
      label: intl.get('spcm.workspace.model.common.version').d('版本'),
      lookupCode: 'SPCM.PC_EDIT_AREA',
      required: true,
    },
  ],
  transport: {
    submit: ({ data }) => {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/edit-share/${pcHeaderId}/updateEditText`,
        method: 'POST',
        data: data[0],
      };
    },
  },
});

export default EditAreaDS;
