import intl from 'utils/intl';
import { Prefix } from '@/utils/globalVariable';

const HeaderFormDS = ({ sourceKey }) => {
  return {
    primaryKey: 'clarifyNotifyId',
    fields: [
      {
        name: 'clarifyNotifyTitle',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.common.title`).d('标题'),
      },
      {
        name: 'companyName',
        disabled: true,
        label: intl.get('ssrc.common.company').d('公司'),
      },
      {
        name: 'sourceNum',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
      },
      {
        name: 'replyEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.replyEndDate`).d('回复截止时间'),
        disabled: true,
        type: 'dateTime',
      },
      {
        name: 'replyRequirement',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarificationRequests`).d('澄清要求'),
      },
      {
        name: 'initiationReason',
        type: 'string',
        label: intl.get(`ssrc.common.view.message.startDescription`).d('发起原因'),
        disabled: true,
      },
      {
        name: 'clarifyNotifyNum',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyIssueNum`).d('澄清通知编号'),
      },
      {
        name: 'clarifyNotifyStatusMeaning',
        type: 'string',
        disabled: true,
        label: intl.get('hzero.common.button.status').d('状态'),
      },
      {
        name: 'submittedByName',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitPeople`).d('提交人'),
      },
      {
        name: 'submittedDate',
        type: 'dateTime',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitDate`).d('提交时间'),
        showType: 'dateTime',
      },
      { name: 'clarifyNotifyStatus', type: 'string' },
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'sourceFrom',
      },
      {
        name: 'organizationId',
      },
      {
        name: 'clarifyNotifyId',
      },
      { name: 'sourceHeaderId' },
    ],
    transport: {
      read: ({ dataSet }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;
        const { organizationId, clarifyNotifyId, sourceFrom } = commonProps;

        return {
          url: `${Prefix}/${organizationId}/clarify-notify/${clarifyNotifyId}`,
          method: 'GET',
          data: {
            sourceFrom,
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.HEADER_FORM_CREATE_DETAIL`,
          },
        };
      },
    },
  };
};

export { HeaderFormDS };
