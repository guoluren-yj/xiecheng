// import { getCurrentOrganizationId } from 'utils/utils';
// import { SMALL_ORDER } from '_utils/config';
import intl from 'utils/intl';

const tableDs = () => ({
  autoQuery: false,
  selection: false,
  queryFields: [
    {
      label: intl.get('smop.common.model.serviceName').d('服务名称'),
      type: 'string',
      name: 'name',
    },
    {
      label: intl.get('smop.common.view.joinClassify').d('对接分类'),
      name: 'menuDeployId',
      lookupCode: 'SOP.MENU',
      valueField: 'menuDeployId',
      textField: 'title',
    },
  ],
  fields: [
    {
      label: intl.get('smop.common.model.serviceName').d('服务名称'),
      type: 'string',
      name: 'name',
    },
    {
      label: intl.get('smop.common.model.introduction').d('简介'),
      type: 'string',
      name: 'introduction',
    },
    {
      name: 'necessity',
      type: 'string',
      label: intl.get('smop.common.model.necessity').d('必须要性'),
    },
    {
      label: intl.get('smop.common.model.interactionMode').d('交互方式'),
      type: 'string',
      name: 'interactionMode',
    },
    {
      label: intl.get('smop.common.model.dailRequestAmount').d('日请求总量'),
      type: 'string',
      name: 'dailRequestAmount',
    },
    {
      label: intl.get('smop.common.model.status').d('状态'),
      name: 'status',
    },
    {
      label: intl.get('smop.common.model.operation').d('操作'),
      type: 'string',
      name: 'operation',
    },
    {
      label: intl.get('smop.common.view.joinClassify').d('对接分类'),
      name: 'menuDeployName',
    },
  ],
  transport: {
    read: ({ data }) => {
      // const { queryParams = {}, ...rest } = data;
      // const { params = {} } = queryParams;
      return {
        url: `/sop/v1/service-deploy/query`,
        method: 'GET',
        data,
      };
    },
  },
});

const formDs = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      label: intl.get('smop.common.view.joinClassify').d('对接分类'),
      name: 'menuDeployId',
      lookupCode: 'SOP.MENU',
      type: 'string',
      valueField: 'menuDeployId',
      textField: 'title',
      required: true,
    },
    {
      label: intl.get('smop.common.model.interfaceCode').d('接口编码'),
      name: 'interfaceCode',
      required: true,
    },
    {
      label: intl.get('smop.common.model.serviceName').d('服务名称'),
      type: 'string',
      name: 'name',
      required: true,
    },
    {
      label: intl.get('smop.common.model.introduction').d('简介'),
      type: 'string',
      name: 'introduction',
      required: true,
    },
    {
      label: intl.get('smop.common.model.dailRequestAmount').d('日请求总量'),
      name: 'dailRequestAmount',
      required: true,
    },
    {
      label: intl.get('smop.common.model.interactionMode').d('交互方式'),
      name: 'interactionMode',
      lookupCode: 'SOP.INTERACTION_MODE',
      type: 'string',
      required: true,
    },
    {
      label: intl.get('smop.common.model.caller').d('调用方'),
      type: 'string',
      name: 'caller',
      required: true,
    },
    {
      label: intl.get('smop.common.model.necessity').d('必要性'),
      name: 'necessity',
      lookupCode: 'SOP.NECESSITY',
      required: true,
    },
    {
      name: 'status',
      label: intl.get('smop.common.model.yesOrnoOpen').d('是否开放'),
      lookupCode: 'SOP.MENU_STATUS',
      required: true,
    },
    {
      name: 'detailsLink',
      label: intl.get('smop.common.model.detailsLink').d('详情菜单连接'),
      lookupCode: 'SOP.MENU',
      valueField: 'menuDeployId',
      type: 'string',
      textField: 'title',
      required: true,
    },
  ],
});

export { tableDs, formDs };
