/*
 * AttachmentInfo - 附件信息
 * @Date: 2023-08-25 10:19:06
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Alert } from 'choerodon-ui';
import { Form } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import FormField from '@/routes/components/FormField';
import styles from '../styles.less';

const AttachmentInfo = ({ dataSet, isEdit = false, viewUpdate = false }) => {
  return !viewUpdate ? (
    <>
      <Alert
        showIcon
        type="info"
        className={styles['att-alert']}
        message={intl
          .get('sslm.enterpriseInform.view.message.supplierAttInfoTips')
          .d(
            '请注意此处上传的附件，仅作为当前变更单变更内容的辅助说明。如您需要更新资质文件等信息，请在“企业信息-附件信息“区域中维护'
          )}
      />
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
    </>
  ) : null;
};

export default AttachmentInfo;
