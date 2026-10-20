/*
 * @Date: 2022-10-18 19:17:25
 * @Author: ZLH
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 评分人信息ds
const getPeopleScoreDS = ({ evalHeaderId }) => ({
  autoCreate: true,
  fields: [
    {
      name: 'loginName',
      type: 'string',
      label: intl.get('sslm.supplierDocManage.model.docManage.scoreUser').d('评分用户'),
    },
    {
      name: 'userName',
      type: 'string',
      label: intl.get('sslm.supplierDocManage.model.docManage.userName').d('评分人描述'),
    },
    {
      name: 'userDepartment',
      type: 'string',
      label: intl.get('sslm.supplierDocManage.model.docManage.department').d('部门'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/eval-dtl-resps/${evalHeaderId}/un-complete`,
        method: 'POST',
      };
    },
  },
});

const peopleScoreColumns = () => [
  {
    name: 'loginName',
    width: 150,
  },
  {
    name: 'userName',
    width: 150,
  },
  {
    name: 'userDepartment',
    width: 150,
  },
];

export { getPeopleScoreDS, peopleScoreColumns };
