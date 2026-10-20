import React, { Fragment, useContext, useMemo } from 'react';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

import StoreProvider from './stores';
import WholeTable from './components/WholeTable';
import type { StoreValueType } from './stores/index';
import { Store } from './stores/index';
import { TableCustomizeCodes, TableCustomizeCodesBTNS } from '../utils/type';
import { formatDynamicBtns } from '../../../utils/utils';

const prefix = `spfp.rebateOrderCaculate`;
const organizationId = getCurrentOrganizationId();

const List = observer(() =>
{
  const { tableDs, customizeBtnGroup, remote } = useContext<StoreValueType>(Store);
  const { selected } = tableDs;

  const exportParams = useMemo(() =>
  {
    return { executeRecordIdList: selected.map(record => record.get('executeRecordId')) };
  }, [selected]);

  const headerBtns = useMemo(() => {
    const btns = [
      {
        name: 'newExports',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: intl.get(`spfp.common.button.selectedExport`).d('勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            disabled: isEmpty(selected) as unknown as string,
          },
          requestUrl: `/ssta/v1/${organizationId}/rebates-engine-export/all?customizeUnitCode=${Object.values(TableCustomizeCodes).join()}`,
          queryParams: exportParams,
          templateCode: 'SRM_C_SPFP_REBATES_EXECUTE_EXPORT_ALL',
          method: 'POST',
          allBody: true,
        },
      },
    ];
    const processBtns = remote
      ? remote.process('SPFP.REBATE_ORDER_CALCULATE_LIST_CUX.BTNS', btns, {
          tableDs,
          selected,
        })
      : btns;
    return formatDynamicBtns(processBtns);
  }, [exportParams, selected, tableDs, remote]);

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.title.rebateOrderCalculate`).d('返利出单计算明细表')}>
        {customizeBtnGroup(
          {
            code: TableCustomizeCodesBTNS,
            pro: true,
          },
          <DynamicButtons
            maxNum={5}
            defaultBtnType="c7n-pro"
            buttons={headerBtns}
          />
        )}
      </Header>
      <Content>
        <WholeTable />
      </Content>
    </Fragment>
  );
});

const RebateOrderCalculate = props =>
{
  return (
    <StoreProvider {...props}>
      <List />
    </StoreProvider>
  );
};

export default RebateOrderCalculate;
