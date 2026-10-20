import intl from 'utils/intl';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

export const tableData = (): DataSetProps => {
  return {
    selection: false,
    fields: [
      {
        name: 'processUserIdMeaning',
        label: intl.get('scux.operationRecordNew.model.operationRecordNew.processUserIdMeaning').d('操作人'),
        type: FieldType.string,
      },
      {
        name: 'processDate',
        label: intl.get('scux.operationRecordNew.model.operationRecordNew.processDate').d('操作时间'),
        type: FieldType.string,
      },
      {
        name: 'processStatusMeaning',
        label: intl.get('scux.operationRecordNew.model.operationRecordNew.processStatusMeaning').d('操作动作'),
        type: FieldType.string,
      },
      {
        name: 'remark',
        label: intl.get('scux.operationRecordNew.model.operationRecordNew.remark').d('操作内容'),
        type: FieldType.string,
      },
      {
        name: 'processStatus',
        type: FieldType.string,
      },
    ],
    transport: {
      read: (values) => {
        const {data: {url, parmasOther}, params} = values;
        return {
          url,
          method: 'GET',
          data: {...params, ...parmasOther, url: undefined},
        };
      },
    },
  };
};