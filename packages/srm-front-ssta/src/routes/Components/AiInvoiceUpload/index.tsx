import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { Spin } from 'choerodon-ui';
import { Attachment, Icon, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import request from 'utils/request';
import { SRM_SSTA } from '_utils/config';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import styles from './index.less';

const { Dragger } = Attachment;

const bucketName = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const bucketDirectory = 'finance-invoice';

interface AiInvoiceUploadProps {
  modal?: any;
  settleHeaderId?: string | number;
  onError?: (err: any) => void;
}

const AiInvoiceUpload: React.FC<AiInvoiceUploadProps> = observer(({ modal, settleHeaderId }) => {
  const [loading, setLoading] = useState(false);
  const formDs = useMemo(() => new DataSet({
    autoCreate: true,
    dataToJSON: DataToJSON.all,
    forceValidate: true,
    fields: [
      {
        name: 'aiAttachmentUuid',
        type: FieldType.attachment,
        required: true,
        fileSize: 50 * 1024 * 1024,
        bucketName,
        bucketDirectory,
      },
    ],
  }), []);

  const handleOk = useCallback(async () => {
    const isValid = await formDs.validate();
    if (!isValid) return false;
    setLoading(true);
    const res = getResponse(await aiInvoiceRecognize({
      aiAttachmentUuid: formDs.current?.get('aiAttachmentUuid'),
      settleHeaderId,
    }));
    setLoading(false);
    if (!res) return false;
  }, [formDs, settleHeaderId]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleOk);
    }
  }, [modal, handleOk]);

  const help = intl
    .get(`ssta.common.model.verify.newMultipleUpload`, {
      size: 50,
      fileType: 'jpg/jpeg/png/bmp/pdf',
    })
    .d(`支持{fileType}格式，建议单个附件不超过{size}M,可批量上传`);


  return (
    <Spin spinning={loading}>
      <Dragger
        name="aiAttachmentUuid"
        dataSet={formDs}
        help={help}
        className={styles['ssta-aiupload-dragger']}
        accept={['.jpg', '.jpeg', '.png', '.bmp', '.pdf']}
      >
        <p className="ssta-aiupload-dragger-icon"><Icon type="upload_black-o" /></p>
        <p className="ssta-aiupload-dragger-text">
          {intl.get('ssta.common.view.message.clickOrDragFileToUpload').d('点击这里或者拖拽文件到这里上传')}
        </p>
        <p className='ssta-aiupload-help-text'>
          {help}
        </p>
      </Dragger>
    </Spin>
  );
});

export default AiInvoiceUpload;

// AI发票识别
export async function aiInvoiceRecognize(body) {
  return request(`${SRM_SSTA}/v1/${getCurrentOrganizationId()}/invoice-ai-batch/recognize`, {
    method: 'POST',
    body: filterNullValueObject(body),
  });
}
