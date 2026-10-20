import React, { useContext, useMemo, memo } from 'react';
import { Modal } from 'choerodon-ui/pro';
// import { ColumnAlign } from 'choerodon-ui/dataset/enum';
// import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { isArray } from 'lodash';
import queryString from 'querystring';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import SearchBarTable from '_components/SearchBarTable';

import { Store } from '../store';
import { dateRangeTransform } from '../../../../utils/utils';
import { ActiveKey} from '../utils/type';
import { GridCustCodeMap, FilterCustCodeMap } from '../utils/type';
import DirectPoolOperation from '../../../Components/DirectPoolOperation';
import { statusTagRender } from '../../../Components/StatusTag';


interface ListTableProps {
  activeKey: ActiveKey,
};
const prefix = 'ssta.directPoolSupply';
const tenantId = getCurrentOrganizationId();
const ListTable = memo((props: ListTableProps) => {
  const { activeKey } = props;
  const {
    dsMap,
    operationDS,
    handleToDetail,
    customizeTable,
    // fetchTabKeysCount,
    history,
  } = useContext(Store);
  const currentListDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  // const fetchTotalCount = useCallback(() => {
  //   fetchTabKeysCount([activeKey]);
  // }, [activeKey, fetchTabKeysCount]);

  const handleToInvoiceDetail = (applyHeaderId) => {
    history.push({
      pathname: '/ssta/direct-pool-supply/detail',
      search: queryString.stringify({ applyHeaderId }),
    });
  };

  // 操作记录
  const openOprationModal = (record) => {
    const poolId = record.get('poolId');
    operationDS.setQueryParameter('poolId', poolId);
    operationDS.setQueryParameter('size', 999);
    Modal.open({
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      style: {
        width: '742px',
      },
      className: 'ssta-medium-modal',
      children: <DirectPoolOperation record={record} poolId={poolId} operationDs={operationDS} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const columns: any = useMemo(() => {
    return [
        {
          width: 150,
          name: 'poolNum',
        },
        {
          width: 100,
          name: 'poolStatus',
          renderer: statusTagRender,
        },
        {
          width: 150,
          name: 'ruleNum',
        },
        {
          width: 150,
          name: 'netPrice',
          align: 'rignt',
        },
        {
          width: 150,
          name: 'taxAmount',
          align: 'rignt',
        },
        {
          width: 150,
          name: 'amountInvoice',
          align: 'rignt',
        },
        {
          width: 150,
          name: 'trxDate',
          renderer: ({ value }) => value && moment(value).format(DEFAULT_DATE_FORMAT),
        },
        activeKey !== ActiveKey.B && {
          width: 150,
          name: 'refDocNumListStr',
          renderer: ({ value }) => {
            let refArr = [];
            if (value) {
              try {
                refArr = JSON.parse(value);
                if (!isArray(refArr)) {
                  refArr = [];
                }
              } catch (e) {
                refArr = [];
              }
            }

            return (
              <>
                {value
                  ? refArr.map((obj, index) => {
                      const { applyHeaderId, applyHeaderNum } = obj;
                      return (
                        <a
                          onClick={() =>
                            handleToInvoiceDetail(applyHeaderId)
                          }
                        >
                          {applyHeaderNum}
                          {index === refArr.length - 1 ? '' : ','}
                        </a>
                      );
                    })
                  : '-'}
              </>
            );
          },
        },

        {
          width: 150,
          name: 'invoiceTypeMeaning',
        },
        activeKey !== ActiveKey.B && {
          width: 200,
          name: 'refInvoiceNumListStr',
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
          name: 'itemName',
        },
        {
          width: 210,
          name: 'commodityNum',
        },
        {
          width: 210,
          name: 'commodityName',
        },
        {
          width: 150,
          name: 'quantity',
        },
        {
          width: 150,
          name: 'sourceDocNum',
        },
        {
          width: 150,
          name: 'sourceDocLineNum',
        },
        [ActiveKey.D].includes(activeKey) && {
          width: 200,
          name: 'errorNum',
        },
        [ActiveKey.D].includes(activeKey) && {
          width: 150,
          name: 'errorTypeMeaning',
        },
        [ActiveKey.D].includes(activeKey) && {
          width: 150,
          name: 'errorMsg',
        },
        ![ActiveKey.D].includes(activeKey) && {
          width: 120,
          title: intl.get(`${prefix}.view.title.operationRecord`).d('操作记录'),
          name: 'action',
          renderer: ({ record }) => (
            <a onClick={() => openOprationModal(record)}>
              {intl.get(`${prefix}.view.title.watch`).d('查看')}
            </a>
          ),
        },
      ];
  }, [
    activeKey,
    handleToInvoiceDetail,
    handleToDetail,
    openOprationModal,
  ]);

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
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
                supplierCompanyId: { lovPara: { tenantId } },
                companyId: { lovPara: { tenantId } },
                refDocNumListStr: { lovPara: { tenantId } },
                ruleNum: { lovPara: { tenantId } },
                trxDate: {
                  defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                  dynamicProps: {
                    disabled: ({ record }) =>
                      record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
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
