import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { invert } from 'lodash';

import { HZERO_IAM } from 'utils/config';

const permissionDS = (permissionCodeMap: Record<string, string>, ingoreKeyList: string[] = []): DataSetProps => {
  return {
    autoQuery: true,
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    data: [{}],
    fields: [],
    transport: {
      read: () => {
        return {
          url: `${HZERO_IAM}/hzero/v1/menus/check-permissions`,
          method: 'POST',
          params: {},
          data: Object.values(permissionCodeMap),
          transformResponse: (res) => {
            try {
              const invertCodeMap = invert(permissionCodeMap);
              return Object.fromEntries(
                JSON.parse(res).map(({ code, approve }) => {
                  const permissionKey = invertCodeMap[code];
                  return [permissionKey, ingoreKeyList.includes(permissionKey) ? true : approve];
                })
              );
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};

export default permissionDS;