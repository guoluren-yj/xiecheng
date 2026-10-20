/*
 * @Descripttion: 寻源过程审批--基本信息
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 15:32:18
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import Upload from '_components/C7NUpload';
// import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import Store from '../store';
import style from './index.less';

const BasicInfo = () => {
  const {
    commonDs: { basicFormDs },
  } = useContext(Store);
  // const { customizeForm } = props;

  return (
    <React.Fragment>
      <Form
        dataSet={basicFormDs}
        columns={3}
        labelLayout="vertical"
        className="c7n-pro-vertical-form-display"
      >
        <Output name="rfTitle" />
        <Output name="sourceProjectNum" />
        <Output name="sourceProjectName" />
        <Output name="closeReason" />
        <Upload
          className={style.c7nUpload}
          viewOnly
          name="adjustAttachmentUuid"
          dataSet={basicFormDs}
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-rf-adjust"
          tenantId={getCurrentOrganizationId()}
          fileSize={FIlESIZE}
          {...ChunkUploadProps}
        />
      </Form>
    </React.Fragment>
  );
};

export default BasicInfo;
