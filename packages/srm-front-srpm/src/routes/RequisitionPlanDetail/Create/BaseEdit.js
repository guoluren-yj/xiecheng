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
// import styles from '../index.less';
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
      ds: baseInfoDs,
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
      if (baseInfoDs.current) {
        baseInfoDs.current.status = 'update';
        return baseInfoDs;
      }
    });

    return customizeForm(
      {
        code: 'SRPM.RP_PLATFORM_CREATE.BASEINFO', // 必传，和unitCode一一对应
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
        <Lov name="rpTypeId" />

        <Lov name="originalCurrency" />
        <Currency name="amount" />
        <Lov name="localCurrency" />
        <Currency name="localCurrencyNoTaxSum" />
        <Currency name="localCurrencyTaxSum" />

        <Lov name="containerId" />
        <Select name="rpStatus" disabled />
        <Lov name="requestedBy" />
        <DatePicker name="requestDate" />
        <TextArea name="remark" resize="vertical" />
      </Form>
    );
  }
);

export default Base;
