import { toJS } from 'mobx';
import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

export default (domainId, tenantInfoRef) => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'allowUpdateObject',
        label: intl.get('hmde.bo.field.extendField.allowUpdateObject').d('允许更新的业务对象'),
        type: 'object',
        multiple: true,
        // unique: true,
        ignore: 'always',
        lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
        lovQueryAxiosConfig: {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-objects/list-by-tenant?publishedFlag=false`,
          method: 'GET',
          params: { domainId },
        },
      },
      {
        name: 'editListBtn',
        ignore: 'always',
      },
    ],
    transport: {
      submit: ({ dataSet }) => {
        const selectData = toJS(dataSet?.getState('selectData'));
        return {
          url: `${lowcodeOrganizationURL({
            route: HZERO_HMDE,
          })}/business-objects/batch-enabled-sync`,
          data: selectData,
          method: 'PUT',
          params: { tenantId: tenantInfoRef?.current },
        };
      },
    },
    events: {
      update: ({ name, value, dataSet }) => {
        if (name === 'allowUpdateObject' && value) {
          const params = value.map((i) => ({
            objectVersionNumber: i?.objectVersionNumber,
            businessObjectId: i.businessObjectId,
          }));
          dataSet.setState('selectData', params);
          dataSet.submit();
        }
      },
    },
  } as DataSetProps;
};
