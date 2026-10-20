import React, { useMemo, useContext, useCallback, useEffect } from 'react';
import { Table, NumberField, Button, useModal } from 'choerodon-ui/pro';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';

import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import EditorForm from '../../../../components/EditorForm';
import { summaryInfoCode, summaryLineCode } from '../../utils/type';
import { useModalOpen } from '../../../../hooks';
import SettleLine from './SettleLine';

interface SettleProps {
  documentType: string;
}
const PrepInfo = (props: SettleProps) => {
  const { documentType } = props;
  const {
    headerDs,
    customizeForm,
    customizeTable,
    paymentListDs,
    prePaymentListDs,
  } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const ds = documentType === 'PAYMENT' ? paymentListDs : prePaymentListDs;

  useEffect(() => {
    ds.setQueryParameter('documentType', documentType);
    ds.query();
  }, [documentType, ds]);


  const editorColumns = useMemo(() => {
    if (documentType === 'PAYMENT') {
      return [
        {name: 'actualPaymentOccupyAmount', disabled: true, editor: NumberField},
        {name: 'actualPaymentCompleteAmount', disabled: true, editor: NumberField},
        {name: 'actualApplyOccupyAmount', disabled: true, editor: NumberField},
        {name: 'actualApplyCompleteAmount', disabled: true, editor: NumberField},
      ];
    }
    return [
      {name: 'actualPrePaymentOccupyAmount', disabled: true, editor: NumberField},
      {name: 'actualPrePaymentCompleteAmount', disabled: true, editor: NumberField},
    ];
  }, [documentType]);

  const handleViewDetail = useCallback((record) => {
    const settleHeaderId = record?.get('settleHeaderId');
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('sbsm.common.view.button.settleLineDetail').d('结算单付款阶段明细行'),
      children: <SettleLine settleHeaderId={settleHeaderId} documentType={documentType} />,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
    });
  }, [modalOpen, documentType]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'settleStatus',
        width: 120,
      },
      {
        name: 'settleNum',
        width: 180,
      },
      documentType === 'PREPAYMENT' && {
        name: 'prepaymentType',
        width: 120,
      },
      documentType === 'PREPAYMENT' && {
        name: 'prepaymentAmount',
        width: 120,
      },
      documentType === 'PAYMENT' && {
        name: 'paymentAmount',
        width: 120,
      },
      documentType === 'PAYMENT' && {
        name: 'applyAmount',
        width: 120,
      },
      {
        name: 'companyName',
        width: 160,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'camp',
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 140,
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
  }, [handleViewDetail, documentType]);

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
              dataSet={ds}
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
