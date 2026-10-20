import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { ScriptAbstractPageInfo } from 'services/scriptEventService';
import { IStore } from '../store';

export default function constructTableDataSet(props: { store: IStore; setCurParams }) {
  const { setCurParams } = props;
  const material: DataSetProps = {
    primaryKey: 'code',
    autoQuery: false,
    selection: false,
    pageSize: 20,
    queryFields: [
      {
        name: 'keyword',
        type: FieldType.string,
        label: '搜索脚本名称/编码',
        labelWidth: '120',
      },
    ],
    fields: [
      {
        name: 'scriptName',
        type: FieldType.string,
        label: '脚本名称',
        required: true,
        maxLength: 30,
      },
      {
        name: 'scriptCode',
        type: FieldType.string,
        label: '脚本编码',
        required: true,
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        label: '所属租户',
        required: true,
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: '描述',
        required: true,
      },
      {
        name: 'enabledFlag',
        type: FieldType.number,
        label: '启用状态',
        required: true,
      },
    ],

    transport: {
      read: {
        url: `${lowcodeOrganizationURL({ route: HZERO_HMDE })}/scripts`,
        method: 'get',
        transformResponse: (rawResponse) => {
          const response = JSON.parse(rawResponse) as ScriptAbstractPageInfo;
          props.store.setState('scriptAbstractPageInfo', response);
          return response;
        },
      },
    },
    events: {
      query: ({ params }) => {
        setCurParams(params);
      },
    },
  };

  return new DataSet(material);
}
