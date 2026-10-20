import React, { useContext, useMemo, memo, useCallback } from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
// import { ColumnAlign } from 'choerodon-ui/dataset/enum';
// import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
// import moment from 'moment';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { isArray } from 'lodash';
import queryString from 'querystring';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../store';
import { dateRangeTransform, confirmDocNegAction } from '../../../../utils/utils';
import { GridCustCodeMap, FilterCustCodeMap, ActiveKey } from '../utils/type';
// import DirectPoolOperation from '../../../Components/DirectPoolOperation';
import { statusTagRender } from '../../../Components/StatusTag';
import { formatColumnCommand } from '../../../Components/ColumnBtnGroup';
import { queryInvoicingApplyList } from '../../../InvoicingApply/api';
import FilledInfoModal from './FilledInfoModal';


interface ListTableProps {
  activeKey: ActiveKey,
};
// const prefix = 'ssta.directPoolSupply';
// const tenantId = getCurrentOrganizationId();
const ListTable = memo((props: ListTableProps) => {
  const { activeKey } = props;
  const {
    dsMap,
    customizeTable,
    // operationDS,
    // handleToDetail,
    // fetchTabKeysCount,
    history,
    permissionMap,
  } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

//   const fetchTotalCount = useCallback(() => {
//     fetchTabKeysCount([activeKey]);
//   }, [activeKey, fetchTabKeysCount]);

  const handleToDetail = useCallback((record, type?: string) => {
    const { applyHeaderId, sourceDocNum, sourceDocId, dataSource, applyStatus, billingType } = record?.get(['applyHeaderId', 'sourceDocNum', 'sourceDocId', 'dataSource', 'applyStatus', 'billingType']) || {};
    history.push({
      pathname: '/ssta/direct-pool-supply/apply/detail',
      search: queryString.stringify(filterNullValueObject({ dataSource, applyHeaderId, sourceDocNum, sourceDocId, docSearchFlag: ['NEW'].includes(applyStatus) ? true : null, type: type || (ActiveKey.InvoiceAll === activeKey ? 'all' : 'edit'), billingType})),
    });
  }, [history, activeKey]);

  const handleBtnMethods = useCallback(async(data) => {
    currentListDs.dataToJSON = 'all';
    const res = await currentListDs.setState('dataValue', data).setState('submitType', 'delivery').submit();
    currentListDs.dataToJSON = 'selected';
    if (!res) return;
    currentListDs.query();
  }, [currentListDs]);

  const handleDeliveryAgain = useCallback(async(record) => {
    Modal.open({
      title: intl.get('ssta.common.button.deliveryStatusAgain').d('重新交付'),
      drawer: false,
      closable: true,
      key: Modal.key(),
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      children: <FilledInfoModal record={record} handleBtnMethods={handleBtnMethods} />,
    });
  }, [currentListDs, handleBtnMethods]);

  const handleSubmitOrDelete = useCallback(async(record, type) => {
    const { sourceDocId, sourceDocNum, applyNum, dataSource, billingType } = record?.get(['sourceDocId', 'sourceDocNum', 'applyNum', 'dataSource', 'billingType']) || {};
    const res = getResponse(await queryInvoicingApplyList(sourceDocId, dataSource, billingType));
    if (!res) return;
    if (isArray(res) && res.length > 1) {
      const docs = res.filter((v) => v.applyNum !== applyNum).map((item) => item.applyNum).join(',') || '23';
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: (
          <div style={{wordBreak: 'break-word'}}>{intl
            .get('ssta.common.view.help.directApplyInvoiceTips', { applyNum, sourceDocNum, docs})
            .d(
              '当前勾选的开票申请单编号{applyNum}，存在关联同一发票结算单编号{sourceDocNum}的开票申请单{docs}，若当前选择继续执行后续操作，则相关开票申请单即将同步处理，请知悉'
            )}
          </div>
        ),
      });
      if (confirmRes !== 'ok') return;
    } else {
      const action = type === 'delete' ? intl.get('hzero.common.button.detele').d('删除') : intl.get('hzero.common.button.submit').d('提交');
      const confirmFlag = await confirmDocNegAction({ action, documentNum: applyNum });
      if (!confirmFlag) return;
    }
    currentListDs.dataToJSON = 'dirty';
    Object.assign(record, { status: 'update' });
    const result = await currentListDs.setState('submitType', type).submit();
    currentListDs.dataToJSON = 'selected';
    if (!result) return;
    currentListDs.query();
  }, [currentListDs]);

  const getOperationCommand = useCallback(({ record }) => {
    const { applyStatus } = record?.get(['applyStatus']) || {};
    const buttons = [
      {
        name: 'update',
        text: intl.get('hzero.common.button.edit').d('编辑'),
        onClick: () => handleToDetail(record, 'edit'),
        showFlag: activeKey === ActiveKey.InvoiceAll && ['NEW'].includes(applyStatus),
      },
      {
        name: 'submit',
        text: intl.get('hzero.common.button.submit').d('提交'),
        onClick: () => handleSubmitOrDelete(record, 'submit'),
        showFlag: activeKey === ActiveKey.InvoiceAll && ['NEW'].includes(applyStatus),
      },
      {
        name: 'delete',
        text: intl.get('hzero.common.button.detele').d('删除'),
        onClick: () => handleSubmitOrDelete(record, 'delete'),
        showFlag: activeKey === ActiveKey.InvoiceAll && ['NEW'].includes(applyStatus),
      },
      {
        name: 'delivery',
        text: intl.get('ssta.common.button.deliveryStatusAgain').d('重新交付'),
        onClick: () => handleDeliveryAgain(record),
        showFlag: ['DIRECT_INVOICE_SUCCESS'].includes(applyStatus) && permissionMap?.get(`deliveryAgain`),
      },
    ].filter((v) => v);
    return formatColumnCommand({ buttons });
  }, [activeKey, handleToDetail, handleDeliveryAgain, handleSubmitOrDelete, permissionMap]);


  const columns: any = useMemo(() => {
    return [
        {
          width: 100,
          name: 'applyStatus',
          renderer: statusTagRender,
        },
        activeKey === ActiveKey.InvoiceAll && {
          width: 150,
          name: 'operate',
          command: getOperationCommand,
        },
        {
          width: 150,
          name: 'applyNum',
          renderer: ({ value, record }) => (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleToDetail(record)}
            >
              {value}
            </Button>
          ),
        },
        {
          width: 150,
          name: 'sourceDocNum',
        },
        {
          width: 150,
          name: 'companyName',
        },
        {
          width: 150,
          name: 'supplierCompanyName',
        },
        {
          width: 150,
          name: 'netAmount',
        },

        {
          width: 150,
          name: 'taxAmount',
        },
        {
          width: 200,
          name: 'amount',
        },
        {
          width: 150,
          name: 'invoiceTypeMeaning',
        },
        ...(
          activeKey === ActiveKey.InvoiceAll ? [
            {
              width: 150,
              name: 'invoiceCode',
            },
            {
              width: 150,
              name: 'invoiceNum',
            },
            {
              width: 140,
              name: 'deliveryStatus',
            },
          ] : []
        ),
        {
          width: 150,
          name: 'creationDate',
        },
      ];
  }, [
    handleToDetail,
    activeKey,
    getOperationCommand,
  ]);

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'creationDateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 260px)' }}>
      {customizeTable(
        { code: GridCustCodeMap[activeKey] },
        <SearchBarTable
          cacheState
          customizable
          dataSet={currentListDs}
          columns={columns}
          searchCode={FilterCustCodeMap[activeKey]}
          style={{ maxHeight: 'calc(100% - 20px)' }}
          searchBarConfig={{
            onFieldChange: handleFieldChange,
            fieldProps: {
                // supplierCompanyId: { lovPara: { tenantId } },
                // companyId: { lovPara: { tenantId } },
                // refDocNumListStr: { lovPara: { tenantId } },
                // ruleNum: { lovPara: { tenantId } },
                creationDate: {
                  defaultValue: ({ record }) => dateRangeTransform(record.get('creationDateRange'), true),
                  dynamicProps: {
                    disabled: ({ record }) =>
                      record.get('creationDateRange') && record.get('creationDateRange') !== 'ALL TIME',
                  },
                },
            },
          }}
        />
      )}
    </div>
  );
});

export default ListTable;
