/*
 * EditorOnline  -  在线编辑通用组件
 * @date: 2019年5月20日 10:52:02
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import {
  DataSet,
  Icon,
  Tree,
  TextField,
  Select,
  Typography,
  // CheckBox,
  // Modal,
  Switch,
} from 'choerodon-ui/pro';
import EmbedPage from 'components/EmbedPage';
import notification from 'utils/notification';
import {
  fetchContractOnlineHTMLType,
  fetchContractMaintainTemporaryWPSURL,
  fetchContractTemplateWPSURL,
  fetchContractFileURL,
  fetchContractFileNewURL,
  fetchContractTemplateNewURL,
  fetchContractMaintainTemporaryNewURL,
} from '@/services/editorOnlineService';
import { queryCarbonCopyInfo, queryShareEditConfig } from '@/services/workspaceService';
import { isUndefined, isNil, isFunction, differenceWith, isEqual } from 'lodash';
// import querystring from 'querystring';
import { getResponse } from 'utils/utils';
import uuid from 'uuid/v4';
import { withRouter } from 'react-router-dom';
// eslint-disable-next-line
import intl from 'utils/intl';
import { EventManager } from '_utils/utils';
import WebOfficeSDK from './web-office-sdk-es.js';
import styles from './index.less';
import { FieldDS, ParentFieldDS } from './EditorOnlineDS.js';

const { Text } = Typography;

/**
 * EditorOnline - 在线编辑通用组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [pcHeaderId] - 头ID
 *
 */

