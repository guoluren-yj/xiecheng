/*
 * @Date: 2024-08-22 14:55:29
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { downloadFileByAxios } from 'services/api';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { batchDownloadAttachments } from '@/services/commonService';
import { isJSON } from '../utils';

const organizationId = getCurrentOrganizationId();

// 下载Url文件
export const downLoadUrlFile = async ({ url, bucketName = PRIVATE_BUCKET, setLoading }) => {
  if (url) {
    const api = `${HZERO_FILE}/v1/${organizationId}/files/download`;
    const queryParams = [{ name: 'url', value: url }, { name: 'bucketName', value: bucketName }];
    setLoading(true);
    await downloadFileByAxios({ requestUrl: api, queryParams });
    setLoading(false);
  }
};

// 下载uuid文件
export const downLoadUuidFile = ({ uuid, setLoading }) => {
  if (uuid) {
    setLoading(true);
    batchDownloadAttachments({
      uuids: [uuid],
    })
      .then(res => {
        const flag = isJSON(res);
        let resp = res;
        if (flag) {
          // 转json
          resp = JSON.parse(res);
        }
        // 先转json再调用getResponse，是因为如果接口报错报错信息被转化为了字符串（responseType: 'text'），这里在转化回json
        const result = getResponse(resp);
        if (result) {
          window.open(res);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  } else {
    notification.warning({
      message: intl.get('hzero.c7nProUI.Attachment.no_attachments').d('暂无附件'),
    });
  }
};
