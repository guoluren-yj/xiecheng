import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default (type: string): DataSetProps => ({
  autoQuery: false,
  // autoQueryAfterSubmit: false,
  paging: false,
  transport: {
    read: ({ params }) => {
      return {
        url: `/${lowcodeOrganizationURL()}/label-assigns`,
        method: 'GET',
        params: {
          ...params,
          targetType: type,
        },
        transformResponse: (res) => {
          try {
            return {
              labelCodes: [...JSON.parse(res).map(({ labelCode }) => labelCode)],
            };
          } catch (error) {
            // do nothing
          }
          return {
            labelCodes: [],
          };
        },
      };
    },
  },
  fields: [
    {
      name: 'labelCodes',
      type: FieldType.string,
      textField: 'labelName',
      valueField: 'labelCode',
      lookupUrl: `/${lowcodeOrganizationURL()}/labels/list`,
      lookupAxiosConfig: () => ({
        method: 'GET',
      }),
      multiple: true,
      ignore: FieldIgnore.never,
    },
  ],
});
