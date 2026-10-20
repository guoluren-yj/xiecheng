import React from 'react';
import formatterCollections from 'srm-front-boot/lib/utils/intl/formatterCollections';
import { DataSet, Form, Icon, Lov, IntlField, TextField, CheckBox } from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { Observer } from 'mobx-react-lite';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

interface IProps {
  createCompositionDS?: DataSet;
  record?: Record;
  [x: string]: any;
}

const Index = (props: IProps) => {
  const { createCompositionDS, record } = props;

  const formProps: any = {};
  if (createCompositionDS) {
    formProps.dataSet = createCompositionDS;
  } else {
    formProps.record = record;
  }

  return (
    <Observer>
      {() => (
        <Form {...formProps} labelLayout={LabelLayout.float} columns={2}>
          <Lov colSpan={2} name="masterObject" />
          <IntlField colSpan={2} name="businessObjectName" suffix={<Icon type="language" />} />
          <TextField
            colSpan={2}
            name="businessObjectCode"
            addonBefore={
              createCompositionDS?.current?.get('domainCode')?.length
                ? `${createCompositionDS?.current?.get('domainCode')}_C_`
                : ''
            }
          />
          <IntlField
            colSpan={2}
            name="remark"
            style={{ height: '80px' }}
            suffix={<Icon type="language" />}
          />
          <CheckBox name="standardFlag" />
        </Form>
      )}
    </Observer>
  );
};

export default formatterCollections({ code: ['hmde.boComposition'] })(Index);
