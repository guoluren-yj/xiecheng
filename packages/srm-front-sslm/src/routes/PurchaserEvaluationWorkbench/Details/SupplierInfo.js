/**
 * 采购方评估 - 详情 - 供应商信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-31 17:34:06
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import SupplierLov from '_components/SupplierLov';

const SupplierInfo = observer(
  ({
    remote,
    dataSet,
    isEdit,
    pubEdit,
    customizeForm,
    custLoading,
    isCreate,
    isFeedBack,
    showOldModal,
    isSupplier,
    customizeCode,
    customizeReadOnly = false,
  }) => {
    const { reportStatus, progressStatus, needFeedbackFlag } =
      dataSet?.current?.get(['reportStatus', 'progressStatus', 'needFeedbackFlag']) || {};

    const newIsEdit = isFeedBack
      ? isEdit
      : isCreate ||
        pubEdit ||
        (isEdit &&
          ['EVAL_PREPARE', 'EVAL_RESULT'].includes(progressStatus) &&
          ['NEW', 'REJECTED', 'FINAL_COLLECTED'].includes(reportStatus));
    const disabledFlag =
      ['EVAL_RESULT'].includes(progressStatus) && ['FINAL_COLLECTED'].includes(reportStatus);

    const queryData = needFeedbackFlag
      ? {
          srmFlag: 1,
          companyId: dataSet.current?.get('companyId'),
        }
      : {
          companyId: dataSet.current?.get('companyId'),
        };

    const formColumns = [
      {
        name: 'supplierCompanyLov',
        componentType: showOldModal ? 'Lov' : 'SupplierLov',
        renderer: ({ value, record }) => {
          const supplierName = value ? value.supplierName : '-';
          if (remote) {
            return remote.process(
              'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_SUPPLIER_INFO_SUPPLIER_NAME',
              supplierName,
              { record }
            );
          }
          return supplierName;
        },
      },
      {
        name: 'supplierType',
        componentType: 'Select',
      },
      {
        name: 'supplierContactor',
        componentType: 'TextField',
      },
      {
        name: 'supplierContactPhone',
        componentType: 'TEL',
      },
      {
        name: 'supplierContactMail',
        componentType: 'TextField',
      },
      {
        name: 'supplierRegisteredAddress',
        componentType: 'TextArea',
        resize: 'both',
        newLine: true,
        colSpan: 2,
      },
      {
        name: 'supplierOverview',
        componentType: 'TextArea',
        resize: 'both',
        newLine: true,
        colSpan: 2,
      },
      {
        name: 'evalAddress',
        componentType: 'TextArea',
        resize: 'both',
        newLine: true,
        colSpan: 2,
      },
      {
        name: 'backRemark',
        componentType: 'TextArea',
        resize: 'both',
        newLine: true,
        colSpan: 2,
        hidden: isFeedBack ? false : !['SUPPLIER_EVAL'].includes(progressStatus),
      },
      ...(isFeedBack
        ? [
            {
              name: 'backReason',
              componentType: 'TextArea',
              resize: 'both',
              newLine: true,
              colSpan: 2,
              hidden: !dataSet?.current?.get('backReason'),
            },
          ]
        : []),
    ].filter(Boolean);

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: !isSupplier ? 'SSLM.PURCHASER_ASSESS_DETAIL.SUPPLIER_INFO' : customizeCode,
            readOnly: customizeReadOnly,
          },
          <Form
            columns={3}
            dataSet={dataSet}
            custLoading={custLoading}
            useWidthPercent
            labelLayout={newIsEdit ? 'float' : 'vertical'}
            className={newIsEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            {formColumns.map(props => {
              if (props.componentType === 'SupplierLov' && newIsEdit) {
                return (
                  <SupplierLov name="supplierCompanyLov" dataSet={dataSet} queryData={queryData} />
                );
              } else {
                return (
                  <FormField
                    key={props.name}
                    isEdit={newIsEdit}
                    disabled={disabledFlag}
                    {...props}
                  />
                );
              }
            })}
          </Form>
        )}
      </Spin>
    );
  }
);

export default SupplierInfo;
