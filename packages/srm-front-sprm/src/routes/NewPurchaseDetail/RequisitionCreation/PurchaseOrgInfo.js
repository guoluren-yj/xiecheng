/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-16 21:25:38
 * @LastEditors: yanglin
 * @LastEditTime: 2022-04-07 17:57:02
 */
import React, { useContext, useLayoutEffect, useRef } from 'react';
import { Lov, Form } from 'choerodon-ui/pro';
import { Store } from '../stores';
import { AutoFillForm } from './AutoFillFormProvider';

const PurchaseOrgInfo = function PurchaseOrgInfo() {
  const { headerDs, customizeForm, prSourcePlatform } = useContext(Store);
  const { renderAutoFillTip } = useContext(AutoFillForm);

  const formRef = useRef(null);

  const form = customizeForm(
    {
      code: 'SPRM.PURCHASE_PLAFORM_CREATE.PURCHASEORGINFO',
      __force_record_to_update__: true,
      dataSet: headerDs,
    },
    <Form
      dataSet={headerDs}
      showLines={6}
      columns={3}
      ref={formRef}
      labelLayout="float"
      useWidthPercent
      useColon={false}
    >
      <Lov name="companyLov" />
      <Lov name="ouLov" />
      <Lov name="purchaseOrgLov" />
      <Lov name="purchaseAgentLov" />
    </Form>
  );

  useLayoutEffect(() => {
    if (prSourcePlatform === 'SRM') {
      renderAutoFillTip(formRef?.current?.props);
    }
  }, [formRef, headerDs, prSourcePlatform]);

  return form;
};

export default PurchaseOrgInfo;
