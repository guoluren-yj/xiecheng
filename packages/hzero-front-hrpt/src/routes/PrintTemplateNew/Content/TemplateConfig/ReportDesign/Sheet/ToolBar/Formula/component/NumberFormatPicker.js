import React, { useImperativeHandle, useMemo } from 'react';
import { NumberField, DataSet, CheckBox } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import styles from '../index.less';

export default function DateFormatPicker(props) {
  const { modal, param, customeRenderRef, onSubmit } = props;
  const formDs = useMemo(() => {
    const initValue = param && param.value && param.value.value;
    const data = {
      thousandthFlag: false,
      decimalPlaces: 0,
    };
    if (/#,##/.test(initValue)) {
      data.thousandthFlag = true;
    }
    if (/\.(\d+)/.test(initValue)) {
      const res = initValue.match(/\.(\d+)/);
      if (res && res[1]) data.decimalPlaces = res[1].length;
    }
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'decimalPlaces',
          type: 'number',
          step: 1,
          min: 0,
          max: 10,
        },
        {
          name: 'thousandthFlag',
          type: 'boolean',
        },
      ],
      data: [data],
    });
  }, []);

  useImperativeHandle(customeRenderRef, () => {
    return {
      submit,
    };
  });

  const submit = () => {
    const record = formDs.current;
    let decimalPlaces = 0;
    let thousandthFlag = false;
    let format = '0';
    if (record) {
      decimalPlaces = record.get('decimalPlaces');
      thousandthFlag = record.get('thousandthFlag');
      if (thousandthFlag) {
        format = '#,##0';
      }
      if (decimalPlaces > 0) {
        decimalPlaces = decimalPlaces > 10 ? 10 : decimalPlaces;
        format = format.concat('.').concat(new Array(decimalPlaces).fill('0').join(''));
      }
    }
    var text = intl.get('hrpt.reportDesign.model.fontFormat.decimalPlaces').d("小数位数")
      .concat(':')
      .concat(decimalPlaces)
      .concat(',')
      .concat(intl.get('hrpt.reportDesign.model.fontFormat.thousandth').d('使用千位分隔符(,)'))
      .concat(":")
      .concat(thousandthFlag ? intl.get('hzero.common.status.yes').d('是') : intl.get('hzero.common.status.no').d('否'));
    onSubmit({
      text,
      value: `'${format}'`,
    });
  };

  const handleChangeDecimalPlaces = v => {
    if (formDs.current) {
      formDs.current.set('decimalPlaces', v < 0 ? 0 : v > 10 ? 10 : v);
    }
  };

  return (
    <div className={styles['number-format-form']}>
      <div style={{ marginBottom: '10px' }}>
        <span style={{ marginRight: '12px' }}>
          {intl.get('hrpt.reportDesign.model.fontFormat.decimalPlaces').d('小数位数')}
        </span>
        <NumberField precision={0} dataSet={formDs} onChange={handleChangeDecimalPlaces} name="decimalPlaces" />
      </div>
      <div style={{ margin: '1px 0 7px' }}>
        <CheckBox dataSet={formDs} name="thousandthFlag" />
        <span style={{ marginLeft: '10px', letterSpacing: '0.4px' }}>
          {intl.get('hrpt.reportDesign.model.fontFormat.thousandth').d('使用千位分隔符(,)')}
        </span>
      </div>
    </div>
  );
}