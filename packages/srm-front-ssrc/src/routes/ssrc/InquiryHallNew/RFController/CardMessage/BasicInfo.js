/*
 * @Descripttion: 寻源过程控制--基本信息
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 15:32:18
 * @LastEditors: yiping.liu
 */
import React, { useContext } from 'react';
import { Form, Output, TextField, Attachment } from 'choerodon-ui/pro';
// import Upload from '_components/C7NUpload';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { observer } from 'mobx-react';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';
import Store from '../store';

const BasicInfo = observer((props) => {
  const { customizeForm } = useContext(Store);

  const { basicFormDs } = props;

  return (
    <React.Fragment>
      {customizeForm(
          {
            code: `SSRC.INQUIRY_HALL.RF_CONTROL.BASE_INFO`,
            dataSet: basicFormDs,
          },
        <Form dataSet={basicFormDs} columns={3} labelLayout="float" useWidthPercent>
          <TextField name="rfTitle" />
          <Output name="rfNum1" hidden />
          <Output name="rfName" hidden />
          <TextField name="adjustRemark" />
          {/* <Upload
            className={style.c7nUpload}
            name="adjustAttachmentUuid"
            // uploadShowFlag
            filePreview
            btnText={intl
              .get(`ssrc.inquiryHall.view.message.upLoadChangeAttachment`)
              .d('变更附件上传')}
            fileSize={FIlESIZE}
            viewMode="popup"
            label={intl.get(`ssrc.rfDetail.view.message.attachment`).d('附件')}
            name="adjustAttachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rf-adjust"
            tenantId={getCurrentOrganizationId()}
          /> */}
          <Attachment
            fileSize={FIlESIZE}
            viewMode="popup"
            label={intl.get(`ssrc.rfDetail.view.message.attachment`).d('附件')}
            name="adjustAttachmentUuid"
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rf-adjust"
            data={{
              tenantId: getCurrentOrganizationId(),
            }}
            {...ChunkUploadProps}
          />
        </Form>
      )}
    </React.Fragment>
  );
});

export default BasicInfo;
