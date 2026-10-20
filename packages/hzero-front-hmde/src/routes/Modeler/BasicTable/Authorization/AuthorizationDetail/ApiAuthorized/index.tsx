/* eslint-disable no-undef */
import React, { useMemo, useEffect, useContext } from 'react';
import { Table, DataSet, Form, TextField, Button, CheckBox } from 'choerodon-ui/pro';
import { Tooltip } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import {
  ColumnAlign,
  TableColumnTooltip,
  TableQueryBarType,
} from 'choerodon-ui/pro/lib/table/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form.d';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import apiTableDS from './apiTableDS';
import Distribute from './PermissionAssignmentModal';
import styles from '../index.less';

export default observer(function Index() {
  const {
    storeData: { tenantId },
  }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
  const apiTableDs = useMemo(() => new DataSet(apiTableDS(tenantId)), [tenantId]);

  useEffect(() => {
    init();
  }, [tenantId]);

  // 初始化
  const init = async () => {
    if ([0].includes(tenantId as any) || tenantId) {
      apiTableDs.query();
    }
  };

  const distributeProps = {
    init,
  };

  const columns = useMemo(
    () => [
      {
        name: 'serviceCode',
        tooltip: TableColumnTooltip.overflow,
      },
      {
        name: 'createApiFlag',
        editor: () => <CheckBox name="createApiFlag">创建API结构</CheckBox>,
      },
      {
        name: 'allApiFlag',
        editor: () => <CheckBox name="allApiFlag">全部授权</CheckBox>,
      },
      {
        name: 'command',
        align: ColumnAlign.center,
        tooltip: TableColumnTooltip.overflow,
        renderer: ({ record }: any) =>
          record.get('allApiFlag') ? (
            <Tooltip title="当前服务的全部可用API结构已授权">
              <Button disabled funcType={FuncType.flat}>
                权限分配
              </Button>
            </Tooltip>
          ) : (
            <Distribute {...record.data} {...distributeProps} />
          ),
      },
    ],
    []
  );

  const queryDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            label: '服务名称',
            name: 'filterName',
            type: 'string' as FieldType,
            labelWidth: 20 as any,
          },
        ],
        events: {
          update: ({ value }) => {
            handleSearch(value);
          },
        },
      } as DataSetProps),
    []
  );

  // 搜索过滤
  const handleSearch = async (val: string) => {
    apiTableDs.setQueryParameter('serviceCode', val);
    apiTableDs.query();
  };

  return (
    <React.Fragment>
      <div className={styles['search-wrapper']}>
        <Form labelLayout={'horizontal' as LabelLayoutType} dataSet={queryDs}>
          <TextField name="filterName" placeholder="搜索字段名称" />
        </Form>
        <div className={styles['search-button-wrapper']}>
          <Button
            color={ButtonColor.primary}
            onClick={() => handleSearch(queryDs.current?.get('filterName'))}
          >
            查询
          </Button>
        </div>
      </div>
      <Table
        className={styles['api-table']}
        dataSet={apiTableDs}
        queryBar={TableQueryBarType.none} // 不加时默认dom结构和演示环境不一致
        columns={columns}
        autoHeight
      />
    </React.Fragment>
  );
});
