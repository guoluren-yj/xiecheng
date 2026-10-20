import React, { useEffect } from 'react';
import { IntlField } from 'choerodon-ui/pro';
// import { observer } from 'mobx-react-lite';

// import intl from 'utils/intl';
import FormPro from '@/components/FormPro';
import { StatusTag } from '../../components/Tag';

// import styles from './index.less';

// const FloatFormField = observer(({ name, title = '' }) => {
//   return (
//     <div className={styles['float-form-field-wrap']}>
//       <p className={styles['field-title']}>{title}</p>
//       <CheckBox name={name}>{intl.get('sstk.common.view.enable').d('开启')}</CheckBox>
//     </div>
//   );
// });
export default function BaseInfo(props) {
  const { readOnly, dataSet } = props;
  useEffect(() => {
  }, [readOnly]);
  return (
    <>
      <FormPro
        style={{ width: '75% ' }}
        readOnly={readOnly}
        columns={3}
        dataSet={dataSet}
        fields={[
          { name: 'strategyCode' },
          {
            name: 'strategyName',
            FormField: IntlField,
          },
          {
            name: 'statusCode',
            show: readOnly,
            renderer: ({ text }) => <StatusTag published={text === 'RELEASED'} />,
          },
        ]}
      />
    </>
  );
};