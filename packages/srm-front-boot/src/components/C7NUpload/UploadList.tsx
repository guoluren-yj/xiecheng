/* eslint-disable react/jsx-filename-extension */
import type { ReactNode } from 'react';
import React, { useEffect, useState, useMemo } from 'react';
import classnames from 'classnames';
import { Size } from 'choerodon-ui/lib/_util/enum';
import Icon from 'choerodon-ui/pro/lib/icon';
import Progress from 'choerodon-ui/pro/lib/progress/Progress';
import type { FormFieldProps } from 'choerodon-ui/pro/lib/field/FormField';
import { FormField } from 'choerodon-ui/pro/lib/field/FormField';
import type { UploadFile } from 'choerodon-ui/pro/lib/upload/interface';
import { notification, Tooltip, Pagination, Spin } from 'choerodon-ui/pro/lib';
import Viewer from 'react-viewer';
import intl from 'utils/intl';
import request from 'hzero-front/lib/utils/request';
import { observer } from 'mobx-react-lite';
import { Modal, Popover } from 'choerodon-ui';
import { DataSet } from 'choerodon-ui/pro';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import { HZERO_HFLE } from 'hzero-front/lib/utils/config';
import { getAttachmentUrlWithToken } from "../../utils/utils";
import styles from './upload.less';

const { BASE_PATH } = getEnvConfig<any>();


const supportPreviewList = [
  '.doc', '.docx', '.docm', '.dot', '.dotx', '.dotm',
  '.odt', '.fodt', '.ott', '.rtf', '.txt', '.html', '.htm', '.mht',
  '.pdf',
  '.djvu', '.fb2', '.epub', '.xps',
  '.xls', '.xlsx', '.xlsm', '.xlt', '.xltx', '.xltm', '.ods', '.fods', '.ots', '.csv',
  '.pps', '.ppsx', '.ppsm', '.ppt', '.pptx', '.pptm', '.pot', '.potx', '.potm', '.odp', '.fodp', '.otp', '.zip', 'rar', '7z', 'tar'
];
const newUrlPreviewList = [
  // ".doc", ".docx", ".docm",
  '.dot', '.dotx', '.dotm',
  '.odt', '.fodt', '.ott', '.rtf', '.txt', '.html', '.htm', '.mht',
  // ".pdf",
  '.djvu', '.fb2', '.epub', '.xps',
  '.xls', '.xlsx', '.xlsm', '.xlt', '.xltx', '.xltm', '.ods', '.fods', '.ots', '.csv',
  '.pps', '.ppsx', '.ppsm', '.ppt', '.pptx', '.pptm', '.pot', '.potx', '.potm', '.odp', '.fodp', '.otp', '.zip', 'rar', '7z', 'tar'
];

export interface UploadListProps extends FormFieldProps {
  items: UploadFile[];
  /**
   * 控制是否开启文件预览图标
   * @type {boolean}
   */
  showPreviewFile?: boolean;
  viewOnly?: boolean;
  tenantId?: any;
  previewUrl?: string;
  previewUrl2?: string;
  bucketName?: string;
  storageCode?: string;
  token?: string;
  remove: Function;
  showHistory?: boolean;
  fileStatusRenderer?: ({ file }) => ReactNode;
}

export default class UploadList extends FormField<UploadListProps> {
  static displayName = 'UploadList';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'upload-list',
    showPreviewFile: true,
    items: [],
  };

  state = {
    previewVisible: false,
    previewImages: [],
  };


  /**
   * 图片预览
   * @param {*} file
   */
  handlePreviewImage = (file) => {
    const { bucketName, tenantId } = this.props;
    const basePath = (BASE_PATH || "").replace(/\//g, "",);
    window.open(`/${basePath}/public/filePreview?url=${encodeURIComponent(getAttachmentUrlWithToken(file.url, bucketName, tenantId, undefined, undefined, (file as any)._fileToken))}`);
  }

  /**
   * 图片预览取消
   */
  handlePreviewCancel = () => {
    this.setState({
      previewImages: [],
      previewVisible: false,
    });
  };


  handlePreviewFile = (item) => {
    const fileExtMatch = item.name.match(/(.[^.]+)$/);
    const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : '';
    if (item.type.startsWith('image')) {
      this.handlePreviewImage(item);
      return;
    }
    if (!supportPreviewList.includes(fileExt)) {
      notification.error({ message: intl.get('hzero.common.title.noPreview').d('该文件不支持预览'), description: '' });
      return;
    }
    const { previewUrl, previewUrl2, bucketName, storageCode, token } = this.props;
    const url = newUrlPreviewList.includes(fileExt) ? previewUrl : previewUrl2;
    window.open(
      `${url}?url=${encodeURIComponent(item.url)}&bucketName=${bucketName}${storageCode ? `&storageCode=${storageCode}` : ''
      }&access_token=${token}`,
    );
  };

  render() {
    const {
      prefixCls,
      props: {
        items,
        remove,
        viewOnly,
        tenantId,
        bucketName,
        showHistory,
        fileStatusRenderer,
      },
    } = this;
    const {
      previewVisible,
      previewImages,
    } = this.state;
    const list = items.map(file => {
      let progress;
      let removeIcon;
      const progressProps = {
        value: file.percent,
        size: Size.small,
        showInfo: false,
      };
      // if (showPreviewImage && file.type.startsWith('image')) {
      //   // temporarily set img[width] to 100
      //   previewImg = <img width={previewImageWidth} alt={file.filename} src={file.url} />;
      // }
      if (file.status === 'uploading') {
        progress = (
          <div className={`${prefixCls}-item-progress`}>
            <Progress {...progressProps} />
          </div>
        );
      } else {
        const rmProps = {
          className: `${prefixCls}-item-icon ${prefixCls}-item-remove-bkt`,
          type: 'close',
          style: { fontSize: '14px', color: '#999', marginLeft: '8px' },
          onClick: async () => {
            Modal.confirm({
              title: intl.get('hzero.common.btn.delete'),
              okText: intl.get('hzero.common.button.sure'),
              cancelText: intl.get('hzero.common.button.cancel'),
              onOk: () => {
                remove(file);
              },
            });
          },
        };
        removeIcon = viewOnly ? null : <Tooltip title={`${intl.get('hzero.common.button.delete')}`}><Icon {...rmProps} /></Tooltip>;
      }
      const listProps = {
        className: classnames(`${prefixCls}-item`, {
          [`${prefixCls}-item-error`]: file.status === 'error',
          [`${prefixCls}-item-success`]: file.status === 'success',
        }),
      };

      return (
        <tr {...listProps} key={file.uid}>
          <td width="40%">
            {getFileIcon(file.name)}
            <span className={`${prefixCls}-item-name`}>
              {/* eslint-disable-next-line no-script-url */}
              <Tooltip title={file.name}>
                <a
                  style={{ verticalAlign: 'middle', overflow: 'hidden' }}
                  // eslint-disable-next-line no-script-url
                  href="javascript:void(0)"
                  onClick={() => { this.handlePreviewFile(file); }}
                >
                  {file.name}
                </a>
              </Tooltip>
            </span>
            {showHistory && <PopoverContent fileUrl={file.url} tenantId={tenantId} />}
            <Tooltip title={intl.get('hzero.common.button.download')}>
              <a
                // eslint-disable-next-line no-script-url
                href="javascript:void(0)"
                onClick={() => {
                  let queryParams: any[] = [];
                  const url = getAttachmentUrlWithToken(file.url, bucketName, tenantId, undefined, undefined, (file as any)._fileToken);
                  const paramStr = url.split("?")[1];
                  if (paramStr) {
                    queryParams = paramStr.split("&").map(param => {
                      const [name, value] = param.split("=");
                      return { name, value };
                    }).filter(i => !["access_token"].includes(i.name));
                  }
                  downloadFileByAxios({ requestUrl: url, queryParams, method: "GET" });
                }}
              >
                <Icon type="cloud_download-o" style={{ fontSize: '14px', color: '#999', marginLeft: '8px' }} />
              </a>
            </Tooltip>
            {removeIcon}
          </td>
          <td width="60%" style={{ textAlign: 'right' }}>
            {progress}
            {file.status === 'success' && (
              fileStatusRenderer ? fileStatusRenderer({ file }) : (
                <>
                  <span className={`${prefixCls}-item-size`}>
                    {intl.get('hzero.common.file.size').d('文件大小')}: {getFileSize((file as any).size)}
                  </span>
                  &nbsp;
                  <span className={`${prefixCls}-item-time`}>
                    {intl.get('hzero.common.date.creation')}: {(file as any).creationDate}
                  </span>
                </>
              )
            )}
          </td>
        </tr>
      );
    });

    const listWrapperCls = items.length ? styles['c7n-pro-upload-list-bkt'] : `${prefixCls}-empty`;

    return (
      <>
        <table className={listWrapperCls} style={{ width: '100%' }}>
          {list}
        </table>
        {
          previewVisible ? (
            <Viewer
              noImgDetails
              noNavbar
              scalable={false}
              changeable={false}
              visible={previewVisible}
              onClose={this.handlePreviewCancel}
              images={previewImages}
            />
          ) : null
        }
      </>
    );
  }
}