@withRouter
@connect(({ editorOnline, loading }) => ({
  editorOnline,
  loading: loading.effects['editorOnline/fetchEditorOnlineHTML'],
}))
export default class EditorOnline extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      type: '',
      autoExpandParent: false,
      docFieldSwitchFlag: true,
    };
    this.uuid = uuid();
    this.docFieldIndex = 1; // 公文域索引
    this.enableEditShare = null; // 是否开启在线协同
  }

  findResult = [];

  clickCount = 0;

  async componentDidMount() {
    this.pathname = this.props.location.pathname;
    this.initFetch();
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  initFetch() {
    const {
      templateFlag,
      sourcePage = '',
      isOtherPageEdit,
      pcTemplateFileId,
      editable,
      pcHeaderWorkbenchPreTextFlag,
    } = this.props;
    fetchContractOnlineHTMLType().then((res) => {
      this.setState(
        {
          type: res || null,
        },
        async () => {
          // new_wps 类型，查询是否开启协同
          if (['new_wps', 'new_wps_V7'].includes(res)) {
            await this.fetchShareEditConfig();
            if (this.enableEditShare === '1') {
              // 处理在线编辑相关事务
              this.handleEditShare();
              // 我的抄送流程，获取工作流流程状态
              if (this.workflowFlag === '2') {
                await this.handleFetchCarbonCopyInfo();
              }
              // 根据状态判断是否工作流，提交后pcHeaderWorkbenchPreTextFlag标识会被置为'0'，所以增加isOtherPageEdit字段区分是否工作流
              // 文本对比模式没有isOtherPageEdit字段
              if (pcHeaderWorkbenchPreTextFlag && isOtherPageEdit !== false) {
                this.fetchEditorOnlineHtmlSubject();
                return;
              }
            }
          }

          // 满足new_wps模板编辑时，允许展示在线插入通配符功能
          if (
            pcTemplateFileId &&
            editable &&
            JSON.parse(editable) &&
            ['new_wps', 'new_wps_V7'].includes(res)
          ) {
            this.ds = new DataSet(FieldDS);
            this.parentFieldDs = new DataSet(ParentFieldDS(this.ds));
          }
          if (templateFlag) {
            this.fetchEditorOnlineTemplateHTML();
            // 协议议制
          } else if (sourcePage === 'contractMaintain' || isOtherPageEdit) {
            this.getContractMaintainOnlineHtml();
          } else {
            this.fetchEditorOnlineHTML();
          }
        }
      );
    });
  }

  componentDidUpdate(prevProps) {
    const { pcHeaderId = '', pcTemplateFileId = '', fullScreenFlag = false } = this.props;
    const { type } = this.state;
    if (prevProps?.pcHeaderId !== pcHeaderId && pcHeaderId) {
      this.initFetch();
    } else if (
      // 针对在线编辑课题
      this.watchPropsChange(prevProps, [
        'pcHeaderWorkbenchPreTextFlag',
        'permissionCode',
        'fileFlag',
      ])
    ) {
      this.initFetch();
    } else if (
      window.location.href.indexOf(this.pathname) > -1 &&
      this.jssdk &&
      ['WPS', 'new_wps', 'new_onlyoffice'].includes(type)
    ) {
      // 因为wps会自动删除以前的
      const idSuffix = `H${pcHeaderId}T${pcTemplateFileId}${fullScreenFlag ? 'full' : ''}${
        this.uuid
      }`;
      const dom = document.querySelector(`.editor-online-mount-wps${idSuffix}`);
      if (dom) {
        if (dom.childNodes.length === 0) {
          this.writeFrameDocumentWps(this.url, 1);
        }
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeOut1);
    clearTimeout(this.timeOut2);
    EventManager.off('SEARCH_KEY_INFO', this.searchKeyInfo);
    // if (this.routerFlag) {
    //   this.removeSaveEvent();
    // }
  }

  // -------在线编辑课题Start------
  // 在线编辑共享配置
  @Bind()
  async fetchShareEditConfig() {
    const response = await queryShareEditConfig();
    const res = getResponse(response);
    if (res) {
      const { enableEditShare } = res;
      this.enableEditShare = enableEditShare;
    }
  }

  @Bind()
  handleEditShare() {
    const {
      routerFlag,
      isContratWorkspace,
      isContractSign,
      editShare,
      templateFlag,
      match: {
        params: { id: processInstanceId },
      },
    } = this.props;
    // 区分2种方式，一种iframe，一种dom节点
    let parentPathname = '';
    if (window?.location?.ancestorOrigins?.length) {
      const { ancestorOrigins, origin } = window?.location;
      console.log('ceshi', window?.location);
      // 当其他系统内迁我们系统时我们,ancestorOrigins主要是为了解决其他公司系统内迁我们系统window.top.location?.pathname访问跨源问题。
      if (ancestorOrigins[0] !== origin) {
        parentPathname = '/hwfp/approval/list';
      } else {
        parentPathname = window.top.location?.pathname || '';
      }
    } else {
      parentPathname = window.top.location?.pathname || '';
    }
    const index = parentPathname.lastIndexOf('/');
    const urlParam = parentPathname.substring(index + 1, parentPathname.length);
    this.processInstanceId = processInstanceId || urlParam;
    // 路由模式下，添加保存事件
    if (routerFlag) {
      // this.addSaveEvent();
      window.saveDocument = this.saveDocument;
    }
    // 签署2套表单，根据标识加以控制
    const isContractSignFlag = editShare === '1' && isContractSign;
    // 工作流页面且是工作台||签署功能，处理查询参数
    // 增加协议模板页面
    if (isContratWorkspace || isContractSignFlag || templateFlag) {
      this.handleJudgeWorkflow(parentPathname);
    }
  }

  @Bind()
  async handleFetchCarbonCopyInfo() {
    const response = await queryCarbonCopyInfo({ processInstanceId: this.processInstanceId });
    const res = getResponse(response);
    if (res) {
      const { deleteReason: processStatus } = res;
      this.processStatus = processStatus;
    }
  }

  /**
   * 添加保存事件监听
   */
  @Bind()
  addSaveEvent() {
    window.addEventListener('message', this.saveDocument, true);
  }

  @Bind()
  removeSaveEvent() {
    window.removeEventListener('message', this.saveDocument, true);
  }

  /**
   * 判断当前是否属于工作流表单
   */
  @Bind()
  handleJudgeWorkflow(parentPathname) {
    this.workflowFlag = this.getWorkflowFlag(parentPathname);
  }

  /**
   * 根据地址判断是抄送还是待办功能
   * @param {String} content
   */
  @Bind()
  getWorkflowFlag(pathname = '') {
    console.log('props', this.props);
    let workflowFlag;
    // 工作流抄送
    if (pathname.includes('/hwfp/carbon-copy-task/detail')) {
      workflowFlag = '2';
      // 工作流待办||审批工作台-表单为协议工作台
    } else if (pathname.includes('/hwfp/task/detail')) {
      workflowFlag = '1';
      // 审批工作台
    } else if (
      pathname.includes('/hwfp/approval/list') ||
      pathname.includes('/hwfp/approval/task/detail') ||
      pathname.includes('/spcm/contract-workspace/list')
    ) {
      workflowFlag = '3';
    }
    return workflowFlag;
  }

  /**
   * 获取工作流的permissionCode
   * @param {String} content
   */
  @Bind()
  getWFPermissionCode() {
    const { permissionCode, remote } = this.props;
    const cuxFlag = remote ? remote.process('SPCM_EDITORONLINE_PROCESS_WORKFLOWFLAG', this.workflowFlag, { current: this }) : this.workflowFlag;
    switch (cuxFlag) {
      case '1':
        return 'EDIT';
      case '2':
        // 抄送流程只有审批中状态可编辑
        if (this.processStatus === 'APPROVAL') {
          return 'EDIT';
        } else {
          return 'VIEW';
        }
      case '3':
        return undefined;
      default:
        return permissionCode;
    }
  }

  @Bind()
  async saveDocument(e) {
    if (e && e.data === 'saveDocument' && this.jssdk?.Application?.ActiveDocument?.Save) {
      await this.jssdk.ready();
      const res = await this.jssdk.Application?.ActiveDocument?.Save();
      if (['ok', 'nochange'].includes(res?.result) || !res?.result) {
        return true;
      } else {
        switch (res.result) {
          case 'SavedEmptyFile':
            notification.error({
              message: intl
                .get('spcm.common.message.wpsSave.saveEmptyFile')
                .d('暂不支持保存空文件 触发场景：内核保存完后文件为空'),
            });
            break;
          case 'SpaceFull':
            notification.error({
              message: intl.get('spcm.common.message.wpsSave.spaceFull').d('空间已满'),
            });
            break;
          case 'QueneFull':
            notification.error({
              message: intl
                .get('spcm.common.message.wpsSave.queneFull')
                .d('保存中请勿频繁操作 触发场景：服务端处理保存队列已满，正在排队'),
            });
            break;
          default:
            notification.error({
              message: intl.get('spcm.common.message.wpsSave.fail').d('保存失败'),
            });
        }
        return false;
      }
    } else {
      return true;
    }
  }

  /**
   * 监听对应的props字段发生改变
   */
  @Bind()
  watchPropsChange(prevProps, watchFields) {
    const changeFieldIndex = watchFields.findIndex((field) => {
      if (!isNil(this.props[field]) && this.props[field] !== prevProps[field]) {
        return true;
      }
      return false;
    });
    return changeFieldIndex !== -1;
  }

  @Bind()
  fetchEditorOnlineHtmlSubject() {
    const { pcHeaderWorkbenchPreTextFlag = '0' } = this.props;
    // 根据不同阶段调用不同接口，在线编辑课题需要
    if (pcHeaderWorkbenchPreTextFlag === '0') {
      this.getContractMaintainOnlineHtmlNew();
    } else {
      this.fetchEditorOnlineHTMLNew();
    }
  }

  // ---在线编辑课题End------

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  writeFrameDocument(content) {
    let message = content;
    try {
      const data = JSON.parse(content);
      message = data?.message;
    } catch (e) {
      message = content;
    }
    const { pcHeaderId = '', pcTemplateFileId = '', fullScreenFlag = false } = this.props;
    const idSuffix = `H${pcHeaderId}T${pcTemplateFileId}${fullScreenFlag ? 'full' : ''}${
      this.uuid
    }`;
    if (document.getElementById(`EditOnline${idSuffix}`)) {
      const editorIframeDocument = document.getElementById(`EditOnline${idSuffix}`).contentWindow
        .document;
      editorIframeDocument.open('text/html', 'replace');
      editorIframeDocument.write(message);
      editorIframeDocument.close();
    }
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  async writeFrameDocumentWps(url, count) {
    this.setState({ url });
    this.url = url;
    clearTimeout(this.timeOut2);
    this.timeOut1 = setTimeout(() => {
      this.writeFrameDocumentWps2(url, count);
    }, 50);
  }

  /**
   * 动态写入iframe的document
   * @param {String} content
   */
  @Bind()
  async writeFrameDocumentWps2(url, count) {
    const { templateFlag, dispatch } = this.props;
    const { type } = this.state;
    if (type === 'new_wps_V7') {
      return true;
    }
    if (url && url.startsWith('http')) {
      const { pcHeaderId = '', pcTemplateFileId = '', fullScreenFlag = false } = this.props;
      const idSuffix = `H${pcHeaderId}T${pcTemplateFileId}${fullScreenFlag ? 'full' : ''}${
        this.uuid
      }`;
      if (document.querySelector(`.editor-online-mount-wps${idSuffix}`)) {
        // eslint-disable-next-line
        const jssdk = WebOfficeSDK.config({
          url,
          mount: document.querySelector(`.editor-online-mount-wps${idSuffix}`),
        });
        this.jssdk = jssdk;
        dispatch({
          type: 'editorOnline/updateState',
          payload: {
            pathname: this.pathname,
          },
        });
        await this.jssdk.ready();
        const iframe = await this.jssdk.iframe;
        this.app = this.jssdk.Application;
        iframe.style.width = '100%';
        EventManager.on('SEARCH_KEY_INFO', this.searchKeyInfo);
        this.searchKeyInfo();
        if (templateFlag) {
          // 页面定制对象：更多菜单
          const moreMenus = await this.app.CommandBars('MoreMenus');
          // 控制更多菜单禁用
          moreMenus.Enabled = false;
        }
      } else if (count !== 0) {
        const newCount = (count || 3) - 1;
        this.timeOut2 = setTimeout(() => {
          this.writeFrameDocumentWps(url, newCount);
        }, 1500);
      }
    } else {
      try {
        getResponse(JSON.parse(url));
      } catch (error) {
        console.log(error);
      }
    }
  }

  @Bind()
  fetchEditorOnlineHTML() {
    const { type } = this.state;
    if (type === 'WPS') {
      return this.fetchEditorOnlineHTMLWps();
    } else if (['new_wps', 'new_onlyoffice', 'new_wps_V7'].includes(type)) {
      return this.fetchEditorOnlineHTMLNew();
    }
    const { dispatch, pcHeaderId = '', permissionCode, supplierFlag, menuCode } = this.props;
    dispatch({
      type: 'editorOnline/fetchEditorOnlineHTML',
      payload: {
        pcHeaderId,
        permissionCode,
        supplierFlag,
        menuCode,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  @Bind()
  fetchEditorOnlineHTMLWps() {
    const {
      pcHeaderId = '',
      permissionCode,
      supplierFlag,
      menuCode,
      showRejectFileFlag = false,
    } = this.props;
    fetchContractFileURL({
      pcHeaderId,
      permissionCode,
      supplierFlag,
      menuCode,
      showRejectFileFlag,
    }).then((res) => {
      if (res) {
        this.writeFrameDocumentWps(res);
      }
    });
  }

  @Bind()
  fetchEditorOnlineHTMLNew() {
    // const { type } = this.state;
    const {
      pcHeaderId = '',
      permissionCode,
      supplierFlag,
      headerInfo,
      pcTemplateId,
      fileFlag,
      customFileFlag = 0,
      menuCode,
      isNewAPIUrlFlag,
      showRejectFileFlag = false,
    } = this.props;
    let paramPermissionCode = permissionCode;
    // 根据workflowFlag判断是否是工作流情况，如果是，是否编辑由后端处理
    if (isFunction(this.getWFPermissionCode)) {
      paramPermissionCode = this.getWFPermissionCode();
    }
    // 避免部分租户未传headerInfo
    if (headerInfo?.pcTemplateId || pcTemplateId || isUndefined(headerInfo)) {
      fetchContractFileNewURL({
        pcHeaderId,
        permissionCode: paramPermissionCode,
        supplierFlag,
        fileFlag, // 刷新对比编辑模式的版本
        workflowFlag: this.workflowFlag, // 处理工作流的在线编辑
        customFileFlag,
        menuCode,
        isNewAPIUrlFlag,
        showRejectFileFlag,
      }).then((res) => {
        if (res) {
          // if (type === 'new_wps') {
          this.writeFrameDocumentWps(res);
          //  } else {
          //    this.writeFrameDocument(res);
          //  }
        }
      });
    }
  }

  /**
   * 除了协议议制页面
   */
  @Bind()
  getContractMaintainOnlineHtml() {
    const { type } = this.state;
    if (type === 'WPS') {
      return this.getContractMaintainOnlineHtmlWps();
    } else if (['new_wps', 'new_onlyoffice', 'new_wps_V7'].includes(type)) {
      return this.getContractMaintainOnlineHtmlNew();
    }
    const { dispatch, pcHeaderId = '', permissionCode, supplierFlag, menuCode } = this.props;
    dispatch({
      type: 'editorOnline/fetchContractMaintainEditorOnlineHTML',
      payload: {
        pcHeaderId,
        permissionCode,
        supplierFlag,
        menuCode,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  /**
   * 只有协议议制页面
   */
  @Bind()
  getContractMaintainOnlineHtmlWps() {
    const { pcHeaderId = '', permissionCode, supplierFlag, menuCode } = this.props;
    fetchContractMaintainTemporaryWPSURL({
      pcHeaderId,
      permissionCode,
      supplierFlag,
      menuCode,
    }).then((res) => {
      if (res) {
        this.writeFrameDocumentWps(res);
      }
    });
  }

  /**
   * 只有协议议制页面
   */
  @Bind()
  getContractMaintainOnlineHtmlNew() {
    //  const { type } = this.state;
    const { pcHeaderId = '', permissionCode, supplierFlag, menuCode } = this.props;
    fetchContractMaintainTemporaryNewURL({
      pcHeaderId,
      permissionCode,
      supplierFlag,
      menuCode,
    }).then((res) => {
      if (res) {
        //  if (type === 'new_wps') {
        this.writeFrameDocumentWps(res);
        //  } else {
        //    this.writeFrameDocument(res);
        //  }
      }
    });
  }

  @Bind()
  fetchEditorOnlineTemplateHTML() {
    const { type } = this.state;
    if (type === 'WPS') {
      return this.fetchEditorOnlineTemplateHTMLWps();
    } else if (['new_wps', 'new_onlyoffice', 'new_wps_V7'].includes(type)) {
      return this.fetchEditorOnlineTemplateHTMLNew();
    }
    const {
      dispatch,
      pcTemplateId = '',
      pcTemplateFileId = '',
      permissionCode,
      revisionFlag,
      menuCode,
    } = this.props;
    dispatch({
      type: 'editorOnline/fetchEditorOnlineTemplateHTML',
      payload: {
        pcTemplateId,
        pcTemplateFileId,
        permissionCode,
        revisionFlag,
        menuCode,
      },
    }).then((res) => {
      this.writeFrameDocument(res);
    });
  }

  searchKeyInfo = async (info) => {
    const { extractValue } = this.props?.editorOnline || {};
    const keyInfo = info || extractValue;
    if (!keyInfo) {
      return false;
    }
    if (this.app?.ActivePDF) {
      await this.app.ActivePDF.Find({ Value: keyInfo });
      return false;
    }
    // 取消搜索结果高亮
    await this.app.ActiveDocument.Find.ClearHitHighlight();
    // 1. 搜索并高亮文本
    const findResult = await this.app.ActiveDocument.Find.Execute(keyInfo, true);
    if (differenceWith(findResult, this.findResult, isEqual).length) {
      this.clickCount = 0;
      this.findResult = findResult;
    } else if (this.clickCount < findResult.length - 1) {
      this.clickCount += 1;
    } else {
      this.clickCount = 0;
    }
    if (findResult.length) {
      // 2. 获取位置信息
      const { pos } = findResult[this.clickCount];
      // 3. 获取区域对象
      const range = await this.app.ActiveDocument.Range.SetRange(pos, pos);
      // 4. 滚动文档窗口, 显示指定的区域
      await this.app.ActiveDocument.ActiveWindow.ScrollIntoView(range);
    } else {
      notification.warning({
        message: intl.get('spcm.common.message.wps.searchKeyNotFound').d('搜索关键字未找到'),
      });
    }
  };

  /**
   * 协议模板页面
   */
  @Bind()
  fetchEditorOnlineTemplateHTMLWps() {
    const {
      pcTemplateId = '',
      pcTemplateFileId = '',
      permissionCode,
      revisionFlag,
      menuCode,
    } = this.props;
    fetchContractTemplateWPSURL({
      pcTemplateId,
      pcTemplateFileId,
      permissionCode,
      revisionFlag,
      menuCode,
    }).then((res) => {
      if (res) {
        this.writeFrameDocumentWps(res);
      }
    });
  }

  /**
   * 协议模板页面
   */
  @Bind()
  fetchEditorOnlineTemplateHTMLNew() {
    //  const { type } = this.state;
    const {
      pcTemplateId = '',
      pcTemplateFileId = '',
      permissionCode,
      revisionFlag,
      menuCode,
    } = this.props;
    let paramPermissionCode = permissionCode;
    // 根据workflowFlag判断是否是工作流情况，如果是，是否编辑由后端处理
    if (isFunction(this.getWFPermissionCode)) {
      paramPermissionCode = this.getWFPermissionCode();
    }
    fetchContractTemplateNewURL({
      revisionFlag,
      pcTemplateId,
      pcTemplateFileId,
      permissionCode: paramPermissionCode,
      workflowFlag: this.workflowFlag, // 处理工作流的在线编辑
      menuCode,
    }).then((res) => {
      if (res) {
        //  if (type === 'new_wps') {
        this.writeFrameDocumentWps(res);
        //  } else {
        //    this.writeFrameDocument(res);
        //  }
      }
    });
  }

  /**
   * 插入字段到文档
   * @param {string} name 字段名
   */
  @Bind()
  async handleWildcard(name) {
    const { docFieldSwitchFlag } = this.state;
    if (docFieldSwitchFlag) {
      this.handleAddDocFields(name);
    } else {
      await this.app.ActiveDocument.ActiveWindow.Selection.InsertAfter(name);
    }
  }

  /**
   * 插入公文域到文档
   * @param {string} name 插入字段内容，计算范围
   */
  async handleAddDocFields(name) {
    const { Selection } = this.app.ActiveDocument.ActiveWindow;
    const End = await Selection.Range.End;
    const documentFields = this.app.ActiveDocument.DocumentFields;
    documentFields.AddDocumentFields([
      {
        Name: `${name}-${this.docFieldIndex}`,
        Range: { Start: End, End },
        Hidden: false, // 是否隐藏，默认 false
        PrintOut: true, // 是否可打印，默认 true
        ReadOnly: true, // 是否只读，默认 false
        Value: name,
      },
    ]);
    this.docFieldIndex++;
  }

  @Bind()
  changeDocFieldSwitch() {
    const { docFieldSwitchFlag } = this.state;
    this.setState({
      docFieldSwitchFlag: !docFieldSwitchFlag,
    });
  }

  @Bind()
  onExpand(newExpandedKeys) {
    this.setState({ expandedKeys: newExpandedKeys, autoExpandParent: false });
  }

  /**
   * 根据字段名称搜索
   */
  @Bind()
  onEnterSearch() {
    const { fieldSit, fieldSearch } = this.parentFieldDs.current?.toJSONData() || {};
    this.ds.forEach((record) => {
      if (
        record.get('langStr').indexOf(fieldSearch) > -1 &&
        (!fieldSit || record.get('parentId')?.split('-')[0] === fieldSit)
      ) {
        record.set('expand', true);
      } else {
        record.set('expand', false);
      }
    });
    this.setState({ autoExpandParent: true });
  }

  /**
   * 右侧通配符显示区域
   * @returns ELement
   */
  @Bind()
  renderRightList() {
    const { autoExpandParent, expandedKeys, docFieldSwitchFlag } = this.state;
    const { iframeStyle } = this.props;
    return (
      <div className={styles.editorField} style={{ height: iframeStyle.height }}>
        <h3 className={styles.editorFieldTitle}>
          {intl.get('spcm.common.title.select.fieldName').d('选择协议通配符')}
        </h3>
        <Select
          allowClear
          name="fieldSit"
          className={styles.fieldSit}
          placeholder={intl.get('spcm.common.msg.fieldSit').d('请选择所属位置')}
          dataSet={this.parentFieldDs}
          optionsFilter={(record) => !record.get('parentId')}
        />
        <TextField
          name="fieldSearch"
          dataSet={this.parentFieldDs}
          className={styles.fieldSearch}
          placeholder={intl.get('spcm.common.msg.fieldName').d('请输入字段名')}
          prefix={<Icon onClick={this.onEnterSearch} type="search" />}
          onEnterDown={this.onEnterSearch}
        />
        <div className={styles.fieldSwitch}>
          <Switch size="small" checked={docFieldSwitchFlag} onChange={this.changeDocFieldSwitch} />
          <div className={styles.switchDesc}>
            {intl.get('spcm.common.msg.isEditFlag').d('通配符只读')}
          </div>
        </div>

        <div className={styles.fieldList} style={{ height: `calc(${iframeStyle.height} - 220px)` }}>
          <Tree
            blockNode
            showLine={{
              showLeafIcon: false,
            }}
            dataSet={this.ds}
            showIcon={false}
            onExpand={this.onExpand}
            autoExpandParent={autoExpandParent}
            expandedKeys={expandedKeys}
            renderer={({ record }) => (
              <Text
                style={{ width: '105px' }}
                className={record.get('expand') ? styles.fieldExpand : null}
                ellipsis={{ tooltip: record.get('langStr') }}
                onClick={() =>
                  record.get('isEnd') === 'Y' && this.handleWildcard(record.get('langStr'))
                }
              >
                {record.get('langStr')}
              </Text>
            )}
          />
        </div>
      </div>
    );
  }

  render() {
    const { type, url } = this.state;
    const {
      iframeStyle = {},
      pcHeaderId = '',
      pcTemplateFileId = '',
      fullScreenFlag = false,
      editable,
      remote,
    } = this.props;
    const idSuffix = `H${pcHeaderId}T${pcTemplateFileId}${fullScreenFlag ? 'full' : ''}${
      this.uuid
    }`;
    if (type === 'new_wps_V7') {
      return (
        <div style={{ display: 'flex' }}>
          <EmbedPage
            contentStyle={{ height: '100%', ...iframeStyle }}
            href={url}
            onlineDocProps={{
              afterLoad: async (jssdk) => {
                this.jssdk = jssdk;
                this.app = jssdk.Application;
                EventManager.on('SEARCH_KEY_INFO', this.searchKeyInfo);
                this.searchKeyInfo();
                if (remote?.event) {
                  await remote.event.fireEvent('handleCuxNewWpsV7WriteDoc', { current: this });
                }
              },
            }}
          />
          {pcTemplateFileId && editable && JSON.parse(editable) ? this.renderRightList() : null}
        </div>
      );
    }
    return ['WPS', 'new_wps', 'new_onlyoffice'].includes(type) ? (
      <div style={{ display: 'flex' }}>
        <div
          className={`editor-online-mount-wps editor-online-mount-wps${idSuffix}`}
          style={{ border: '0', flex: 1, ...iframeStyle }}
        />
        {pcTemplateFileId && editable && JSON.parse(editable) && type === 'new_wps'
          ? this.renderRightList()
          : null}
      </div>
    ) : (
      <iframe
        id={`EditOnline${idSuffix}`}
        style={{ border: '0', ...iframeStyle }}
        title="Edit Online"
      />
    );
  }
}
