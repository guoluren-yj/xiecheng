/*
 * @Date: 2022-09-14 15:32:34
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

export const getScorerInfoDS = ({ weightSameFlag, averageFlag }) => ({
  fields: [
    {
      name: 'userLov',
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'SSLM.KPI_CHOOSE_USER',
      lovPara: { tenantId },
      label: intl.get('sslm.supplierDocManage.model.docManage.scoreUser').d('评分用户'),
    },
    {
      name: 'respUserId',
      bind: 'userLov.userId',
    },
    {
      name: 'userName',
      bind: 'userLov.userName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.userName`).d('评分用户描述'),
    },
    {
      name: 'userDepartment',
      bind: 'userLov.unitName',
      label: intl.get(`sslm.supplierDocManage.model.docManage.department`).d('部门'),
    },
    {
      name: 'respWeight',
      type: 'number',
      required: !averageFlag && weightSameFlag,
      label: intl.get(`sslm.supplierDocManage.model.docManage.scoreWeight`).d('权重'),
    },
  ],
});
