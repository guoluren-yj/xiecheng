import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from 'choerodon-ui';
import { DataSet, Button, TextField } from 'choerodon-ui/pro';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';

import intl from 'hzero-front/lib/utils/intl';

import { omit } from 'lodash';

import { Content, Header } from 'hzero-front/lib/components/Page';

import { listTableDS } from '@/stores/ApplicationManage/ApplicationManageDS';

import tagRender from '@/utils/TagRender';

import styles from './index.less';

const ApplicationManage: React.FC<any> = ({ history }) => {
  const tableDs = useMemo(() => new DataSet(listTableDS()), []);

  // 检索
  const handleSearch = (params) => {
    let filterValues: { creationDate_range?: string, applicationCode?: string } = params;
    // eslint-disable-next-line camelcase
    const { creationDate_range = '', applicationCode = '' } = filterValues;
    const creationDate: String[] = creationDate_range.split(',');
    filterValues = omit(filterValues, ['__dirty', 'tenantLov', 'creationDate_range']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      applicationName: applicationCode,
      // eslint-disable-next-line camelcase
      creationDateFrom: creationDate_range ? creationDate[0]
        : null,
      // eslint-disable-next-line camelcase
      creationDateTo: creationDate_range ? creationDate[1]
        : null,
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
            <Link to={`/hitf/application-manage/detail/${applicationHeaderId}`}>
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
    <>
      <Header title={intl.get('hitf.application.view.title.header').d('应用管理')}>
        <Button
          icon="add"
          color={ButtonColor.primary}
          onClick={() => {
            history.push({
              pathname: `/hitf/application-manage/create-detail`,
            });
          }}
        >
          {intl.get('hzero.common.button.creation').d('新建')}
        </Button>
      </Header>
      <Content>
        <SearchBarTable
          searchCode="HITF.APPLICATION_MANAGE.FILTER"
          selectionMode={SelectionMode.none}
          columns={columns}
          dataSet={tableDs}
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
            onQuery: ({ params }) => handleSearch(params),
            fieldProps: {
              tenantId: {
                lovPara: {
                  tenantId: undefined,
                },
              },
            },
          }}
          autoHeight={{ type: TableAutoHeightType.maxHeight, diff: 0 }}
        />
      </Content>
    </>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(ApplicationManage));

