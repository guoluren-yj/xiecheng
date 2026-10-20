/* eslint-disable prefer-destructuring */
import React, { useMemo } from 'react';

const DEFAULT_BUCKET_NAME = 'spfm-comp';
export default function UploadFileNumSync(props) {
  const { ctx, parentUpload } = props;
  const propsUuid = parentUpload.props.attachmentUUID;
  const stateUuid = parentUpload.state.attachmentUUID;

  useMemo(() => {
    const uuid = stateUuid || propsUuid;
    let fileList = parentUpload.state.fileList || [];
    let bucketName = DEFAULT_BUCKET_NAME;
    if (parentUpload.props.bucketName) bucketName = parentUpload.props.bucketName;
    if (parentUpload.upload && parentUpload.upload.state.fileList)
      {fileList = parentUpload.upload.state.fileList;}
    if (ctx && ctx.attachmentsCount && uuid) {
      ctx.attachmentsCount[`${uuid}#${bucketName || ''}`] = fileList.filter(
        (item) => item.status !== 'removed'
      ).length;
    }
  }, [parentUpload.state.fileList, propsUuid, stateUuid, parentUpload.upload]);
  return null;
}
