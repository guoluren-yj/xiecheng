import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

const ObjectSelectDS = (domainId, flag, selectedDS?) => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: true,
    pageSize: 10,
    queryFields: [
      {
        name: 'businessObjectCode',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectCode').d('对象编码'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectName').d('对象名称'),
      },
    ],
    fields: [
      {
        name: 'businessObjectCode',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectCode').d('对象编码'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectName').d('对象名称'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectDescription').d('对象描述'),
      },
    ],
    transport: {
      read: ({ params }) => ({
        url: `${lowcodeOrganizationURL({
          route: HZERO_HMDE,
        })}/business-objects/list-by-tenant`,
        method: 'GET',
        params: {
          ...params,
          domainId,
          publishedFlag: false,
          ignoreEnabledFlag: true,
        },
      }),
    },
    events: {
      load: ({ dataSet }) => {
        const selectedData = selectedDS.toData() || [];
        const codeArray = selectedData?.map((item) => item?.businessObjectCode);
        dataSet.forEach((i) => {
          if (codeArray?.includes(i?.get('businessObjectCode'))) {
            Object.assign(i, { selectable: false });
          }
        });
      },
    },
  } as DataSetProps;
};

const SelectedListDS = () => {
  return {
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: false,
    fields: [
      {
        name: 'businessObjectCode',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectCode').d('对象编码'),
      },
      {
        name: 'businessObjectName',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectName').d('对象名称'),
      },
      {
        name: 'remark',
        type: 'string',
        label: intl.get('hmde.bo.view.message.header.objectDescription').d('对象描述'),
      },
      {
        name: 'businessObjectId',
        type: 'string',
      },
    ],
  } as DataSetProps;
};

export { ObjectSelectDS, SelectedListDS };
