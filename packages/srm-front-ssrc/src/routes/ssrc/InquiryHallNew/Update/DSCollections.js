import intl from 'utils/intl';

const PrequalScoreElementTemplateButton = () => {
  return {
    fields: [
      {
        name: 'templateLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.REFERENCE_SCORE_TEMPL',
        textField: 'templateCode',
        valueField: 'templateId',
        lovPara: {
          templatePurpose: 'PREQUALIFICATION',
          selectFlag: 1,
        },
      },
      {
        name: 'templateId',
        bind: 'templateLov.templateId',
      },
      {
        name: 'templateCode',
        bind: 'templateLov.templateCode',
      },
      {
        name: 'scoreIndics',
        bind: 'templateLov.scoreIndics',
      },
    ],
  };
};

// 预审小组组长
const PrequalGroupLeaderLovDS = () => {
  return {
    primaryKey: 'userId',
    fields: [
      {
        name: 'preGroupLeaderLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.PREQUAL_USER',
        textField: 'realName',
        valueField: 'id',
        required: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
      {
        name: 'prequalMemberId',
        bind: 'preGroupLeaderLov.prequalMemberId',
      },
      {
        name: 'userId',
        bind: 'preGroupLeaderLov.userId',
      },
      {
        name: 'prequalMemberId',
      },
      {
        name: 'leaderFlag',
        defaultValue: 1,
      },
      {
        name: 'objectVersionNumber',
        type: 'number',
      },
      {
        name: 'sourceHeaderId',
      },
      {
        name: 'organizationId',
      },
      {
        name: 'tenantId',
      },
    ],
    events: {
      update: ({ dataSet, record, name, value }) => {
        const { commonProps = {} } = dataSet.queryParameter || {};
        const { organizationId = null, rfxHeaderId = null } = commonProps || {};

        if (name === 'preGroupLeaderLov') {
          const { id = null } = value || {};

          record.set('userId', id);
          record.set('tenantId', organizationId);
          record.set('sourceHeaderId', rfxHeaderId);
        }
      },
    },
  };
};

// 报价,竞价运行时间
const RunningTimerDS = () => {
  return {
    fields: [
      {
        name: 'day',
        type: 'number',
        label: intl.get('hzero.common.date.unit.day').d('天'),
        placeholder: intl.get('hzero.common.date.unit.day').d('天'),
        step: 1,
        min: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record }) {
            const day = record.get('day');
            const hour = record.get('hour');
            const minute = record.get('minute');

            return !day && !hour && !minute;
          },
        },
      },
      {
        name: 'hour',
        type: 'number',
        label: intl.get('hzero.common.date.unit.hours').d('小时'),
        placeholder: intl.get('hzero.common.date.unit.hours').d('小时'),
        step: 1,
        min: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record }) {
            const day = record.get('day');
            const hour = record.get('hour');
            const minute = record.get('minute');

            return !day && !hour && !minute;
          },
        },
      },
      {
        label: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        placeholder: intl.get('hzero.common.date.unit.minutes').d('分钟'),
        name: 'minute',
        type: 'number',
        step: '0.1',
        min: 0,
        defaultValue: 0,
        dynamicProps: {
          required({ record }) {
            const day = record.get('day');
            const hour = record.get('hour');
            const minute = record.get('minute');

            return !day && !hour && !minute;
          },
        },
      },
    ],
  };
};

export { PrequalScoreElementTemplateButton, PrequalGroupLeaderLovDS, RunningTimerDS };
