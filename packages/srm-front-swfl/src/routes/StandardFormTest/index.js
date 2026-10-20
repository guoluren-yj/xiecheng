import React, { useMemo, useEffect, useState } from 'react';
import { DataSet, Form, TextField, TelField, Attachment } from 'choerodon-ui/pro';

import { Content } from 'hzero-front/lib/components/Page';
import { getCurrentUser } from 'hzero-front/lib/utils/utils';
import { PHONE } from 'hzero-front/lib/utils/regExp';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import Upload from 'srm-front-boot/lib/components/Upload';


export default function StandardFormTest(props) {
  const {
    additionInfo: { phone },
  } = getCurrentUser();
  const { onLoad, onFormLoaded } = props;
  const [waitCustomize, setWaitCustomize] = useState(true);
  const [templateConfig, setTemplateConfig] = useState({});
  const formDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      forceValidate: true,
      fields: [
        { name: 'code', label: '编码', required: true },
        {
          name: 'phone',
          label: '编码',
          type: 'tel',
          regionField: 'tel',
          // required: true,
          dynamicProps: {
            pattern: ({ record }) => record?.get('tel') === '+86' && PHONE,
          },
        },
        {
          name: 'phone1',
          label: '编码',
          regionField: 'tel',
          // required: true,
          dynamicProps: {
            pattern: ({ record }) => record?.get('tel') === '+86' && PHONE,
          },
        },
        {
          name: 'phone2',
          label: '编码',
          regionField: 'tel',
          // required: true,
          dynamicProps: {
            pattern: ({ record }) => record?.get('tel') === '+86' && PHONE,
          },
        },
        { name: 'tel', type: 'string', lookupCode: 'HPFM.IDD' },
        { name: 'attachment', type: 'attachment', bucketName: 'private-bucket' },
      ],
      data: [
        {
          phone,
          phone1: phone,
          phone2: phone,
          _token: '123',
          attachment: '3034ec32af6ec34f13bf83a7e6e263688a',
        },
      ],
    });
  }, []);
  useEffect(() => {
    if (onFormLoaded) {
      onFormLoaded(true);
    }
    if (onLoad) {
      onLoad({ submit });
    }
    setWaitCustomize(true);
    setTimeout(() => {
      setWaitCustomize(false);
      setTemplateConfig({
        cuszTplVersion: -2147483648,
        cuszTplTemplateCode: '001',
        cuszTplStageCode: 'SUBMIT',
        cuszTplPageCode: 'DELIVERY_WORKBENCH.DETAIL',
      });
    }, 2000);
  }, []);

  const submit = () => {
    return new Promise(async (resolve, reject) => {
      const flag = await formDs.validate();
      if (!flag) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({
          message: '有必输项未填！',
        });
      }
      resolve(true);
    });
  };

  return (
    <Content>
      <Upload attachmentUUid='3034ec32af6ec34f13bf83a7e6e263688a' showHistory />
      <Form dataSet={formDs} columns={3}>
        <TextField name="code" />
        <TelField name="phone" />
        <TelField name="phone1" mode="secret" />
        <TelField name="phone2" mode="secret" readOnly />
        <Attachment name='attachment' />
        <Attachment readOnly name='attachment' showHistory />
      </Form>
      <SearchBarTable
        searchCode="TEST.TEST.1"
        dataSet={formDs}
        columns={[{ name: 'field10' }]}
        searchBarConfig={{
          isTemplate: true,
          loading: waitCustomize,
          templateConfig,
        }}
      />
    </Content>
  );
}
