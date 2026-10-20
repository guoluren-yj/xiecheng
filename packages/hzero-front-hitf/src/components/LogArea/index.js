import React from 'react';
import { Button, DataSet, Spin, CheckBox } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
import moment from 'moment';
import styles from './index.less';
import getLang from '@/langs/commonLang';

class LogArea extends React.Component {
  constructor(props) {
    super(props);
    const { requestUrl = '', requestParams = {} } = props;
    this.logFormDS = new DataSet({
      autoQuery: false,
      autoCreate: false,
      selection: false,
      paging: false,
      transport: {
        read: () => {
          return {
            url: requestUrl,
            method: 'GET',
            data: requestParams,
          };
        },
      },
    });

    this.state = {
      logResult: '',
      originLogResult: '',
      autoWrap: true,
    };
  }

  componentDidMount() {
    const { requestUrl, content } = this.props;
    if (!requestUrl) {
      this.setState({ logResult: this.colorizationLog(content), originLogResult: content });
    } else {
      this.fetchDetail();
    }
  }

  colorizationLog(log = '') {
    const timeReg = /[0-9]{4}-[0-9]{2}-[0-9]{2}\s+[0-9]{2}:[0-9]{2}:[0-9]{2}:[0-9]{3}/g;
    let logResult = log;
    // 时间替换
    logResult = logResult.replace(timeReg, `<span style="color: #5C5DE1">${'$&'}</span>`);
    // 日志级别
    logResult = logResult.replace(/FATAL/g, `<span style="color: #CC666E">FATAL</span>`);
    logResult = logResult.replace(/ERROR/g, `<span style="color: #FF6B68">ERROR</span>`);
    logResult = logResult.replace(/WARN/g, `<span style="color: #D6BF55">WARN</span>`);
    logResult = logResult.replace(/INFO/g, `<span style="color: #A8C023">INFO</span>`);
    logResult = logResult.replace(/DEBUG/g, `<span style="color: #299999">DEBUG</span>`);
    logResult = logResult.replace(/TRACE/g, `<span style="color: #5394EC">TRACE</span>`);
    return logResult;
  }

  @Bind()
  async fetchDetail() {
    const logResult = await this.logFormDS.query();
    this.setState({ logResult: this.colorizationLog(logResult), originLogResult: logResult });
  }

  @Bind()
  renderContent() {
    const { logResult = '', autoWrap } = this.state;
    return (
      <div
        className={classNames({
          [styles.content]: true,
          [styles['content-auto-wrap']]: autoWrap,
        })}
      >
        <pre id="logContainer" dangerouslySetInnerHTML={{ __html: logResult }} />
      </div>
    );
  }

  handleScroll(direction) {
    const container = document.getElementById('logContainer');
    if (container) {
      const { scrollHeight, clientHeight } = container;
      container.scrollTop = direction === 'top' ? 0 : scrollHeight - clientHeight;
    }
  }

  @Bind()
  handleAutoWrap(val) {
    this.setState({ autoWrap: val });
  }

  handleDownload() {
    const { originLogResult = '' } = this.state;
    return new Promise((resolve) => {
      const ele = document.createElement('a');
      const file = new Blob([originLogResult], { type: 'text/plain' });
      ele.href = URL.createObjectURL(file);
      ele.download = `${moment().format('x')}.log`;
      ele.dispatchEvent(new MouseEvent('click', { bubbles: false, cancelable: true }));
      resolve();
    });
  }

  render() {
    const { requestUrl } = this.props;
    return (
      <Spin dataSet={this.logFormDS}>
        <div className={styles.operations}>
          <div className={styles['operations-left']}>
            <CheckBox defaultChecked onChange={this.handleAutoWrap}>
              {getLang('AUTO_WRAP')}
            </CheckBox>
          </div>
          <div className={styles['operations-right']}>
            <Button icon="vertical_align_top" onClick={() => this.handleScroll('top')}>
              {getLang('BACK_TOP')}
            </Button>
            <Button icon="vertical_align_bottom" onClick={() => this.handleScroll('bottom')}>
              {getLang('BACK_BOTTOM')}
            </Button>
            <Button
              icon="get_app"
              wait={2000}
              waitType="throttle"
              onClick={() => this.handleDownload()}
            >
              {getLang('DOWNLOAD')}
            </Button>
            {requestUrl && (
              <Button icon="refresh" onClick={this.fetchDetail}>
                {getLang('REFRESH')}
              </Button>
            )}
          </div>
        </div>
        {this.renderContent()}
      </Spin>
    );
  }
}

export default LogArea;
