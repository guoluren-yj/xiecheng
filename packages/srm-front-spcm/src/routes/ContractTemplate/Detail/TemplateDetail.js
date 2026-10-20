/**
 * PurchaseLineInfo - 模板编辑
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Header, Content } from 'components/Page';
import querystring from 'querystring';
import { connect } from 'dva';
import { Button, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import moment from 'moment';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import classnames from 'classnames';
import hocRemote from 'utils/remote';

import { renderStatus } from '@/utils/renderer';
import { fetchReviewRecord } from '@/services/contractCommonService';
import EditorOnline from '../../components/EditorOnline';
import { showSmartReview } from './SmartReview';
import { showReviewRecord } from './ReviewRecord';

import styles from './index.less';

const CONTRACT_TEMPLATE = 'srm.pc-admin.pc-config.template';

const TIME_45S = 45 * 1000;
const TIME_5MIN = 5 * 60 * 1000;
const TIME_17MIN = 17 * 60 * 1000;
const INTERVAL_10S = 10 * 1000;
const INTERVAL_30S = 30 * 1000;

const viewMessagePrompt = 'spcm.purchaseContactType.view.message';
@connect(({ contractTemplate = {} }) => ({
  contractTemplate,
}))
@formatterCollections({
  code: [
    'spcm.purchaseContactType',
    'spcm.common',
    'spcm.contractTemplate',
    'hzero.common',
    'spcm.workspace',
  ],
})
@withCustomize({
  unitCode: ['SPCM.CONTRACT.TEMPLATE.DETAIL.BUTTONS'],
})
@hocRemote(
  {
    code: 'SPCM_CONTRACT_TEMPLATE_DETAIL',
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      // 协议模板new wps v7处理
      handleCuxNewWpsV7WriteDoc() {},
    },
  }
)
export default class contractTemplate extends Component {
  constructor(props) {
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    super(props);
    const {
      match: { state = {} },
      onLoad,
      location: { search },
    } = this.props;
    const {
      pcTemplateId,
      pcTemplateFileId,
      backUrl,
      versionId,
      editable,
      revisionFlag,
      lang,
    } = querystring.parse(search.substr(1));
    this.backUrl = backUrl;
    this.versionId = versionId;
    this.state = {
      isPub,
      onLoad: onLoad || state?.onLoad,
      pcTemplateId,
      pcTemplateFileId,
      fullScreenFlag: false,
      editable,
      revisionFlag,
      lang,
    };
  }

  componentDidMount() {
    const { onLoad } = this.props;
    const { isPub } = this.state;
    this.startPolling();
    if (isPub && onLoad) {
      onLoad({
        submit: this.handleWpsSave,
      });
    }
  }

  componentWillUnmount() {
    const { onLoad } = this.state;
    const { isPub } = this.state;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
    }
    if (!isPub && onLoad) {
      this.handleWpsSave();
    }
  }

  /**
   * 审批单据需要手动保存wps防止文本数据丢失。
   * @returns
   */
  @Bind()
  handleWpsSave() {
    return new Promise((resolve, reject) => {
      // 手动保存编辑文档
      if (this.editorOnlineRef && isFunction(this.editorOnlineRef.saveDocument)) {
        this.editorOnlineRef.saveDocument({ data: 'saveDocument' }).then((res) => {
          if (res) {
            resolve(true); // 文件保存成功继续执行
          } else {
            reject(); // 文件保存失败中断审批
          }
        });
      } else {
        resolve(true);
      }
    });
  }

  pollTimer = null;

  @Bind()
  async startPolling() {
    const { pcTemplateId, pcTemplateFileId, lang } = this.state;
    try {
      // 1. 查询最新审查任务结果
      const res = await fetchReviewRecord({
        pcTemplateId,
        pcTemplateFileId,
        lang,
      });

      this.setState({ recordInfo: res });

      // 2.查询接口报错 或 状态非处理中，直接返回结果并停止轮询
      if (!getResponse(res) || res.taskStatus !== 'PROCESSING') {
        clearInterval(this.pollTimer);
        return;
      }

      // 3. 已过去的毫秒数
      const elapsedTime = moment().diff(moment(res.creationDate));

      // 4. 根据时间梯度判断轮询策略
      if (elapsedTime < TIME_45S) {
        // 45秒内：不重新查询（清除现有定时器，45秒后再启动）
        clearInterval(this.pollTimer);
        setTimeout(() => {
          this.startPolling(); // 45秒后重新执行查询
        }, TIME_45S - elapsedTime);
      } else if (elapsedTime >= TIME_45S && elapsedTime < TIME_5MIN) {
        // 45秒-5分钟：间隔10秒查询一次
        if (!this.pollTimer) {
          clearInterval(this.pollTimer);
          this.pollTimer = setInterval(this.startPolling, INTERVAL_10S);
        }
      } else if (elapsedTime >= TIME_5MIN && elapsedTime < TIME_17MIN) {
        // 5分钟-17分钟：间隔30秒查询一次
        if (!this.pollTimer || this.pollTimer?._interval !== INTERVAL_30S) {
          // 避免重复设置
          clearInterval(this.pollTimer);
          this.pollTimer = setInterval(this.startPolling, INTERVAL_30S);
        }
      } else {
        // 超过17分钟：停止轮询,后端是超过15分钟失败，前端加两分钟的buffer
        clearInterval(this.pollTimer);
      }
    } catch (error) {
      // 捕获错误并停止轮询
      clearInterval(this.pollTimer);
      throw error;
    }
  }

  /**
   * handleVisible - 通过协议-打开模态框
   */
  @Bind()
  fullScreen(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * @returns  BackPath
   */
  @Bind()
  getBackPath() {
    const { pcTemplateId, isPub, onLoad } = this.state;
    const backUrlObj = {
      version: '/spcm/contract-template/version',
    };
    if (onLoad) {
      return null;
    }
    const backUrl =
      backUrlObj[this.backUrl] && this.versionId
        ? `${backUrlObj[this.backUrl]}/${this.versionId}`
        : `/spcm/contract-template/config/${pcTemplateId}`;
    return isPub ? `/pub${backUrl}` : `${backUrl}`;
  }

  /**
   * 查看审查结果
   */
  @Bind()
  checkResult() {
    const { resultUrl } = this.state.recordInfo || {};
    if (window?.open) {
      window.open(resultUrl);
    }
  }

  /**
   * 查看审查历史
   */
  @Bind()
  handlePreview() {
    const { pcTemplateFileId } = this.state || {};
    showReviewRecord({ pcTemplateFileId });
  }

  @Bind()
  renderSmartReview() {
    const { recordInfo } = this.state;
    const { taskStatus, taskStatusMeaning } = recordInfo || {};
    return (
      <span
        style={{
          marginRight: 'auto',
        }}
      >
        {intl.get(`${viewMessagePrompt}.smartTask`).d('智能审查任务')}
        {renderStatus(taskStatus, taskStatusMeaning, 'temp')}
        {taskStatus === 'SUCCESS' && (
          <a onClick={this.checkResult}>
            {intl.get('hzero.common.button.checkResult').d('查看结果')}
          </a>
        )}
      </span>
    );
  }

  @Bind()
  renderTemplateTitle() {
    const { editable = false } = this.state;
    return (
      <>
        {JSON.parse(editable)
          ? intl.get(`${viewMessagePrompt}.theTemplateEditor`).d('模板编辑')
          : intl.get(`${viewMessagePrompt}.theTemplateView`).d('模板查看')}
      </>
    );
  }

  /**
   * 获得按钮
   * @returns
   */
  @Bind()
  getButton() {
    const { customizeBtnGroup } = this.props;
    const { isPub, onLoad, recordInfo, pcTemplateFileId } = this.state;
    const buttonList = [
      !isPub && !onLoad && (
        <Button
          name="fullScreen"
          icon="arrows-alt"
          onClick={() => this.fullScreen('fullScreenFlag', true)}
        >
          {intl.get(`${viewMessagePrompt}.fullScreenMode`).d('全屏模式')}
        </Button>
      ),
      <Button
        name="smartReview"
        icon="eye-o"
        onClick={() =>
          showSmartReview({
            startPolling: this.startPolling,
            handleWpsSave: this.handleWpsSave,
            data: {
              ...recordInfo,
              pcTemplateFileId,
            },
          })
        }
      >
        {intl.get('spcm.common.view.title.smartReview').d('智能审查')}
      </Button>,
      recordInfo?.taskStatus && (
        <Button name="reviewRecord" icon="book" onClick={this.handlePreview}>
          {intl.get('spcm.contractTemplate.view.title.reviewRecord').d('模板审查记录')}
        </Button>
      ),
    ].filter(Boolean);
    return customizeBtnGroup(
      {
        code: 'SPCM.CONTRACT.TEMPLATE.DETAIL.BUTTONS',
      },
      buttonList
    );
  }

  render() {
    const { remote } = this.props;
    const {
      pcTemplateId,
      fullScreenFlag,
      pcTemplateFileId,
      editable = false,
      revisionFlag,
      recordInfo,
    } = this.state;
    const ModalProps = {
      width: '100%',
      height: document?.body?.clientHeight || '100vh',
      visible: fullScreenFlag,
      onCancel: () => this.fullScreen('fullScreenFlag', false),
      footer: null,
      closable: false,
      destroyOnClose: true,
    };
    return (
      <Fragment>
        <Header title={this.renderTemplateTitle()} backPath={this.getBackPath()}>
          {this.getButton()}
          {recordInfo?.taskStatus && this.renderSmartReview()}
        </Header>
        <Content style={{ padding: 0, margin: 0 }}>
          {!fullScreenFlag && (
            <EditorOnline
              remote={remote}
              editable={editable}
              menuCode={CONTRACT_TEMPLATE}
              onRef={(node) => {
                this.editorOnlineRef = node;
              }}
              templateFlag
              iframeStyle={{
                width: '100%',
                // height: isPub ? '1000px' : `${(document.body.clientHeight - 96) * 0.93}px`,
                height: '1000px',
              }}
              revisionFlag={revisionFlag}
              pcTemplateId={pcTemplateId}
              pcTemplateFileId={pcTemplateFileId}
            />
          )}

          {fullScreenFlag && (
            <Modal
              wrapClassName={classnames(
                styles['full-modal-wrapper'],
                styles['clear-modal-padding']
              )}
              bodyStyle={{ height: `${document?.body?.clientHeight - 39}px` }}
              {...ModalProps}
              title={
                <Button
                  icon="shrink"
                  style={{ float: 'right' }}
                  onClick={() => this.fullScreen('fullScreenFlag', false)}
                >
                  {intl.get(`${viewMessagePrompt}.exitFullScreen`).d('退出全屏')}
                </Button>
              }
            >
              <EditorOnline
                remote={remote}
                templateFlag
                editable={editable}
                menuCode={CONTRACT_TEMPLATE}
                iframeStyle={{
                  width: '100%',
                  height: 'calc(100vh - 50px)',
                }}
                revisionFlag={revisionFlag}
                pcTemplateId={pcTemplateId}
                pcTemplateFileId={pcTemplateFileId}
                fullScreenFlag={fullScreenFlag}
              />
            </Modal>
          )}
        </Content>
      </Fragment>
    );
  }
}
