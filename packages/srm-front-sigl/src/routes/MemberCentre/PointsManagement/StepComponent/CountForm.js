/**
 * 积分管理 - 选择积分数量步骤
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import intl from 'utils/intl';
import { Form, NumberField, DatePicker, Select } from 'choerodon-ui/pro';
import { Input } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import DataSetList from '@/components/DataSetList';
import classNames from 'classnames';

import styles from './index.less';

const { TextArea } = Input;

const CountForm = observer((props) => {
  const { dataSet, memberDS, customizeForm } = props;

  const handleInputRemarks = (e) => {
    if (dataSet.current) {
      dataSet.current.set('remarks', e.target.value);
    }
  };

  return (
    <div className={classNames(styles['count-form-layout'])}>
      {customizeForm(
        {
          code: 'SIGL.PONIT_MANAGE.DISTIBUTE_POINT.FORM',
        },
        <Form
          // className={styles['count-form-width']}
          labelLayout="float"
          dataSet={dataSet}
          columns={2}
        >
          <Select name="pointsTypeId" noCache />
          <NumberField
            className="count-input"
            name="pointsCount"
            suffix={`/${intl.get('sigl.memberCenter.view.numberField.unitPeople').d('人')}`}
          />
          <DatePicker name="expirationDate" />
          <TextArea
            name="remarks"
            placeholder={intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注')}
            label={intl.get(`sigl.memberCenter.view.modal.remarks`).d('备注')}
            maxLength={30}
            onChange={handleInputRemarks}
            value={dataSet.current ? dataSet.current.get('remarks') : ''}
          />
        </Form>
      )}
      <div style={{ marginTop: '24px' }}>
        <DataSetList dataSet={memberDS} />
      </div>
    </div>
  );
});

export default CountForm;
