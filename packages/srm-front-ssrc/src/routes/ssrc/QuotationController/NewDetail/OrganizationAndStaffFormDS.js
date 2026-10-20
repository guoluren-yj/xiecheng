import intl from 'utils/intl';

const OrganizationAndStaffFormDS = (bidFlag) => {
  return {
    autoCreate: true,
    dataToJSON: 'all',
    fields: [
      {
        name: 'openBidLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.openBidder`).d('开标员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        selection: 'multiple',
        multiple: true,
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
          disabled({ record }) {
            // 为1说明全部已开标,开标员置灰
            return Number(record.get('allOpenedFlag')) === 1;
          },
          required({ record }) {
            const openerFlag = record.get('openerFlag') || 0;
            const sealedQuotationFlag = record.get('sealedQuotationFlag') || 0;
            return sealedQuotationFlag && openerFlag;
          },
        },
      },
      {
        name: 'openerFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'prequalCheckerLov',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.prequalChecker`).d('初审审查员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
          disabled({ record }) {
            // 初审已过,初审审查员置灰
            return record.get('pretrialStatus') === 'SUBMITED';
          },
          required({ record }) {
            const pretrialFlag = record.get('pretrialFlag') || 0;
            return !!pretrialFlag;
          },
        },
      },
      {
        name: 'inquierLov',
        label: !bidFlag
          ? intl.get('ssrc.common.view.message.RfxCreator').d('询价员')
          : intl.get('ssrc.common.view.message.BIDCreator').d('招标员'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
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
        name: 'checkPriceLov',
        type: 'object',
        label: !bidFlag
          ? intl.get(`ssrc.inquiryHall.model.inquiryHall.RFXcheckPricer`).d('核价员')
          : intl.get(`ssrc.inquiryHall.model.inquiryHall.BIDcheckPricer`).d('定标员'),
        ignore: 'always',
        lovCode: 'SSRC.TENANT.USER',
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
        name: 'observeLov',
        type: 'object',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.observePerson`).d('观察员'),
        ignore: 'always',
        multiple: true,
        lovCode: 'SSRC.TENANT.USER',
        textField: 'realName',
        valueField: 'id',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { organizationId = null } = dataSet.queryParameter.commonProps || {};
            return {
              organizationId,
            };
          },
        },
      },
    ],
  };
};
export default OrganizationAndStaffFormDS;
