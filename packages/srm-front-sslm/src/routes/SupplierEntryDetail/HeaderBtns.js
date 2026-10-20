import React from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import DynamicButtons from '_components/DynamicButtons';

import { handleJoinedMointor } from '@/routes/components/utils/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { openRelationChart } from '@/routes/components/EnterpriseRelationSearch';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';

const HeaderBtns = observer(
  ({
    isPub,
    isEdit,
    allLoading,
    editStatus,
    changeReqId,
    currentStep,
    stepsConfig,
    entryBaseInfoDs,
    setLoading,
    handleEdit,
    handleSave,
    handleDelete,
    aiApproveStatus,
    companyBaseInfo,
    currentStepCode,
    handlerSubmit,
    handlerPreStep,
    handlerNextStep,
    customizeBtnGroup,
    onIntelligentReview = () => {},
  }) => {
    const stepCode = stepsConfig()[currentStep].key;
    const isShowNextStep = currentStepCode !== 'preview' && (isEdit || editStatus !== 'view');
    const isShowSubmit = currentStepCode === 'preview' && (isEdit || editStatus !== 'view');
    const isShowPreStep = currentStep > 0 && (isEdit || editStatus !== 'view');
    const reqStatus = entryBaseInfoDs?.current?.get('reqStatus');
    const { companyName, domesticForeignRelation } = companyBaseInfo;
    const params = { documentId: changeReqId, documentType: 'SUPPLIER_ENTRY', changeReqId };
    // 编辑按钮显隐
    const editFlag = !isEdit && editStatus === 'view' && ['NEW', 'REJECTED'].includes(reqStatus);
    // 删除按钮显隐
    const deleteFlag = isEdit || editStatus !== 'view';

    const buttons = [
      {
        name: 'nextStep',
        hidden: isPub || !isShowNextStep,
        child: intl.get(`sslm.supplierEntryDetail.button.options.nextStep`).d('下一步'),
        btnProps: {
          icon: 'arrow_forward',
          color: 'primary',
          onClick: handlerNextStep,
        },
      },
      {
        name: 'submit',
        hidden: isPub || !isShowSubmit,
        child: intl.get(`sslm.supplierEntryDetail.button.options.submit`).d('提交'),
        btnProps: {
          icon: 'check',
          color: 'primary',
          onClick: handlerSubmit,
        },
      },
      {
        name: 'edit',
        hidden: isPub || !editFlag,
        child: intl.get(`sslm.supplierEntryDetail.button.options.editing`).d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          color: 'primary',
          onClick: handleEdit,
        },
      },
      {
        name: 'preStep',
        hidden: isPub || !isShowPreStep,
        child: intl.get(`sslm.supplierEntryDetail.button.options.preStep`).d('上一步'),
        btnProps: {
          icon: 'arrow_back',
          funcType: 'flat',
          onClick: handlerPreStep,
        },
      },
      {
        name: 'save',
        hidden: isPub || !isShowNextStep,
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          funcType: 'flat',
          onClick: () => handleSave(),
        },
      },
      {
        name: 'delete',
        hidden: isPub || !deleteFlag,
        child: intl.get('hzero.common.button.delete').d('删除'),
        btnProps: {
          icon: 'delete',
          funcType: 'flat',
          onClick: handleDelete,
        },
      },
      {
        name: 'intelligentReview',
        hidden: isEdit ? stepCode !== 'preview' : isPub,
        child: (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {!allLoading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
            {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
          </span>
        ),
        btnProps: {
          funcType: 'flat',
          disabled: aiApproveStatus === 'APPROVING',
          onClick: onIntelligentReview,
        },
      },
      {
        name: 'operationRecord',
        child: intl.get('sslm.supplierEntryDetail.button.options.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => operationRecordsModal(params),
        },
      },
      {
        name: 'riskScan',
        hidden: domesticForeignRelation !== 1,
        child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
        btnProps: {
          icon: 'document_scanner-o',
          funcType: 'flat',
          onClick: () =>
            handleJoinedMointor({
              setLoading,
              companyName,
              documentId: changeReqId,
              documentType: 'ENTERING',
            }),
        },
      },
      {
        name: 'relationSearch',
        child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
        btnProps: {
          icon: 'relate',
          funcType: 'flat',
          onClick: () =>
            openRelationChart({ supplierCompanyName: companyName, businessType: 'SUPPLIER_ENTRY' }),
        },
      },
    ].map(btn => ({
      ...btn,
      btnProps: { ...btn.btnProps, waitType: 'throttle', wait: 200, loading: allLoading },
    }));

    return customizeBtnGroup(
      {
        code: 'SSLM.SUPPLIER_ENTRY_DETAIL.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons maxNum={5} trigger="hover" buttons={buttons} defaultBtnType="c7n-pro" />
    );
  }
);

export default HeaderBtns;
