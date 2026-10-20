import React from 'react';
import { Attachment } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import notification from 'hzero-front/lib/utils/notification';

import Style from '../index.less';

export default function TemplateConfig({ record }) {
  const beforeUpload = (attachment) => {
    if (attachment && attachment.ext && ['doc', 'docx'].includes(attachment.ext.toLowerCase())) {
      return true;
    }
    notification.error({
      message: intl
        .get('ssrc.fileTemplateManage.view.message.supportDoc')
        .d('仅支持上传docx格式文件'),
    });
    return false;
  };

  return (
    <div>
      <div className={Style['template-upload-tips']}>
        <div>{intl.get('ssrc.fileTemplateManage.view.tips.uploadTipTitle').d('注意：')}</div>
        <div>
          {intl
            .get('ssrc.fileTemplateManage.view.tips.uploadTipOne')
            .d('1、模板文件仅支持上传.docx 文件格式，且仅支持上传一份文档；')}
        </div>
        <div>
          {intl
            .get('ssrc.fileTemplateManage.view.tips.uploadTipTwo')
            .d('2、模板文件保存后打印模板会同步变更，且保存后无法调整模板文件，请谨慎操作。')}
        </div>
      </div>
      <div>
        <Attachment
          record={record}
          name="templateUrl"
          accept={['.docx', '.DOCX']}
          viewMode="list"
          bucketName={PRIVATE_BUCKET}
          bucketDirectory="ssrc-file-template-manage"
          multiple={false}
          beforeUpload={beforeUpload}
          labelLayout="float"
        >
          {intl.get('hzero.common.upload.text').d('上传附件')}
        </Attachment>
      </div>
    </div>
  );
}
