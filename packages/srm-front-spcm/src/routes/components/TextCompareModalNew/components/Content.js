/**
 *  弹窗表单
 */
import React from 'react';
import { compose } from 'lodash';

import { Form, Select, TextField } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import { TopSection, SecondSection } from '_components/Section';
import intl from 'utils/intl';

const Index = ({ dataSet }) => {
  return (
    <TopSection>
      <SecondSection title={intl.get('spcm.common.view.title.basicDocument').d('基准文档')}>
        <Form
          dataSet={dataSet}
          columns={1}
          labelLayout="float"
          style={{
            marginBottom: 16,
          }}
        >
          <TextField name="fileUrlMeaning" />
        </Form>
      </SecondSection>
      <SecondSection
        title={intl.get('spcm.common.view.title.selectCompareDocument').d('选择对比文档')}
      >
        <Form dataSet={dataSet} columns={1} labelLayout="float">
          <Select name="comparefileUrl" />
        </Form>
      </SecondSection>
    </TopSection>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common'],
  })
)(Index);
