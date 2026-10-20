/*
 * @Description: file content
 * @Date: 2022-02-07 19:28:31
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */

import React, { useMemo, useContext, useCallback, Fragment } from 'react';
import { Form, Button, useModal, Output, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import { SRM_SSTA } from '_utils/config';
import moment from 'moment';

import { FormItem } from '@/routes/Components';
import { formItemRender } from '@/utils/renderer';
import { getSettleHeaderData } from '@/services/settlePoolServices';
import { recordPickValues, viewPayPlanModal } from '@/utils/utils';
import PrePayWriteOffModal from './PrePayWriteOffModal';
import MultiDimensionPay from './MultiDimensionPay';
import { Store } from '../Detail/StoreProvider';
import { useModalOpen } from '../hooks';
import DynamicAlertList from '@/routes/Components/DynamicAlert/List';

const formCodes = {
  INVOICE: 'SSTA.PURCHASE_SETTLE_DETAIL.INV_PAY_INFO',
  PAYMENT: 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_PAY_INFO',
};

const organizationId = getCurrentOrganizationId();

export default ({ source }) => {
  const {
    settleType,
    updateFlag,
    approveFlag,
    headPayment,
    settleHeader,
    documentType,
    settleLineDs,
    settleHeaderId,
    settleHeaderDs,
    headPrePaymentVer,
    customizeForm,
    readOnlyFlag,
    headMultiDimensionPayment,
    history,
    remoteProps,
    paymentStageDs,
    preferenceObj,
  } = useContext(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);

  const { paymentControlRuleSource } =
    settleHeaderDs.current?.get(['paymentControlRuleSource']) || {};

  const multiDimenAssignBtnShowFlag = useMemo(() => {
    const normalShowFlag =
      settleType !== 'INVOICE' && headMultiDimensionPayment !== 'HIDE' && source !== 'step';
    return remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.PAYINFO_MDABTN_SHOW', normalShowFlag, {
          settleHeaderDs,
        })
      : normalShowFlag;
  }, [source, settleType, remoteProps, settleHeaderDs, headMultiDimensionPayment]);

  const handlePayAutoAssign = useCallback(async () => {
    const res = await settleHeaderDs.setState('submitType', 'payAutoAssign').forceSubmit();
    if (!res) return;
    const { warnMessage } = res.content?.[0] || {};
    notification.success({ description: warnMessage });
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(await getSettleHeaderData({ documentType, settleHeaderId }));
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'applyAmount',
      'paymentAmount',
      'paymentSpliteRule',
      'prepaymentSpliteRule',
    ]);
    settleLineDs.query();
    if (paymentStageDs) paymentStageDs.query();
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
  }, [settleHeaderDs, settleLineDs, documentType, settleHeaderId, paymentStageDs]);

  const handlePrePayWriteOff = useCallback(() => {
    const isModalEdit = updateFlag && headPrePaymentVer === 'EDIT';
    modalOpen({
      size: 'large',
      editFlag: isModalEdit,
      title: isModalEdit
        ? intl.get(`ssta.purchaseSettle.view.title.prePaymentWriteOff`).d('预付款核销')
        : intl.get(`ssta.purchaseSettle.view.title.prePayWriteOffRecord`).d('预付款核销记录'),
      children: <PrePayWriteOffModal topRecord={settleHeader} isModalEdit={isModalEdit} />,
    });
  }, [modalOpen, settleHeader, updateFlag, headPrePaymentVer]);

  const handleMultiDimenAssign = useCallback(() => {
    const isModalEdit = updateFlag && headMultiDimensionPayment === 'EDIT';
    const processEditFlag = remoteProps
      ? remoteProps.process(
          'SSTA_PURCHASESETTLE_DETAIL.MULTI_DIMEN_ASSIGN_EDIT_FLAG',
          isModalEdit,
          {
            updateFlag,
            approveFlag,
            headMultiDimensionPayment,
          }
        )
      : isModalEdit;
    modalOpen({
      size: 'large',
      editFlag: isModalEdit,
      title: isModalEdit
        ? intl.get(`ssta.purchaseSettle.view.title.multiDimenAssign`).d('多维度分配')
        : intl.get(`ssta.purchaseSettle.view.title.multiDimenAssignInfo`).d('多维度分配信息'),
      children: <MultiDimensionPay topRecord={settleHeader} isModalEdit={processEditFlag} />,
      okText: intl.get('ssta.common.view.button.allocateToSettleLine').d('分摊至结算行'),
    });
  }, [modalOpen, updateFlag, approveFlag, settleHeader, remoteProps, headMultiDimensionPayment]);

  return (
    <Fragment>
      <DynamicAlertList
        dataSource={[
          {
            name: 'paymentInfoAlert1',
            message: intl
              .get(`ssta.common.view.message.paymentAutoAssignBtnAlert`)
              .d(
                '如需按填写总金额分配、总预付款核销，需点击下方「付款自动分配」按钮将金额分配至行，若直接点击「保存」将自动汇总所有行付款/核销金额'
              ),
            showFlag:
              updateFlag &&
              source !== 'step' &&
              settleType !== 'INVOICE' &&
              [headPayment, headPrePaymentVer].includes('EDIT'),
          },
          {
            name: 'paymentInfoAlert2',
            requestUrl: `${SRM_SSTA}/v1/${organizationId}/settle-headers/bank-prompt-default`,
            showFlag: documentType !== 'INVOICE',
          },
        ]}
      />
      <div style={{ marginBottom: 8 }}>
        {updateFlag &&
          source !== 'step' &&
          settleType !== 'INVOICE' &&
          [headPayment, headPrePaymentVer].includes('EDIT') && (
            <Button icon="project" funcType="flat" color="primary" onClick={handlePayAutoAssign}>
              {intl.get(`ssta.purchaseSettle.button.paymentAutoAssign`).d('付款自动分配')}
            </Button>
          )}
        {settleType !== 'INVOICE' && headPrePaymentVer !== 'HIDE' && (
          <Button icon="instance" funcType="flat" color="primary" onClick={handlePrePayWriteOff}>
            {updateFlag && headPrePaymentVer === 'EDIT'
              ? intl.get(`ssta.purchaseSettle.button.prePaymentWriteOffHeader`).d('预付款核销')
              : intl
                  .get(`ssta.purchaseSettle.button.prePaymentWriteOffRecordHeader`)
                  .d('预付款核销记录')}
          </Button>
        )}
        {multiDimenAssignBtnShowFlag && (
          <Button
            icon="microservice"
            funcType="flat"
            color="primary"
            onClick={handleMultiDimenAssign}
          >
            {updateFlag && headMultiDimensionPayment === 'EDIT'
              ? intl.get(`ssta.purchaseSettle.button.multiDemensionAssign`).d('多维度分配')
              : intl
                  .get(`ssta.purchaseSettle.button.multiDemensionAssignRecord`)
                  .d('多维度分配记录')}
          </Button>
        )}
      </div>
      {customizeForm(
        { code: formCodes[documentType], readOnly: readOnlyFlag },
        <Form
          useWidthPercent={source !== 'step'}
          dataSet={settleHeaderDs}
          columns={3}
          useColon={false}
          labelLayout={updateFlag ? 'float' : 'vertical'}
        >
          {settleType !== 'INVOICE' && (
            <FormItem
              name="paymentAmount"
              editor="numberfield"
              editable={updateFlag}
              disabled={headPayment !== 'EDIT'}
            />
          )}
          {settleType !== 'INVOICE' && <FormItem name="applyAmount" disabled={updateFlag} />}
          {settleType !== 'INVOICE' && headPayment !== 'HIDE' && (
            <FormItem
              name="paymentSpliteRule"
              editable={updateFlag}
              disabled={headPayment !== 'EDIT'}
              editor="select"
            />
          )}
          <FormItem name="bankIdLov" editor="lov" editable={updateFlag} />
          <FormItem name="bankBranchName" disabled={updateFlag} />
          <FormItem name="bankAccountNum" disabled={updateFlag} />
          <FormItem name="bankAccountName" disabled={updateFlag} />
          {formItemRender({ name: 'payBankLov', editor: Lov, editorable: updateFlag })}
          {formItemRender({ name: 'payBankBranchName', editorDisabled: updateFlag })}
          {formItemRender({ name: 'payBankAccountNum', editorDisabled: updateFlag })}
          {formItemRender({ name: 'payBankAccountName', editorDisabled: updateFlag })}
          <FormItem name="paymentMethodLov" editor="lov" editable={updateFlag} />
          <FormItem
            name="paymentCondition"
            placeholder={intl
              .get(`ssta.purchaseSettle.model.purchaseSettle.paymentCondition`)
              .d('付款条件')}
            editor="lov"
            editable={updateFlag}
          />
          <FormItem name="paymentDiscountAmount" editor="numberfield" editable={updateFlag} />
          {Boolean(paymentControlRuleSource) &&
            settleType === 'PAYMENT' &&
            [
              <Output
                name="planNum"
                renderer={({ value }) => (
                  <a
                    onClick={() =>
                      viewPayPlanModal({ planNum: value, history, source: 'paymentInfo' })
                    }
                  >
                    {value}
                  </a>
                )}
              />,
            ].concat(
              [
                'versionNumber',
                'planStageNum',
                'planStageDesc',
                'planStageAmount',
                'planStageBalance',
                'planStagePercent',
                'planStageStartDate',
                'planStageEndDate',
              ].map((name) => formItemRender({ name, editorDisabled: updateFlag }))
            )}
          <FormItem
            name="expectPaymentDate"
            editor="datepicker"
            editable={updateFlag}
            renderer={({ value }) =>
              value && moment(value).format(preferenceObj?.dateFormat || 'YYYY-MM-DD')
            }
          />
        </Form>
      )}
    </Fragment>
  );
};
