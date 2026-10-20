import React, { Fragment, useContext, useMemo, useCallback } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import WholeTable from './components/WholeTable';
import DetailTable from './components/DetailTable';
import { ActiveKey, DetailGridCustCode, DetailSearchCustCode, ListTabsCustCode, WholeGridCustCode, WholeSearchCustCode } from '../utils/type';

const { TabPane, TabGroup } = Tabs;

const ExportTabParam: Record<ActiveKey, string> = {
  [ActiveKey.WholeAll]: 'ALL',
  [ActiveKey.WholeProgress]: 'EXECUTING',
  [ActiveKey.WholeNotStart]: 'EFFECTIVE',
  [ActiveKey.DetailAll]: 'ALL',
  [ActiveKey.DetailProgress]: 'EXECUTING',
  [ActiveKey.DetailNotStart]: 'EFFECTIVE',
};
const GridCustCode = { ...WholeGridCustCode, ...DetailGridCustCode };
const SearchCustCode = { ...WholeSearchCustCode, ...DetailSearchCustCode };

const List = observer(() => {
  const {
    dsMap,
    activeKey,
    handleTabChange,
    customizeTabPane,
  } = useContext(Store) as StoreValueType;

  const currentTableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);
  const { selected } = currentTableDs;

  const wholeTabColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.WholeNotStart,
        tab: intl.get(`ssta.paymentPlan.view.title.notStart`).d('未开始'),
      },
      {
        key: ActiveKey.WholeProgress,
        tab: intl.get(`ssta.paymentPlan.view.title.progress`).d('执行中'),
      },
      {
        key: ActiveKey.WholeAll,
        tab: intl.get(`ssta.paymentPlan.view.title.all`).d('全部'),
      },
    ];
  }, []);

  const detailTabColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.DetailNotStart,
        tab: intl.get(`ssta.paymentPlan.view.title.notStart`).d('未开始'),
      },
      {
        key: ActiveKey.DetailProgress,
        tab: intl.get(`ssta.paymentPlan.view.title.progress`).d('执行中'),
      },
      {
        key: ActiveKey.DetailAll,
        tab: intl.get(`ssta.paymentPlan.view.title.all`).d('全部'),
      },
    ];
  }, []);

  const getExportParams = useCallback(() => {
    const params: Record<string, any> = {
      exportSearchbarUnitCode: `${GridCustCode[activeKey]},${SearchCustCode[activeKey]}`,
    };
    if (selected.length > 0) {
      const { primaryKey } = currentTableDs.props;
      params[`${primaryKey}List`] = selected.map((item) => item.key);
    } else {
      const queryData = currentTableDs.queryDataSet?.current?.toData() || {};
      Object.assign(params, queryData);
    }
    return filterNullValueObject(params);
  }, [selected, activeKey, currentTableDs]);

  return (
    <Fragment>
      <Header title={intl.get('ssta.paymentPlan.view.title.paymentPlanLedger').d('付款计划台账')}>
        <ExcelExportPro
          templateCode={
            activeKey.startsWith('detail')
              ? 'SRM_C_SPRP_PLAN_LINE_LIST_EXPORT'
              : 'SRM_C_SPRP_PLAN_HEADER_LIST_EXPORT'
          }
          allBody
          method="POST"
          queryParams={getExportParams}
          requestUrl={
            activeKey.startsWith('detail')
              ? `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/plan-lines/excel-export?tab=${ExportTabParam[activeKey]}`
              : `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/plan-headers/excel-export?tab=${ExportTabParam[activeKey]}`
          }
          buttonText={
            isEmpty(selected)
              ? intl.get(`ssta.common.button.export`).d('导出')
              : intl.get(`ssta.common.button.selectedExport`).d('勾选导出')
          }
          otherButtonProps={{
            funcType: 'flat',
          }}
        />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: ListTabsCustCode,
            cascade: true,
          },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`ssta.paymentPlan.view.title.paymentPlanWhole`).d('付款计划')} key="whole">
              {wholeTabColumns.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  <WholeTable activeKey={key} />
                </TabPane>
              ))}
            </TabGroup>
            <TabGroup tab={intl.get(`ssta.paymentPlan.view.title.paymentPlanLine`).d('付款计划行')} key="detail">
              {detailTabColumns.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={dsMap[key].getState('totalCount')}
                >
                  <DetailTable activeKey={key} />
                </TabPane>
              ))}
            </TabGroup>
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

const PaymentPlanList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default PaymentPlanList;