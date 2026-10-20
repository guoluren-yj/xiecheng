---
order: 9
title:
  zh-CN: 显示额外icon
  en-US: ShowUploadList
---

## zh-CN

用户可以callback按钮的时间

## en-US

after user click upload icon, will trigger a callback for these icon btn;

````jsx
import { Upload, Modal } from 'hzero-ui';

class ShowUploadListUpload extends React.Component {
  state = {
    previewVisible: false,
    previewFile: null,
    fileList: [{
     uid: -1,
     name: 'xxx.png',
     status: 'done',
     url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
   }],
  };

  reUploadRef = React.createRef();

  handlePreview = (file) => {
    this.setState({
      previewVisible: true,
      previewFile: file,
    });
  }

  handleCancelPreview = () => {
    this.setState({
      previewVisible: false,
      previewFile: null,
    });
  }

  handleChange = ({ fileList }) => this.setState({ fileList })

  handleReUploadChange = (file) => {
    const { reUploadFile, fileList } = this.state;
    console.log({
      file,
      reUploadFile,
      fileList,
    });
    return false;
  }

  handleReUpload = (file) => {
    this.setState({
      // 如果用户取消了也不管, 会在再次点击时重新设置 reUploadFile
      reUploadFile: file,
    }, () => {
        if (this.reUploadRef.current && this.reUploadRef.current.upload && this.reUploadRef.current.upload.uploader) {
            if (this.reUploadRef.current.upload.uploader.fileInput) {
              this.reUploadRef.current.upload.uploader.fileInput.click();
            } else if (this.reUploadRef.current.upload.uploader.getFormInputNode) {
              const iframeInput = this.reUploadRef.current.upload.uploader.getFormInputNode();
              if (iframeInput) {
                iframeInput.click();
              }
            }
      }
    });
  }

  render() {
    const { fileList, previewVisible, previewFile } = this.state;
    return (
      <div className="clearfix">
        <Upload
          action="//jsonplaceholder.typicode.com/posts/"
          listType="picture-card"
          showUploadList={{
            showReUploadIcon: true,
            removePopConfirmTitle: '是否删除此条记录？',
            reUploadText: '重新上传',
            reUploadPopConfirmTitle: '是否重新上传？',
            getCustomFilenameTitle: (file) => {
              return `custom-${file.name}`;
            },
          }}
          onReUpload={this.handleReUpload}
          onPreview={this.handlePreview}
          onRemove={this.handleRemove}
          onChange={this.handleChange}
          fileList={fileList}
        />
        <Upload
          ref={this.reUploadRef}
          beforeUpload={this.handleReUploadChange}
          action="//jsonplaceholder.typicode.com/posts/"
          fileList={[]}
        />
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancelPreview}>
          <img alt="example" style={{ width: '100%' }} src={previewFile && (previewFile.url || previewFile.thumbUrl)} />
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<ShowUploadListUpload />, mountNode);
````

````css
/* you can make up upload button and sample style by using stylesheets */
.ant-upload-select-picture-card i {
  font-size: 32px;
  color: #999;
}

.ant-upload-select-picture-card .ant-upload-text {
  margin-top: 8px;
  color: #666;
}
````
