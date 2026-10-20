import { API_HOST } from 'utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const BASICS = API_HOST;
export default (): DataSetProps => ({
  autoQuery: false,
  paging: false,
  cacheSelection: false,
  transport: {
    read: ({ params }) => {
      return {
        url: `${BASICS}/${lowcodeOrganizationURL()}/labels/list-order`,
        method: 'GET',
        params,
      };
    },
  },
  fields: [
    {
      name: 'labelName',
      type: FieldType.string,
    },
    {
      name: 'labelCode',
      type: FieldType.string,
      unique: true,
    },
    {
      name: 'color',
      type: FieldType.color,
    },
    {
      name: 'labelId',
      type: FieldType.string,
      unique: true,
    },
    {
      name: 'checked',
      type: FieldType.boolean,
      defaultValue: false,
    },
  ],
});
