import type { CSSProperties } from 'react';
import React, { Component } from 'react';
import classnames from 'classnames';
import { parse } from 'querystring';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { Spin, NumberField, Button } from 'choerodon-ui/pro';
import { Divider, Icon } from 'choerodon-ui';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { WaitType } from 'choerodon-ui/pro/lib/core/enum';
import { Size } from 'choerodon-ui/lib/_util/enum';

import styles from './index.less';

// 导入 pdf.worker.js，这是必需的
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const scaleArr = [25, 33, 50, 67, 75, 80, 90, 100, 125, 150, 175, 200, 300, 400, 500];

interface PDFViewerProps {
  url: string; // pdf文件地址
  fileName?: string; // 标题和文件名
  style?: CSSProperties;
  className?: string;
  customeDownload?: () => void;
};

const SiderWidth = 300;
const Padding = 80;

export default class PDFViewer extends Component<PDFViewerProps, any>{
  pdfWrapper: any;

  printIframe: any;

  renderSuccess: boolean = false;

  constructor(props) {
    super(props);
    this.printIframe = null;
    this.state = {
      pageNumber: 1,
      numPages: 1,
      bolbUrl: null,
      rotate: 0,
      siderBar: false,
      scale: 100,
    };
  }

  componentDidMount() {
    this.createBlobUrl(this.props.url);
  }

  componentWillUnmount() {
    if (this.state.bolbUrl) {
      URL.revokeObjectURL(this.state.bolbUrl);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.url !== this.props.url) {
      URL.revokeObjectURL(this.state.bolbUrl);
      this.createBlobUrl(nextProps.url);
    }
  }

