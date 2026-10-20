import intl from 'utils/intl';
import { getDateTimeFormat } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const HeaderFormDS = ({ sourceKey }) => {
  return {
    fields: [
      {
        name: 'clarifyNotifyTitle',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.common.title`).d('标题'),
      },
      {
        name: 'companyName',
        label: intl.get('ssrc.common.company').d('公司'),
        type: 'string',
        disabled: true,
      },
      {
        name: 'sourceNum',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
      },
      {
        name: 'replyEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.responseEndDate`).d('回复截至时间'),
        type: 'string',
        disabled: true,
        format: getDateTimeFormat(),
      },
      {
        name: 'replyRequirement',
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarificationRequests`).d('澄清要求'),
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
        type: 'string',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitDate`).d('提交时间'),
      },
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
      { name: 'clarifyNotifyType', defaultValue: 'PRICE' },
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
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.HEADER_FORM_REPLY_DETAIL`,
          },
        };
      },
    },
  };
};

export { HeaderFormDS };
