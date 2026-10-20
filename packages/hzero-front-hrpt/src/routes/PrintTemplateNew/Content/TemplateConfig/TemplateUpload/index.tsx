import React from 'react';
import { Attachment } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import intl from 'hzero-front/lib/utils/intl';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import notification from 'hzero-front/lib/utils/notification';

import styles from '../index.less';

export default function TemplateConfig({ record }) {

  const beforeUpload = (attachment) => {
    if (attachment &&  attachment.ext && ['docx'].includes(attachment.ext.toLowerCase())) {
      return true;
    }
    notification.error({
      message: intl.get('hrpt.reportDesign.view.message.supportDoc').d('仅支持上传docx格式文件'),
    });
    return false;
  };
  
  return (
    <div>
      <div className={styles['template-upload-tips']}>
        <div>{intl.get('hrpt.printTemplate.templateUplaod.attention.title').d('注意')}:</div>
        <div>{intl.get('hrpt.printTemplate.templateUplaod.attention.meesage1').d('1、模板文件仅支持上传.docx 文件格式，且仅支持上传一份文档；')}</div>
        <div>{intl.get('hrpt.printTemplate.templateUplaod.attention.message2').d('2、模板文件的删除/变更会导致打印模板同步变更，请谨慎操作；')}</div>
      </div>
      <div>
        <Attachment
          record={record}
          name='templateUrl'
          accept={['.docx', '.DOCX']}
          viewMode='list'
          bucketName={PRIVATE_BUCKET}
          bucketDirectory='print_word_template'
          multiple={false}
          beforeUpload={beforeUpload}
          labelLayout={LabelLayout.float}
        >
          {intl.get('hrpt.printTemplate.templateUplaod').d('上传附件')}
        </Attachment>
      </div>
    </div>
  )
}