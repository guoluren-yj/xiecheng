import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SPUC } from '_utils/config';
import { DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const modelPrompt = 'sinv.common.model.common';
const organizationId = getCurrentOrganizationId();

function getColumnsAndDataSet(params) {
  const { asnHeaderId, ...others } = params;
  const OperationDs = new DataSet({
    selection: false,
    autoQuery: true,
    queryFields: [
      {
        name: 'processDateFrom',
        type: 'dateTime',
        label: intl.get(`${modelPrompt}.operatorDateFrom`).d('操作时间从'),
      },
      {
        name: 'processDateTo',
        type: 'dateTime',
        label: intl.get(`${modelPrompt}.operatorDateTo`).d('操作时间至'),
      },
    ],
    fields: [
      {
        label: intl.get(`${modelPrompt}.lastUpdatedName`).d('操作人'),
        name: 'processUser',
      },
      {
        label: intl.get(`${modelPrompt}.operatorDate`).d('操作时间'),
        name: 'processDate',
      },
      {
        label: intl.get(`${modelPrompt}.processStatusMeaning`).d('动作'),
        name: 'processStatusMeaning',
      },
      {
        label: intl.get(`${modelPrompt}.explain`).d('说明'),
        name: 'processRemark',
      },
      {
        label: intl.get(`${modelPrompt}.changeAction`).d('变更动作'),
        name: 'changeTypeName',
      },
      {
        label: intl.get(`${modelPrompt}.changeField`).d('变更内容'),
        name: 'changeFieldNameMeaning',
      },
      {
        label: intl.get(`${modelPrompt}.beforeModification`).d('修改前'),
        name: 'oldDisplayValue',
      },
      {
        label: intl.get(`${modelPrompt}.afterModification`).d('修改后'),
        name: 'newDisplayValue',
      },
    ],

    transport: {
      read({ data }) {
        return {
          url: `${SRM_SPUC}/v1/${organizationId}/asn-header/${asnHeaderId}/action`,
          method: 'GET',
          data: { ...data, ...others },
        };
      },
    },
  });
  const columns = [
    {
      title: intl.get(`${modelPrompt}.statusChangeRecord`).d('状态变更记录'),
      children: [
        {
          name: 'processUser',
          width: 80,
        },
        {
          name: 'processDate',
          width: 150,
        },
        {
          name: 'processStatusMeaning',
          width: 80,
        },
        {
          name: 'processRemark',
          width: 100,
        },
      ],
    },
    {
      title: intl.get(`${modelPrompt}.dataChangeRecord`).d('数据变更记录'),
      children: [
        {
          name: 'changeTypeName',
          width: 80,
        },
        {
          name: 'changeFieldNameMeaning',
          width: 100,
        },
        {
          name: 'oldDisplayValue',
          width: 80,
        },
        {
          name: 'newDisplayValue',
          width: 80,
        },
      ],
    },
  ];
  return { OperationDs, columns };
}

export default getColumnsAndDataSet;
