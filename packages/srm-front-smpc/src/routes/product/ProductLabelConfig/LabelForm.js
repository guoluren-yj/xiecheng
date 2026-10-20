import React from 'react';
import { Form, Output, TextField, IntlField, Lov } from 'choerodon-ui/pro';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Card from '@/components/Card';
import LabelColor from './LabelColor';

import './index.less';

const organizationId = getCurrentOrganizationId();

const isPlatform = organizationId === 0;

export default function (props) {
  const { dataSet } = props;
  const renderLabelColor = ({ value, record }) => {
    return (
      <LabelColor
        colorCode={value}
        onChange={(color) => {
          record.set('labelColorCode', color);
        }}
      />
    );
  };

  return (
    <>
      <Card title={intl.get('smpc.product.view.baseInfo1').d('基础信息')}>
        <Form dataSet={dataSet} labelLayout="float" columns={1}>
          <TextField name="labelCode" />
          <IntlField name="labelName" />
          {!isPlatform && <Lov name="labelSuppliers" noCache maxTagCount={3} />}
        </Form>
      </Card>
      <Card title={intl.get('smpc.product.model.labelColor').d('标签颜色')}>
        <Form dataSet={dataSet} labelLayout="float" columns={1}>
          <Output
            name="labelColorCode"
            label=""
            renderer={renderLabelColor}
            className="label-color-output"
          />
        </Form>
      </Card>
    </>
  );
}
