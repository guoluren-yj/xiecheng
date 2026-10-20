import React, { Fragment, Component } from 'react';
import Upload from 'components/Upload/UploadButton';
import { publicBucketName } from '@/utils/smblConstant.js';
import { Icon, Progress } from 'choerodon-ui/pro';
import notification from 'utils/notification';
// import { downloadFileByAxios } from 'hzero-front/lib/services/api';
// import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import styles from './index.less';
import iconImage from './image_icon.svg';

// const organizationId = getCurrentOrganizationId();

@formatterCollections({ code: ['smbl.purchaseRobotConfig'] })
export default class UploadImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadingFileName: null,
      uploading: false,
    };
  }

  render() {
    const { record } = this.props;
    const url = record && record.get('cardImag');
    let fileName = null;
    if (url && typeof url === 'string') {
      if (url.indexOf('@')) {
        const subStrs = url.split('@');
        fileName = subStrs[subStrs.length - 1];
      } else {
        const subStrs = url.split('/');
        fileName = subStrs[subStrs.length - 1];
      }
    }

    return (
      <Fragment>
        <Upload
          listType="text"
          bucketName={publicBucketName}
          multiple={false}
          showUploadList={false}
          accept={['.png', '.jpg', '.jpeg']}
          onSuccess={(newUrl) => {
            this.setState({
              uploadingFileName: null,
              uploading: false,
            });
            if (record) {
              record.set('cardImag', newUrl);
            }
          }}
          onRemove={() => {
            record.set('cardImag', undefined);
          }}
          beforeUpload={(file) => {
            if (file.size > 5 * 1024 * 1024) {
              notification.error({
                message: intl
                  .get('smbl.purchaseRobotConfig.view.message.imageTooBig')
                  .d('上传失败，请选择小于5M的图片'),
              });
              return false;
            }
            this.setState({
              uploadingFileName: file && file.name,
              uploading: true,
            });
          }}
          disabled={fileName || this.state.uploading}
        >
          <a>
            <Icon type="file_upload" style={{ fontSize: '14px', paddingBottom: '2px' }} />
            <span>
              {intl
                .get('smbl.purchaseRobotConfig.view.button.uploadBackgroundImage')
                .d('上传背景图片')}
            </span>
            <span className={styles['file-upload-number']}>
              {fileName || this.state.uploading ? '1/1' : '0/1'}
            </span>
          </a>
        </Upload>
        {fileName || this.state.uploading ? (
          <div className={styles['file-state']}>
            {this.state.uploading ? (
              <div className="file-state-loading">
                <Progress type="loading" size="small" />
              </div>
            ) : (
              <img src={iconImage} className="file-state-photo" alt="" />
            )}
            <a
              className={this.state.uploading ? 'file-state-name' : 'file-state-name-click'}
              href={!this.state.uploading && url}
              download={fileName}
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
            >
              {fileName || this.state.uploadingFileName}
            </a>
            {/* <div className='file-state-del'>
                <Icon
                  type="get_app"
                  className={this.state.uploading ? "file-state-del-hide" : "file-state-del"}
                  onClick={() => {
                    downloadFileByAxios({
                      requestUrl: `/hfle/v1/${organizationId}/files/signedUrl`,
                      method: 'GET',
                      queryParams: [{
                        name: "bucketName",
                        value: publicBucketName,
                      }, {
                        name: "url",
                        value: url,
                      }],
                    }, "fileName.png");
                  }}
                />
              </div> */}
            <div className="file-state-del">
              <Icon
                type="close"
                className={this.state.uploading ? 'file-state-del-hide' : 'file-state-del'}
                onClick={() => {
                  record.set('cardImag', undefined);
                }}
              />
            </div>
          </div>
        ) : null}
        <div className={styles['upload-tip']}>
          {intl
            .get('smbl.purchaseRobotConfig.view.message.uploadImgTip')
            .d('图片支持.png、.jpg格式，大小不超过5M')}
        </div>
      </Fragment>
    );
  }
}
