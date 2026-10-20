import { FieldType, DataSetSelection } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SQAM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { ActionType, ProjectListCode, ProjectSearchCode, ActiveKey } from '../../utils/type';

const organizationId = getCurrentOrganizationId();

export const projectTableDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    selection: activeKey === ActiveKey.ProjectAll ? DataSetSelection.multiple : false,
    primaryKey: 'projectHeaderId',
    cacheSelection: true,
    fields: [
      {
        name: 'projectStatus',
        type: FieldType.string,
        lookupCode: 'SQAM.PPAP_PROJECT_STATUS',
        label: intl.get('hzero.common.common.status').d('状态'),
      },
      {
        name: 'operate',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.common.operate').d('操作'),
      },
      {
        name: 'projectNum',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectNum').d('项目汇总编号'),
      },
      {
        name: 'projectName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.projectName').d('项目名称'),
      },
      {
        name: 'companyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.company').d('公司'),
      },
      {
        name: 'supplierCompanyName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.supplierCompany').d('供应商'),
      },
      {
        name: 'createName',
        type: FieldType.string,
        label: intl.get('sqam.ppap.model.project.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sqam.ppap.model.project.createDate').d('创建日期'),
      },
      {
        name: 'itemCode',
        type: FieldType.string,
        label: intl.get(`sqam.ppap.model.project.partNum`).d('零件编码'),
      },
    ],
    queryParameter: {
      action: ActionType[activeKey],
      customizeUnitCode: [ProjectListCode[activeKey], ProjectSearchCode[activeKey]].join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SQAM}/v1/${organizationId}/access-project-headers/sum-page`,
          method: 'GET',
        };
      },
    },
  };
};
