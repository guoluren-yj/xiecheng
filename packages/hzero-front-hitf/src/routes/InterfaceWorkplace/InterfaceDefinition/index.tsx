import React, { useMemo, useCallback, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import { DataSet, Button, TextField } from 'choerodon-ui/pro';
import { SelectionMode, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import withProps from 'hzero-front/lib/utils/withProps';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'hzero-front/lib/utils/intl';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { omit } from 'lodash';

import { listTableDS } from '@/stores/InterfaceDefinition/InterfaceDefinitionDS';

import tagRender from '@/utils/TagRender';

import styles from './index.less';

const InterfaceDefinition: React.FC<any> = ({ history, tableDs }) => {

  useEffect(() => {
    tableDs.query(tableDs.currentPage);
  }, []);
  // 检索
  const handleSearch = (params) => {
    let filterValues: { interfaceCode?: string } = params;
    const { interfaceCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty', 'tenantLov']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      interfaceName: interfaceCode,
    });
    tableDs.query();
  };

  // 编辑接口
  const handleEdit = useCallback((serviceType, interfaceId) => {
    if (serviceType === 'external') {
      history.push({
        pathname: `/hitf/interface-configuration-workbench/interface-definition/detail/${interfaceId}`,
        state: {
          selectedData: {
            serviceType: 'external',
          },
        },
      });
    } else {
      history.push({
        pathname: `/hitf/interface-configuration-workbench/interface-definition/detail/${interfaceId}`,
        state: {
          selectedData: {
            serviceType: 'inside',
          },
        },
      });
    }
  }, []);

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
        name: 'interfaceCode',
        renderer: ({ value, record }) => {
          const { interfaceId = '', serviceType = '' } = record ? record.get(['interfaceId', 'serviceType']) : {};
          return (
            <span
              className={styles['link-span']}
              onClick={() => handleEdit(serviceType, interfaceId)}
            >
              {value}
            </span>
          );
        },
      },
      {
        name: 'interfaceName',
      },
      { name: 'tenantName' },
      { name: 'applicationTypeMeaning' },
      { name: 'interfaceTypeMeaning' },
      { name: 'interfaceStandardTypeMeaning' },
      { name: 'requestMethodMeaning' },
      { name: 'publishTypeMeaning' },
      { name: 'creationName' },
      { name: 'creationDate' },
    ],
    [],
  );

  const handleCreate = useCallback(() => {
    history.push({
      pathname: '/hitf/interface-configuration-workbench/interface-definition/create-detail',
      state: {
        selectedData: {
          serviceType: 'external',
          interfaceStandardType: 'secondAlter',
        },
      },
    });
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 226px)' }}>
      <SearchBarTable
        searchCode='HITF.INTERFACE_CONFIGURATION_WORKBENCH.API.DEFINITION'
        selectionMode={SelectionMode.none}
        buttons={[
          <Button
            icon='playlist_add'
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            onClick={handleCreate}
          >
            {intl.get('hzero.common.btn.add').d('新增')}
          </Button>,
        ]}
        columns={columns}
        dataSet={tableDs}
        cacheState
        searchBarConfig={{
          autoQuery: false,
          left: {
            render: (_, dataSet) => {
              return (
                <TextField
                  clearButton
                  dataSet={dataSet}
                  name='interfaceCode'
                  placeholder={intl
                    .get('hitf.interface.definition.filter.codeAndName')
                    .d('请输入接口编码、接口名称查询')}
                  prefix={<Icon type='search' />}
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
  code: ['hzero.common', 'hitf.common', 'hitf.application', 'hitf.interface'],
})(withProps(() => {
  const tableDs = new DataSet(listTableDS());
  return { tableDs };
}, {
  cacheState: true,
})(InterfaceDefinition)));

