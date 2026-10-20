/* eslint-disable eqeqeq */
import React from 'react';
import intl from 'utils/intl';
import { Table } from 'choerodon-ui/pro';
import Lov from '@/components/Lov';

const { Column } = Table;

const LovListTable = props => {
  const { lovListDS } = props;

  return (
    <Table dataSet={lovListDS}>
      <Column name="viewCode" />
      <Column name="viewName" width={150} />
      <Column name="lovCode" width={150} />
      <Column name="lovName" width={150} />
      <Column
        name="operation"
        width={150}
        lock="right"
        renderer={({ record }) => {
          const { viewCode = '', tenantId = 0 } = record.get(['viewCode', 'tenantId']);
          return (
            <Lov
              code={viewCode}
              isButton
              originTenantId={tenantId}
              queryParams={{ tenantId }}
              // TODO: 使用了没有暴露的属性 prefixCls
              href={undefined}
              prefixCls=""
              style={{ color: '#29BECE', fontWeight: 'inherit', padding: '0' }}
              okButtonProps={{ style: { display: 'none' } }}
              cancelButtonProps={{ type: 'primary' }}
              cancelText={intl.get('sdps.dataSheet.view.option.ok').d('确定')}
              rowSelection={false}
              btnText={`${intl.get('sdps.dataSheet.view.option.preview').d('预览')} `}
            />
          );
        }}
      />
    </Table>
  );
};

export default LovListTable;
