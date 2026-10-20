import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldIgnore, FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { getScriptPageUrl } from '@/services/scriptUtilityService';

export function constructQueryPointsDataSet(/* props: { store: IStore } */) {
  const material: DataSetProps = {
    autoQuery: false,
    // pageSize: 10,
    selection: false,
    primaryKey: 'id',
    paging: false,
    fields: [
      {
        name: 'serviceName',
        label: intl.get('hiam.subAccount.model.user.serviceName').d('服务名'),
        type: FieldType.string,
      },
      {
        name: 'servicePointCode',
        label: intl.get('hiam.subAccount.model.user.servicePointCode').d('编码'),
        type: FieldType.string,
      },
      {
        name: 'servicePointDesc',
        label: intl.get('hiam.subAccount.model.user.servicePointDesc').d('描述'),
        type: FieldType.string,
      },
      {
        name: 'servicePointId',
        label: intl.get('hzero.common.model.common.servicePointId').d('ID'),
        type: FieldType.string,
      },
      {
        name: 'servicePoints',
        label: intl.get('hzero.common.model.common.servicePoints').d('points'),
        type: FieldType.object,
      },
    ],
    queryFields: [
      {
        name: 'organizationIdLov',
        label: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        ignore: FieldIgnore.always,
        // noCache: true,
      },
      {
        name: 'tenantId',
        label: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
        type: FieldType.string,
        bind: 'organizationIdLov.tenantId',
      },
    ],
    transport: {
      read: ({ data }) => ({
        url: getScriptPageUrl,
        method: 'GET',
        data,
        transformResponse(response) {
          const res = JSON.parse(response);
          return { data: res };
        },
      }),
    },
  };

  return new DataSet(material);
}
