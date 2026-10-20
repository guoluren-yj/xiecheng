import React from 'react';
import { Divider, Steps } from 'choerodon-ui';
import { DataSet, Form, Lov, Output, TextArea, TextField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import intl from 'utils/intl';

import { EcSignStatus } from '../enum';
import styles from './index.less';

const ReqSteps: React.FC<{dataSet: DataSet}> = observer(({ dataSet }) => {
  const ecSignStatus = dataSet.current?.get('ecSignStatus');
  let currentStep: number;
  let stepStatus: string | undefined;
  switch (ecSignStatus) {
    case EcSignStatus.UNSIGNED:
      currentStep = 0;
      break;
    case EcSignStatus.SIGNING:
      currentStep = 1;
      break;
    case EcSignStatus.REJECTED:
      currentStep = 2;
      stepStatus = 'error';
      break;
    case EcSignStatus.SIGNED:
      currentStep = 3;
      break;
    case EcSignStatus.TERMINATED:
      currentStep = 3;
      stepStatus = 'error';
      break;
    case EcSignStatus.ACTIVATED:
      currentStep = 4;
      break;
    default:
      currentStep = 0;
      break;
  }

  return (
    <Steps current={currentStep} status={stepStatus}>
      <Steps.Step title={intl.get('small.ecSign.view.reqSign').d('发起签约')} />
      <Steps.Step title={intl.get('small.ecSign.view.signing').d('签约中')} />
      {ecSignStatus === EcSignStatus.REJECTED ? <Steps.Step title={intl.get('small.ecSign.view.rejected').d('已拒绝')} /> : <Steps.Step title={intl.get('small.ecSign.view.signed').d('已签约')} />}
      {ecSignStatus === EcSignStatus.TERMINATED ? <Steps.Step title={intl.get('small.ecSign.view.terminated').d('已终止')} /> : <Steps.Step title={intl.get('small.ecSign.view.actived').d('已激活')} />}
    </Steps>
  );
});

const EcSigning: React.FC<{ecSigningDs: DataSet}> = ({ecSigningDs}) => {
  const ecSignStatus = ecSigningDs.current?.get('ecSignStatus');
  const editFlag = EcSignStatus.UNSIGNED === ecSignStatus || (EcSignStatus.REJECTED && ecSigningDs.getState('editFlag') === 1);
  return (
    <div className={styles['ec-signing']}>
      <ReqSteps dataSet={ecSigningDs} />
      <Divider className='ec-signing-divider' />
      <div className='ec-signing-form-wapper'>
        <Form
          className={editFlag ? "" : "c7n-pro-vertical-form-display"}
          dataSet={ecSigningDs}
          columns={3}
          labelLayout={editFlag ? LabelLayout.float : LabelLayout.vertical}
          // @ts-ignore
          useWidthPercent
        >
          {editFlag ? (
            <>
              <TextField name="tenantNum" disabled />
              <TextField name="tenantName" disabled />
              <TextField name="ecPlatformName" disabled />
              <Lov name="contactLov" />
              <TextField name="contactPhone" />
              <TextField name="contactEmail" />
              <Lov name="unitLov" />
              <Lov name="positionLov" />
              <TextArea name='remark' newLine colSpan={2} resize={ResizeType.vertical} />
            </>
          ): (
            <>
              <Output name="tenantNum" />
              <Output name="tenantName" />
              <Output name="ecPlatformName" />
              <Output name="contactName" />
              <Output name="contactPhone" />
              <Output name="contactEmail" />
              <Output name="unitName" />
              <Output name="positionName" />
              <Output name='remark' newLine colSpan={2} />
            </>
          )}
        </Form>
      </div>
    </div>
  );
}

export default EcSigning;