  createBlobUrl = (url) => {
    const xhr = new XMLHttpRequest();
    xhr.open('get', url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const type = 'application/pdf';
        const blob = new Blob([xhr.response], { type });
        const bolbUrl = URL.createObjectURL(blob);
        this.setState({ bolbUrl });
      }
    };
    xhr.send();
  };

  getFileName = () => {
    const { url, fileName } = this.props;
    if (fileName) {
      return fileName;
    }
    if (url) {
      const ua = window.navigator && window.navigator.userAgent;
      const isFireFox = ua && /rv:([^)]+)\) Gecko\/\d{8}/i.test(ua) && /Firefox\/(\S+)/.test(ua);
      const [pathname, search] = url.split('?');
      if (isFireFox && pathname) {
        const path = decodeURIComponent(pathname);
        return path.substr(path.indexOf('@')+1);
      }
      if (search) {
        const { 'response-content-disposition': content } = parse(search) || {};
        if (content) {
          return decodeURIComponent((content as string).replace('attachment;filename=', ''));
        }
      }
    }
    return '';
  };

  handleDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  };

  handleRenderSuccess = () => {
    if (this.renderSuccess) {
      return;
    }
    if (this.pdfWrapper) {
      const { width: wrappWidth } = this.pdfWrapper.getBoundingClientRect();
      const pageCanvas = this.pdfWrapper.querySelector('.pdf-preview-page-item:first-child .react-pdf__Page__canvas') as HTMLCanvasElement;
      if (pageCanvas) {
        this.renderSuccess = true;
        const { width } = pageCanvas.getBoundingClientRect();
        const { scale } = this.state;
        let scaleIndex = scaleArr.findIndex((item) => item >= scale);
        scaleArr.forEach((item, index) => {
          if (item < scale) {
            return;
          }
          const newWidth = width * item / 100;
          if (wrappWidth - SiderWidth - newWidth > Padding) {
            scaleIndex = index;
          }
        });
        this.setState({ scale: scaleArr[scaleIndex] });
      }
    }
  };

  pageZoom = (type) => {
    const { scale } = this.state;
    let index = scaleArr.findIndex((item) => item >= scale);
    if (scale === scaleArr[index]) {
      if (type === 'in' && scale > 25) {
        index --;
      } else if (type === 'out' && scale < 500){
        index ++;
      }
    } else {
      if (index === -1) {
        index = 0;
      }
      if (type === 'in' && index > 0) {
        index --;
      }
    }
    this.setState({ scale: scaleArr[index] });
  }

  handleChangePage = (page) => {
    let result = page;
    if (page < 1) {
      result = 1;
    } else if (page > this.state.numPages) {
      result = this.state.numPages;
    }
    this.setState({ pageNumber: result }, () => {
      if (this.pdfWrapper) {
        const pageList = this.pdfWrapper.querySelectorAll('.pdf-preview-page-item');
        if (pageList && pageList[result - 1]) {
          this.pdfWrapper.scrollTop = pageList[result - 1].offsetTop;

        }
      }
    });
  };

  handleChangeScale = (scale) => {
    let result = scale;
    if (scale < 25) {
      result = 25;
    } else if (scale > 500) {
      result = 500;
    }
    if (result !== this.state.scale) {
      this.setState({ scale: result });
    }
  };

  handleSiderBar = () => {
    this.setState({ siderBar: !this.state.siderBar });
  };

  handleWrapper = ref => {
    this.pdfWrapper = ref;
  };

  handlePrintIframe = ref => {
    this.printIframe = ref;
  };

  handleRotate = () => {
    this.setState({ rotate: this.state.rotate === -270 ? 0 : this.state.rotate - 90 });
  };

  handleDownload = () => {
    const { url, customeDownload } = this.props;
    if (customeDownload) {
      return customeDownload();
    }
    if (url) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'blob';
      xhr.onload = () => {
        if (xhr.status === 200) {
          const urlObject = window.URL || window.webkitURL || window;
          const exportBlob = new Blob([xhr.response]);
          const link = document.createElement('a');
          link.href = urlObject.createObjectURL(exportBlob);
          link.download = this.getFileName();
          link.click();
        }
      };
      xhr.send();
    }
  };

  handlePrint = () => {
    if (this.printIframe && this.printIframe.contentWindow) {
      this.printIframe.contentWindow.print();
    }
  }

  handleScroll = () => {
    if (this.pdfWrapper) {
      const pageList = this.pdfWrapper.querySelectorAll('.pdf-preview-page-item');
      let index = 0;
      for (let i = 0; i < pageList.length; i++) {
        if (pageList[i].offsetTop <= this.pdfWrapper.scrollTop) {
          index = i;
        }
      }
      this.setState({ pageNumber: index + 1 });
    }
  };

  render() {
    const { url, style, className } = this.props;
    const { siderBar, rotate, scale, numPages, pageNumber, bolbUrl } = this.state;
    const fileName = this.getFileName();
    return (
      <div className={classnames(styles['pdf-viewer'], className)} style={style}>
        <div className={styles['tool-bar']}>
          <div className={styles['tool-bar-left']}>
            <span className={styles['tool-bar-icon']} onClick={this.handleSiderBar}>
              <Icon type='dehaze' style={{ fontSize: '20px' }} />
            </span>
            <div className={styles.title}>{fileName}</div>
          </div>
          <div className={styles['tool-bar-center']}>
            <NumberField
              value={pageNumber}
              onChange={this.handleChangePage}
              border={false}
              style={{ width: '24px' }}
              showValidation={ShowValidation.tooltip}
            />
            <span style={{ margin: '0 5px' }}>/</span>{numPages}
            <Divider type="vertical" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '0 20px' }} />
            <span
              className={styles['tool-bar-icon']}
              style={{ color: scale <= 25 ? 'rgb(154,160,166)' : '#fff' }}
              onClick={() => this.pageZoom('in')}
            >
              <Icon type='remove' />
            </span>
            <NumberField
              value={scale}
              onChange={this.handleChangeScale}
              border={false}
              max={500}
              min={25}
              style={{ width: '40px', marginLeft: '5px' }}
              showValidation={ShowValidation.tooltip}
            />
            %
            <span
              className={styles['tool-bar-icon']}
              style={{ marginLeft: '8px', color: scale >= 500 ? 'rgb(154,160,166)' : '#fff' }}
              onClick={() => this.pageZoom('out')}
            >
              <Icon type='add' />
            </span>
            <Divider type="vertical" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', margin: '0 14px' }} />
            <span className={styles['tool-bar-icon']} onClick={this.handleRotate}><Icon type="rotate_90_degrees_ccw" /></span>
          </div>
          <div className={styles['tool-bar-right']}>
            <Button className={styles['tool-bar-icon']} style={{ marginRight: '8px' }} onClick={this.handleDownload} wait={300} waitType={WaitType.debounce}>
              <Icon type="file_download_black-o" />
            </Button>
            <Button className={styles['tool-bar-icon']} onClick={this.handlePrint} wait={300} waitType={WaitType.debounce}>
              <Icon type='print' />
            </Button>
          </div>
        </div>
        <div className={styles.container}>
          <div
            className={styles.sider}
            style={{
              visibility: siderBar ? 'visible' : 'hidden',
              width: siderBar ? SiderWidth : 0,
              padding: siderBar ? '30px' : 0,
            }}
          >
            {url && (
              <Document file={url} loading={<Spin size={Size.small} />}>
                {new Array(numPages).fill(0).map((_, index) => (
                  <div
                    className={
                      classnames(styles['sider-page-item'], {
                        [styles['sider-page-item-active']]: pageNumber === index + 1,
                      })}
                    // eslint-disable-next-line react/no-array-index-key
                    key={`page-preview-${index}`}
                    onClick={() => this.handleChangePage(index + 1)}
                  >
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      rotate={rotate}
                      width={150}
                      loading={<Spin size={Size.small} />}
                    />
                    <div className={styles['sider-page-item-index']}>{index + 1}</div>
                  </div>
                ))}
              </Document>
            )}
          </div>
          <div className={styles.main}>
            <div className={styles.wrapper} ref={this.handleWrapper} onScroll={this.handleScroll}>
              {bolbUrl && (
                <iframe
                  title="printIframe"
                  ref={this.handlePrintIframe}
                  src={`${bolbUrl}#toolbar=0`}
                  style={{ height: '100%', width: '100%', border: 'none', display: 'none'}}
                />
              )}
              {url && (
                <Document
                  file={url}
                  onLoadSuccess={this.handleDocumentLoadSuccess}
                  loading={<Spin size={Size.large} />}
                >
                  {new Array(numPages).fill(0).map((_, index) => (
                    <div
                      // eslint-disable-next-line react/no-array-index-key
                      key={`page-${index}`}
                      className='pdf-preview-page-item'
                      style={{ paddingTop: '16px' }}
                    >
                      <Page
                        pageNumber={index + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        rotate={rotate}
                        scale={scale/100}
                        onRenderSuccess={this.handleRenderSuccess}
                        loading={<Spin size={Size.large} />}
                      />
                    </div>
                  ))}
                </Document>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
