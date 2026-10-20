import React from 'react';
import { Form, Output, Attachment } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import moment from 'moment';

import { numberSeparatorRender } from '@/utils/renderer';

import Style from '../index.less';

// 基础信息卡片
const CommonChangeForm = observer((props) => {
  const { ds, fields, formConfig } = props || {};

  if (!ds || !fields) return null;

  return (
    <Form
      dataSet={ds}
      columns={3}
      labelLayout="vertical"
      className={`c7n-pro-vertical-form-display ${Style['sp-change-common-red']}`}
      useWidthPercent
      {...(formConfig || {})}
    >
      {fields?.map((field) => {
        switch (field?.componentType) {
          case 'string':
            if (field?.name === 'contactMobilephone') {
              // 电话号码特殊处理
              return (
                <Output
                  name={field?.name}
                  renderer={({ record }) =>
                    record?.get('internationalTelCode')
                      ? `${record?.get('internationalTelCode')} | ${
                          record?.get('contactMobilephone') ?? ''
                        }`
                      : record?.get('contactMobilephone')
                  }
                />
              );
            }
            return <Output name={field?.name} />;
          case 'number':
            return (
              <Output name={field?.name} renderer={({ value }) => numberSeparatorRender(value)} />
            );
          case 'date':
            return (
              <Output
                name={field?.name}
                renderer={({ value }) => value && moment(value).format(DEFAULT_DATE_FORMAT)}
              />
            );
          case 'attachment':
            return (
              <Attachment
                readOnly
                name={field?.name}
                data={{
                  tenantId: getCurrentOrganizationId(),
                }}
              />
            );
          default:
            return <Output name={field?.name} />;
        }
      })}
    </Form>
  );
});

export default CommonChangeForm;
