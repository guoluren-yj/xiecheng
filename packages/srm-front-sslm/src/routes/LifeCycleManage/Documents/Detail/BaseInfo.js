/*
 * @Date: 2022-12-09 13:53:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useCallback, useState } from 'react';
import { Form, Spin, Output, Select } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';

const BaseInfo = ({
  dataSet,
  isCreate,
  laneCreate,
  isEdit,
  custLoading,
  isAmktClient,
  readOnlyFlag,
  documentType,
  customizeForm,
  customizeUnitCode,
  routerSupplierCompanyId,
  onRest,
  onInit,
}) => {
  const [supplierId, setSupplierId] = useState(routerSupplierCompanyId);

  // 供应商改变时的回调
  const handleSupplierChange = useCallback(
    lovRecord => {
      if (lovRecord) {
        const { dimensionCode, supplierCompanyId } = lovRecord;
        setSupplierId(supplierCompanyId);
        if (dimensionCode === 'GROUP') {
          onInit({ supplierCompanyId, documentType });
        }
      } else {
        onRest();
      }
    },
    [documentType]
  );

  // 公司改变时的回调
  const handleCompanyChange = useCallback(
    lovRecord => {
      if (lovRecord) {
        const { companyId } = lovRecord;
        onInit({ supplierCompanyId: supplierId, companyId, documentType });
      } else {
        onRest();
      }
    },
    [supplierId, documentType]
  );

  const isDisabled = !isCreate || laneCreate;
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
          readOnly: readOnlyFlag,
        },
        <Form
          columns={3}
          useWidthPercent
          dataSet={dataSet}
          custLoading={custLoading}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField isEdit={isEdit} name="documentNumber" />
          <FormField isEdit={isEdit} name="realName" />
          <FormField
            isEdit={isEdit}
            name="createUserDepartmentId"
            componentType="LOV"
            disabled={isCreate}
          />
          <FormField isEdit={isEdit} name="creationDate" componentType="DATETIMEPICKER" />
          <FormField isEdit={isEdit} name="documentType" componentType="SELECT" />
          <FormField isEdit={isEdit} name="documentFrom" componentType="SELECT" />
          <FormField isEdit={isEdit} name="processStatus" renderer={renderStatus} />
          <FormField
            isEdit={isEdit}
            name="supplierCompanyId"
            componentType="LOV"
            disabled={isDisabled || isAmktClient}
            onChange={handleSupplierChange}
          />
          {/* 编辑时取翻译值，不更换字段的情况下，手动处理，不使用FormField */}
          {isEdit ? (
            <Select
              name="fromStageId"
              renderer={({ record }) => record.get('fromStageDescription')}
            />
          ) : (
            <Output
              name="fromStageId"
              renderer={({ record }) => record.get('fromStageDescription')}
            />
          )}
          <FormField
            isEdit={isEdit}
            name="toStageId"
            componentType="SELECT"
            disabled={isDisabled}
            renderer={({ record }) => record.get('toStageDescription')}
          />
          <FormField isEdit={isEdit} name="dimensionCode" componentType="SELECT" />
          <FormField
            isEdit={isEdit}
            name="companyId"
            componentType="LOV"
            disabled={isDisabled}
            onChange={handleCompanyChange}
          />
          <FormField isEdit={isEdit} name="erpSupplierNum" />
          <FormField isEdit={isEdit} name="erpSupplierName" />
          <FormField
            newLine
            rows={3}
            colSpan={2}
            isEdit={isEdit}
            name="remark"
            resize="both"
            componentType="TextArea"
          />
        </Form>
      )}
    </Spin>
  );
};

export default BaseInfo;
