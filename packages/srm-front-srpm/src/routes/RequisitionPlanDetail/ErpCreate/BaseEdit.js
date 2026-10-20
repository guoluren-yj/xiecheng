import React, { useImperativeHandle, useMemo, useCallback, useState, useEffect } from 'react';
import {
  TextField,
  DatePicker,
  Select,
  Lov,
  Currency,
  TextArea,
  Form,
  DataSet,
} from 'choerodon-ui/pro';
import { baseDs } from '../indexDS';
// import CollapseForm from '_components/CollapseForm';
import styles from '../index.less';
// let baseInfoDs;
let proxyDsCreate;

const Base = React.forwardRef(
  ({ rpHeaderId, handleDetailField, customizeForm, custLoading, getLineDs }, ref) => {
    const baseInfoDs = useMemo(
      () =>
        new DataSet({
          ...baseDs({ rpHeaderId, handleDetailField }),
          events: {
            update: ({ name, record, value }) => {
              if (name === 'requestedByLov') {
                record.set({
                  prRequestedNumAndName:
                    value && value.loginName ? `${value.loginName}-${value.userName}` : null,
                });
              }

              if (name === 'originalCurrency' && value) {
                if (getLineDs()) {
                  getLineDs().forEach((lineRecord) => {
                    lineRecord.set({
                      currencyCode: {
                        currencyCode: value.currencyCode,
                        currencyName: value.currencyName,
                      },
                      defaultPrecision: value.defaultPrecision,
                      financialPrecision: value.financialPrecision,
                    });
                  });
                }
              }

              if (name === 'localCurrency') {
                if (getLineDs()) {
                  getLineDs().forEach((lineRecord) => {
                    lineRecord.set({
                      localDefaultPrecision: value.defaultPrecision,
                      localFinancialPrecision: value.financialPrecision,
                    });
                  });
                }
              }
            },
          },
        }),
      []
    );

    const [init, setInit] = useState(false);

    useEffect(() => {
      proxyDsCreate = {
        createNow: true,
        createData: {},
      };
      return () => {
        proxyDsCreate = undefined;
      };
    }, []);

    // 函数组件调用到子组件的函数
    useImperativeHandle(ref, () => ({
      loadCurrentData,
      handleGetDeatial,
      saveCurrentData,
      ref: ref.current,
    }));

    const loadCurrentData = useCallback((data) => {
      if (!init) {
        proxyDsCreate = {
          createNow: true,
          proxyQuery: () => proxyLoadData(data),
        };
        setInit(true);
      } else {
        proxyLoadData(data);
      }
    });

    const proxyLoadData = (data) => {
      baseInfoDs.loadData([]);
      baseInfoDs.create({
        ...data,
        prRequestedNumAndName: data.prRequestedNum
          ? `${data.prRequestedNum}-${data.prRequestedName}`
          : null,
      });
    };

    const handleGetDeatial = useCallback((detailField) => {
      return baseInfoDs.current?.get(detailField);
    });

    const saveCurrentData = useCallback(() => {
      baseInfoDs.current.status = 'update';
      return baseInfoDs;
    });

    return (
      <div className={styles['rfx-card-item-form']}>
        {customizeForm(
          {
            code: 'SRPM.RP_PLATFORM_ERP_CREATE.BASEINFO', // 必传，和unitCode一一对应
            dataSet: baseInfoDs,
            custLoading,
            proxyDsCreate,
          },
          <Form
            dataSet={baseInfoDs}
            showLines={6}
            columns={3}
            labelLayout="float"
            useColon={false}
            useWidthPercent
          >
            <TextField name="displayRpNum" disabled />
            <TextField name="createdByName" disabled />
            <DatePicker name="creationDate" disabled />
            <Lov name="rpTypeId" disabled />

            <Lov name="originalCurrency" disabled />
            <Currency name="amount" disabled />
            <Lov name="localCurrency" disabled />
            <Currency name="localCurrencyNoTaxSum" disabled />
            <Currency name="localCurrencyTaxSum" disabled />

            <Lov name="containerId" disabled />
            <Select name="rpStatus" disabled />
            <Lov name="requestedBy" disabled />
            <DatePicker name="requestDate" disabled />
            <TextArea name="remark" disabled resize="vertical" />
          </Form>
        )}
      </div>
    );
  }
);

export default Base;
