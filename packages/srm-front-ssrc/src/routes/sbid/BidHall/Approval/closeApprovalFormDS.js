/*
 * @Descripttion: 关闭询价单--审批-DS
 * @version: 1.0
 * @Author: yujie.shao@going-link.com;
 * @Date: 2021-09-01 11:20
 */
import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const promptCode = 'ssrc.bidHall';
// 基本信息
const closeApprovalFormDS = ({ bidHeaderId }) => {
  return {
    autoQuery: true,
    paging: false,
    primaryKey: 'closeApprovalId',
    fields: [
      {
        name: 'bidNum',
        type: 'string',
        label: intl.get(`${promptCode}.model.bidHall.bidNum`).d('招标编号'),
      },
      {
        name: 'templateName',
        type: 'string',
        label: intl.get(`${promptCode}.model.bidHall.rfxModal`).d('寻源模板'),
      },
      {
        name: 'bidTitle',
        type: 'string',
        label: intl.get(`${promptCode}.model.bidTitle`).d('招标标题'),
      },
      {
        name: 'closeRemark',
        type: 'string',
        label: intl.get(`${promptCode}.modal.closeReason`).d('关闭理由'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${Prefix}/${organizationId}/bid/${bidHeaderId}/close-approve/detail`,
          method: 'GET',
        };
      },
    },
  };
};
export { closeApprovalFormDS };
