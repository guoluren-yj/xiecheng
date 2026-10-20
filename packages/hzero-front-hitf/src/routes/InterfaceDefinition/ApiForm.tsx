import React, { useState, useCallback, useEffect } from 'react';
import { DataSet, Form, TextField, Select, IntlField } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import intl from 'hzero-front/lib/utils/intl';

import styles from './index.less';

interface ApiFormProps {
  treeDs: DataSet,
  formDs: DataSet,
  obj?: any,
  childRef: any,
}

const ApiForm: React.FC<ApiFormProps> = ({ treeDs, formDs, obj, childRef }) => {
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    if(formDs.current && obj) {
      formDs.loadData([obj]);
    }
  }, [formDs]);

  if(childRef) {
    // eslint-disable-next-line no-param-reassign
    childRef.current = { flag };
  }

  // 新增弹窗编码值转大写
  const handleToUpper = useCallback((value) => {
    const upperValue = value.toUpperCase();
    const treeArr: any[] = treeDs.toData() || [];
    const flagArr = treeArr.filter((item: { interfaceCategoryCode: String }) => item.interfaceCategoryCode === upperValue);
    if (formDs.current) {
      formDs.current.set('interfaceCategoryCode', upperValue);
    }
    setFlag(flagArr.length > 0);
  }, [formDs, treeDs]);

  return (
    <Form dataSet={formDs} labelLayout={LabelLayout.float} className={styles['modal-form']}>
      {!obj && (
        <>
          <TextField
            name="interfaceCategoryCode"
            restrict="A-Za-z._"
            onChange={handleToUpper}
          />
          {flag && (
            <span className={styles['repeat-info']}>
              {intl.get('hitf.common.api.code.repeat.info').d('类别编码不能重复，请重新输入')}
            </span>
          )}
        </>
      )}
      <IntlField name="interfaceCategoryName" />
      <Select name="applicationTypeCode" />
    </Form>
  );
};

export default React.memo(formatterCollections({
  code: ['hzero.common', 'hitf.common', 'hitf.application'],
})(ApiForm));
