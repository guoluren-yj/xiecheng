// import { stringify } from 'querystring';
import type { ReactElement } from 'react';
import React, { Fragment, useMemo, useCallback } from 'react';
import { flow, isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import queryString from 'querystring';

import MultiTextFilter from '../../../components/MultiTextFilter';
import { formatDynamicBtns } from '../../../utils/utils';
import { fundPlanForecastListDS } from './listDS';
import { ListCustomizeCode, ListCustomizeBtnCode } from '../utils/type';
import styles from '../../../common.less';
import TermDetail from '../Detail';

interface FundPlanForecastProps {
  history: any;
  customizeTable: (customizeOptions: object | undefined, tableElement: React.ReactNode) => any;
  customizeBtnGroup: Function,
}

const FundPlanForecastingList = flow(
  observer,
  withCustomize({
    unitCode: [...Object.values(ListCustomizeCode), ListCustomizeBtnCode],
  }),
  formatterCollections({
    code: [
      'sbsm.common',
      'sbsm.fundPlanForecast',
      'sbsm.fundPlan',
    ],
  }),
)((props: FundPlanForecastProps) => {
  const { customizeTable, customizeBtnGroup } = props;
  const listDs = useMemo<DataSet>(() => new DataSet(fundPlanForecastListDS()), []);
  const { selected } = listDs;
  // 跳转至详情页
  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <TermDetail recordInfo={record} />,
      cancelButton: false,
    });
  }, []);

  // 跳转到对应的单据详情页
  const handleToSourceDoc = useCallback((record) => {
    const { controlDimension, sourceDocId, sourceDocNum } = record?.get(['controlDimension', 'sourceDocId', 'sourceDocNum']) || {};
    if (!sourceDocId) return;
    if (['PO_LINE', 'ORDER'].includes(controlDimension)) {
      openTab({
        key: `/sodr/order-workspace/detail/all-orders/${sourceDocId}`,
        title: intl.get('sbsm.common.view.title.orderWorkspace').d('订单工作台'),
        search: queryString.stringify({
          poSourcePlatform: sourceDocNum,
          openFrom: 'settle',
          isBackFlag: 0,
        }),
      });
    }
  }, []);


  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'sourceDocNum',
        width: 140,
        renderer: ({value, record}) => {
          const { controlDimension, sourceDocLineNum = '', displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['controlDimension', 'sourceDocLineNum', 'displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          let text = displaySourceDocNum || value;
          if (['PO_LINE'].includes(controlDimension)) text = `${displaySourceDocNum || value}-${displaySourceDocLineNum || sourceDocLineNum}`;
          return <a onClick={() => handleToSourceDoc(record)}>{text}</a>;
        },
      },
      {
        name: 'sourceAmount',
        width: 100,
      },
      {
        name: 'stageNum',
        width: 120,
        renderer: ({ value, record }) => {
          return (
            <a onClick={() => handleClickNum(record)}>
              {value}
            </a>
          );
        },
      },
      {
        name: 'stageDesc',
        width: 140,
      },
      {
        name: 'stagePercent',
        width: 100,
      },
      {
        name: 'fcStageAmount',
        width: 120,
      },
      {
        name: 'fcStageDate',
        width: 140,
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyName',
        width: 240,
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        name: 'lastUpdateDate',
        width: 140,
      },
    ];
  }, [handleClickNum, handleToSourceDoc]);


  const getQueryParams = useCallback(() => {
    const queryData = listDs.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryData,
      ...listDs.queryParameter,
    });
  }, [listDs]);

  const getSelectedKeys = useCallback(() => {
    const { props: { primaryKey }, queryParameter } = listDs;
    return {
      ...queryParameter,
      fcHeaderIdList: selected.map((record) => record.get(primaryKey)),
    };
  }, [listDs, selected]);

  const buttons: any = useMemo(() => {
    const btns: any = [
      {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`hzero.common.button.export`).d('导出')
          : intl.get(`hzero.common.button.exportSelect`).d('勾选导出'),
        btnProps: {
          templateCode: 'SBSM_FORECAST_HEADER_EXPORT  ',
          allBody: true,
          method: 'POST',
          requestUrl: `/sbdm/v1/${getCurrentOrganizationId()}/forecast-headers/export/new`,
          queryParams: isEmpty(selected) ? getQueryParams : getSelectedKeys,
          otherButtonProps: {
            funcType: 'flat',
            permissionList: [],
          },
        },
      },
    ].filter((v) => v);
    return formatDynamicBtns(btns);
  }, [selected, getQueryParams, getSelectedKeys]);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.fundPlanForecast.view.title.fundPlanForecastingList').d('资金计划预测')}>
        {customizeBtnGroup(
          { code: ListCustomizeBtnCode, pro: true },
          <DynamicButtons unitCode={ListCustomizeBtnCode} buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content>
        {customizeTable(
          {
            code: ListCustomizeCode.TableCode,
          },
          <SearchBarTable
            cacheState
            virtual
            customizable
            dataSet={listDs}
            columns={columns}
            style={{ maxHeight: 'calc(100vh - 210px)' }}
            searchCode={ListCustomizeCode.SearchBarCode}
            searchBarConfig={{
              left: {
                render: (_, customizeDs) => (
                  <MultiTextFilter
                    name="sourceDocNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('sbsm.fundPlan.view.message.sourceDocNums')
                      .d('请输入来源单据号查询')}
                  />
                ),
              },
            }}
          />
        )}
      </Content>
    </Fragment>
  );
}) as (props: any) => ReactElement;

export default FundPlanForecastingList;