function getFileIcon(name) {
  if (/.(png|gif|jpg|webp|jpeg|bmp|tif|pic)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+ZmlsZS1pY29ucy8yNHB4L2ltYWdlPC90aXRsZT4KICAgIDxkZWZzPgogICAgICAgIDxwYXRoIGQ9Ik01LjI1LDIgTDE1LDIgTDE1LDIgTDIxLDggTDIxLDE5Ljc1IEMyMSwyMC45OTI2NDA3IDE5Ljk5MjY0MDcsMjIgMTguNzUsMjIgTDUuMjUsMjIgQzQuMDA3MzU5MzEsMjIgMywyMC45OTI2NDA3IDMsMTkuNzUgTDMsNC4yNSBDMywzLjAwNzM1OTMxIDQuMDA3MzU5MzEsMiA1LjI1LDIgWiIgaWQ9InBhdGgtMSI+PC9wYXRoPgogICAgICAgIDxmaWx0ZXIgeD0iLTguMyUiIHk9Ii03LjUlIiB3aWR0aD0iMTE2LjclIiBoZWlnaHQ9IjExNS4wJSIgZmlsdGVyVW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiBpZD0iZmlsdGVyLTIiPgogICAgICAgICAgICA8ZmVPZmZzZXQgZHg9IjAiIGR5PSIwIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIxIj48L2ZlT2Zmc2V0PgogICAgICAgICAgICA8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIwLjUiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjEiIHJlc3VsdD0ic2hhZG93Qmx1ck91dGVyMSI+PC9mZUdhdXNzaWFuQmx1cj4KICAgICAgICAgICAgPGZlQ29sb3JNYXRyaXggdmFsdWVzPSIwIDAgMCAwIDAgICAwIDAgMCAwIDAgICAwIDAgMCAwIDAgIDAgMCAwIDAuMDUgMCIgdHlwZT0ibWF0cml4IiBpbj0ic2hhZG93Qmx1ck91dGVyMSI+PC9mZUNvbG9yTWF0cml4PgogICAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ikljb25zL0ZpbGUvMjRweC9JbWFnZSI+CiAgICAgICAgICAgIDxnIGlkPSJSZWN0YW5nbGUtQ29weSI+CiAgICAgICAgICAgICAgICA8dXNlIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjEiIGZpbHRlcj0idXJsKCNmaWx0ZXItMikiIHhsaW5rOmhyZWY9IiNwYXRoLTEiPjwvdXNlPgogICAgICAgICAgICAgICAgPHVzZSBmaWxsPSIjMkZCOEVFIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHhsaW5rOmhyZWY9IiNwYXRoLTEiPjwvdXNlPgogICAgICAgICAgICA8L2c+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMy4wMzY1MDg5LDEyLjc1MDg1MjcgTDEzLjEyMzIzNjMsMTIuNzUzMTIyMiBDMTMuMjk4MDMyNywxMi43NzAzNDgyIDEzLjQ1MTE3MjksMTIuODcyMjI3NyAxMy41MzAwNjMzLDEzLjAyMjM0MDEgTDEzLjUzMDA2MzMsMTMuMDIyMzQwMSBMMTUuNjk1NjgyNSwxNy4yODc4Mjc2IEMxNS43NzUwODg1LDE3LjQzOTkwODcgMTUuNzY3MzU0MiwxNy42MjEwMjc4IDE1LjY3Mjk5NTEsMTcuNzY2MjE4NSBDMTUuNTc4NjM1OSwxNy45MTE0MDkxIDE1LjQxMzEyMDgsMTggMTUuMjM0MTk5NCwxOCBMMTUuMjM0MTk5NCwxOCBMOC4wMTU0Njg3NCwxOCBDNy44Mjk4NDQyNCwxOCA3LjY1ODE0MTU4LDE3LjkwNTAxMDkgNy41NjY4NzYyLDE3Ljc1MDQ2OSBDNy40NzU2MTA4MiwxNy41OTU0MzQ5IDcuNDc3NjczMzEsMTcuNDA2NDQxIDcuNTczNTc5MywxNy4yNTQzNiBMNy41NzM1NzkzLDE3LjI1NDM2IEw5LjAxNzMyNTQzLDE0LjQ2NTM4NzMgQzkuMDg5NTEyNzQsMTQuMzUwMjE5MiA5LjIwODYyMTc5LDE0LjI2ODAyNjUgOS4zNDYyOTMzLDE0LjIzODQ5NjIgQzkuNDgyOTMzNTYsMTQuMjA4OTY1OSA5LjYyNzgyMzc5LDE0LjIzNTA1MSA5Ljc0NTM4NTk4LDE0LjMwOTM2ODkgTDkuNzQ1Mzg1OTgsMTQuMzA5MzY4OSBMMTAuODk4ODM2LDE1LjA0MzE5NjggTDEyLjY2NjM5MzgsMTIuOTM0NzMzNSBDMTIuNzc2MjIxNiwxMi44MDQzMDggMTIuOTQ4OTU1NSwxMi43MzM5Mjc1IDEzLjEyMzIzNjMsMTIuNzUzMTIyMiBaIE0xMC41NjgxODE4LDEwLjUgQzExLjEzMzAxODUsMTAuNSAxMS41OTA5MDkxLDEwLjk0OTU2NTMgMTEuNTkwOTA5MSwxMS41MDQxMzIyIEMxMS41OTA5MDkxLDEyLjA1ODY5OTEgMTEuMTMzMDE4NSwxMi41MDgyNjQ1IDEwLjU2ODE4MTgsMTIuNTA4MjY0NSBDMTAuMDAzMzQ1MSwxMi41MDgyNjQ1IDkuNTQ1NDU0NTUsMTIuMDU4Njk5MSA5LjU0NTQ1NDU1LDExLjUwNDEzMjIgQzkuNTQ1NDU0NTUsMTAuOTQ5NTY1MyAxMC4wMDMzNDUxLDEwLjUgMTAuNTY4MTgxOCwxMC41IFoiIGlkPSJDb21iaW5lZC1TaGFwZSIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIiBvcGFjaXR5PSIwLjkwMDAwMDAzNiI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTUsMiBMMjEsOCBMMTcuMjUsOCBDMTYuMDA3MzU5Myw4IDE1LDYuOTkyNjQwNjkgMTUsNS43NSBMMTUsMiBMMTUsMiBaIiBpZD0iUmVjdGFuZ2xlLUNvcHktMyIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC40MDAwMDAwMDYiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==\')',
        }}
      />
    );
  } else if (/.(doc|docx|dot|wps|wpt)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjUgKDY3NDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5maWxlLXR5cGUvZG9jPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9Iue8uumZty/or6bmg4UiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLpmYTku7YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNDYuMDAwMDAwLCAtNjYwLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iZmlsZS10eXBlL2RvYyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjQ2LjAwMDAwMCwgNjYwLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgZmlsbD0iIzJGODVFRCIgZmlsbC1ydWxlPSJub256ZXJvIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSIyIj48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMi41LDEyLjc2OTUzMTIgTDIuNSw3LjA4MjAzMTI1IEw0LjMzMjAzMTI1LDcuMDgyMDMxMjUgQzQuODM0NjM3OTMsNy4wODIwMzEyNSA1LjI4NjQ1NjMzLDcuMTk1OTYyNCA1LjY4NzUsNy40MjM4MjgxMiBDNi4wODg1NDM2Nyw3LjY1MTY5Mzg1IDYuNDAxNjkxNTgsNy45NzMzMDUyMSA2LjYyNjk1MzEyLDguMzg4NjcxODggQzYuODUyMjE0NjcsOC44MDQwMzg1NCA2Ljk2NjE0NTgyLDkuMjY5NTI4NjcgNi45Njg3NSw5Ljc4NTE1NjI1IEw2Ljk2ODc1LDEwLjA0Njg3NSBDNi45Njg3NSwxMC41Njc3MTA5IDYuODU4NzI1MDYsMTEuMDM0NTAzMSA2LjYzODY3MTg4LDExLjQ0NzI2NTYgQzYuNDE4NjE4NjksMTEuODYwMDI4MSA2LjEwODcyNTk2LDEyLjE4Mjk0MTUgNS43MDg5ODQzOCwxMi40MTYwMTU2IEM1LjMwOTI0Mjc5LDEyLjY0OTA4OTcgNC44NjMyODM3MSwxMi43NjY5MjcxIDQuMzcxMDkzNzUsMTIuNzY5NTMxMiBMMi41LDEyLjc2OTUzMTIgWiBNMy44NzEwOTM3NSw4LjE0MDYyNSBMMy44NzEwOTM3NSwxMS43MTQ4NDM4IEw0LjM0NzY1NjI1LDExLjcxNDg0MzggQzQuNzQwODg3MzgsMTEuNzE0ODQzOCA1LjA0Mjk2NzcsMTEuNTc0ODcxMiA1LjI1MzkwNjI1LDExLjI5NDkyMTkgQzUuNDY0ODQ0OCwxMS4wMTQ5NzI2IDUuNTcwMzEyNSwxMC41OTg5NjExIDUuNTcwMzEyNSwxMC4wNDY4NzUgTDUuNTcwMzEyNSw5LjgwMDc4MTI1IEM1LjU3MDMxMjUsOS4yNTEyOTkzNCA1LjQ2NDg0NDgsOC44MzcyNDA5OCA1LjI1MzkwNjI1LDguNTU4NTkzNzUgQzUuMDQyOTY3Nyw4LjI3OTk0NjUyIDQuNzM1Njc5MSw4LjE0MDYyNSA0LjMzMjAzMTI1LDguMTQwNjI1IEwzLjg3MTA5Mzc1LDguMTQwNjI1IFogTTEyLjQ4ODI4MTIsMTAuMDQyOTY4OCBDMTIuNDg4MjgxMiwxMC41OTc2NTkgMTIuMzg1NDE3NywxMS4wODg1Mzk1IDEyLjE3OTY4NzUsMTEuNTE1NjI1IEMxMS45NzM5NTczLDExLjk0MjcxMDUgMTEuNjgxNjQyNSwxMi4yNzE0ODMyIDExLjMwMjczNDQsMTIuNTAxOTUzMSBDMTAuOTIzODI2MiwxMi43MzI0MjMgMTAuNDkyMTg5OSwxMi44NDc2NTYyIDEwLjAwNzgxMjUsMTIuODQ3NjU2MiBDOS41MjM0MzUwOCwxMi44NDc2NTYyIDkuMDkzNzUxODgsMTIuNzM2MzI5MiA4LjcxODc1LDEyLjUxMzY3MTkgQzguMzQzNzQ4MTIsMTIuMjkxMDE0NSA4LjA1MTQzMzM0LDExLjk3MjY1ODMgNy44NDE3OTY4OCwxMS41NTg1OTM4IEM3LjYzMjE2MDQxLDExLjE0NDUyOTIgNy41MjIxMzU0NywxMC42NjkyNzM1IDcuNTExNzE4NzUsMTAuMTMyODEyNSBMNy41MTE3MTg3NSw5LjgxMjUgQzcuNTExNzE4NzUsOS4yNTUyMDU1NSA3LjYxMzkzMTI3LDguNzYzNjc0IDcuODE4MzU5MzgsOC4zMzc4OTA2MiBDOC4wMjI3ODc0OCw3LjkxMjEwNzI1IDguMzE1NzUzMyw3LjU4MzMzNDQ5IDguNjk3MjY1NjIsNy4zNTE1NjI1IEM5LjA3ODc3Nzk1LDcuMTE5NzkwNTEgOS41MTMwMTg0LDcuMDAzOTA2MjUgMTAsNy4wMDM5MDYyNSBDMTAuNDgxNzczMiw3LjAwMzkwNjI1IDEwLjkxMTQ1NjQsNy4xMTg0ODg0NCAxMS4yODkwNjI1LDcuMzQ3NjU2MjUgQzExLjY2NjY2ODYsNy41NzY4MjQwNiAxMS45NjAyODU0LDcuOTAyOTkyNjggMTIuMTY5OTIxOSw4LjMyNjE3MTg4IEMxMi4zNzk1NTgzLDguNzQ5MzUxMDcgMTIuNDg1Njc3MSw5LjIzNDM3MjI3IDEyLjQ4ODI4MTIsOS43ODEyNSBMMTIuNDg4MjgxMiwxMC4wNDI5Njg4IFogTTExLjA5Mzc1LDkuODA0Njg3NSBDMTEuMDkzNzUsOS4yMzk1ODA1MSAxMC45OTkzNDk5LDguODEwNTQ4MzQgMTAuODEwNTQ2OSw4LjUxNzU3ODEyIEMxMC42MjE3NDM4LDguMjI0NjA3OTEgMTAuMzUxNTY0Myw4LjA3ODEyNSAxMCw4LjA3ODEyNSBDOS4zMTI0OTY1Niw4LjA3ODEyNSA4Ljk0OTIxODk1LDguNTkzNzQ0ODQgOC45MTAxNTYyNSw5LjYyNSBMOC45MDYyNSwxMC4wNDI5Njg4IEM4LjkwNjI1LDEwLjYwMDI2MzIgOC45OTg2OTY5OSwxMS4wMjg2NDQzIDkuMTgzNTkzNzUsMTEuMzI4MTI1IEM5LjM2ODQ5MDUxLDExLjYyNzYwNTcgOS42NDMyMjczNCwxMS43NzczNDM4IDEwLjAwNzgxMjUsMTEuNzc3MzQzOCBDMTAuMzU0MTY4NCwxMS43NzczNDM4IDEwLjYyMTA5MjgsMTEuNjMwMjA5OCAxMC44MDg1OTM4LDExLjMzNTkzNzUgQzEwLjk5NjA5NDcsMTEuMDQxNjY1MiAxMS4wOTExNDU4LDEwLjYxODQ5MjMgMTEuMDkzNzUsMTAuMDY2NDA2MiBMMTEuMDkzNzUsOS44MDQ2ODc1IFogTTE3Ljc5Njg3NSwxMC44NDM3NSBDMTcuNzc4NjQ1NywxMS4yMzk1ODUzIDE3LjY3MTg3NiwxMS41ODkxOTEyIDE3LjQ3NjU2MjUsMTEuODkyNTc4MSBDMTcuMjgxMjQ5LDEyLjE5NTk2NTEgMTcuMDA3MTYzMiwxMi40MzA5ODg4IDE2LjY1NDI5NjksMTIuNTk3NjU2MiBDMTYuMzAxNDMwNSwxMi43NjQzMjM3IDE1Ljg5ODQzOTgsMTIuODQ3NjU2MiAxNS40NDUzMTI1LDEyLjg0NzY1NjIgQzE0LjY5NzkxMjksMTIuODQ3NjU2MiAxNC4xMDkzNzcxLDEyLjYwNDE2OTEgMTMuNjc5Njg3NSwxMi4xMTcxODc1IEMxMy4yNDk5OTc5LDExLjYzMDIwNTkgMTMuMDM1MTU2MiwxMC45NDI3MTI4IDEzLjAzNTE1NjIsMTAuMDU0Njg3NSBMMTMuMDM1MTU2Miw5Ljc3MzQzNzUgQzEzLjAzNTE1NjIsOS4yMTYxNDMwNSAxMy4xMzIxNjA1LDguNzI4NTE3NzEgMTMuMzI2MTcxOSw4LjMxMDU0Njg4IEMxMy41MjAxODMzLDcuODkyNTc2MDQgMTMuNzk5NDc3Myw3LjU2OTY2MjYgMTQuMTY0MDYyNSw3LjM0MTc5Njg4IEMxNC41Mjg2NDc3LDcuMTEzOTMxMTUgMTQuOTUwNTE4NCw3IDE1LjQyOTY4NzUsNyBDMTYuMTE5Nzk1MSw3IDE2LjY3NDQ3NzEsNy4xODE2Mzg4MSAxNy4wOTM3NSw3LjU0NDkyMTg4IEMxNy41MTMwMjI5LDcuOTA4MjA0OTQgMTcuNzUxMzAxOCw4LjQwODg1MDk4IDE3LjgwODU5MzgsOS4wNDY4NzUgTDE2LjQ0MTQwNjIsOS4wNDY4NzUgQzE2LjQzMDk4OTUsOC43MDA1MTkxIDE2LjM0Mzc1MDgsOC40NTE4MjM2NyAxNi4xNzk2ODc1LDguMzAwNzgxMjUgQzE2LjAxNTYyNDIsOC4xNDk3Mzg4MyAxNS43NjU2MjY3LDguMDc0MjE4NzUgMTUuNDI5Njg3NSw4LjA3NDIxODc1IEMxNS4wODg1NCw4LjA3NDIxODc1IDE0LjgzODU0MjUsOC4yMDE4MjE2NCAxNC42Nzk2ODc1LDguNDU3MDMxMjUgQzE0LjUyMDgzMjUsOC43MTIyNDA4NiAxNC40Mzc1LDkuMTE5Nzg4ODcgMTQuNDI5Njg3NSw5LjY3OTY4NzUgTDE0LjQyOTY4NzUsMTAuMDgyMDMxMiBDMTQuNDI5Njg3NSwxMC42ODg4MDUxIDE0LjUwNTg1ODYsMTEuMTIyMzk0NSAxNC42NTgyMDMxLDExLjM4MjgxMjUgQzE0LjgxMDU0NzYsMTEuNjQzMjMwNSAxNS4wNzI5MTQ4LDExLjc3MzQzNzUgMTUuNDQ1MzEyNSwxMS43NzM0Mzc1IEMxNS43NjA0MTgyLDExLjc3MzQzNzUgMTYuMDAxMzAxMywxMS42OTkyMTk1IDE2LjE2Nzk2ODgsMTEuNTUwNzgxMiBDMTYuMzM0NjM2MiwxMS40MDIzNDMgMTYuNDIzMTc3LDExLjE2NjY2ODMgMTYuNDMzNTkzOCwxMC44NDM3NSBMMTcuNzk2ODc1LDEwLjg0Mzc1IFoiIGlkPSJET0MiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+\')',
        }}
      />
    );
  } else if (/.(ppt|pptx|pot|pps|dps|dpt)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+ZmlsZS1pY29ucy8yNHB4L3BwdDwvdGl0bGU+CiAgICA8ZGVmcz4KICAgICAgICA8cGF0aCBkPSJNNS4yNSwyIEwxNSwyIEwxNSwyIEwyMSw4IEwyMSwxOS43NSBDMjEsMjAuOTkyNjQwNyAxOS45OTI2NDA3LDIyIDE4Ljc1LDIyIEw1LjI1LDIyIEM0LjAwNzM1OTMxLDIyIDMsMjAuOTkyNjQwNyAzLDE5Ljc1IEwzLDQuMjUgQzMsMy4wMDczNTkzMSA0LjAwNzM1OTMxLDIgNS4yNSwyIFoiIGlkPSJwYXRoLTEiPjwvcGF0aD4KICAgICAgICA8ZmlsdGVyIHg9Ii04LjMlIiB5PSItNy41JSIgd2lkdGg9IjExNi43JSIgaGVpZ2h0PSIxMTUuMCUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgaWQ9ImZpbHRlci0yIj4KICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PSIwIiBkeT0iMCIgaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9InNoYWRvd09mZnNldE91dGVyMSI+PC9mZU9mZnNldD4KICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMC41IiBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiPjwvZmVHYXVzc2lhbkJsdXI+CiAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjA1IDAiIHR5cGU9Im1hdHJpeCIgaW49InNoYWRvd0JsdXJPdXRlcjEiPjwvZmVDb2xvck1hdHJpeD4KICAgICAgICA8L2ZpbHRlcj4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJJY29ucy9GaWxlLzI0cHgvUFBUIj4KICAgICAgICAgICAgPGcgaWQ9IlJlY3RhbmdsZS1Db3B5Ij4KICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iMSIgZmlsdGVyPSJ1cmwoI2ZpbHRlci0yKSIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgICAgICA8dXNlIGZpbGw9IiNEOTQyMUEiIGZpbGwtcnVsZT0iZXZlbm9kZCIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHBhdGggZD0iTTcuNDYwNjI1LDE2Ljc1IEw3LjQ2MDYyNSwxNS4wMzU1IEw4LjE4Mjg3NSwxNS4wMzU1IEM4LjY5MTM3NSwxNS4wMzU1IDkuMDk4NjI1LDE0Ljg3NTc1IDkuNDA0NjI1LDE0LjU1NjI1IEM5LjY4MzYyNSwxNC4yNjgyNSA5LjgyMzEyNSwxMy45MTI3NSA5LjgyMzEyNSwxMy40ODk3NSBDOS44MjMxMjUsMTMuMDY2NzUgOS42ODM2MjUsMTIuNzExMjUgOS40MDQ2MjUsMTIuNDIzMjUgQzkuMDk4NjI1LDEyLjEwMzc1IDguNjkxMzc1LDExLjk0NCA4LjE4Mjg3NSwxMS45NDQgTDguMTgyODc1LDExLjk0NCBMNi4yNzkzNzUsMTEuOTQ0IEw2LjI3OTM3NSwxNi43NSBMNy40NjA2MjUsMTYuNzUgWiBNOC4xMjg4NzUsMTMuOTc1NzUgTDcuNDYwNjI1LDEzLjk3NTc1IEw3LjQ2MDYyNSwxMy4wMDM3NSBMOC4xMjg4NzUsMTMuMDAzNzUgQzguNDcwODc1LDEzLjAwMzc1IDguNjQxODc1LDEzLjE2NTc1IDguNjQxODc1LDEzLjQ4OTc1IEM4LjY0MTg3NSwxMy44MTM3NSA4LjQ3MDg3NSwxMy45NzU3NSA4LjEyODg3NSwxMy45NzU3NSBMOC4xMjg4NzUsMTMuOTc1NzUgWiBNMTEuNjkyODc1LDE2Ljc1IEwxMS42OTI4NzUsMTUuMDM1NSBMMTIuNDE1MTI1LDE1LjAzNTUgQzEyLjkyMzYyNSwxNS4wMzU1IDEzLjMzMDg3NSwxNC44NzU3NSAxMy42MzY4NzUsMTQuNTU2MjUgQzEzLjkxNTg3NSwxNC4yNjgyNSAxNC4wNTUzNzUsMTMuOTEyNzUgMTQuMDU1Mzc1LDEzLjQ4OTc1IEMxNC4wNTUzNzUsMTMuMDY2NzUgMTMuOTE1ODc1LDEyLjcxMTI1IDEzLjYzNjg3NSwxMi40MjMyNSBDMTMuMzMwODc1LDEyLjEwMzc1IDEyLjkyMzYyNSwxMS45NDQgMTIuNDE1MTI1LDExLjk0NCBMMTIuNDE1MTI1LDExLjk0NCBMMTAuNTExNjI1LDExLjk0NCBMMTAuNTExNjI1LDE2Ljc1IEwxMS42OTI4NzUsMTYuNzUgWiBNMTIuMzYxMTI1LDEzLjk3NTc1IEwxMS42OTI4NzUsMTMuOTc1NzUgTDExLjY5Mjg3NSwxMy4wMDM3NSBMMTIuMzYxMTI1LDEzLjAwMzc1IEMxMi43MDMxMjUsMTMuMDAzNzUgMTIuODc0MTI1LDEzLjE2NTc1IDEyLjg3NDEyNSwxMy40ODk3NSBDMTIuODc0MTI1LDEzLjgxMzc1IDEyLjcwMzEyNSwxMy45NzU3NSAxMi4zNjExMjUsMTMuOTc1NzUgTDEyLjM2MTEyNSwxMy45NzU3NSBaIE0xNi44MjI4NzUsMTYuNzUgTDE2LjgyMjg3NSwxMi45OTcgTDE4LjAwNDEyNSwxMi45OTcgTDE4LjAwNDEyNSwxMS45NDQgTDE0LjQ2MDM3NSwxMS45NDQgTDE0LjQ2MDM3NSwxMi45OTcgTDE1LjY0MTYyNSwxMi45OTcgTDE1LjY0MTYyNSwxNi43NSBMMTYuODIyODc1LDE2Ljc1IFoiIGlkPSJQUFQiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iMC45MDAwMDAwMzYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTE1LDIgTDIxLDggTDE3LjI1LDggQzE2LjAwNzM1OTMsOCAxNSw2Ljk5MjY0MDY5IDE1LDUuNzUgTDE1LDIgTDE1LDIgWiIgaWQ9IlJlY3RhbmdsZS1Db3B5LTMiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNDAwMDAwMDA2Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=\')',
        }}
      />
    );
  } else if (/.(xls|xlsx|xlsm|csv|xlt|et|ett)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjUgKDY3NDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5maWxlLXR5cGUveGxzPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9Iue8uumZty/or6bmg4UiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLpmYTku7YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yNzYuMDAwMDAwLCAtNjYwLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iZmlsZS10eXBlL3hscyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMjc2LjAwMDAwMCwgNjYwLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9IlJlY3RhbmdsZSIgZmlsbD0iIzI5QjM1RCIgZmlsbC1ydWxlPSJub256ZXJvIiB4PSIwIiB5PSIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHJ4PSIyIj48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNNS41MzUxNTYyNSw4Ljk2ODc1IEw2LjQ2NDg0Mzc1LDcuMDc4MTI1IEw4LjAzMTI1LDcuMDc4MTI1IEw2LjQ0MTQwNjI1LDkuODk4NDM3NSBMOC4wNzQyMTg3NSwxMi43NjU2MjUgTDYuNDkyMTg3NSwxMi43NjU2MjUgTDUuNTM1MTU2MjUsMTAuODM5ODQzOCBMNC41NzgxMjUsMTIuNzY1NjI1IEwzLDEyLjc2NTYyNSBMNC42Mjg5MDYyNSw5Ljg5ODQzNzUgTDMuMDQyOTY4NzUsNy4wNzgxMjUgTDQuNjA1NDY4NzUsNy4wNzgxMjUgTDUuNTM1MTU2MjUsOC45Njg3NSBaIE05Ljg5MDYyNSwxMS43MTA5Mzc1IEwxMi4yNzczNDM4LDExLjcxMDkzNzUgTDEyLjI3NzM0MzgsMTIuNzY1NjI1IEw4LjUxOTUzMTI1LDEyLjc2NTYyNSBMOC41MTk1MzEyNSw3LjA3ODEyNSBMOS44OTA2MjUsNy4wNzgxMjUgTDkuODkwNjI1LDExLjcxMDkzNzUgWiBNMTUuNzg5MDYyNSwxMS4yNTM5MDYyIEMxNS43ODkwNjI1LDExLjA1MzM4NDQgMTUuNzE4MDk5NywxMC44OTcxMzYgMTUuNTc2MTcxOSwxMC43ODUxNTYyIEMxNS40MzQyNDQxLDEwLjY3MzE3NjUgMTUuMTg0ODk3NiwxMC41NTcyOTIzIDE0LjgyODEyNSwxMC40Mzc1IEMxNC40NzEzNTI0LDEwLjMxNzcwNzcgMTQuMTc5Njg4NiwxMC4yMDE4MjM1IDEzLjk1MzEyNSwxMC4wODk4NDM4IEMxMy4yMTYxNDIxLDkuNzI3ODYyNzcgMTIuODQ3NjU2Miw5LjIzMDQ3MTkxIDEyLjg0NzY1NjIsOC41OTc2NTYyNSBDMTIuODQ3NjU2Miw4LjI4MjU1MDUxIDEyLjkzOTQ1MjIsOC4wMDQ1NTg1IDEzLjEyMzA0NjksNy43NjM2NzE4OCBDMTMuMzA2NjQxNSw3LjUyMjc4NTI1IDEzLjU2NjQwNDYsNy4zMzUyODcxMyAxMy45MDIzNDM4LDcuMjAxMTcxODggQzE0LjIzODI4MjksNy4wNjcwNTY2MiAxNC42MTU4ODMzLDcgMTUuMDM1MTU2Miw3IEMxNS40NDQwMTI1LDcgMTUuODEwNTQ1Myw3LjA3MjkxNTk0IDE2LjEzNDc2NTYsNy4yMTg3NSBDMTYuNDU4OTg2LDcuMzY0NTg0MDYgMTYuNzEwOTM2Niw3LjU3MjI2NDI4IDE2Ljg5MDYyNSw3Ljg0MTc5Njg4IEMxNy4wNzAzMTM0LDguMTExMzI5NDcgMTcuMTYwMTU2Miw4LjQxOTI2OTEgMTcuMTYwMTU2Miw4Ljc2NTYyNSBMMTUuNzkyOTY4OCw4Ljc2NTYyNSBDMTUuNzkyOTY4OCw4LjUzMzg1MzAxIDE1LjcyMjAwNTksOC4zNTQxNjczIDE1LjU4MDA3ODEsOC4yMjY1NjI1IEMxNS40MzgxNTAzLDguMDk4OTU3NyAxNS4yNDYwOTUsOC4wMzUxNTYyNSAxNS4wMDM5MDYyLDguMDM1MTU2MjUgQzE0Ljc1OTExMzQsOC4wMzUxNTYyNSAxNC41NjU3NTU5LDguMDg5MTkyMTcgMTQuNDIzODI4MSw4LjE5NzI2NTYyIEMxNC4yODE5MDAzLDguMzA1MzM5MDggMTQuMjEwOTM3NSw4LjQ0MjcwNzUgMTQuMjEwOTM3NSw4LjYwOTM3NSBDMTQuMjEwOTM3NSw4Ljc1NTIwOTA2IDE0LjI4OTA2MTcsOC44ODczNjkyIDE0LjQ0NTMxMjUsOS4wMDU4NTkzOCBDMTQuNjAxNTYzMyw5LjEyNDM0OTU1IDE0Ljg3NjMwMDEsOS4yNDY3NDQxNiAxNS4yNjk1MzEyLDkuMzczMDQ2ODggQzE1LjY2Mjc2MjQsOS40OTkzNDk1OSAxNS45ODU2NzU4LDkuNjM1NDE1OTQgMTYuMjM4MjgxMiw5Ljc4MTI1IEMxNi44NTI4Njc3LDEwLjEzNTQxODQgMTcuMTYwMTU2MiwxMC42MjM2OTQ4IDE3LjE2MDE1NjIsMTEuMjQ2MDkzOCBDMTcuMTYwMTU2MiwxMS43NDM0OTIxIDE2Ljk3MjY1ODEsMTIuMTM0MTEzMiAxNi41OTc2NTYyLDEyLjQxNzk2ODggQzE2LjIyMjY1NDQsMTIuNzAxODI0MyAxNS43MDgzMzY2LDEyLjg0Mzc1IDE1LjA1NDY4NzUsMTIuODQzNzUgQzE0LjU5Mzc0NzcsMTIuODQzNzUgMTQuMTc2NDM0MiwxMi43NjEwNjg1IDEzLjgwMjczNDQsMTIuNTk1NzAzMSBDMTMuNDI5MDM0NiwxMi40MzAzMzc3IDEzLjE0Nzc4NzQsMTIuMjAzNzc3NSAxMi45NTg5ODQ0LDExLjkxNjAxNTYgQzEyLjc3MDE4MTMsMTEuNjI4MjUzOCAxMi42NzU3ODEyLDExLjI5Njg3NjkgMTIuNjc1NzgxMiwxMC45MjE4NzUgTDE0LjA1MDc4MTIsMTAuOTIxODc1IEMxNC4wNTA3ODEyLDExLjIyNjU2NCAxNC4xMjk1NTY1LDExLjQ1MTE3MTIgMTQuMjg3MTA5NCwxMS41OTU3MDMxIEMxNC40NDQ2NjIyLDExLjc0MDIzNTEgMTQuNzAwNTE5MSwxMS44MTI1IDE1LjA1NDY4NzUsMTEuODEyNSBDMTUuMjgxMjUxMSwxMS44MTI1IDE1LjQ2MDI4NTgsMTEuNzYzNjcyNCAxNS41OTE3OTY5LDExLjY2NjAxNTYgQzE1LjcyMzMwNzksMTEuNTY4MzU4OSAxNS43ODkwNjI1LDExLjQzMDk5MDUgMTUuNzg5MDYyNSwxMS4yNTM5MDYyIFoiIGlkPSJYTFMiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+\')',
        }}
      />
    );
  } else if (/.(txt|conf)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjUgKDY3NDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5maWxlLXR5cGUvdHh0PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9Iue8uumZty/or6bmg4UiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLpmYTku7YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0zMzYuMDAwMDAwLCAtNjYwLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iZmlsZS10eXBlL3R4dCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzM2LjAwMDAwMCwgNjYwLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTIsMCBMMTgsMCBDMTkuMTA0NTY5NSwtMi4wMjkwNjEyNWUtMTYgMjAsMC44OTU0MzA1IDIwLDIgTDIwLDE4IEMyMCwxOS4xMDQ1Njk1IDE5LjEwNDU2OTUsMjAgMTgsMjAgTDIsMjAgQzAuODk1NDMwNSwyMCAtMy40MTc0NDI5M2UtMTUsMTkuMTA0NTY5NSAtMy41NTI3MTM2OGUtMTUsMTggTC0zLjU1MjcxMzY4ZS0xNSwyIEMtMy42ODc5ODQ0M2UtMTUsMC44OTU0MzA1IDAuODk1NDMwNSwyLjAyOTA2MTI1ZS0xNiAyLDAgWiIgaWQ9IlJlY3RhbmdsZS0zNyIgZmlsbD0iI0MxQ0FEQiI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTcuMjUzOTA2MjUsOC4wNTg1OTM3NSBMNS41NDY4NzUsOC4wNTg1OTM3NSBMNS41NDY4NzUsMTIuNjg3NSBMNC4xNzU3ODEyNSwxMi42ODc1IEw0LjE3NTc4MTI1LDguMDU4NTkzNzUgTDIuNSw4LjA1ODU5Mzc1IEwyLjUsNyBMNy4yNTM5MDYyNSw3IEw3LjI1MzkwNjI1LDguMDU4NTkzNzUgWiBNOS45NTMxMjUsOC44OTA2MjUgTDEwLjg4MjgxMjUsNyBMMTIuNDQ5MjE4OCw3IEwxMC44NTkzNzUsOS44MjAzMTI1IEwxMi40OTIxODc1LDEyLjY4NzUgTDEwLjkxMDE1NjIsMTIuNjg3NSBMOS45NTMxMjUsMTAuNzYxNzE4OCBMOC45OTYwOTM3NSwxMi42ODc1IEw3LjQxNzk2ODc1LDEyLjY4NzUgTDkuMDQ2ODc1LDkuODIwMzEyNSBMNy40NjA5Mzc1LDcgTDkuMDIzNDM3NSw3IEw5Ljk1MzEyNSw4Ljg5MDYyNSBaIE0xNy40MDIzNDM4LDguMDU4NTkzNzUgTDE1LjY5NTMxMjUsOC4wNTg1OTM3NSBMMTUuNjk1MzEyNSwxMi42ODc1IEwxNC4zMjQyMTg4LDEyLjY4NzUgTDE0LjMyNDIxODgsOC4wNTg1OTM3NSBMMTIuNjQ4NDM3NSw4LjA1ODU5Mzc1IEwxMi42NDg0Mzc1LDcgTDE3LjQwMjM0MzgsNyBMMTcuNDAyMzQzOCw4LjA1ODU5Mzc1IFoiIGlkPSJUWFQiIGZpbGw9IiNGRkZGRkYiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+\')',
        }}
      />
    );
  } else if (/.(java|JAVA|js|ts|jsx|tsx|html|css|sql|yml)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+ZmlsZS1pY29ucy8yNHB4L2NvZGU8L3RpdGxlPgogICAgPGRlZnM+CiAgICAgICAgPHBhdGggZD0iTTUuMjUsMiBMMTUsMiBMMTUsMiBMMjEsOCBMMjEsMTkuNzUgQzIxLDIwLjk5MjY0MDcgMTkuOTkyNjQwNywyMiAxOC43NSwyMiBMNS4yNSwyMiBDNC4wMDczNTkzMSwyMiAzLDIwLjk5MjY0MDcgMywxOS43NSBMMyw0LjI1IEMzLDMuMDA3MzU5MzEgNC4wMDczNTkzMSwyIDUuMjUsMiBaIiBpZD0icGF0aC0xIj48L3BhdGg+CiAgICAgICAgPGZpbHRlciB4PSItOC4zJSIgeT0iLTcuNSUiIHdpZHRoPSIxMTYuNyUiIGhlaWdodD0iMTE1LjAlIiBmaWx0ZXJVbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIGlkPSJmaWx0ZXItMiI+CiAgICAgICAgICAgIDxmZU9mZnNldCBkeD0iMCIgZHk9IjAiIGluPSJTb3VyY2VBbHBoYSIgcmVzdWx0PSJzaGFkb3dPZmZzZXRPdXRlcjEiPjwvZmVPZmZzZXQ+CiAgICAgICAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjAuNSIgaW49InNoYWRvd09mZnNldE91dGVyMSIgcmVzdWx0PSJzaGFkb3dCbHVyT3V0ZXIxIj48L2ZlR2F1c3NpYW5CbHVyPgogICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4wOCAwIiB0eXBlPSJtYXRyaXgiIGluPSJzaGFkb3dCbHVyT3V0ZXIxIiByZXN1bHQ9InNoYWRvd01hdHJpeE91dGVyMSI+PC9mZUNvbG9yTWF0cml4PgogICAgICAgICAgICA8ZmVPZmZzZXQgZHg9IjAiIGR5PSIwIiBpbj0iU291cmNlQWxwaGEiIHJlc3VsdD0ic2hhZG93T2Zmc2V0T3V0ZXIyIj48L2ZlT2Zmc2V0PgogICAgICAgICAgICA8ZmVDb2xvck1hdHJpeCB2YWx1ZXM9IjAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgIDAgMCAwIDAgMCAgMCAwIDAgMC4wNSAwIiB0eXBlPSJtYXRyaXgiIGluPSJzaGFkb3dPZmZzZXRPdXRlcjIiIHJlc3VsdD0ic2hhZG93TWF0cml4T3V0ZXIyIj48L2ZlQ29sb3JNYXRyaXg+CiAgICAgICAgICAgIDxmZU1lcmdlPgogICAgICAgICAgICAgICAgPGZlTWVyZ2VOb2RlIGluPSJzaGFkb3dNYXRyaXhPdXRlcjEiPjwvZmVNZXJnZU5vZGU+CiAgICAgICAgICAgICAgICA8ZmVNZXJnZU5vZGUgaW49InNoYWRvd01hdHJpeE91dGVyMiI+PC9mZU1lcmdlTm9kZT4KICAgICAgICAgICAgPC9mZU1lcmdlPgogICAgICAgIDwvZmlsdGVyPgogICAgPC9kZWZzPgogICAgPGcgaWQ9IlBhZ2UtMSIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Ikljb25zL0ZpbGUvMjRweC9Db2RlIj4KICAgICAgICAgICAgPGcgaWQ9IlJlY3RhbmdsZS1Db3B5Ij4KICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iMSIgZmlsdGVyPSJ1cmwoI2ZpbHRlci0yKSIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgICAgICA8dXNlIGZpbGw9IiM3Mzc4OTkiIGZpbGwtcnVsZT0iZXZlbm9kZCIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHBhdGggZD0iTTEwLjE3OTEyMDYsMTIgTDExLjAzNzM2MTcsMTIuODQwOTAzOSBMOS4yMTY0ODIzMywxNC42MjUgTDExLjAzNzM2MTcsMTYuNDA5MDk2MSBMMTAuMTc5MTIwNiwxNy4yNSBMNy41LDE0LjYyNSBMMTAuMTc5MTIwNiwxMiBaIE0xMy44MjA4Nzk0LDEyIEwxNi41LDE0LjYyNSBMMTMuODIwODc5NCwxNy4yNSBMMTIuOTYyNjM4MywxNi40MDkwOTYxIEwxNC43ODM1MTc3LDE0LjYyNSBMMTIuOTYyNjM4MywxMi44NDA5MDM5IEwxMy44MjA4Nzk0LDEyIFoiIGlkPSJDb21iaW5lZC1TaGFwZSIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJub256ZXJvIiBvcGFjaXR5PSIwLjkwMDAwMDAzNiI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTUsMiBMMjEsOCBMMTcuMjUsOCBDMTYuMDA3MzU5Myw4IDE1LDYuOTkyNjQwNjkgMTUsNS43NSBMMTUsMiBMMTUsMiBaIiBpZD0iUmVjdGFuZ2xlLUNvcHktMyIgZmlsbD0iI0ZGRkZGRiIgb3BhY2l0eT0iMC40MDAwMDAwMDYiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==\')',
        }}
      />
    );
  } else if (/.(pdf)$/i.test(name)) {
    return (
      <div
        style={{
          display: 'inline-block',
          width: '16px',
          height: '16px',
          borderRadius: '2px',
          overflow: 'hidden',
          verticalAlign: 'middle',
          flexShrink: 0,
          backgroundPosition: '50%',
          backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjRweCIgaGVpZ2h0PSIyNHB4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8dGl0bGU+ZmlsZS1pY29ucy8yNHB4L3BkZjwvdGl0bGU+CiAgICA8ZGVmcz4KICAgICAgICA8cGF0aCBkPSJNNS4yNSwyIEwxNSwyIEwxNSwyIEwyMSw4IEwyMSwxOS43NSBDMjEsMjAuOTkyNjQwNyAxOS45OTI2NDA3LDIyIDE4Ljc1LDIyIEw1LjI1LDIyIEM0LjAwNzM1OTMxLDIyIDMsMjAuOTkyNjQwNyAzLDE5Ljc1IEwzLDQuMjUgQzMsMy4wMDczNTkzMSA0LjAwNzM1OTMxLDIgNS4yNSwyIFoiIGlkPSJwYXRoLTEiPjwvcGF0aD4KICAgICAgICA8ZmlsdGVyIHg9Ii04LjMlIiB5PSItNy41JSIgd2lkdGg9IjExNi43JSIgaGVpZ2h0PSIxMTUuMCUiIGZpbHRlclVuaXRzPSJvYmplY3RCb3VuZGluZ0JveCIgaWQ9ImZpbHRlci0yIj4KICAgICAgICAgICAgPGZlT2Zmc2V0IGR4PSIwIiBkeT0iMCIgaW49IlNvdXJjZUFscGhhIiByZXN1bHQ9InNoYWRvd09mZnNldE91dGVyMSI+PC9mZU9mZnNldD4KICAgICAgICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMC41IiBpbj0ic2hhZG93T2Zmc2V0T3V0ZXIxIiByZXN1bHQ9InNoYWRvd0JsdXJPdXRlcjEiPjwvZmVHYXVzc2lhbkJsdXI+CiAgICAgICAgICAgIDxmZUNvbG9yTWF0cml4IHZhbHVlcz0iMCAwIDAgMCAwICAgMCAwIDAgMCAwICAgMCAwIDAgMCAwICAwIDAgMCAwLjA1IDAiIHR5cGU9Im1hdHJpeCIgaW49InNoYWRvd0JsdXJPdXRlcjEiPjwvZmVDb2xvck1hdHJpeD4KICAgICAgICA8L2ZpbHRlcj4KICAgIDwvZGVmcz4KICAgIDxnIGlkPSJQYWdlLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJJY29ucy9GaWxlLzI0cHgvUERGIj4KICAgICAgICAgICAgPGcgaWQ9IlJlY3RhbmdsZS1Db3B5Ij4KICAgICAgICAgICAgICAgIDx1c2UgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iMSIgZmlsdGVyPSJ1cmwoI2ZpbHRlci0yKSIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgICAgICA8dXNlIGZpbGw9IiNERDM2MzMiIGZpbGwtcnVsZT0iZXZlbm9kZCIgeGxpbms6aHJlZj0iI3BhdGgtMSI+PC91c2U+CiAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPHBhdGggZD0iTTcuMzQyNSwxNi43NSBMNy4zNDI1LDE1LjAzNTUgTDguMDY0NzUsMTUuMDM1NSBDOC41NzMyNSwxNS4wMzU1IDguOTgwNSwxNC44NzU3NSA5LjI4NjUsMTQuNTU2MjUgQzkuNTY1NSwxNC4yNjgyNSA5LjcwNSwxMy45MTI3NSA5LjcwNSwxMy40ODk3NSBDOS43MDUsMTMuMDY2NzUgOS41NjU1LDEyLjcxMTI1IDkuMjg2NSwxMi40MjMyNSBDOC45ODA1LDEyLjEwMzc1IDguNTczMjUsMTEuOTQ0IDguMDY0NzUsMTEuOTQ0IEw4LjA2NDc1LDExLjk0NCBMNi4xNjEyNSwxMS45NDQgTDYuMTYxMjUsMTYuNzUgTDcuMzQyNSwxNi43NSBaIE04LjAxMDc1LDEzLjk3NTc1IEw3LjM0MjUsMTMuOTc1NzUgTDcuMzQyNSwxMy4wMDM3NSBMOC4wMTA3NSwxMy4wMDM3NSBDOC4zNTI3NSwxMy4wMDM3NSA4LjUyMzc1LDEzLjE2NTc1IDguNTIzNzUsMTMuNDg5NzUgQzguNTIzNzUsMTMuODEzNzUgOC4zNTI3NSwxMy45NzU3NSA4LjAxMDc1LDEzLjk3NTc1IEw4LjAxMDc1LDEzLjk3NTc1IFogTTEyLjE3NTUsMTYuNzUgQzEyLjcyNDUsMTYuNzUgMTMuMTU2NSwxNi41OTI1IDEzLjQ3MTUsMTYuMjc3NSBDMTMuNzE5LDE2LjAzIDEzLjg3MiwxNS43MzMgMTMuOTMwNSwxNS4zODY1IEMxMy45NTMsMTUuMjUxNSAxMy45NjY1LDE1LjA4NSAxMy45NzEsMTQuODg3IEwxMy45NzEsMTQuODg3IEwxMy45NzEsMTMuODA3IEMxMy45NjY1LDEzLjYwOSAxMy45NTMsMTMuNDQyNSAxMy45MzA1LDEzLjMwNzUgQzEzLjg3MiwxMi45NjEgMTMuNzE5LDEyLjY2NCAxMy40NzE1LDEyLjQxNjUgQzEzLjE1NjUsMTIuMTAxNSAxMi43MjQ1LDExLjk0NCAxMi4xNzU1LDExLjk0NCBMMTIuMTc1NSwxMS45NDQgTDEwLjM5MzUsMTEuOTQ0IEwxMC4zOTM1LDE2Ljc1IEwxMi4xNzU1LDE2Ljc1IFogTTEyLjA5NDUsMTUuNjk3IEwxMS41NzQ3NSwxNS42OTcgTDExLjU3NDc1LDEyLjk5NyBMMTIuMDk0NSwxMi45OTcgQzEyLjM1MSwxMi45OTcgMTIuNTQsMTMuMDg3IDEyLjY2MTUsMTMuMjY3IEMxMi43MTEsMTMuMzM5IDEyLjc0NDc1LDEzLjQzMzUgMTIuNzYyNzUsMTMuNTUwNSBDMTIuNzgwNzUsMTMuNjk0NSAxMi43ODk3NSwxMy45NiAxMi43ODk3NSwxNC4zNDcgTDEyLjc4OTE5OSwxNC41MDU0MTg0IEMxMi43ODY5OTQ5LDE0LjgwNzM3NzYgMTIuNzc4MTc4NiwxNS4wMjAwNzE0IDEyLjc2Mjc1LDE1LjE0MzUgQzEyLjc0NDc1LDE1LjI2MDUgMTIuNzExLDE1LjM1NSAxMi42NjE1LDE1LjQyNyBDMTIuNTQsMTUuNjA3IDEyLjM1MSwxNS42OTcgMTIuMDk0NSwxNS42OTcgTDEyLjA5NDUsMTUuNjk3IFogTTE1Ljk2OSwxNi43NSBMMTUuOTY5LDE0Ljg5Mzc1IEwxNy43NTEsMTQuODkzNzUgTDE3Ljc1MSwxMy44NDA3NSBMMTUuOTY5LDEzLjg0MDc1IEwxNS45NjksMTIuOTk3IEwxOC4wNTQ3NSwxMi45OTcgTDE4LjA1NDc1LDExLjk0NCBMMTQuNzg3NzUsMTEuOTQ0IEwxNC43ODc3NSwxNi43NSBMMTUuOTY5LDE2Ljc1IFoiIGlkPSJQREYiIGZpbGw9IiNGRkZGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgb3BhY2l0eT0iMC45MDAwMDAwMzYiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTE1LDIgTDIxLDggTDE3LjI1LDggQzE2LjAwNzM1OTMsOCAxNSw2Ljk5MjY0MDY5IDE1LDUuNzUgTDE1LDIgTDE1LDIgWiIgaWQ9IlJlY3RhbmdsZS1Db3B5LTMiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuNDAwMDAwMDA2Ij48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=\')',
        }}
      />
    );
  }
  return (
    <div
      style={{
        display: 'inline-block',
        width: '16px',
        height: '16px',
        borderRadius: '2px',
        overflow: 'hidden',
        verticalAlign: 'middle',
        flexShrink: 0,
        backgroundPosition: '50%',
        backgroundImage: 'url(\'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjBweCIgaGVpZ2h0PSIyMHB4IiB2aWV3Qm94PSIwIDAgMjAgMjAiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjUgKDY3NDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5maWxlLXR5cGUvb3RoZXJzPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9Iue8uumZty/or6bmg4UiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSLpmYTku7YiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC01MTYuMDAwMDAwLCAtNjYwLjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0iZmlsZS10eXBlL290aGVycyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTE2LjAwMDAwMCwgNjYwLjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTIsMy40NjM4OTU4NGUtMTMgTDE4LDMuNDYzODk1ODRlLTEzIEMxOS4xMDQ1Njk1LDMuNDYxODY2NzhlLTEzIDIwLDAuODk1NDMwNSAyMCwyIEwyMCwxOCBDMjAsMTkuMTA0NTY5NSAxOS4xMDQ1Njk1LDIwIDE4LDIwIEwyLDIwIEMwLjg5NTQzMDUsMjAgLTEuNjQxMDg2MDllLTE1LDE5LjEwNDU2OTUgLTEuNzc2MzU2ODRlLTE1LDE4IEwtMS43NzYzNTY4NGUtMTUsMiBDLTEuOTExNjI3NTllLTE1LDAuODk1NDMwNSAwLjg5NTQzMDUsMy40NTcwNDMxMWUtMTMgMiwzLjQ1NTAxNDA1ZS0xMyBaIiBpZD0iUmVjdGFuZ2xlLTM3IiBmaWxsPSIjQTFBQ0JGIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTUgQzkuNCwxNSA5LDE0LjYgOSwxNCBDOSwxMy40IDkuNCwxMyAxMCwxMyBDMTAuNiwxMyAxMSwxMy40IDExLDE0IEMxMSwxNC42IDEwLjYsMTUgMTAsMTUgWiIgaWQ9IlBhdGgiIGZpbGw9IiNGRkZGRkYiIG9wYWNpdHk9IjAuOTAwMDAwMDM2Ij48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTEuNiwxMC40IEMxMS4xLDEwLjcgMTEuMSwxMC44IDExLjEsMTEgTDExLjEsMTIgTDkuMSwxMiBMOS4xLDExIEM5LjEsOS43IDkuOSw5LjEgMTAuNSw4LjcgQzExLDguNCAxMS4xLDguMyAxMS4xLDggQzExLjEsNy40IDEwLjcsNyAxMC4xLDcgQzkuNyw3IDkuNCw3LjIgOS4yLDcuNSBMOC43LDguNCBMNyw3LjQgTDcuNSw2LjUgQzgsNS42IDksNSAxMC4xLDUgQzExLjgsNSAxMy4xLDYuMyAxMy4xLDggQzEzLjEsOS40IDEyLjIsMTAgMTEuNiwxMC40IFoiIGlkPSJQYXRoIiBmaWxsPSIjRkZGRkZGIiBvcGFjaXR5PSIwLjkwMDAwMDAzNiI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=\')',
      }}
    />
  );
}

