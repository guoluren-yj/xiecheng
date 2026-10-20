import React from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Button, Tooltip, Form, DateTimePicker, NumberField, TextArea } from 'choerodon-ui/pro';
import UrlAttachment from 'srm-front-boot/lib/components/UrlAttachment';
import intl from 'utils/intl';
import { bucketName } from '@/utils/smblConstant';
import { buildFileUrl } from '@/utils/utils.js';

import styles from './index.less';

function EditForm({ record, help }) {
  const picUrl = record && record.get('picUrl') && record.get('picUrl')[0];

  const deleteFile = () => {
    if (record) {
      record.set('picUrl', undefined);
    }
    // eslint-disable-next-line no-param-reassign
    record.attachmentCaches = observable.map();
  };

  return (
    <>
      {picUrl && (
        <div className={styles['attchament-container']}>
          <img
            src={buildFileUrl(picUrl)}
            alt="banner"
            style={{ width: '100px', height: '100px' }}
          />
          <div className={styles['attchament-btn']}>
            <Tooltip title={intl.get('hzero.common.button.detele').d('删除')}>
              <Button icon="delete_forever-o" onClick={deleteFile} />
            </Tooltip>
          </div>
        </div>
      )}
      {!picUrl && (
        <UrlAttachment
          record={record}
          bucketName={bucketName}
          name="picUrl"
          listType="picture-card"
          accept={['.png', '.jpg', '.jpeg']}
          max={1}
          className={styles['url-attchament']}
          showValidation="none"
        />
      )}
      <div
        newLine
        style={{
          color: '#868D9C',
          fontWeight: 400,
          lineHeight: '18px',
          marginTop: '8px',
          marginBottom: '16px',
        }}
      >
        {help}
      </div>
      <Form record={record} labelLayout="float">
        <DateTimePicker name="validDate" />
        <NumberField name="sequence" />
        <NumberField name="showTime" />
        <TextArea name="remark" />
      </Form>
    </>
  );
}

export default observer(EditForm);
