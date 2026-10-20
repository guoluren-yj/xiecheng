import React, { useImperativeHandle, useMemo, useState } from 'react';
import { Form, DataSet, Output } from 'choerodon-ui/pro';
import { baseDs } from './stores';
// import CollapseForm from '_components/CollapseForm';
import styles from '../../index.less';

const Base = React.forwardRef(
  ({ prHeaderId, handleDetailField, customizeForm = () => {}, code }, ref) => {
    const baseInfoDs = useMemo(() => new DataSet(baseDs({ handleDetailField })), []);
    // todo==为了刷新页面数据,等链接组件完善后可以删除
    const [, setstate] = useState(prHeaderId);
    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));

    const loadCurrentData = (data) => {
      baseInfoDs.loadData([
        { ...data, prRequestedNumAndName: `${data.prRequestedNum}-${data.prRequestedName}` },
      ]);
      setstate(data.prHeaderId);
    };

    const handleGetDeatial = (detailField) => baseInfoDs.current?.get(detailField);

    const saveCurrentData = () => {
      return baseInfoDs;
    };

    const renderAmount = ({ record, name, text }) => {
      // console.log(name, record)
      if (record && record.get('headerPriceHiddenFlag') === 1) {
        return record.get(`${name}Meaning`);
      }

      return text;
    };

    return (
      <div className={styles['rfx-card-item-form']}>
        {customizeForm(
          {
            code, // 必传，和unitCode一一对应
            dataSet: baseInfoDs,
          },
          <Form
            dataSet={baseInfoDs}
            showLines={6}
            columns={3}
            labelLayout="vertical"
            labelAlign="left"
            className="c7n-pro-vertical-form-display"
            useColon={false}
          >
            <Output name="displayPrNum" />
            <Output name="title" />
            <Output name="createByName" />
            <Output name="creationDate" />
            <Output name="prTypeLov" />
            <Output name="prSourcePlatform" />
            <Output name="originalCurrencyLov" />
            <Output name="amount" renderer={renderAmount} />
            <Output name="localCurrencyLov" />
            <Output name="localCurrencyNoTaxSum" renderer={renderAmount} />
            <Output name="localCurrencyTaxSum" renderer={renderAmount} />
            <Output name="paymentMethodName" />
            <Output name="lotNum" />
            <Output name="requestedByLov" />
            <Output name="requestDate" />
            <Output name="unitLov" />
            <Output name="remark" />
          </Form>
        )}
      </div>
    );
  }
);

export default Base;
