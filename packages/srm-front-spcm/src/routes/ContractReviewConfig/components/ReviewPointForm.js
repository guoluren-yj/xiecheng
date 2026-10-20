/*
 * ReviewPointModal - 弹窗
 * @Date: 2025-03-07 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { observer } from 'mobx-react-lite';
import { yesOrNoRender } from 'utils/renderer';

import { Form } from 'choerodon-ui/pro';

import FormField from '@/routes/components/GeneralForm/FormField';

import styles from '../styles.less';

const ReviewPointForm = observer(({ dataSet, isEdit = false, customizeForm, formCode = '' }) => {
  const currentRecord = dataSet.current;
  const { customCopyFlag } = currentRecord?.get(['customCopyFlag']) || {};
  const copyFlagIsZero = Number(customCopyFlag) === 0;

  return (
    <div className={styles['spcm-contract-review-config-point-form']}>
      {customizeForm(
        {
          code: formCode,
          readOnly: !isEdit,
        },
        <Form
          useWidthPercent
          columns={1}
          dataSet={dataSet}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField name="reviewCode" isEdit={isEdit} />
          <FormField name="reviewName" isEdit={isEdit} componentType="INTLFIELD" />
          <FormField
            name="routeName"
            isEdit={isEdit}
            componentType="LOV"
            hidden={!copyFlagIsZero}
          />

          <FormField name="routeUrl" isEdit={isEdit} hidden={!copyFlagIsZero} />
          <FormField name="riskType" isEdit={isEdit} componentType="SELECT" />
          <FormField name="riskLevel" isEdit={isEdit} componentType="SELECT" />

          <FormField name="validationType" isEdit={isEdit} componentType="SELECT" />
          <FormField
            name="ignoreReasonFlag"
            isEdit={isEdit}
            componentType="CHECKBOX"
            renderer={({ value }) => {
              return yesOrNoRender(value);
            }}
          />
          <FormField name="riskDescription" isEdit={isEdit} componentType="TEXTAREA" />

          <FormField name="resolution" isEdit={isEdit} componentType="TEXTAREA" />
          <FormField name="ruleDescription" isEdit={isEdit} componentType="TEXTAREA" />
          <FormField name="ruleSource" isEdit={isEdit} componentType="SELECT" hidden />
          <FormField name="customCopyFlag" isEdit={isEdit} componentType="SELECT" hidden />
          <FormField name="copyReviewCode" isEdit={isEdit} />
          <FormField name="reviewType" isEdit={isEdit} componentType="SELECT" />
          {/* <FormField
              name="paramDefinition"
              isEdit={false}
              renderer={({ value, text, name, record, dataSet }) => {
                return (
                  <a
                    disabled // todo
                    onClick={() => {}}
                  >
                    {intl.get('spcm.common.model.common.paramDefinition').d('参数定义')}
                  </a>
                );
              }}
            /> */}
        </Form>
      )}
    </div>
  );
});

export default ReviewPointForm;
