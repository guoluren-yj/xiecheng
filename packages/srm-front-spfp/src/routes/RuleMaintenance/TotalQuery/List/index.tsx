/*
 * @Description: 优惠政策规则维护
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Fragment } from 'react';
import { observer } from 'mobx-react';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';

import WholeTable from './components/WholeTable';
import StoreProvider from './stores';


const prefix = `spfp.ruleMaintenance`;

const List = observer(() =>
{


  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.rulesMaintenanceQuery`).d('规则汇总查询')} />
      <Content>
        <WholeTable />
      </Content>
    </Fragment>
  );
});

const RuleMaintenance = props =>
{
  return (
    <StoreProvider {...props}>
      <List />
    </StoreProvider>
  );
};
export default RuleMaintenance;