import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';
import { getDateTimeFormat, getCurrentOrganizationId } from 'utils/utils';
import { langPrefixCode, ListCustomizeCode } from '../utils/constant';

const tenantId = getCurrentOrganizationId();

// 替代方案列表
export const subRelationListDS = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: false,
    primaryKey: 'subRelationCurId',
    fields: [
      {
        name: 'operate',
        label: intl.get('hzero.common.button.action').d('操作'),
      },
      {
        name: 'displaySubRelationNum',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.subRelationCode`).d('替代方案编码'),
      },
      {
        name: 'subRelationName',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.subRelationName`).d('替代方案名称'),
      },
      {
        name: 'status',
        type: FieldType.string,
        required: true,
        lookupCode: 'SMDM.SUB_RELATION_STATUS',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'createdByName',
        type: FieldType.string,
        label: intl.get(`${langPrefixCode}.model.common.createdByName`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        format: getDateTimeFormat(),
        label: intl.get(`${langPrefixCode}.model.common.creationDate`).d('创建时间'),
      },
    ],
    queryParameter: {
      customizeUnitCode: Object.values(ListCustomizeCode).join(),
    },
    transport: {
      read: {
        url: `${SRM_MDM}/v1/${tenantId}/sub-relation-cur/query`,
        method: 'GET',
      },
    },
  };
};
