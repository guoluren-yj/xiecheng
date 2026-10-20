import React, { useMemo, forwardRef, useImperativeHandle } from 'react';
import { Form, DataSet, TextArea, TextField, DatePicker, NumberField } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import { isEmpty, isNil } from 'lodash';
// import intl from 'utils/intl';
// import notification from 'utils/notification';

import { indexDS } from './indexDS';

const BatchModifying = forwardRef((props, ref) => {
  const {
    lineDs,
    campKey = null,
    customizeForm,
    // doubleUnitEnabled = 1,
    nodeTemplateCode,
    // handleSaveList = (e) => e,
  } = props;

  // const doubleUom = Boolean(doubleUnitEnabled);
  // console.log(doubleUom, 'doubleUom');
  const indexDs = useMemo(() => new DataSet(indexDS(nodeTemplateCode)), []);

  useImperativeHandle(ref, () => ({
    indexDs,
    ref: ref.current,
    handleBatchOk,
  }));

  const selectList = lineDs?.selected.map((item) => item?.toData()) || [];
  const handleBatchOk = async () => {
    const { __id, _status, __dirty, ...values } = indexDs?.current?.toData() || {};
    // if (['LABEL'].includes(nodeTemplateCode) && !isEmpty(selectList)) {
    //   const flag = selectList.every((item) => item.actualQuantity >= values.unitPackageQuantity);
    //   if (!flag) {
    //     notification.warning({
    //       message: intl
    //         .get('slod.deliveryWorkbench.view.title.variablesTest')
    //         .d('【单包装数】不可超过【本次创建数量】，请检查后重试。'),
    //     });
    //     return false;
    //   }
    // }
    const fields = indexDs?.fields.toJSON();
    const batchRecord = indexDs?.current;
    // const initFields = indexDs.props.fields;
    // Reflect.deleteProperty(formData, '__dirty');
    const formFlag = await indexDs.validate();
    if (isEmpty(values)) return true;
    if (!formFlag) return false;
    const tempArr = [];
    // const custStandardFields = [];
    const fieldMapValues = [];
    indexDs.fields.forEach((i) => {
      tempArr.push(i.get('name'));
    });
    for (const i in fields) {
      if (Object.prototype.hasOwnProperty.call(fields, i) && fields[i]) {
        const value = fields[i].getValue(batchRecord);
        // const lable = fields[i].get('label');
        const bind = fields[i].get('bind');
        // 是否是扩展的标准字段
        // const isCustStandardField = !(
        //   initFields.find((n) => n.name === fields[i].name) || fields[i].name.includes('attribute')
        // );
        // if (isCustStandardField && lable && value) {
        //   custStandardFields.push(lable);
        // }
        if (value && !bind) {
          fieldMapValues.push([i, value]);
        }
      }
    }
    // if (!isEmpty(custStandardFields)) {
    //   notification.error({
    //     message: intl
    //       .get(`slod.deliveryWorkbench.view.message.hasCustStandardFields`, {
    //         fields: String(custStandardFields.map((i) => `【${i}】`)),
    //       })
    //       .d('{fields}为扩展的标准字段，不允许批量编辑！'),
    //   });
    //   return false;
    // }
    if (isEmpty(selectList)) {
      const oldBatchData = lineDs.getState('batchData') || {};
      const oldFieldMapValues = lineDs.getState('fieldMapValues') || [];
      lineDs.setState({
        batchData: {
          ...oldBatchData,
          ...values,
          customizeUnitCode: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_LIST`,
        },
        fieldMapValues: [...oldFieldMapValues, ...fieldMapValues],
      });
    }
    const data = indexDs.current.get(tempArr);
    runInAction(() => {
      Object.keys(data).forEach((item) => {
        if (!isNil(data[item])) {
          (isEmpty(lineDs.selected) ? lineDs.all : lineDs.selected).forEach((i) => {
            tempArr.forEach((key) => {
              const field = i.getField(key);
              if (!isNil(data[key]) && !field.disabled) {
                i.setState({ batchFlag: true });
                i.set({ [key]: data[key] });
              }
            });
          });
        }
      });
    });
    indexDs.reset();
    return true;
  };
  return (
    <>
      {customizeForm(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.BATCH_MAINTAIN`,
          __force_record_to_update__: true,
        },
        <Form labelLayout="float" dataSet={indexDs} columns={1}>
          {/* {nodeTemplateCode === 'ASN' && !doubleUom && <NumberField name="actualQuantity" />} */}
          {nodeTemplateCode === 'ASN' && <NumberField name="unitPackageQuantity" />}
          {nodeTemplateCode === 'ASN' && <NumberField name="netWeight" />}
          {nodeTemplateCode === 'ASN' && <NumberField name="grossWeight" />}
          {nodeTemplateCode === 'ASN' && <TextField name="lotNum" />}
          {nodeTemplateCode === 'ASN' && <DatePicker name="productionDate" />}
          {nodeTemplateCode === 'ASN' && <DatePicker name="lotExpirationDate" />}
          {nodeTemplateCode === 'ASN' && <TextField name="serialNum" />}
          {nodeTemplateCode === 'ASN' && <TextField name="deliveryAddress" />}
          {nodeTemplateCode === 'ASN' && <TextField name="receiveAddress" />}
          {nodeTemplateCode === 'ASN' && campKey === 'p' && <TextArea name="purchaseLineRemark" />}
          {nodeTemplateCode === 'ASN' && campKey === 's' && <TextArea name="supplierLineRemark" />}
          {nodeTemplateCode === 'PLAN' && <DatePicker name="plannedArrivalDate" />}
          {['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode) && (
            <NumberField name="unitPackageQuantity" />
          )}
          {['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode) && (
            <NumberField name="volumeLength" />
          )}
          {['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode) && (
            <NumberField name="volumeWidth" />
          )}
          {['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode) && (
            <NumberField name="volumeHeight" />
          )}
          {['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode) && <NumberField name="netWeight" />}
          {['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode) && (
            <NumberField name="grossWeight" />
          )}
        </Form>
      )}
    </>
  );
});
export default BatchModifying;
