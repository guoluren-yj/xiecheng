import React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { Observer } from 'mobx-react';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table.d';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  TableColumnTooltip,
  TableQueryBarType,
  ColumnAlign,
} from 'choerodon-ui/pro/lib/table/enum';

import { HZERO_HMDE } from '@/utils/config';
import { lowcodeOrganizationURL } from '@/utils/common';

interface IEditListModal {
  domainId?: string;
  formDisabled?: boolean;
}
const EditListModal = ({ domainId, formDisabled }: IEditListModal) => {
  const buttons = React.useMemo(() => ['delete'], []);

  const editListDs = React.useMemo(
    () =>
      new DataSet({
        autoQuery: false,
        primaryKey: 'businessObjectCode',
        queryFields: [
          {
            label: intl.get('hmde.domain.model.header.objectName').d('对象名称'),
            name: 'businessObjectName',
            type: 'string',
          },
          {
            label: intl.get('hmde.domain.model.header.objectCode').d('对象编码'),
            name: 'businessObjectCode',
            type: 'string',
          },
        ],
        fields: [
          {
            label: intl.get('hmde.domain.model.header.objectName').d('对象名称'),
            name: 'businessObjectName',
            type: 'string',
            maxLength: 60,
          },
          {
            label: intl.get('hmde.domain.model.header.objectCode').d('对象编码'),
            name: 'businessObjectCode',
            type: 'string',
          },
          {
            label: intl.get('hmde.domain.model.header.objectRemark').d('对象描述'),
            name: 'remark',
            type: 'string',
          },
        ],
        transport: {
          read: ({ params }) => {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/business-objects/page?physicalSyncFlag=true`,
              method: 'GET',
              params,
            };
          },
          submit: ({ data }) => {
            return {
              url: `${lowcodeOrganizationURL({
                route: HZERO_HMDE,
              })}/business-objects/batch-disabled-sync`,
              data,
              method: 'PUT',
            };
          },
        },
        events: {},
      } as DataSetProps),
    []
  );

  React.useEffect(() => {
    if (domainId) {
      editListDs.setQueryParameter('domainId', domainId);
      editListDs.query();
    }
  }, []);

  const thisColumns = React.useMemo(
    () => [
      {
        align: ColumnAlign.center,
        tooltip: TableColumnTooltip.overflow,
        name: 'businessObjectName',
      },
      {
        align: ColumnAlign.center,
        tooltip: TableColumnTooltip.overflow,
        name: 'businessObjectCode',
      },
      {
        align: ColumnAlign.center,
        tooltip: TableColumnTooltip.overflow,
        name: 'remark',
      },
    ],
    []
  );
  return (
    <Observer>
      {() => (
        <Table
          buttons={formDisabled ? undefined : (buttons as Buttons[])}
          dataSet={editListDs}
          queryBar={TableQueryBarType.filterBar}
          queryBarProps={{
            fuzzyQueryPlaceholder: intl.get('hmde.domain.model.query.nameOrCode').d('名称/编码'),
            dynamicFilterBar: { searchText: 'nameOrCode' },
          } as any}
          columns={thisColumns}
        />
      )}
    </Observer>
  );
};
export default formatterCollections({ code: ['hmde.domain'] })(EditListModal);
