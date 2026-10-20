import moment from 'moment';

import intl from 'utils/intl';
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'spcm.common.model.common';

// 协议阶段信息
const stageDS = (props) => {
  const { pcHeaderId } = props;
  return {
    selection: false,
    primaryKey: 'pcStageId',

    fields: [
      {
        name: 'pcStatusCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.pcStatusCode`).d('状态'),
      },
      {
        name: 'anciContractCode',
        type: 'string',
        label: intl.get(`${commonPrompt}.anciContractCode`).d('补充协议编号'),
      },
      {
        name: 'version',
        type: 'string',
        label: intl.get(`${commonPrompt}.version`).d('版本号'),
      },
      {
        name: 'createByRealName',
        type: 'string',
        label: intl.get(`${commonPrompt}.createByRealName`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
        min: moment().format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'approveDate',
        type: 'dateTime',
        label: intl.get(`${commonPrompt}.approveDate`).d('生效日期'),
        min: moment().format(DEFAULT_DATE_FORMAT),
      },
    ],
    transport: {
      read: ({ data }) => {
        const { queryParams } = data;
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract/${pcHeaderId}/stage/page`,
          method: 'GET',
          data: queryParams,
        };
      },
    },
  };
};

export default stageDS;
