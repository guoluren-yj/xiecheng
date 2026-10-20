/*
 * @Description: file content
 * @Date: 2022-02-09 01:03:55
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useContext, Fragment, useCallback } from 'react';
import { Form, Lov, Button, useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { FormItem } from '@/routes/Components';
import { formItemRender } from '@/utils/renderer';
import { Store } from '../Detail/StoreProvider';
import { useModalOpen } from '../hooks';
import FilledLogisticsInfo from './FilledLogisticsInfo';

export default () => {
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const {
    notPub,
    syncFlag,
    isEditPub,
    settleType,
    updateFlag,
    approveFlag,
    settleStatus,
    readOnlyFlag,
    documentType,
    permissionMap,
    customizeForm,
    settleHeaderDs,
    editableFlowFlag,
  } = useContext(Store);

  const handleFillLogisticsInfo = useCallback(() => {
    modalOpen({
      editFlag: true,
      size: 'small',
      title: intl.get('ssta.common.button.logisticsInfoFill').d('物流信息补充'),
      children: <FilledLogisticsInfo />,
    });
  }, [modalOpen]);

  const handleUpdateLogisticsInfo = useCallback(async () => {
    const res = await settleHeaderDs.setState('submitType', 'syncLogisticsInfo').forceSubmit();
    if (!res) return;
    settleHeaderDs.query();
  }, [settleHeaderDs]);

  return (
    <Fragment>
      {readOnlyFlag && settleType !== 'PAYMENT' && permissionMap.get(`logisticsInfoFill`) && (
        <Button color="primary" funcType="flat" icon="note_alt" onClick={handleFillLogisticsInfo}>
          {intl.get('ssta.common.button.logisticsInfoFill').d('物流信息补充')}
        </Button>
      )}
      {readOnlyFlag && settleType !== 'PAYMENT' && permissionMap.get(`logisticsUpdate`) && (
        <Button color="primary" funcType="flat" icon="cached" onClick={handleUpdateLogisticsInfo}>
          {intl.get('ssta.common.button.logisticsUpdate').d('物流更新')}
        </Button>
      )}
      {customizeForm(
        {
          code:
            documentType === 'INVOICE'
              ? 'SSTA.PURCHASE_SETTLE_DETAIL.INV_OTHER'
              : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER',
          readOnly: readOnlyFlag && !isEditPub,
          __force_record_to_update__: true,
        },
        <Form
          useWidthPercent
          dataSet={settleHeaderDs}
          columns={3}
          useColon={false}
          labelLayout={updateFlag ? 'float' : 'vertical'}
        >
          {!(approveFlag && settleStatus === 'SUBMITED') &&
            !syncFlag &&
            documentType === 'INVOICE' && (
              <FormItem
                name="accountingDate"
                editor="datepicker"
                editable={updateFlag || isEditPub}
              />
            )}
          <FormItem name="termCode" disabled={updateFlag} />
          <FormItem name="invOrganizationName" disabled={updateFlag} />
          <FormItem name="sourceSettleNum" disabled={updateFlag} />
          <FormItem name="purOrganizationName" disabled={updateFlag} />
          {formItemRender({
            name: 'logisticsCompanyLov',
            editor: Lov,
            editorable: updateFlag,
            visible: settleType !== 'PAYMENT',
          })}
          {formItemRender({
            name: 'logisticsNum',
            editorable: updateFlag,
            visible: settleType !== 'PAYMENT',
          })}
          {formItemRender({
            name: 'logisticsPhoneNum',
            editorable: updateFlag,
            visible: settleType !== 'PAYMENT',
          })}
        </Form>
      )}
      {!notPub &&
        customizeForm(
          {
            code: 'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW',
            readOnly: readOnlyFlag && !editableFlowFlag,
          },
          <Form
            useWidthPercent
            dataSet={settleHeaderDs}
            columns={3}
            useColon={false}
            labelLayout="vertical"
          />
        )}
    </Fragment>
  );
};
