/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-09-21 10:59:39
 * @LastEditors: yanglin
 * @LastEditTime: 2022-11-28 15:33:10
 */
import React from 'react';
// import intl from 'utils/intl';
import { InputNumber } from 'hzero-ui';

export default (props) => {
  const { materielDetail, onChange, disabled, form } = props;

  const { getFieldDecorator } = form;

  return (
    <div style={{ width: '100%', display: 'flex' }}>
      {getFieldDecorator('primaryUomScale', {
        initialValue: materielDetail.primaryUomScale,
        // rules: [
        //   {
        //     required: true,
        //     message: intl.get('hzero.common.validation.notNull', {
        //       name: intl.get('smdm.materiel.model.materiel.primaryUomScale').d('双单位基本单位比例'),
        //     }),
        //   },
        // ],
      })(
        <InputNumber
          style={{ width: '100%' }}
          max={99999999.99999999}
          min={0.00000001}
          onChange={onChange}
          disabled={disabled}
        />
      )}
      :
      {getFieldDecorator('secondaryUomScale', {
        initialValue: materielDetail.secondaryUomScale,
        // rules: [
        //   {
        //     required: !!getFieldValue('primaryUomScale'),
        //     message: intl.get('hzero.common.validation.notNull', {
        //       name: intl.get('smdm.materiel.model.materiel.secondaryUomScale').d('双单位辅助单位比例'),
        //     }),
        //   },
        // ],
      })(
        <InputNumber
          style={{ width: '100%' }}
          max={99999999.99999999}
          min={0.00000001}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  );
};
