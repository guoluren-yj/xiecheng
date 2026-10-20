import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { isFunction } from 'lodash';
import { Form, DataSet, Output } from 'choerodon-ui/pro';
import { baseDs } from './../indexDS';
import { colorRender } from '@/routes/RequisitionPlan/util';
// import CollapseForm from '_components/CollapseForm';
import styles from '../index.less';

const Base = React.forwardRef(
  ({ rpHeaderId, handleDetailField, customizeForm = () => {}, code, remote, getLineDs, path, commonUpdate }, ref) => {
    const {headerUpdateRenderCux = undefined} = remote?.props?.process || {};
    const baseInfoDs = useMemo(() => new DataSet(baseDs({ rpHeaderId, handleDetailField })), []);
    // todo==为了刷新页面数据,等链接组件完善后可以删除
    const [, setstate] = useState(rpHeaderId);
    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));

    useEffect(() => {
      baseInfoDs.addEventListener("update", ({name, value, record, dataSet}) => {
        if(isFunction(headerUpdateRenderCux)) {
          headerUpdateRenderCux({name, value, record, dataSet}, {getLineDs, baseInfoDs, path, commonUpdate})
        }
      })
    }, [baseInfoDs]);

    const loadCurrentData = (data) => {
      baseInfoDs.loadData([
        { ...data, prRequestedNumAndName: `${data.prRequestedNum}-${data.prRequestedName}` },
      ]);
      setstate(data.rpHeaderId);
    };

    const handleGetDeatial = (detailField) => baseInfoDs.current?.get(detailField);

    const saveCurrentData = () => {
      return baseInfoDs;
    };

    const colorFormRender = ({ record, value }) => {
      if (record?.get('rpStatus')) {
        const Dom = colorRender(value, record.get('rpStatusMeaning'));
        return Dom;
      }
      if (record?.get('syncStatus')) {
        const Dom = colorRender(value, record.get('syncStatusMeaning'));
        return Dom;
      }
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
            useWidthPercent
          >
            <Output name="displayRpNum" />
            <Output name="createdByName" />
            <Output name="creationDate" />
            <Output name="rpTypeId" />

            <Output name="originalCurrency" />
            <Output name="amount" />
            {/* <Output name="originalCurrencyNoTaxSum" />
            <Output name="originalCurrencyTaxSum" /> */}

            <Output name="localCurrency" />
            <Output name="localCurrencyNoTaxSum" />
            <Output name="localCurrencyTaxSum" />

            <Output name="containerId" />
            <Output name="rpStatus" renderer={colorFormRender} />
            <Output name="cancelStatusCode" />
            <Output name="requestedBy" />
            <Output name="requestDate" />
            <Output name="srmExecuteFlag" />
            <Output name="syncStatus" renderer={colorFormRender} />
            <Output name="remark" />
            {isFunction(headerUpdateRenderCux) ? headerUpdateRenderCux : null}
          </Form>
        )}
      </div>
    );
  }
);

export default Base;
