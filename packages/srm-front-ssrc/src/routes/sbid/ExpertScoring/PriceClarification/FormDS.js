import intl from 'utils/intl';
// import { getDateTimeFormat } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

const HeaderFormDS = ({ sourceKey }) => {
  return {
    fields: [
      {
        name: 'clarifyNotifyTitle',
        type: 'string',
        required: true,
        label: intl.get(`ssrc.common.title`).d('标题'),
      },
      {
        name: 'companyLov',
        label: intl.get('ssrc.common.company').d('公司'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPFM.USER_AUTHORITY_COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        disabled: true,
      },
      {
        name: 'companyId',
        bind: 'companyLov.companyId',
      },
      {
        name: 'companyName',
        bind: 'companyLov.companyName',
      },
      {
        name: 'sourceNum',
        disabled: true,
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号'),
      },
      {
        name: 'replyEndDate',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.replyEndDate`).d('回复截止时间'),
        type: 'dateTime',
        required: true,
        // format: getDateTimeFormat(),
        min: new Date(),
      },
      {
        name: 'replyRequirement',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarificationRequests`).d('澄清要求'),
      },
      {
        name: 'initiationReason',
        type: 'string',
        label: intl.get(`ssrc.common.view.message.startDescription`).d('发起原因'),
      },
      {
        name: 'clarifyNotifyNum',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.clarifyIssueNum`).d('澄清通知编号'),
      },
      {
        name: 'clarifyNotifyStatusMeaning',
        type: 'string',
        label: intl.get('hzero.common.button.status').d('状态'),
      },
      {
        name: 'submittedByName',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitPeople`).d('提交人'),
      },
      {
        name: 'submittedDate',
        type: 'string',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.submitDate`).d('提交时间'),
        showType: 'dateTime',
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
      { name: 'clarifyNotifyStatus', type: 'string' },
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
            customizeUnitCode: `SSRC.${sourceKey}_HALL.CLARIFICATION.FORM_CREATE_EDIT`,
          },
        };
      },
    },
  };
};

export { HeaderFormDS };
