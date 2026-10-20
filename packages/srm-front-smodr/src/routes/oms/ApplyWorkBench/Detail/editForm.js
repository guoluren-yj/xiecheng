import React from 'react';
import { DatePicker, Form, TextField, Lov, TextArea, NumberField, Icon } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';
import { observable, action } from 'mobx';

import styles from './editForm.less';

export default function EditForm(props) {
  const { ds, title, type, skuDS, selectFlag } = props;
  const visible = observable.box(true);
  const flag = selectFlag
    ? skuDS?.selected?.map(i => i.toData()).some(f => f.agreementBusinessType === 'RECEIVE')
    : skuDS.toData().some(f => f.agreementBusinessType === 'RECEIVE');
  return (
    <div className={styles.content}>
      <Observer>
        {() => (visible.get() &&
          (
            <div className='title'>
              <div className='title-left'>
                <Icon type='help' /><span className='label'>{title}</span>
              </div>
              <Icon type='close' onClick={action(() => visible.set(false))} />
            </div>
          ))
        }
      </Observer>
      <div className='form-content'>
        <Observer>
          {() =>
          (
            <Form dataSet={ds} labelLayout='float'>
              {type.type === 'MANUAL' && <TextField name='skuName' />}
              <Lov name='itemCodeLov' />
              {type.type === 'MANUAL' && !flag && <NumberField name='quantityMeaning' />}
              {type.type === 'MANUAL' && !flag && <Lov name='uomName' />}
              {type.type === 'MANUAL' && !flag && <Lov name='taxRate' />}
              <DatePicker name='neededDate' />
              {type.type === 'MANUAL' && !flag && <Lov name='supplier' />}
              {/* {['MANUAL', 'CATA'].includes(type.type) && <Lov name='receiveFullAddress' />} */}
              <TextArea name='remark' resize="both" />
            </Form>
          )
          }
        </Observer>
      </div>
    </div>
  );
}
