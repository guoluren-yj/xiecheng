/**
 *通用导入模块
 * @since 2020-08-13
 * @version 0.0.1
 * @author WY <yang.wang06@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Button, Upload } from 'hzero-ui';
import { isObject, isString } from 'lodash';
import { Bind } from 'lodash-decorators';

import request from 'utils/request';
import { API_HOST } from 'utils/config';
import { SRM_SSRC } from '_utils/config';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

const organizationId = getCurrentOrganizationId();

export default class UploadExcel extends React.Component {
  state = {
    uploadLoading: false,
  };

  @Bind()
  beforeUpload(file) {
    const {
      param = {},
      success = (e) => e,
      quotationHeaderId,
      sourceFrom = 'RFX',
      sourceHeaderId,
      templateCode,
      projectLineSectionId,
      operationType,
    } = this.props;
    const formData = new FormData();
    formData.append('excel', file, file.name);
    if (quotationHeaderId || sourceHeaderId) {
      const headerName = quotationHeaderId ? 'quotationHeaderId' : 'sourceHeaderId';
      const headerId = quotationHeaderId || sourceHeaderId;
      const url = projectLineSectionId
        ? `${API_HOST}${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/import-upload?templateCode=${templateCode}&${headerName}=${headerId}&sourceFrom=${sourceFrom}&projectLineSectionId=${projectLineSectionId}&operationType=${operationType}&importFrom=OFFLINE`
        : `${API_HOST}${SRM_SSRC}/v1/${organizationId}/share/sup-dtl/import-upload?templateCode=${templateCode}&${headerName}=${headerId}&sourceFrom=${sourceFrom}&operationType=${operationType}&importFrom=OFFLINE`;
      this.setState({
        uploadLoading: true,
      });
      request(url, {
        method: 'POST',
        query: param,
        body: formData,
        responseType: 'text',
      })
        .then((res) => {
          if (isJSON(res) && JSON.parse(res).failed) {
            notification.error({ description: JSON.parse(res).message });
          } else if (res) {
            success(res);
          }
        })
        .catch((e) => {
          throw e;
        })
        .finally(() => {
          this.setState({
            uploadLoading: false,
          });
        });
    }
    return false;
  }

  render() {
    const { uploadLoading } = this.state;
    const { disabled = false } = this.props;
    const uploadProps = {
      accept: '.xls,.xlsx,.csv',
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      style: {
        margin: '0 12px',
      },
    };
    return (
      <Upload {...uploadProps}>
        <Button className="label-btn" icon="upload" loading={uploadLoading} disabled={disabled}>
          {intl.get(`ssrc.quoDeImport.view.button.dataUpload`).d('数据上传')}
        </Button>
      </Upload>
    );
  }
}
