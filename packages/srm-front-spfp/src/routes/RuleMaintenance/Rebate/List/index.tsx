/*
 * @Description: 优惠政策规则维护
 * @Author: yan.xie <yan.xie@gong-link.com>
 * @Date: 2023-03-01 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2023, Hand
 */
import React, { Fragment, useContext } from 'react';
import { Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import { Header, Content } from 'components/Page';
import intl from 'utils/intl';

import type { StoreValueType } from './stores';
import StoreProvider, {
  Store,
} from './stores';
import WholeTable from './components/WholeTable';

const prefix = `spfp.ruleMaintenance`;

const List = observer(() =>
{

  const { handleToDetail } = useContext<StoreValueType>(Store);


  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.rebateMaintenance`).d('返利规则维护')}>
        <Button color={ButtonColor.primary} icon="add" onClick={() => handleToDetail()}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
      </Header>
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