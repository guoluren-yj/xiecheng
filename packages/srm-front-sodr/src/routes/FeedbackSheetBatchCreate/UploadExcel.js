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
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { API_HOST } from 'utils/config';
import notification from 'utils/notification';
import intl from 'utils/intl';

import { SRM_SIEC } from '_utils/config';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

export default class UploadExcel extends React.Component {
  state = {
    uploadLoading: false,
  };

  @Bind()
  beforeUpload(file) {
    const { templateCode, statusConfigId, param = {}, success = (e) => e } = this.props;
    const formData = new FormData();
    const organizationId = getCurrentOrganizationId();
    formData.append('excel', file, file.name);
    if (templateCode) {
      const url = `${API_HOST}${SRM_SIEC}/v1/${organizationId}/feedback-import/data-upload?templateCode=${templateCode}&statusConfigId=${statusConfigId}`;
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
        <Button className="label-btn" icon="download" loading={uploadLoading} disabled={disabled}>
          {intl.get(`ssrc.priceLibBatchCreate.view.button.importData`).d('数据导入')}
        </Button>
      </Upload>
    );
  }
}
