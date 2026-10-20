/* ManualCheck - 人工材料审核
 * @Date: 2022-06-13 20:43:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import styles from '../index.less';

const ManualCheck = ({ dataSet }) => {
  return (
    <Form dataSet={dataSet} labelLayout="float">
      <div className={styles['manual-review-title']}>
        <span />
        {intl.get('spfm.enterpriseCertification.view.title.basicInfo').d('基本信息')}
      </div>
      <TextField name="proposerName" />
      <TextField name="reason" />
      <div className={styles['manual-review-title']} style={{ 'margin-top': '32px' }}>
        <span />
        {intl.get('spfm.supplierRegister.view.manualReview.applyAttachment').d('申请附件')}
      </div>
      <Attachment
        name="attachmentUuid"
        bucketName={PRIVATE_BUCKET}
        bucketDirectory="sslm-common"
        funcType="link"
        viewMode="list"
      />
    </Form>
  );
};

export default ManualCheck;
