/*
 * 基本信息
 * @date: 2023/10/19
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { renderStatus, renderEnable } from '@/routes/components/utils';
import '@/routes/index.less';

const HeaderInfo = ({
  remote,
  dataSet,
  customizeForm,
  custLoading,
  customizeUnitCode,
  isEdit,
  source,
  basicsInfo,
}) => {
  const { versionNum } = basicsInfo || {};
  // 判断是否配额主数据变更单据 或者 已变更单据【版本大于1】
  const isChangeFlag = (isEdit && source === 'masterData') || +versionNum > 0;
  // 判断是否配额主数据变更单据查看单据
  const isViewFlag = !isEdit && source === 'masterData';
  // 历史版本隐藏状态字段
  const hiddenStatus = ['masterDataVersion', 'masterDataDetailVersion'].includes(source);
  const remoteProps = {
    isEdit,
    dataSet,
  };
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
        },
        <Form
          useWidthPercent
          dataSet={dataSet}
          columns={3}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          custLoading={custLoading}
        >
          <FormField isEdit={isEdit} name="quotaAgreementNum" disabled />
          <FormField isEdit={isEdit} name="quotaAgreementDescription" />
          <FormField
            isEdit={isEdit}
            name="evalStatus"
            componentType={!isViewFlag ? 'SELECT' : ''}
            disabled
            hidden={hiddenStatus}
            renderer={
              isViewFlag
                ? ({ record }) => {
                    const { enableFlag } = record.get(['enableFlag']);
                    return renderEnable({ value: enableFlag });
                  }
                : renderStatus
            }
          />
          <FormField isEdit={isEdit} name="createName" componentType="LOV" disabled />
          <FormField isEdit={isEdit} name="unitId" componentType="LOV" disabled={isChangeFlag} />
          <FormField isEdit={isEdit} name="creationDate" componentType="DatePicker" disabled />
          <FormField isEdit={isEdit} name="companyId" componentType="LOV" disabled={isChangeFlag} />
          <FormField isEdit={isEdit} name="ouId" componentType="LOV" disabled={isChangeFlag} />
          <FormField isEdit={isEdit} name="versionNum" disabled />
          <FormField
            isEdit={isEdit}
            name="itemCategoryId"
            componentType="LOV"
            disabled={isChangeFlag}
          />
          <FormField isEdit={isEdit} name="itemCategoryName" />
          <FormField isEdit={isEdit} name="buyerId" componentType="LOV" />
          <FormField isEdit={isEdit} name="itemId" componentType="LOV" disabled={isChangeFlag} />
          <FormField isEdit={isEdit} name="itemName" />
          <FormField isEdit={isEdit} name="validCycle" componentType="SELECT" />
          <FormField isEdit={isEdit} name="effectiveDateFrom" componentType="DatePicker" />
          <FormField isEdit={isEdit} name="effectiveDateTo" componentType="DatePicker" />
          <FormField isEdit={isEdit} name="numberOfProsecutions" />
          <FormField isEdit={isEdit} name="controlMethod" componentType="SELECT" />
          <FormField
            isEdit={isEdit}
            name="versionDescription"
            componentType="TEXTAREA"
            newLine
            colSpan={2}
            resize="vertical"
          />
          {remote &&
            remote.process('SSLM_SUP_QUOTA_APPLICATION_DEFINITION_HEADER_INFO', null, remoteProps)}
        </Form>
      )}
    </Spin>
  );
};

export default HeaderInfo;
