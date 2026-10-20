// import { SRM_SMBL } from "@/utils/config";
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { PRIVATE_BUCKET } from '_utils/config';
import { BUCKET_DIRECTORY } from '../Room/common/global';

const organizationId = getCurrentOrganizationId();

// 上传附件接口
export async function uploadFileApi(file, bucketName = PRIVATE_BUCKET) {
  const url = `/hfle/v1/${organizationId}/files/multipart`;
  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('bucketName', bucketName);
  formData.append('directory', BUCKET_DIRECTORY);
  formData.append('fileName', file.name);
  return request(url, {
    processData: false,
    method: 'POST',
    type: 'FORM',
    body: formData,
    responseType: 'text',
  });
}
