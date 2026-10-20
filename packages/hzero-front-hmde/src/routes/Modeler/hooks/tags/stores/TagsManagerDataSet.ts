import { API_HOST } from 'utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const BASICS = API_HOST;

export default (labelId?: string): DataSetProps => ({
  autoQuery: false,
  autoQueryAfterSubmit: true,
  selection: false,
  autoCreate: true,
  transport: {
    read: ({ params }) => {
      const _params = { ...params };
      return {
        url: `${BASICS}/${lowcodeOrganizationURL()}/${labelId ? `labels/${labelId}` : 'labels'}`,
        method: 'GET',
        params: _params,
      };
    },
    submit: ({ data }) => ({
      url: `${BASICS}/${lowcodeOrganizationURL()}/labels`,
      data: { ...data[0] },
      method: 'POST',
    }),
    update: ({ data }) => {
      const record = data[0];
      return {
        url: `${BASICS}/${lowcodeOrganizationURL()}/labels`,
        data: { ...record },
        method: 'PUT',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${BASICS}/${lowcodeOrganizationURL()}/labels`,
        method: 'delete',
        data: data.map(({ labelId: id }) => id),
      };
    },
  },
  fields: [
    {
      name: 'labelName',
      type: FieldType.string,
      required: true,
      defaultValidationMessages: {
        valueMissingNoLabel: '请输入标签名称',
      },
    },
    {
      name: 'labelCode',
      type: FieldType.string,
      required: true,
      unique: true,
      disabled: !!labelId,
      defaultValidationMessages: {
        valueMissingNoLabel: '请输入标签编码',
      },
    },
    {
      name: 'color',
      type: FieldType.string,
      required: true,
      defaultValue: '#29bece',
      defaultValidationMessages: {
        valueMissingNoLabel: '请输入标签颜色',
      },
    },
  ],
});
