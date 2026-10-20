import { isEmpty } from 'lodash';
import intl from 'utils/intl';

// import { STRICT_URL } from 'utils/regExp';

// 业务信息DS
const bussinessDS = () => ({
  fields: [
    {
      name: 'businessType',
      type: 'string',
      // required: true,
      multiple: true,
      defaultValue: 'sale',
      label: intl.get('spfm.enterprise.model.business.businessType').d('主要身份'),
      lookupCode: 'SPFM.MASTER.STATUS',
      disabled: true,
      help: intl
        .get('spfm.business.view.business.saleMessage')
        .d('如果您是采购方，请在完成认证后联系您的项目经理/运维经理申请权限'),
    },
    {
      name: 'interBusinessShield',
      type: 'boolean',
      defaultValue: 0,
      trueValue: 1,
      falseValue: 0,
      label: intl
        .get(`spfm.enterprise.model.message.interBusinessShield`)
        .d('不允许其他企业找到我'),
    },
    {
      name: 'serviceType',
      type: 'string',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.serviceType').d('经营性质'),
      lookupCode: 'SPFM.BUSINESS.NATURE',
      dynamicProps: {
        required: ({ dataSet }) => {
          return !dataSet.getState('personalFlag');
        },
      },
    },
    {
      name: 'industryList',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
      dynamicProps: {
        required: ({ dataSet }) => {
          return !dataSet.getState('personalFlag');
        },
      },
    },
    {
      name: 'industryCategoryList',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
      dynamicProps: {
        disabled: ({ record }) => {
          const disabledFlag = isEmpty(record.get('industryList'));
          return disabledFlag;
        },
        required: ({ dataSet }) => {
          return !dataSet.getState('personalFlag');
        },
      },
    },
    {
      name: 'serviceAreaList',
      multiple: true,
      label: intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围'),
      dynamicProps: {
        required: ({ dataSet }) => {
          return !dataSet.getState('personalFlag');
        },
      },
    },
    {
      name: 'website',
      type: 'string',
      // pattern: STRICT_URL,
      label: intl.get('spfm.enterprise.model.business.website').d('公司官网'),
    },
    {
      name: 'logoUrl',
    },
    {
      name: 'description',
      type: 'string',
      label: intl.get('spfm.enterprise.model.business.description').d('公司简介'),
    },
  ],
});

export { bussinessDS };
