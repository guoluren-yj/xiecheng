import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { getServicePointsUrl, getScripRecordUrl } from '@/services/scriptUtilityService';

// 历史记录
export function constructQueryPointsRecordDataSet(/* props: { store: IStore } */) {
  const material: DataSetProps = {
    autoQuery: false,
    selection: false,
    primaryKey: 'id',
    paging: false,
    fields: [
      {
        name: 'tenantName',
        label: intl.get('hiam.subAccount.model.user.tenantName').d('所属租户'),
        type: FieldType.string,
      },
      {
        name: 'scriptName',
        label: intl.get('hiam.subAccount.model.user.scriptName').d('脚本名称'),
        type: FieldType.string,
      },
      {
        name: 'scriptCode',
        label: intl.get('hiam.subAccount.model.user.scriptCode').d('脚本编码'),
        type: FieldType.string,
      },
      {
        name: 'scriptTypeMeaning',
        label: intl.get('hzero.common.model.common.scriptTypeMeaning').d('脚本类型'),
        type: FieldType.string,
      },
      {
        name: 'version',
        label: intl.get('hzero.common.model.common.version').d('脚本版本'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.model.common.enabledFlag').d('脚本状态'),
        type: FieldType.number,
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: `${getScripRecordUrl}/${data.pointScriptId}`,
        method: 'GET',
        data,
      }),
    },
  };

  return new DataSet(material);
}

// card列表
export default function constructServicePointsDataSet(/* props: { store: IStore } */) {
  const material: DataSetProps = {
    autoQuery: false,
    selection: false,
    fields: [
      {
        name: 'tenantName',
        label: intl.get('hiam.subAccount.model.user.tenantName').d('所属租户'),
        type: FieldType.string,
      },
      {
        name: 'scriptName',
        label: intl.get('hiam.subAccount.model.user.scriptName').d('脚本名称'),
        type: FieldType.string,
      },
      {
        name: 'scriptCode',
        label: intl.get('hiam.subAccount.model.user.scriptCode').d('脚本编码'),
        type: FieldType.string,
      },
      {
        name: 'scriptTypeMeaning',
        label: intl.get('hzero.common.model.common.scriptTypeMeaning').d('脚本类型'),
        type: FieldType.string,
      },
      {
        name: 'version',
        label: intl.get('hzero.common.model.common.version').d('脚本版本'),
        type: FieldType.string,
      },
      {
        name: 'enabledFlag',
        label: intl.get('hzero.common.model.common.enabledFlag').d('脚本状态'),
        type: FieldType.number,
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: getServicePointsUrl,
        method: 'GET',
        data,
      }),
    },
  };

  return new DataSet(material);
}
