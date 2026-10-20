import React, { useMemo, useContext, useCallback } from 'react';
import { Table, NumberField, Button, useModal, Select } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/interface';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { StageAllPrepInfoCode, statusMap, PrepLineCode } from '../../utils/type';
import StatusTag from '../../../../components/StatusTag';
import { useModalOpen } from '../../../../hooks';
import PrepLine from './PrepLine';

const PrepInfo = () => {
  const {
    headerDs,
    customizeForm,
    customizeTable,
    prepListDs,
  } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);


  const editorColumns = useMemo(() => {
    return [
      {name: 'prepOccupyPayAmount', disabled: true, editor: NumberField},
      {name: 'prepCompletePayAmount', disabled: true, editor: NumberField},
      {name: 'prepEnablePayAmount', disabled: true, editor: NumberField},
      {name: 'prepOccupyApplyAmount', disabled: true, editor: NumberField},
      {name: 'prepCompleteApplyAmount', disabled: true, editor: NumberField},
      {name: 'prepEnableApplyAmount', disabled: true, editor: NumberField},
      {name: 'prepStatus', disabled: true, editor: Select, renderer: ({ text, value }) => <StatusTag value={text} color={statusMap[value]} />},
      'prepPaymentDate',
      'prepPaymentDateLast',
    ];
  }, []);

  const handleViewDetail = useCallback((record) => {
    const prepHeaderId = record?.get('prepHeaderId');
    const prepViewType = record?.get('prepViewType');
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('sbsm.common.view.button.prepLineDetail').d('编制单行明细'),
      children: <PrepLine prepHeaderId={prepHeaderId} prepViewType={prepViewType} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
    });
  }, [modalOpen]);

  const columns: ColumnProps[] = useMemo(() => {
    return [
      {
        name: 'prepProcessStatusMeaning',
        width: 120,
      },
      {
        name: 'prepNum',
        width: 180,
      },
      {
        name: 'prepViewType',
        width: 120,
      },
      {
        name: 'sumPrepPayAmount',
        width: 120,
      },
      {
        name: 'sumPrepApplyAmount',
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
        customizeOptions={{ code: StageAllPrepInfoCode, readOnly: true }}
      />
      <div style={{marginTop: '16px'}}>
        {
          customizeTable({
            code: PrepLineCode,
            readOnly: true,
          }, (
            <Table
              dataSet={prepListDs}
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
