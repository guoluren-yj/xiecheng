import React, { useContext, useMemo, useEffect, useCallback } from 'react';
// import { Modal } from 'choerodon-ui/pro';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';
import { openTab } from 'utils/menuTab';
import queryString from 'querystring';
import intl from 'utils/intl';

import StatusTag from '../../../../components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { StageListCode, StageSearchCode, statusMap, ActiveKey } from '../../utils/type';
import StageDetail from '../../Detail/index';
import styles from '../../../../common.less';
import StatusInfo from './StatusInfo';
import MultiTextFilter from '../../../../components/MultiTextFilter';

interface StageTableProps {
  activeKey: ActiveKey,
  handleRecordInit: (key: ActiveKey) => void,
};

const StageTable = (props: StageTableProps) => {
  const { activeKey, handleRecordInit } = props;
  const { dsMap, customizeTable } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);


  const handleClickNum = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <StageDetail recordInfo={record} viewType='STAGE' />,
      cancelButton: false,
    });
  }, []);

  const handleLinkDetail = useCallback((record) => {
    const { dataSource, documentNum, documentId } = record?.get(['dataSource', 'documentNum', 'documentId']) || {};
    if (!documentId) return;
    if (['ORDER', 'PO_LINE'].includes(dataSource)) {
      openTab({
        key: `/sodr/order-workspace/detail/all-orders/${documentId}`,
        title: intl.get('sbsm.common.view.title.orderWorkspace').d('订单工作台'),
        search: queryString.stringify({
          poSourcePlatform: documentNum,
          openFrom: 'settle',
          isBackFlag: 0,
        }),
      });
    }
  }, []);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'supplierCompanyName',
        width: 160,
      },
      {
        name: 'displayDocumentNum',
        width: 160,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleLinkDetail(record)}
            >
              {displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value}
            </Button>
          );
        },
      },
      {
        name: 'currencyCode',
        width: 90,
      },
      {
        name: 'stageNum',
        width: 120,
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'stageDesc',
        width: 150,
      },
      {
        name: 'stageAmount',
        width: 120,
      },
      ...(activeKey === ActiveKey.StageAll ? [
        {
          name: 'prefabStatus',
          width: 120,
          renderer: ({ text, record }) => (
            <StatusInfo record={record} field='prefabStatus' source='stage'><StatusTag value={record?.get('prefabStatusMeaning')} color={statusMap[text]} /></StatusInfo>
          ),
        },
        {
          name: 'prepStatus',
          width: 120,
          renderer: ({ text, record }) => (
            <StatusInfo record={record} field='prepStatus' source='stage'><StatusTag value={record?.get('prepStatusMeaning')} color={statusMap[text]} /></StatusInfo>
          ),
        },
        {
          name: 'balStatus',
          width: 120,
          renderer: ({ text, value, record }) => (
            <StatusInfo record={record} field='balStatus' source='stage'><StatusTag value={text} color={statusMap[value]} /></StatusInfo>
          ),
        },
        {
          name: 'prepFinalPaymentDate',
          width: 160,
        },
        {
          name: 'prepFinalPaymentDateLast',
          width: 160,
        },
      ] : []),
      ...(activeKey === ActiveKey.StageCompile ? [
        {
          name: 'prefabPayAmount',
          width: 120,
        },
        {
          name: 'prefabApplyAmount',
          width: 120,
        },
        {
          name: 'prepEnablePayAmount',
          width: 120,
        },
        {
          name: 'prepEnableApplyAmount',
          width: 120,
        },
      ] : []),
      ...((activeKey === ActiveKey.StageCompile || activeKey === ActiveKey.StageSummary) ? [
        {
          name: 'prepOccupyPayAmount',
          width: 120,
        },
        {
          name: 'prepOccupyApplyAmount',
          width: 120,
        },
      ] : []),
      ...(activeKey === ActiveKey.StageSummary ? [
        {
          name: 'balEnablePayAmount',
          width: 120,
        },
        {
          name: 'balEnableApplyAmount',
          width: 120,
        },
        {
          name: 'prepPaymentDate',
          width: 140,
        },
        {
          name: 'prepPaymentDateLast',
          width: 140,
        },
      ] : [
        {
          name: 'prefabPaymentDate',
          width: 140,
        },
        {
          name: 'prefabPaymentDateLast',
          width: 140,
        },
      ]),
    ];
  }, [activeKey, handleClickNum, handleLinkDetail]);

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        { code: StageListCode[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={StageSearchCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="documentNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterDocumentNumQuery')
                    .d('请输入条款来源单据编号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(StageTable);
