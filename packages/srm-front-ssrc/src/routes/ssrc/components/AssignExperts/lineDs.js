// 评分明细表ds
import intl from 'utils/intl';

import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';

import { Prefix } from '@/utils/globalVariable';

const expertModalDS = () => {
  return {
    primaryKey: 'evaluateExpertId',
    paging: false,
    autoQuery: false,
    fields: [
      {
        name: 'evaluateExpertId',
      },
      {
        name: 'indicAssginAdjustId',
      },
      {
        name: 'evaluateExpertAdjustId',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertSubAccount`).d('专家子账户'),
        name: 'loginName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertName`).d('专家姓名'),
        name: 'expertName',
        type: 'string',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.expertWeights`).d('专家权重%'),
        name: 'expertWeight',
        type: 'number',
        precision: 2,
        computedProps: {
          disabled: ({ dataSet }) =>
            dataSet.getState('elementRecord')?.get?.('indicateType') === 'PASS',
        },
      },
      {
        name: 'assignFlag',
      },
      {
        name: 'evaluateIndicAssignAdjustFields',
      },
    ],
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((r) => {
          if (r.get('assignFlag')) {
            Object.assign(r, { isSelected: true });
          } else {
            Object.assign(r, { isSelected: false });
          }
        });
      },

      // 选择记录事件
      select: ({ record, dataSet }) => {
        const elementRecord = dataSet.getState('elementRecord');
        record.set('assignFlag', 1);
        const oldSelectedData = elementRecord.get('assignedExperts') || [];
        const currentData = record.toData();
        elementRecord.set('assignedExperts', [...oldSelectedData, currentData]);
      },
      // 全选记录事件
      selectAll: ({ dataSet }) => {
        const elementRecord = dataSet.getState('elementRecord');
        dataSet.records.forEach((r) => r.set('assignFlag', 1));
        const selectedData = dataSet.toData();
        elementRecord.set('assignedExperts', selectedData);
      },
      // 取消选择记录事件
      unSelect: ({ dataSet, record }) => {
        const elementRecord = dataSet.getState('elementRecord');
        record.set('assignFlag', 0);
        const selectedData = dataSet.toData().filter((i) => i.assignFlag);
        elementRecord.set('assignedExperts', selectedData);
      },
      // 取消全选记录事件
      unSelectAll: ({ dataSet }) => {
        const elementRecord = dataSet.getState('elementRecord');
        dataSet.records.forEach((r) => r.set('assignFlag', 0));
        elementRecord.set('assignedExperts', []);
      },

      // 更新
      update: ({ dataSet, record, name }) => {
        const elementRecord = dataSet.getState('elementRecord');
        if (
          ![
            'expertName',
            'assignFlag',
            'loginName',
            'evaluateExpertId',
            'indicAssginAdjustId',
            'evaluateExpertAdjustId',
          ].includes(name) &&
          record.get('assignFlag')
        ) {
          const optionData = dataSet.toData().filter((i) => i.assignFlag);
          elementRecord.set('assignedExperts', optionData);
        }
      },
    },
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;

        return {
          url: `${Prefix}/${getCurrentOrganizationId()}/evaluate-indic-assigns`,
          method: 'GET',
          data: {
            ...commonProps,
          },
          transformResponse: (res) => {
            const result = JSON.parse(res);
            const response = getResponse(result);
            if (response) {
              const elementRecord = dataSet.getState('elementRecord') || {};
              const assignedExperts = elementRecord.get('assignedExperts') || [];
              // 获取行上数据
              const getCurrentObj = (r) => {
                return assignedExperts.find((i) => i?.evaluateExpertId === r?.evaluateExpertId);
              };
              // 如果查到的下拉数据未外面显示，则不勾选当前数据，并且assignFlag置为0
              const data = response.map((r) => {
                const item = getCurrentObj(r);
                if (!item) {
                  return { ...r, assignFlag: 0 };
                } else {
                  // 处理个性化字段
                  return { ...r, ...item, assignFlag: 1 };
                }
              });
              return data;
            }
          },
        };
      },
    },
  };
};

export { expertModalDS };
