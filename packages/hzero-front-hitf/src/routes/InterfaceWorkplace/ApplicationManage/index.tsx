/* eslint-disable camelcase */
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'choerodon-ui';
import { DataSet, Button, TextField } from 'choerodon-ui/pro';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'hzero-front/lib/utils/intl';

import { omit } from 'lodash';

import { listTableDS } from '@/stores/ApplicationManage/ApplicationManageDS';

import tagRender from '../../../utils/TagRender';

import styles from './index.less';

const ApplicationManage: React.FC<any> = () => {
  const tableDs = useMemo(() => new DataSet(listTableDS()), []);

  // 检索
  const handleSearch = (params) => {
    let filterValues: { creationDate_range?: string, applicationCode?: string } = params;
    const { creationDate_range = '', applicationCode = '' } = filterValues;
    const creationDate: String[] = creationDate_range ? creationDate_range.split(',') : [];
    filterValues = omit(filterValues, ['__dirty', 'tenantLov', 'creationDate_range']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      applicationName: applicationCode,
      creationDateFrom: creationDate[0],
      creationDateTo: creationDate[1],
    });
    tableDs.query();
  };

  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'statusMeaning',
        width: 110,
        renderer: ({ value, record }) => {
          const status = record ? record.get('status') : '';
          return <span>{tagRender(status, value)}</span>;
        },
      },
      {
        name: 'applicationCode',
        renderer: ({ value, record }) => {
          const applicationHeaderId = record ? record.get('applicationHeaderId') : '';
          return (
            <Link to={`/hitf/interface-configuration-workbench/application-manage/detail/${applicationHeaderId}`}>
              <span
                className={styles['link-span']}
              >
                {value}
              </span>
            </Link>
          );
        },
      },
      {
        name: 'applicationName',
      },
      { name: 'applicationTypeMeaning' },
      { name: 'comments' },
      { name: 'dataSourceMeaning' },
      { name: 'tenantName' },
      { name: 'creationName' },
      { name: 'creationDate' },
    ],
    []
  );

  return (
    <div style={{ height: 'calc(100vh - 226px)' }}>
      <SearchBarTable
        searchCode="HITF.INTERFACE_CONFIGURATION_WORKBENCH.APPMANAGE.FILTER"
        selectionMode={SelectionMode.none}
        buttons={[
          <Link to='/hitf/interface-configuration-workbench/application-manage/create-detail'>
            <Button
              icon='playlist_add'
              funcType={FuncType.flat}
              color={ButtonColor.primary}
            >
              {intl.get('hzero.common.btn.add').d('新增')}
            </Button>
          </Link>,
        ]}
        columns={columns}
        dataSet={tableDs}
        border={false}
        cacheState
        searchBarConfig={{
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name="applicationCode"
                  placeholder={
                    intl
                      .get('hitf.application.filter.codeAndName')
                      .d('请输入应用编码、应用名称查询')
                  }
                  prefix={<Icon type="search" />}
                  style={{ width: '280px', margin: '0 20px 4px 0', zIndex: 0 }}
                />
              );
            },
          },
          closeFilterSelector: true,
          onQuery: ({ params }) => handleSearch(params),
          fieldProps: {
            tenantId: {
              lovPara: {
                tenantId: undefined,
              },
            },
          },
        }}
        autoHeight={{ type: TableAutoHeightType.maxHeight, diff: -70 }}
      />
    </div>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(ApplicationManage));

