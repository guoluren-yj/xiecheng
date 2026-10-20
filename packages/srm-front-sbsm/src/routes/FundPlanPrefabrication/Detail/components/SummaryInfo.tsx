import React, { useMemo, useContext, useCallback } from 'react';
import { Table, NumberField, Button, useModal, Select } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { summaryInfoCode, statusMap, summaryLineCode } from '../../utils/type';
import StatusTag from '../../../../components/StatusTag';
import { useModalOpen } from '../../../../hooks';
import SummaryLine from './SummaryLine';

const PrepInfo = () => {
  const {
    headerDs,
    customizeForm,
    customizeTable,
    summaryListDs,
  } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);


  const editorColumns = useMemo(() => {
    return [
      {name: 'balOccupyPayAmount', disabled: true, editor: NumberField},
      {name: 'balCompletePayAmount', disabled: true, editor: NumberField},
      {name: 'balEnablePayAmount', disabled: true, editor: NumberField},
      {name: 'balOccupyApplyAmount', disabled: true, editor: NumberField},
      {name: 'balCompleteApplyAmount', disabled: true, editor: NumberField},
      {name: 'balEnableApplyAmount', disabled: true, editor: NumberField},
      {name: 'balStatus', disabled: true, editor: Select, renderer: ({ text, value }) => <StatusTag value={text} color={statusMap[value]} />},
      'balPaymentDate',
      'balPaymentDateLast',
    ];
  }, []);

  const handleViewDetail = useCallback((record) => {
    const balHeaderId = record?.get('balHeaderId');
    const prepViewType = record?.get('prepViewType');
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('sbsm.common.view.button.balLineDetail').d('汇总单行明细'),
      children: <SummaryLine balHeaderId={balHeaderId} prepViewType={prepViewType} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
    });
  }, [modalOpen]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'balProcessStatusMeaning',
        width: 120,
      },
      {
        name: 'balNum',
        width: 180,
      },
      {
        name: 'prepViewType',
        width: 120,
      },
      {
        name: 'sumBalPayAmount',
        width: 120,
      },
      {
        name: 'sumBalApplyAmount',
        width: 120,
      },
      {
        name: 'createdUserName',
      },
      {
        name: 'creationDate',
        width: 200,
      },
      {
        name: 'operate',
        width: 120,
        renderer: ({ record }) => {
          return (
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              style={{ userSelect: 'text' }}
              onClick={() => handleViewDetail(record)}
            >
              {intl.get('sbsm.fundPlan.model.detail.viewDetail').d('查看详情')}
            </Button>
          );
        },
      },
    ];
  }, [handleViewDetail]);

  return (
    <div>
      <EditorForm
        useWidthPercent
        columns={3}
        useColon={false}
        dataSet={headerDs}
        editorFlag={false}
        customizeForm={customizeForm}
        editorColumns={editorColumns}
        customizeOptions={{ code: summaryInfoCode, readOnly: true }}
      />
      <div style={{marginTop: '16px'}}>
        {
          customizeTable({
            code: summaryLineCode,
            readOnly: true,
          }, (
            <Table
              dataSet={summaryListDs}
              columns={columns}
              style={{ maxHeight: 430 }}
            />
          ))
        }
      </div>
    </div>
  );
};


export default PrepInfo;
