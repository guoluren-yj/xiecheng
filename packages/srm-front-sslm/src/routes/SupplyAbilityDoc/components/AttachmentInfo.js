/*
 * AttachmentInfo - 附件信息
 * @Date: 2024-06-04 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import FormField from '@/routes/components/FormField';

const AttachmentInfo = ({ dataSet, isEdit = false }) => {
  return (
    <div className="card-content">
      <div className="card-content-title">
        {intl.get('hzero.common.view.title.attachment').d('附件')}
      </div>
      <Form
        columns={4}
        dataSet={dataSet}
        useWidthPercent
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        <FormField
          name="attachmentUuid"
          isEdit
          componentType="ATTACHMENT"
          readOnly={!isEdit}
          colSpan={2}
        />
      </Form>
    </div>
  );
};

export default AttachmentInfo;
