// time control DS
import intl from 'utils/intl';

const PrequalificationDS = (organizationId) => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'adjustFields',
        type: 'object',
        defaultValue: [],
      },
      {
        name: 'rfxRequirePrequalHeaderDTO',
        type: 'object',
      },
      {
        name: 'nowAdjustedField',
        type: 'string',
      },
      {
        name: 'reviewMethod',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.reviewMethod`).d('审查方式'),
        type: 'string',
        // required: true,
        lookupCode: 'SSRC.REVIEW_METHOD',
        dynamicProps: {
          required({ dataSet }) {
            // 与前面dom显示隐藏保持一致，解决dom隐藏，此处依然必输问题
            const prequalificationDisabled = dataSet.getState('prequalificationDisabled');
            const prequalExistFlag = dataSet.getState('prequalExistFlag');
            const prequalStatusFlag = dataSet.getState('prequalStatusFlag');
            const isRequired = !(prequalificationDisabled || prequalStatusFlag || prequalExistFlag);
            return isRequired;
          },
        },
      },
      {
        name: 'qualifiedLimit',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.qualifiedLimit`).d('合格上限'),
        type: 'number',
        step: 1,
        dynamicProps: {
          required({ record }) {
            return record.get('reviewMethod') === 'LIMITED_QUANTITY';
          },
        },
      },
      {
        name: 'preGroupLeaderLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMain`).d('预审小组组长'),
        type: 'object',
        lovCode: 'SSRC.PREQUAL_USER',
        textField: 'realName',
        valueField: 'id',
        // required: true,
        dynamicProps: {
          lovPara() {
            return {
              organizationId,
            };
          },
          required({ dataSet }) {
            // 与前面dom显示隐藏保持一致，解决dom隐藏，此处依然必输问题
            const prequalificationDisabled = dataSet.getState('prequalificationDisabled');
            const prequalExistFlag = dataSet.getState('prequalExistFlag');
            const prequalStatusFlag = dataSet.getState('prequalStatusFlag');
            const isRequired = !(prequalificationDisabled || prequalStatusFlag || prequalExistFlag);
            return isRequired;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.pretrialGroupMember`).d('预审小组成员'),
        name: 'preGroupMemberLov',
        type: 'object',
        lovCode: 'SSRC.PREQUAL_USER',
        textField: 'realName',
        valueField: 'id',
        multiple: true,
        lovPara: {
          organizationId,
        },
      },
      {
        name: 'prequalRemark',
        label: intl.get(`ssrc.common.qualRequirements`).d('资质要求'),
        type: 'string',
        maxLength: 800,
      },
      {
        name: 'prequalAttachmentUuid',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalAttachment`).d('资格预审文件'),
        type: 'attachment',
        // required: true,
        dynamicProps: {
          required({ dataSet }) {
            // 与前面dom显示隐藏保持一致，解决dom隐藏，此处依然必输问题
            const prequalificationDisabled = dataSet.getState('prequalificationDisabled');
            const prequalExistFlag = dataSet.getState('prequalExistFlag');
            const prequalStatusFlag = dataSet.getState('prequalStatusFlag');
            const isRequired = !(prequalificationDisabled || prequalStatusFlag || prequalExistFlag);
            return isRequired;
          },
        },
      },
    ],
  };
};

const promptInfoDS = () => {
  return {
    selection: false,
    fields: [
      {
        label: intl.get('ssrc.quoController.model.controller.messageDesc').d('问题列表'),
        name: 'messageDesc',
      },
      {
        label: intl.get('ssrc.quoController.model.controller.validateValue').d('对应标段'),
        name: 'validateValue',
      },
    ],
  };
};

export { PrequalificationDS, promptInfoDS };
