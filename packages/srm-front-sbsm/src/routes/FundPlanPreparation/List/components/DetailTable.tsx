import React, { useContext, useMemo, useCallback } from 'react';
import { Button, useModal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { observer } from 'mobx-react';

import { statusTagRender } from '../../../../components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import type { ActiveKey } from '../../utils/type';
import { DetailListCode, DetailSearchCode } from '../../utils/type';
import { useModalOpen } from '../../../../hooks';
import DetailTableLine from './DetailTableLine';
import MultiTextFilter from '../../../../components/MultiTextFilter';

interface WholeTableProps {
  activeKey: ActiveKey,
};

const WholeTable = (props: WholeTableProps) => {
  const { activeKey } = props;
  const { dsMap, customizeTable, handleToDetail } = useContext(Store) as StoreValueType;
  const tableDs = useMemo(() => dsMap[activeKey], [dsMap, activeKey]);

  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const handleViewLineDetail = useCallback((record) => {
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('sbsm.fundPlan.model.detail.viewLine').d('查看行明细'),
      children: <DetailTableLine reocrdInfo={record} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
    });
  }, [modalOpen]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'prepReportStatus',
        width: 120,
        renderer: statusTagRender,
      },
      {
        name: 'prepNum',
        width: 160,
        renderer: ({ value, record }) => {
          const lineNum = record?.get('lineNum');
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleToDetail(record?.get('prepHeaderId'), 'view')}
            >
              {`${value}-${lineNum}`}
            </Button>
          );
        },
      },
      {
        name: 'companyName',
        width: 180,
      },
      {
        name: 'supplierCompanyNum',
        width: 160,
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'prepViewType',
        width: 120,
      },
      {
        name: 'termSourceDocumentNum',
        width: 160,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          if (displaySourceDocNum) return `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}`;
          const termSourceDocumentLineNum = record?.get('termSourceDocumentLineNum');
          if (!termSourceDocumentLineNum) return value;
          return `${value}-${termSourceDocumentLineNum}`;
        },
      },
      {
        name: 'stageNum',
        width: 130,
      },
      {
        name: 'stageDesc',
        width: 130,
      },
      {
        name: 'stageAmount',
        width: 120,
      },
      {
        name: 'prepPayAmount',
        width: 120,
      },
      {
        name: 'prepSource',
        width: 120,
      },
      {
        name: 'documentNum',
        width: 140,
        renderer: ({ value, record }) => {
          const { displaySourceDocNum = '', displaySourceDocLineNum = '' } = record?.get(['displaySourceDocNum', 'displaySourceDocLineNum']) || {};
          return displaySourceDocNum ? `${displaySourceDocNum}${displaySourceDocLineNum && '-'}${displaySourceDocLineNum || ''}` : value;
        },
      },
      {
        name: 'prepSourceAmount',
        width: 120,
      },
      {
        name: 'prepPayAmount',
        width: 120,
      },
      {
        name: 'prepApplyAmount',
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
      {
        name: 'lineRemark',
        width: 140,
      },
      {
        name: 'operate',
        width: 140,
        renderer: ({ record }) => {
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleViewLineDetail(record)}
            >
              {intl.get('sbsm.fundPlan.model.detail.viewLine').d('查看行明细')}
            </Button>
          );
        },
      },
      {
        name: 'prefabPayAmount',
        width: 140,
      },
      {
        name: 'prepOccupyPayAmount',
        width: 140,
      },
      {
        name: 'prepEnablePayAmount',
        width: 140,
      },
      {
        name: 'prefabApplyAmount',
        width: 140,
      },
      {
        name: 'prepOccupyApplyAmount',
        width: 140,
      },
      {
        name: 'prepEnableApplyAmount',
        width: 140,
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
        name: 'orgPrepPayAmount',
        width: 140,
      },
      {
        name: 'orgPrepApplyAmount',
        width: 140,
      },
      {
        name: 'rtnPrepPayAmount',
        width: 140,
      },
      {
        name: 'rtnPrepApplyAmount',
        width: 140,
      },
    ];
  }, [handleToDetail, handleViewLineDetail]);

  return (
    <div style={{ height: 'calc(100vh - 254px)' }}>
      {customizeTable(
        { code: DetailListCode[activeKey] },
        <SearchBarTable
          cacheState
          virtual
          customizable
          dataSet={tableDs}
          columns={columns}
          searchCode={DetailSearchCode[activeKey]}
          style={{ maxHeight: 'calc(100% - 22px)' }}
          pagination={{ maxPageSize: 1000, pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
          searchBarConfig={{
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="prepNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('sbsm.fundPlan.view.message.enterPrepNumQuery')
                    .d('请输入资金计划编制单号查询')}
                />
              ),
            },
          }}
        />
      )}
    </div>
  );
};

export default observer(WholeTable);