function getFileSize(size: number = 0) {
  if (size === 0) return `0 KB`;
  const kb = size / 1024;
  let mb = 0;
  let gb = 0;
  if (kb < 1024) return `${kb.toFixed(2)} KB`;
  mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(2)} MB `;
  gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

type OpLine = {
  date?: string;
  opType?: string;
  tenantName?: string;
  userId?: string;
  userName?: string;
  realName?: string;
}

const PopoverContent = observer(({ fileUrl, tenantId }: any) => {
  const [opList, setOpList] = useState([] as OpLine[]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const dataSet = useMemo(() => {
    return new DataSet({
      pageSize: 10,
      dataKey: 'logs.content',
      totalKey: 'logs.totalElements',
      transport: {
        read: () => {
          return {
            url: `${HZERO_HFLE}/v1/files/${tenantId}/oplog?fileUrlOrKey=${decodeURIComponent(fileUrl)}`,
            method: 'GET',
            headers: {
              'h-request-auto-decrypt': true,
            },
          };
        },
      },
    });
  }, [fileUrl]);

  useEffect(() => {
    if (fileUrl && visible) {
      dataSet.query();
    }
  }, [fileUrl, visible]);
  return (
    <Tooltip title={intl.get('hzero.common.components.operationAudit.showHistory')}>
      <Popover
        visible={visible}
        onVisibleChange={v => setVisible(v)}
        content={visible && (
          <Spin dataSet={dataSet}>
            <div className="upload-showHistory-list-wrapper">
              <table>
                <thead>
                  <tr>
                    <td colSpan={3}>{intl.get('hzero.common.date.creation')}</td>
                    <td colSpan={2}>{intl.get('hzero.common.action').d('操作')}</td>
                    <td colSpan={3}>{intl.get('hzero.common.components.operationAudit.operatedBy').d('操作人')}</td>
                    <td colSpan={4}>{intl.get('hzero.common.model.tenantName').d('租户名')}</td>
                  </tr>
                </thead>
                <div className="upload-showHistory-list-content">
                  <table>
                    <tbody>
                      {dataSet.status !== 'loading' && dataSet.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="no-data">
                            {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
                          </td>
                        </tr>
                      ) : (
                        <>
                          {dataSet.map(line => (
                            <tr>
                              <td colSpan={3}>{dateTimeRender(line.get('date'))}</td>
                              <td colSpan={2}>{line.get('opType')}</td>
                              <td colSpan={3}>{line.get('realName')}({line.get('userName')})</td>
                              <td colSpan={4}>{line.get('tenantName')}</td>
                            </tr>
                          ))}
                          <tr><td colSpan={11}><Pagination dataSet={dataSet} /></td></tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </table>
            </div>
          </Spin>
        )}
        placement="right"
        trigger="click"
      >
        <Icon type="assignment" style={{ fontSize: '14px', color: '#999', marginLeft: '8px', cursor: 'pointer' }} />
      </Popover>
    </Tooltip>
  );
});
