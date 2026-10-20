import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';
import queryString from 'querystring';
import { openTab } from 'utils/menuTab';

import StatusTag from '../../../../components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { SourceListCode, SourceSearchCode, statusMap, ActiveKey } from '../../utils/type';
import StatusInfo from './StatusInfo';
import StageDetail from '../../Detail/index';
import styles from '../../../../common.less';
import MultiTextFilter from '../../../../components/MultiTextFilter';

interface StageTableProps {
  activeKey: ActiveKey,
  handleRecordInit: (key: ActiveKey) => void,
  customSourceType: string,
};

const SourceTable = (props: StageTableProps) => {
  const { activeKey, handleRecordInit, customSourceType } = props;
  const { dsMap, customizeTable } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  useEffect(() => {
    handleRecordInit(activeKey);
  }, [activeKey, handleRecordInit]);


  const handleLinkDetail = useCallback((record) => {
    const { prepSource, documentNum, documentId } = record?.get(['prepSource', 'documentNum', 'documentId']) || {};
    if (!documentId) return;
    if (['PRE_STAGE', 'ORDER_PRE_STAGE'].includes(prepSource)) {
      const num = (documentNum?.split('-') || [])[0] || documentNum;
      openTab({
        key: `/sodr/order-workspace/detail/all-orders/${documentId}`,
        title: intl.get('sbsm.common.view.title.orderWorkspace').d('订单工作台'),
        search: queryString.stringify({
          poSourcePlatform: num,
          openFrom: 'settle',
          isBackFlag: 0,
        }),
      });
    } else if (['INVOICE'].includes(prepSource)) {
      openTab({
        key: `/ssta/new-purchase-settle/invoice/${documentId}`,
        title: intl.get('sbsm.common.view.title.settleWorkspace').d('采购方结算单工作台'),
        search: queryString.stringify({
          source: 'sbsm',
          type: 'all',
        }),
      });
    } else if (['RCV_TRX'].includes(prepSource)) {
      openTab({
        key: `/sinv/receipt-workbench/return-detail/${documentId}`,
        title: intl.get('sbsm.common.view.title.receiptWorkspace').d('收货工作台'),
        search: queryString.stringify({
          viewType: 'flat',
        }),
      });
    }
  }, []);

  const handleClickExecute = useCallback((record) => {
    Modal.open({
      drawer: true,
      closable: true,
      className: styles['sbsm-detailDrawer-modal'],
      style: {
        width: 1090,
      },
      children: <StageDetail recordInfo={record} viewType='SOURCE_DOCUMENT' />,
      cancelButton: false,
    });
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
        name: 'prepSource',
        width: 140,
      },
      customSourceType !== 'PREP_SOURCE_DOC_LINE' && {
        name: 'documentNum',
        width: 150,
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
      customSourceType === 'PREP_SOURCE_DOC_LINE' && {
        name: 'documentLineNum',
        width: 150,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleLinkDetail(record)}
            >
              {displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : record?.get('documentNum')}{value && '-'}{value}
            </Button>
          );
        },
      },
      {
        name: 'currencyCode',
        width: 90,
      },
      {
        name: 'prepSourceAmount',
        width: 120,
        header: customSourceType === 'PREP_SOURCE_DOC_LINE' ? intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedDocLineAmount').d('编制来源单据行金额') : intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.preparedDocAmount').d('编制来源单据金额'),
      },
      ...(activeKey === ActiveKey.SourceAll ? [
        // {
        //   name: 'prefabStatus',
        //   width: 120,
        //   renderer: ({ text, record }) => (
        //     <StatusInfo record={record} field='prefabStatus' source='source'><StatusTag value={record?.get('prefabStatusMeaning')} color={statusMap[text]} /></StatusInfo>
        //   ),
        // },
        {
          name: 'prepStatus',
          width: 120,
          renderer: ({ text, record }) => (
            <StatusInfo record={record} field='prepStatus' source='source'><StatusTag value={record?.get('prepStatusMeaning')} color={statusMap[text]} /></StatusInfo>
          ),
        },
        {
          name: 'balStatus',
          width: 120,
          renderer: ({ text, value, record }) => (
            <StatusInfo record={record} field='balStatus' source='source'><StatusTag value={text} color={statusMap[value]} /></StatusInfo>
          ),
        },
        {
          name: 'prefabPaymentDate',
          width: 140,
        },
        {
          name: 'prefabPaymentDateLast',
          width: 140,
        },
        {
          name: 'prepFinalPaymentDate',
          header: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmDate').d('编制确认付款日期(最早)'),
          width: 170,
        },
        {
          name: 'prepFinalPaymentDateLast',
          header: intl.get('sbsm.fundPlan.model.fundPlanPrefabrication.prepPaymentConfirmDateLast').d('编制确认付款日期(最晚)'),
          width: 170,
        },
      ] : []),
      ...(activeKey === ActiveKey.SourceCompile ? [
        {
          name: 'prefabPayAmount',
          width: 120,
        },
        {
          name: 'prefabApplyAmount',
          width: 120,
        },
        {
          name: 'prepOccupyPayAmount',
          width: 120,
        },
        {
          name: 'prepOccupyApplyAmount',
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
        {
          name: 'prefabPaymentDate',
          width: 140,
        },
        {
          name: 'prefabPaymentDateLast',
          width: 140,
        },
      ] : []),
      ...(activeKey === ActiveKey.SourceSummary ? [
        {
          name: 'prepOccupyPayAmount',
          width: 120,
        },
        {
          name: 'prepOccupyApplyAmount',
          width: 120,
        },
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
      ] : []),
      ...((activeKey !== ActiveKey.SourceLines && activeKey !== ActiveKey.SourceError) ? [{
          name: 'operate',
          width: 140,
          renderer: ({ record }) => (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleClickExecute(record)}
            >
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ),
        }] : []
      ),
      // 错误行 全部行
      ...((activeKey === ActiveKey.SourceLines) ? [
        {
          name: 'prefabPayAmount',
          width: 120,
        },
        {
          name: 'prefabApplyAmount',
          width: 120,
        },
        {
          name: 'prepOccupyPayAmount',
          width: 120,
        },
        {
          name: 'prepOccupyApplyAmount',
          width: 120,
        },
        {
          name: 'balEnablePayAmount',
          width: 120,
        },
        {
          name: 'balEnableApplyAmount',
          width: 120,
        },
        {
          name: 'prefabPaymentDate',
          width: 140,
        },
        {
          name: 'prefabPaymentDateLast',
          width: 140,
        },
      ] : []),
      // 错误行
      ...(activeKey === ActiveKey.SourceError ? [
        {
          name: 'errorMessage',
          width: 140,
        },
      ] : []),
    ];
  }, [activeKey, customSourceType, handleLinkDetail, handleClickExecute]);

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        { code: SourceListCode[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={SourceSearchCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <div>
                  <MultiTextFilter
                    name="documentNums"
                    dataSet={customizeDs}
                    placeholder={intl
                      .get('sbsm.fundPlan.view.message.enterSourceNumQuery')
                      .d('请输入编制来源单据编号查询')}
                  />
                </div>
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(SourceTable);
