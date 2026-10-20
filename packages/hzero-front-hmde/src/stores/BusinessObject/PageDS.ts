import intl from 'srm-front-boot/lib/utils/intl';
import { HZERO_HLOD } from '@/utils/config';
import { businessObjectPageNameCheck } from '@/services/businessObjectService';
import { lowcodeOrganizationURL } from '@/utils/common';

const pageDs = (businessObjectCode) => ({
  autoCreate: false,
  autoQuery: false,
  selection: false,
  queryFields: [
    {
      name: 'businessObjectPageName',
      type: 'string',
      label: intl.get('hmde.bo.page.name').d('页面布局名称'),
    },
    {
      name: 'businessObjectPageCode',
      type: 'string',
      label: intl.get('hmde.bo.page.code').d('页面布局代码'),
    },
    {
      name: 'sourceType',
      type: 'string',
      label: intl.get('hmde.bo.page.sourceType').d('页面布局来源'),
      lookupCode: 'HLOD.BUSINESS_OBJECT_PAGE.SOURCE_TYPE',
    },
  ],
  fields: [
    {
      name: 'businessObjectPageName',
      type: 'string',
      label: intl.get('hmde.bo.page.name').d('页面布局名称'),
      required: true,
      maxLength: 32,
      validator: async (value, nu, record) => {
        if (!record.get('businessObjectPageName')) {
          return intl.get('hmde.bo.message.LayoutNameError').d('页面布局名称不能为空');
        }

        if (value === record.getPristineValue('businessObjectPageName')) {
          return;
        }

        // 校验方法
        const query = {
          businessObjectCode,
          businessObjectPageName: value,
        };
        const res = await businessObjectPageNameCheck(query);
        if (res && res.failed) {
          return (
            res?.message ||
            intl
              .get('hmde.bo.message.LayoutNameErrorRepeat')
              .d('同一业务对象下页面布局名称/代码不能重复')
          );
        }
      },
    },
    {
      name: 'businessObjectPageCode',
      type: 'string',
      label: intl.get('hmde.bo.page.code').d('页面布局代码'),
      required: true,
      maxLength: 64,
      validator: async (value, nu, record) => {
        if (!record.get('businessObjectPageCode')) {
          return intl.get('hmde.bo.message.LayoutCodeError').d('页面布局代码不能为空');
        }

        if (value === record.getPristineValue('businessObjectPageCode')) {
          return;
        }

        // 校验方法
        const query = {
          businessObjectCode,
          businessObjectPageCode: value,
        };
        const res = await businessObjectPageNameCheck(query);
        if (res && res.failed) {
          return (
            res?.message ||
            intl
              .get('hmde.bo.message.LayoutNameErrorRepeat')
              .d('同一业务对象下页面布局名称/代码不能重复')
          );
        }
      },
    },
    {
      name: 'publishStatus',
      type: 'string',
      label: intl.get('hmde.bo.page.publishStatus').d('发布状态'),
    },
    {
      name: 'lowcodePageRoute',
      type: 'string',
      label: intl.get('hmde.bo.page.lowcodePageRoute').d('路由'),
    },
    {
      name: 'publishTime',
      type: 'string',
      label: intl.get('hmde.bo.page.publishTime').d('发布时间'),
    },
    {
      name: 'sourceType',
      type: 'string',
      label: intl.get('hmde.bo.page.sourceType').d('页面布局来源'),
      lookupCode: 'HLOD.BUSINESS_OBJECT_PAGE.SOURCE_TYPE',
    },
    {
      name: 'businessObjectPageType',
      type: 'string',
      label: intl.get('hmde.bo.page.type').d('页面布局分类'),
      lookupCode: 'HLOD.BUSINESS_OBJECT_PAGE.TYPE',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('hmde.common.label.remark').d('描述'),
    },
    {
      name: 'creator',
      type: 'string',
      label: intl.get('hmde.common.date.creator').d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get('hmde.common.date.creation').d('创建时间'),
    },
    {
      name: 'updater',
      type: 'string',
      label: intl.get('hmde.common.date.lastUpdatedBy').d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get('hmde.common.date.lastUpdateDate').d('更新时间'),
    },
    {
      name: 'enabledFlag',
      type: 'boolean',
      label: intl.get('hzero.common.status').d('状态'),
      trueValue: true,
      falseValue: false,
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-pages/page`,
        method: 'GET', // FIXME: method必须全大写 GET POST DELETE PUT
      };
    },
    create: () => {
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-pages`,
        method: 'POST', // FIXME: method必须全大写 GET POST DELETE PUT
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${lowcodeOrganizationURL({ route: HZERO_HLOD })}/business-object-pages`,
        method: 'DELETE', // FIXME: method必须全大写 GET POST DELETE PUT
        data: data[0],
      };
    },
    submit: ({ data }) => ({
      url: `${lowcodeOrganizationURL({
        route: HZERO_HLOD,
      })}/business-object-pages/update-page-info`,
      method: 'POST',
      data: data[0],
    }),
  },
});

export { pageDs };
