import React, { useContext, memo } from 'react';
import C7nFromWrapper from '@/routes/components/C7nFormWrapper';
import { Spin, Lov, DateTimePicker } from 'choerodon-ui/pro';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import { useColorRender } from '../hooks';
import { Store } from './index';

function HeaderInfo() {
  const {
    HeaderDs,
    loading,
    editFlag,
    processFactory,
    activeKey,
    sourceCode,
    customizeForm,
    getUnitCode,
    sureSupplier,
  } = useContext(Store);
  const differenceFlag = processFactory === '0';
  const isSubmitting = activeKey === 'submit'; // 新建明细可编辑
  const isCreateFlag = sourceCode === 'SRM' && processFactory === '1'; // 手工创建并且盘点单
  const newStatusEdit = HeaderDs?.current?.get('invStatus') !== 'NEW';
  const lineNumFlag = HeaderDs?.current?.get('internalQuantityFlag');

  const getFields = [
    { name: 'displayInvNum' },
    {
      name: 'strategyName',
    },
    activeKey === 'all' && editFlag
      ? {
          name: 'invStatus',
          renderer: useColorRender(),
        }
      : {
          name: 'invStatus',
          renderer: ({ record }) => record && record.get('invStatusMeaning'),
        },
    { name: 'sourceCode' },
    {
      name: 'creationName',
    },
    { name: 'creationDate', FormField: DateTimePicker },
    isCreateFlag && {
      name: 'invDateLov',
      FormField: DateTimePicker,
      disabled: lineNumFlag || !isSubmitting,
    },
    {
      name: 'companyIdLov',
      FormField: Lov,
      disabled: !isSubmitting || newStatusEdit || lineNumFlag,
    },
    sureSupplier
      ? {
          name: 'supplierIdLov',
          FormField: Lov,
          disabled: !isSubmitting || newStatusEdit || lineNumFlag,
        }
      : {
          name: 'supplierIdLov',
          FormField: () => (
            <SupplierLov
              name="supplierIdLov"
              dataSet={HeaderDs}
              style={{ width: '100%' }}
              disabled={!isSubmitting || newStatusEdit || lineNumFlag}
            />
          ),
          disabled: !isSubmitting || newStatusEdit || lineNumFlag,
        },
    differenceFlag && {
      name: 'inSupplierIdLov',
      FormField: () => (
        <SupplierLov
          style={{ width: '100%' }}
          name="inSupplierIdLov"
          dataSet={HeaderDs}
          disabled={!isSubmitting || newStatusEdit || lineNumFlag}
        />
      ),
      disabled: !isSubmitting || newStatusEdit,
    },
    differenceFlag && { name: 'deliverAddress', disabled: !isSubmitting },

    differenceFlag && { name: 'shipAddress', disabled: !isSubmitting },
    { name: 'purchaseAgentId', disabled: sourceCode !== 'SRM' || !isSubmitting, FormField: Lov },
  ];

  return (
    <Spin spinning={loading}>
      <C7nFromWrapper
        readOnly={editFlag}
        dataSet={HeaderDs}
        columns={3}
        fields={getFields}
        customizeForm={customizeForm}
        customizeCode={getUnitCode(processFactory).units[0]}
      />
    </Spin>
  );
}
export default memo(HeaderInfo);
