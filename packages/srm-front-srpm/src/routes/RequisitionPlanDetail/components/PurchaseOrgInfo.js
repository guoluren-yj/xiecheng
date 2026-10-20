import React, { useImperativeHandle, useMemo } from 'react';
import { Form, Output, DataSet } from 'choerodon-ui/pro';
import { purchaseOrgInfoDs } from './../indexDS';
import styles from '../index.less';

// import intl from 'utils/intl';

const PurchaseOrgInfo = React.forwardRef(
  ({ rpHeaderId, handleDetailField, code, customizeForm = () => {} }, ref) => {
    const purchaseOrgInfo = useMemo(
      () => new DataSet(purchaseOrgInfoDs({ rpHeaderId, handleDetailField })),
      []
    );
    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));
    const loadCurrentData = (data) => {
      purchaseOrgInfo.loadData([data]);
    };
    const saveCurrentData = () => {
      return purchaseOrgInfo;
    };

    const handleGetDeatial = (detailField) => {
      return purchaseOrgInfo.current?.get(detailField);
    };

    return (
      <div className={styles['rfx-card-item-form']}>
        {customizeForm(
          {
            code, // 必传，和unitCode一一对应
            dataSet: purchaseOrgInfo,
          },
          <Form
            dataSet={purchaseOrgInfo}
            showLines={6}
            columns={3}
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
            useColon={false}
          >
            <Output name="companyId" />
            <Output name="ouId" />
            <Output name="purchaseOrgId" />
            <Output name="unitId" />
            <Output name="purchaseAgentId" />
          </Form>
        )}
      </div>
    );
  }
);

export default PurchaseOrgInfo;
