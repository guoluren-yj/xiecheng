import moment from 'moment';
import intl from 'utils/intl';
import { HZERO_SRDM } from '@/common/config';
import notification from 'utils/notification';

function getConfigSyncDS(url = `${HZERO_SRDM}/v1/hpdm-config-deploy-infos/create-submit`) {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        type: 'object',
        name: 'recList',
      },
      {
        type: 'string',
        name: 'issueNum',
        label: intl.get('srdm.deploy.model.issueNum').d('需求号'),
        required: true,
      },
      {
        type: 'object',
        lookupCode: 'SRDM.APPROVER_NUM',
        name: 'approver',
        label: intl.get('hzero.common.model.apply.approver').d('审批人'),
        required: true,
        ignore: 'always',
        defaultValue: '直接上级',
      },
      {
        type: 'string',
        name: 'approverLoginName',
        defaultValue: '直接上级',
      },
      {
        type: 'boolean',
        name: 'blacklistFlag',
        label: intl.get('srdm.deploy.modal.sync.prod.blacklist').d('迭代同步生产黑名单'),
        defaultValue: 0,
        trueValue: 1,
        falseValue: 0,
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          data: data[0],
          url,
          method: 'POST',
        };
      },
    },
    feedback: {
      submitSuccess: ({ content }) => {
        notification.success({
          message: content && content[0] && content[0].message,
        });
      },
    },
  };
}

function getScanDs() {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        type: 'number',
        name: 'objectId',
      },
      {
        type: 'date',
        name: 'from',
        label: intl.get('hzero.common.date.release.startTime').d('开始时间'),
        defaultValue: moment().startOf('date'),
      },
      {
        type: 'date',
        name: 'to',
        label: intl.get('hzero.common.date.release.endTime').d('结束时间'),
        defaultValue: moment().endOf('date'),
      },
    ],
    transport: {
      create: ({ data = [] }) => {
        return {
          url: '/srdm/v1/data-migrate-recs/scan',
          method: 'post',
          data: data[0],
        };
      },
    },
    feedback: {
      submitSuccess: ({ content }) => {
        notification.success({
          message: content && content[0] && content[0].message,
        });
      },
    },
  };
}

export { getConfigSyncDS, getScanDs };
