/*
 * 基本信息
 * @date: 2023/10/19
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import React, { useState, useCallback } from 'react';
import { Form, Spin, TextField, Output } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { checkValid } from '@/services/supplyAbilityService';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import { dateRender } from 'utils/renderer';
import '@/routes/index.less';

const organizationId = getCurrentOrganizationId();

const HeaderInfo = ({
  dataSet,
  customizeForm,
  custLoading,
  readOnlyFlag,
  customizeUnitCode,
  isCreat,
  isEdit,
}) => {
  const currentRecord = dataSet?.current;
  const [supplyListDimensionCode, setSupplyListDimensionCode] = useState(
    currentRecord ? currentRecord.supplyListDimensionCode : 'GROUP'
  );

  /**
   * 校验数据唯一性
   * @param {Number} supplierCompanyId 供应商Id
   * @param {Number} companyId 公司Id
   */
  const handleCheckValid = useCallback((supplierCompanyId, companyId, dimensionCode) => {
    if ((supplierCompanyId && companyId) || dimensionCode === 'GROUP') {
      const params = {
        supplierCompanyId,
        companyId,
        organizationId,
      };
      checkValid(params).then(res => {
        const response = getResponse(res);
        if (!response) {
          if (currentRecord) {
            currentRecord.set({
              companyLov: undefined,
              companyId: undefined,
            });
            if (dimensionCode === 'GROUP') {
              currentRecord.set({
                supplierNameLov: null,
              });
            }
          }
        }
      });
    }
  }, []);

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
          readOnly: readOnlyFlag,
        },
        <Form
          useWidthPercent
          dataSet={dataSet}
          columns={3}
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          custLoading={custLoading}
        >
          <FormField
            isEdit={isEdit}
            disabled={!isCreat}
            name="supplierNameLov"
            clearButton={false}
            onChange={supplierObj => {
              const { supplierCompanyId, supplyListDimensionCode: newSupplyListDimensionCode } =
                supplierObj || {};
              const companyId = currentRecord?.get('companyId');
              setSupplyListDimensionCode(newSupplyListDimensionCode);
              handleCheckValid(supplierCompanyId, companyId, newSupplyListDimensionCode);
            }}
            componentType="LOV"
          />
          <FormField isEdit={isEdit} name="supplierCompanyNum" disabled />
          <FormField
            isEdit={isEdit}
            disabled={
              !isCreat || supplyListDimensionCode === 'GROUP' || isEmpty(supplyListDimensionCode)
            }
            name="companyLov"
            componentType="LOV"
            onChange={companyObj => {
              const { companyId } = companyObj || {};
              const supplierCompanyId = currentRecord.get('supplierCompanyId');
              handleCheckValid(supplierCompanyId, companyId);
            }}
          />
          <FormField isEdit={isEdit} name="createUserName" disabled />
          {isEdit ? (
            <TextField
              isEdit={isEdit}
              name="creationDate"
              disabled
              renderer={({ value }) => {
                return dateRender(value);
              }}
            />
          ) : (
            <Output
              name="creationDate"
              renderer={({ value }) => {
                return dateRender(value);
              }}
            />
          )}
          <FormField isEdit={isEdit} name="lastUpdateUserName" disabled />
          {isEdit ? (
            <TextField
              isEdit={isEdit}
              name="lastUpdateDate"
              disabled
              renderer={({ value }) => {
                return dateRender(value);
              }}
            />
          ) : (
            <Output
              name="lastUpdateDate"
              renderer={({ value }) => {
                return dateRender(value);
              }}
            />
          )}
          <FormField isEdit={isEdit} name="stageDescription" disabled />
          <FormField
            isEdit={isEdit}
            newLine
            name="remark"
            colSpan={2}
            resize="both"
            componentType="TEXTAREA"
          />
        </Form>
      )}
    </Spin>
  );
};

export default HeaderInfo;
