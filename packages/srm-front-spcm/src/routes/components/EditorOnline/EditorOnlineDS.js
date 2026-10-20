/*
 * @Description:
 * @Date: 2022-10-31 09:47:06
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const FieldDS = {
  primaryKey: 'id',
  autoQuery: true,
  selection: false,
  blockNode: true,
  parentField: 'parentId',
  expandField: 'expand',
  idField: 'id',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'expand', type: 'boolean' },
    { name: 'parentId', type: 'string' },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/purchase-contract-file/getWildcard`,
        method: 'GET',
        data,
      };
    },
  },
};

const ParentFieldDS = (ds) => {
  return {
    fields: [
      {
        name: 'fieldSit',
        type: 'string',
        textField: 'langStr',
        valueField: 'id',
        options: ds,
      },
      {
        name: 'fieldSearch',
        type: 'string',
      },
    ],
  };
};

export { FieldDS, ParentFieldDS };
