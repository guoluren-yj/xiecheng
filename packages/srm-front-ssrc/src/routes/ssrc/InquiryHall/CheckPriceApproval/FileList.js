import React, { useEffect, useState, Suspense } from 'react';
import { Tooltip } from 'hzero-ui';

import { queryFileListOrg } from 'services/api';
import { getAttachmentUrl } from 'hzero-front/lib/utils//utils';
// import Upload from 'srm-front-boot/lib/components/Upload';
import { FIlESIZE, ChunkUploadProps } from '@/utils/SsrcRegx';

import styles from './index.less';
import excelIcon from '@/assets/icons/excel.svg';
import pdfIcon from '@/assets/icons/pdf.svg';
import picIcon from '@/assets/icons/pic.svg';
import pptIcon from '@/assets/icons/ppt.svg';
import txtIcon from '@/assets/icons/txt.svg';
import wordIcon from '@/assets/icons/word.svg';
import zipIcon from '@/assets/icons/zip.svg';
import unknowIcon from '@/assets/icons/unknow.svg';

export default ({
  attachmentUUID,
  organizationId,
  bucketName,
  bucketDirectory,
  filePreview,
  viewOnly,
  uploadShowFlag,
}) => {
  const [fileList, setFileList] = useState([]);
  const Upload = React.lazy(() => import('srm-front-boot/lib/components/Upload'));
  // 查询相关文件信息
  const fetchAttachment = () => {
    /* eslint-disable no-new */
    new Promise(() => {
      queryFileListOrg({
        bucketName,
        attachmentUUID,
      }).then((res) => {
        const defaultFileList = res.map((item, index) => ({
          uid: index,
          name: item.fileName,
          type: item.fileType,
          status: 'done',
          size: item.fileSize,
          response: item.fileUrl,
          url: getAttachmentUrl(
            item.fileUrl,
            item.bucketName,
            organizationId,
            item.bucketDirectory
          ),
          thumbUrl: getAttachmentUrl(
            item.fileUrl,
            item.bucketName,
            organizationId,
            item.bucketDirectory
          ),
        }));
        setFileList(defaultFileList);
      });
    });
  };

  // 防止重复点击对服务器造成压力
  const throttle = () => {
    const clickArray = {};
    return (e) => {
      const text = e.target.textContent;
      if (!clickArray[text]) {
        clickArray[text] = setTimeout(() => {
          clickArray[text] = null;
        }, 5000);
      } else {
        e.preventDefault();
      }
    };
  };

  useEffect(() => {
    // eslint-disable-next-line no-unused-expressions
    uploadShowFlag && attachmentUUID && fetchAttachment();
  }, [attachmentUUID]);

  const picType = ['jpeg', 'png', 'jpg', 'svg']; // 可以补充

  return (
    <div className={styles['fileList-div']} onClick={throttle()}>
      {uploadShowFlag ? (
        Array.isArray(fileList) && fileList.length ? (
          fileList.map((item) => {
            const type = item.name.slice(item.name.lastIndexOf('.') + 1);
            let icon = unknowIcon;
            if (type === 'doc' || type === 'docx') {
              icon = wordIcon;
            } else if (type === 'xls' || type === 'xlsx') {
              icon = excelIcon;
            } else if (type === 'ppt' || type === 'pptx') {
              icon = pptIcon;
            } else if (type === 'pdf') {
              icon = pdfIcon;
            } else if (picType.find((x) => x === type)) {
              icon = picIcon;
            } else if (type === 'txt') {
              icon = txtIcon;
            } else if (type === 'zip') {
              icon = zipIcon;
            }
            return (
              <div>
                <img src={icon} alt="" style={{ width: '14px', marginRight: '6px' }} />
                <Tooltip title={item.name}>
                  <a className={styles['fileList-a']} href={item.url}>
                    {item.name}
                  </a>
                </Tooltip>
              </div>
            );
          })
        ) : null
      ) : (
        <Suspense fallback="">
          <Upload
            bucketName={bucketName}
            bucketDirectory={bucketDirectory}
            attachmentUUID={attachmentUUID}
            filePreview={filePreview}
            viewOnly={viewOnly}
            organizationId={organizationId}
            fileSize={FIlESIZE}
            {...ChunkUploadProps}
          />
        </Suspense>
      )}
    </div>
  );
};
