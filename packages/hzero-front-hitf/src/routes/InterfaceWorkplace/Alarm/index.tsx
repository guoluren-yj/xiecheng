import React, { useMemo } from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { DataSet, Button, TextField } from 'choerodon-ui/pro';
import { Link } from 'react-router-dom';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column.d';
import { SelectionMode, TableColumnTooltip, TableAutoHeightType } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'hzero-front/lib/utils/intl';
import { omit } from 'lodash';
import { Icon } from 'choerodon-ui';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import tagRender from '@/utils/TagRender';
import { listTableDS } from './ApplicationManageDS';

import styles from './index.less';

const Alarm: React.FC<any> = () => {
  const tableDs = useMemo(() => new DataSet(listTableDS()), []);
  // 检索
  const handleSearch = (params) => {
    let filterValues: { creationDate_range?: string, warnCode?: string } = params;
    // eslint-disable-next-line camelcase
    const { warnCode = '' } = filterValues;
    filterValues = omit(filterValues, ['__dirty', 'tenantLov']);
    tableDs.setQueryParameter('queryParams', {
      ...filterValues,
      warnName: warnCode,
    });
    tableDs.query();
  };
  const columns = useMemo(
    (): ColumnProps[] => [
      {
        name: 'status',
        width: 110,
        renderer: ({ value }) => {
          let state;
          if (value === '1') {
            state = '启用';
          }
          if (value === '0') {
            state = '禁用';
          }
          return value && <span>{tagRender(value, state)}</span>;
        },
      },
      {
        name: 'warnCode',
        renderer: ({ value, record }) => {
          const warnRuleId = record ? record.get('warnRuleId') : '';
          return (
            <Link to={`/hitf/interface-configuration-workbench/detail/${warnRuleId}`}>
              <span className={styles['api-link-span']}>
                {value}
              </span>
            </Link>
          );
        },
      },
      {
        name: 'warnName',
      },
      {
        name: 'applicationHeaders',
        width: 600,
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'remark',
      },
    ],
    [],
  );

  return (
    <div
      className={styles.content}
      style={{ height: 'calc(100vh - 226px)' }}
    >
      <SearchBarTable
        searchCode='HITF.INTERFACE_CONFIGURATION_WORKBENCH.ALARM.FILTER'
        selectionMode={SelectionMode.none}
        buttons={[
          <div className={styles['lov-btn']}>
            <Link to='/hitf/interface-configuration-workbench/create-detail'>
              <Button
                icon='playlist_add'
                funcType={FuncType.flat}
                color={ButtonColor.primary}
              >
                {intl.get('hzero.common.btn.add').d('新增')}
              </Button>
            </Link>
          </div>,
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
                  name='warnCode'
                  placeholder={
                    intl
                      .get('hitf.application.codeAndName')
                      .d('请输入告警代码、应用告警名称查询')
                  }
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
  code: ['hzero.common', 'hitf.common', 'hitf.InterfaceWorkplace', 'application', 'hitf.application'],
})(Alarm));
