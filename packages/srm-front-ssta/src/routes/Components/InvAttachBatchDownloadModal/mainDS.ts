import { isArray } from 'lodash';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';

export const attachmentBatchDownLoadDS = (readTransport): DataSetProps => ({
  dataToJSON: DataToJSON.all,
  fields: [
    {
      name: 'invoiceFileType',
      multiple: true,
    },
  ],
  transport: {
    read: {
      method: 'POST',
      transformResponse: (response) =>
      {
        try
        {
          const res = JSON.parse(response);
          const invoiceFileTypes: Array<string> = [];
          const fileDTO = {};
          if (getResponse(res) && isArray(res))
          {
            res.forEach((item) =>
            {
              const { invoiceFileType, fileDTOList } = item || {};
              invoiceFileTypes.push(invoiceFileType);
              fileDTO[invoiceFileType] = fileDTOList;
            });
          }
          return [{ invoiceFileType: invoiceFileTypes, fileDTO }];
        } catch (message)
        {
          notification.error({ message });
          return [{ invoiceFileType: [], fileDTO: [] }];
        }
      },
      ...readTransport,
    },
  },
});