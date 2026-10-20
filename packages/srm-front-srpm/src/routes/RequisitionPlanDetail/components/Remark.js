import React, { useImperativeHandle } from 'react';
import { Form, DataSet, TextArea } from 'choerodon-ui/pro';
import { remarkDs } from '../indexDS';
// import CollapseForm from '_components/CollapseForm';
import styles from '../index.less';

const Base = React.forwardRef(({ required = false, remarkLabel }, ref) => {
  const remarkInfo = new DataSet(remarkDs({ required }));
  // 函数组件调用到子组件的函数
  useImperativeHandle(ref, () => ({
    loadCurrentData,
    handleGetDeatial,
    saveCurrentData,
    ref: ref.current,
  }));

  const loadCurrentData = (data) => {
    remarkInfo.loadData([data]);
  };

  const handleGetDeatial = (detailField) => remarkInfo.get(detailField);

  const saveCurrentData = () => {
    return remarkInfo;
  };

  return (
    <div className={styles['rfx-card-item-form']}>
      <Form dataSet={remarkInfo} useColon={false} labelLayout="float">
        <TextArea name="cancelRemark" label={remarkLabel} resize="vertical" />
      </Form>
    </div>
  );
});

export default Base;
