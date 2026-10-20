import React, { useCallback, useEffect, useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { createFormDS } from './stores/listDS';

interface NewLanguageDrawerProps {
  modal?: any;
  onOk: (data: Record<string, any>) => Promise<boolean | void>;
}

const NewLanguageDrawer = (props: NewLanguageDrawerProps) => {
  const { modal, onOk } = props;
  const formDs = useMemo(() => new DataSet(createFormDS()), []);

  const handleOk = useCallback(async () => {
    const validate = await formDs.validate();
    if (!validate) return false;
    return onOk(formDs.current?.toData());
  }, [formDs, onOk]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
    }
  }, [handleOk, modal]);

  return (
    <Form dataSet={formDs} columns={1} labelLayout={LabelLayout.float}>
      <Select
        name="lang"
        placeholder={intl.get('ssta.invoiceAiPrompt.view.placeholder.lang').d('请选择发票语言')}
      />
    </Form>
  );
};

export default NewLanguageDrawer;
