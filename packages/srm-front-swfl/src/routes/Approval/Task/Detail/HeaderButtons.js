/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { connect } from 'dva';
import { withRouter, routerRedux } from 'dva/router';
import moment from 'moment';
import { stringify, parse } from 'querystring';
import { Button, TextField, Attachment, Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon, Dropdown, Menu, message } from 'choerodon-ui';
import { isEmpty, forEach, keys, isFunction, cloneDeep, isObject, isNil } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import { toJS } from 'mobx';

import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, getResponse, getCurrentUser } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config.js';
import { closeTab, getActiveTabKey } from 'utils/menuTab';

import { queryUUID } from 'services/api';
import { queryQuickReply } from '@/services/quickReply';
import {
  getJumpList,
  saveTaskComment,
  fetchFileCount,
  saveTask,
  checkGroupButFlag,
  starGroupChat,
  getForecastLists,
  getDdConfig,
} from '@/services/taskService';
import QuickReply from '@/components/QuickReply';
import QuickReplyAllScreen from '@/components/QuickReply/AllScreen';
import { getDetailDispatchRouter } from '@/utils/util';
import ContactLov from 'srm-front-boot/lib/components/ContactLov';
import ApprovalReply from 'srm-front-boot/lib/components/ApprovalReply';

import ApproveProcessNotification, {
  PROCESS_EXCUTE_STATUS,
} from '@/components/ApproveProcessNotification';
import AssignDrawer from './AssignDrawer';
import ApprovalDrawer from './ApprovalDrawer';
import styles from './index.less';

@remote({
  code: 'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS',
  name: 'processRemote',
})
@withRouter
@connect(({ task }) => ({
  newTask: task,
}))
export default class HeaderButtons extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.uploadModalRef = null;
    this.modalApprovalType = undefined;
    this.script = null; // 用于存储script标签的引用
    this.newScript = null;
    this.state = {
      approveActions: {},
      approveCommentTitle: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      formInvokeFlag: false,
      approvalNeedOpinionFlag: false,
      approvalRefuseOpinionFlag: false,
      hasRefuseOpinionFlag: false,
      approveCommentNotice: '',
      approvalDrawerVisible: false,
      approvalType: 'Approved',
      carbonCopyFlag: false,
      nextNodeFlag: false,
      approvalData: {},
      specifyEmployeeData: [],
      showQuickReply: false,
      showAllScreen: false,
      attachments: [],
      preApprovalOpinionStatus: {}, // 存储上一个审批意见的状态，内部存储两个值 approvalNeedOpinionFlag:是否保存时候校验 fieldRequired: 上次字段是否必输
      isRoleWorkbench: getActiveTabKey() === '/swbh/role-workbench',
      rejectJumpConfigRebutFlag: false,
      rejectJumpConfigRefuseFlag: false,
      loadFlag: false,
      beforeApproveLoading: false,
      moreBtnVisible: false,
      formLoadTime: '', // 审批表单加载完成时间
      submitTime: '', // 点击审批按钮时间
      groupFlag: false, // 是否有群聊 （金雨科技租户使用）
      groupStatus: false, // 校验群聊接口是否正常调用 （金雨科技租户使用）
      groupData: {}, // 发起群聊或者加入群聊 入参
      processStatus: undefined,
      actions: [],
      showActionCodes: [],
      moreActionCodes: [],
      rejectAgainSubmitPathDefault: undefined,
      rebutAgainSubmitPathDefault: undefined,
    };
  }

  approvalModal;

  componentDidMount() {
    const {
      task: { formKey },
      // matchParams: { processInstanceId },
    } = this.props;

    if (!formKey || !formKey.includes('include://')) {
      // 没有表单或者非include表单，页脚按钮无需loading
      this.setState({ loadFlag: true });
    }

    // 判断是否需要展示群聊按钮  然后判断展示创建群聊或者加入群聊
    const { tenantNum } = getCurrentUser();
    if (tenantNum === 'SRM-GOLDRAIN') {
      this.handleConfigDd();
      this.handleGolorainConfig();
    }

    this.openDrawer();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.taskId === nextProps.taskId) {
      return;
    }
    this.props = nextProps;
    this.setState({
      approveActions: {},
      approveCommentTitle: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      formInvokeFlag: false,
      approvalNeedOpinionFlag: false,
      approveCommentNotice: '',
      approvalDrawerVisible: false,
      approvalType: 'Approved',
      carbonCopyFlag: false,
      nextNodeFlag: false,
      approvalData: {},
      specifyEmployeeData: [],
      showQuickReply: false,
      showAllScreen: false,
      attachments: [],
      loadFlag: false,
      actions: [],
      showActionCodes: [],
      moreActionCodes: [],
    });
    this.openDrawer();
  }

  // 钉钉配置
  @Bind()
  handleConfigDd() {
    // 创建一个新的script元素
    this.script = document.createElement('script');
    this.script.src = 'https://g.alicdn.com/dingding/dingtalk-jsapi/3.0.38/dingtalk.open.js'; // 替换为你的外部脚本URL
    this.script.async = true; // 如果需要异步加载，可以设置这个属性
    this.script.onload = () => {
      const { dd } = window;
      if (dd.env.platform !== 'notInDingTalk') {
        dd.setNavigationTitle({
          title: 'SRM',
          success: () => {},
          fail: () => {},
          complete: () => {},
        });
      }
      // console.log("dingtalk-jsapi success------");
    };
    this.script.onerror = () => {
      notification.warning({
        message: intl.get('hwfp.common.model.getDdConfig.message').d('获取钉钉JSAPI配置失败'),
      });
    };
    // 将script元素添加到DOM中（通常添加到<head>或<body>）
    document.head.appendChild(this.script);
  }

  // SRM-GOLDRAIN租户单独处理的方法
  @Bind()
  handleGolorainConfig() {
    const {
      task: {
        processInstanceId,
        description,
        startUserId,
        processName,
        processDefinitionId,
        historicTaskExtList,
      },
    } = this.props;
    checkGroupButFlag({ processInstanceId }).then(async (res) => {
      if (getResponse(res)) {
        // groupFlag 为 true 加入群聊 false 创建群聊
        const { groupFlag, groupId } = res;
        this.setState({ groupFlag });
        this.setState({ groupStatus: true });
        const response1 = await getForecastLists({
          tenantId: getCurrentOrganizationId(),
          processInstanceId,
          processDefinitionId,
        });
        const employeeCodes = [
          ...new Set(
            [...response1, ...historicTaskExtList]
              .filter((item) => item.assignee)
              .map((item) => item.assignee)
          ),
        ];
        const groupData = groupFlag
          ? {
              processInstanceId,
              processName,
              startUserId,
              groupId,
              processDescription: description,
              employeeCodes,
            }
          : {
              processInstanceId,
              startUserId,
              processName,
              processDescription: description,
              employeeCodes,
            };
        this.setState({ groupData });
      }
    });
  }

  @Bind()
  handleLoadCommentDraft() {
    const {
      formDs,
      task: { comment },
    } = this.props;
    this.setState({ oldComment: comment || '' });
    if (comment) {
      formDs.current.set('approvalOpinion', comment);
      this.setState({
        approveCommentNotice: intl
          .get('hwfp.task.view.message.restoredLatestDraft')
          .d('已恢复上一次保存的草稿'),
      });
    }
  }

  @Bind()
  openEditModal() {
    this.setState({ showQuickReply: true, showAllScreen: true });
  }

  @Bind()
  handleSaveCommentDraft(comment) {
    const { taskId } = this.props;
    const { oldComment } = this.state;
    const { timeZone } = getCurrentUser();
    const timeZoneValue = parseInt(timeZone.split('GMT')[1], 0);
    if (oldComment === comment) {
      return;
    }
    saveTaskComment({
      taskId,
      comment,
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          approveCommentNotice: intl
            .get('hwfp.task.view.message.saveDraft', {
              time: moment().utcOffset(timeZoneValue).format('YYYY-MM-DD H:mm:ss'),
            })
            .d(`于${moment().utcOffset(timeZoneValue).format('YYYY-MM-DD H:mm:ss')}时保存草稿`),
          oldComment: comment || '',
        });
      }
    });
  }

  @Bind()
  handleProcessCuszInfo() {
    const {
      formDs,
      task: { formKey, formData = {} },
    } = this.props;
    const { formProperties } = formData;
    if (!isEmpty(formProperties)) {
      const approveActions = {};
      let approveCommentTitle = intl.get('hwfp.task.view.message.comment').d('审批意见');
      let formInvokeFlag = false;
      let approvalNeedOpinionFlag = false;
      let approvalRefuseOpinionFlag = false;
      let hasRefuseOpinionFlag = false;
      let rejectJumpConfigRebutFlag = false;
      let rejectJumpConfigRefuseFlag = false;
      let hasApproveAndAddSignFlag = false;
      let rejectAgainSubmitPathDefault = 0;
      let rebutAgainSubmitPathDefault = 0;
      formProperties.forEach((prop) => {
        // 自定义审批动作
        if (prop.id === 'APPROVAL_ACTION' && prop.type === 'enum' && !isEmpty(prop.enumValues)) {
          const targetAction = prop.enumValues.filter((item) => item.name === 'Y');
          // 兼容历史数据没有该字段
          hasApproveAndAddSignFlag =
            prop.enumValues.filter((item) => item.id === 'ACTION_APPROVE_AND_ADD_SIGN').length > 0;
          if (!isEmpty(targetAction)) {
            targetAction.forEach((action) => {
              switch (action.id) {
                case 'ACTION_DELEGATE':
                  // 无法确定按钮和按钮标题哪个先执行，故先做判断
                  if (!approveActions.delegate) {
                    approveActions.delegate = intl
                      .get('hwfp.task.view.option.delegate', { name: '转交' })
                      .d('转交');
                  }
                  break;
                case 'ACTION_ADD_SIGN':
                  if (!approveActions.AddSign) {
                    approveActions.AddSign = intl
                      .get('hwfp.task.view.option.addUser', { name: '加签' })
                      .d('加签');
                  }
                  if (!approveActions.ApproveAndAddSign && !hasApproveAndAddSignFlag) {
                    approveActions.ApproveAndAddSign = intl
                      .get('hwfp.task.view.option.ApproveAndAddSign', { name: `同意并加签` })
                      .d('同意并加签');
                  }
                  break;
                case 'ACTION_APPROVE_AND_ADD_SIGN':
                  if (!approveActions.ApproveAndAddSign) {
                    approveActions.ApproveAndAddSign = intl
                      .get('hwfp.task.view.option.ApproveAndAddSign', { name: `同意并加签` })
                      .d('同意并加签');
                  }
                  break;
                case 'ACTION_REJECT':
                  if (!approveActions.Rejected) {
                    approveActions.Rejected = intl
                      .get('hwfp.task.view.option.rejected', { name: '审批拒绝' })
                      .d('审批拒绝');
                  }
                  break;
                case 'ACTION_APPROVE':
                  if (!approveActions.Approved) {
                    approveActions.Approved = intl
                      .get('hwfp.task.view.option.approved', { name: '审批通过' })
                      .d('审批通过');
                  }
                  break;
                case 'ACTION_JUMP':
                  if (!approveActions.Jumped) {
                    approveActions.Jumped = intl
                      .get('hwfp.task.view.option.jumped', { name: '驳回' })
                      .d('驳回');
                  }
                  break;
                case 'ACTION_COMMENT':
                  approveActions.comment = intl.get('hwfp.task.view.option.comment').d('评论');
                  break;
                default:
                  break;
              }
            });
          }
        }
        // 自定义审批动作标题
        if (prop.id === 'APPROVAL_ACTION_TITLE' && prop.type === 'enum') {
          forEach(prop.enumValues, (result) => {
            const { id, name } = result;
            if (name) {
              switch (id) {
                case 'ACTION_DELEGATE':
                  if (approveActions.delegate) {
                    approveActions.delegate = intl
                      .get('hwfp.task.view.option.delegate', { name })
                      .d(name);
                  }
                  break;
                case 'ACTION_ADD_SIGN':
                  if (approveActions.AddSign) {
                    approveActions.AddSign = intl
                      .get('hwfp.task.view.option.addUser', { name })
                      .d(name);
                  }
                  if (approveActions.ApproveAndAddSign && !hasApproveAndAddSignFlag) {
                    approveActions.ApproveAndAddSign = intl
                      .get('hwfp.task.view.option.ApproveAndAddSign', { name: `同意并${name}` })
                      .d(`同意并${name}`);
                  }
                  break;
                case 'ACTION_APPROVE_AND_ADD_SIGN':
                  if (approveActions.ApproveAndAddSign) {
                    approveActions.ApproveAndAddSign = intl
                      .get('hwfp.task.view.option.ApproveAndAddSign', { name })
                      .d(name);
                  }
                  break;
                case 'ACTION_REJECT':
                  if (approveActions.Rejected) {
                    approveActions.Rejected = intl
                      .get('hwfp.task.view.option.rejected', { name })
                      .d(name);
                  }
                  break;
                case 'ACTION_JUMP':
                  if (approveActions.Jumped) {
                    approveActions.Jumped = intl
                      .get('hwfp.task.view.option.jumped', { name })
                      .d(name);
                  }
                  break;
                case 'ACTION_APPROVE':
                  if (approveActions.Approved) {
                    approveActions.Approved = intl
                      .get('hwfp.task.view.option.approved', { name })
                      .d(name);
                  }
                  break;
                default:
                  break;
              }
            }
          });
        }
        // 自定义审批意见标题
        if (prop.id === 'ACTION_COMMENT_TITLE') {
          approveCommentTitle = prop.name;
        }
        // 自定义审批同意时审批意见必输
        if (prop.id === 'APPROVAL_NEED_OPINION_FLAG') {
          if (prop.name === 'Y') {
            approvalNeedOpinionFlag = true;
            formDs.current.getField('approvalOpinion').set('required', true);
          } else {
            approvalNeedOpinionFlag = false;
            formDs.current.getField('approvalOpinion').set('required', false);
          }
        }
        // 自定义审批拒绝时审批意见必输
        if (prop.id === 'APPROVAL_REFUSED_OPINION_FLAG') {
          hasRefuseOpinionFlag = true;
          if (prop.name === 'Y') {
            approvalRefuseOpinionFlag = true;
            formDs.current.getField('approvalOpinion').set('required', true);
          } else {
            approvalRefuseOpinionFlag = false;
            formDs.current.getField('approvalOpinion').set('required', false);
          }
        }
        if (formKey && prop.id === 'FORM_INVOKE_FLAG') {
          formInvokeFlag = false;
        }
        // 驳回
        if (prop.id === 'REJECT_JUMP_CONFIG_REBUT_FLAG' && prop.name === 'Y') {
          rejectJumpConfigRebutFlag = true;
        }
        // 拒绝
        if (prop.id === 'REJECT_JUMP_CONFIG_REFUSE_FLAG' && prop.name === 'Y') {
          rejectJumpConfigRefuseFlag = true;
        }
        // 拒绝
        if (prop.id === 'APPROVE_REJECT_AGAIN_SUBMIT_PATH_DEFAULT' && rejectJumpConfigRefuseFlag) {
          rejectAgainSubmitPathDefault = prop.name === 'START_FROM_FIRST' ? 0 : 1;
        }
        // 驳回
        if (prop.id === 'APPROVE_REBUT_AGAIN_SUBMIT_PATH_DEFAULT' && rejectJumpConfigRebutFlag) {
          rebutAgainSubmitPathDefault = prop.name === 'START_FROM_REBUT' ? 0 : 1;
        }
      });
      this.setState(
        {
          approveActions,
          approveCommentTitle,
          formInvokeFlag,
          approvalNeedOpinionFlag,
          approvalRefuseOpinionFlag,
          hasRefuseOpinionFlag,
          rejectJumpConfigRebutFlag,
          rejectJumpConfigRefuseFlag,
          rejectAgainSubmitPathDefault,
          rebutAgainSubmitPathDefault,
        },
        this.handleJumpList
      );
    } else {
      this.handleInitActions();
    }
  }

  @Bind()
  handleJumpList() {
    const { taskId, newTask, stepRebutFlag: propsStepRebutFlag } = this.props;
    const { stepRebutFlag } = newTask || {};
    const flag = isNil(propsStepRebutFlag) ? stepRebutFlag : propsStepRebutFlag;
    const { approveActions } = this.state;
    if (Object.keys(approveActions).find((item) => item === 'Jumped')) {
      // 有驳回再查询驳回节点
      getJumpList({
        tenantId: getCurrentOrganizationId(),
        taskId,
        query: flag ? { workStationFlg: 1 } : undefined,
      }).then((res) => {
        const result = getResponse(res);
        if (result) {
          this.setState(
            {
              jumpList: result,
            },
            this.handleInitActions
          );
        } else {
          this.handleInitActions();
        }
      });
    } else {
      this.handleInitActions();
    }
  }

  @Bind()
  async handleInitActions() {
    const { approveActions } = this.state;
    const { task, processRemote } = this.props;
    let actions = this.handleApproveActions(approveActions);
    if (processRemote) {
      actions = processRemote.process('SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_MAP', actions, {
        actions,
      });
    }
    const actionsCode = actions.map(({ action }) => action);
    const defaultSortedAcitons = this.handleSortAction(actionsCode);
    const [showActionCodes, moreActionCodes] = processRemote
      ? await processRemote.process(
          'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_RENDER',
          defaultSortedAcitons,
          {
            actionsCode,
            approvalActionSeqDataMap: task.approvalActionSeqDataMap,
            defaultSortedAcitons,
            task,
          }
        )
      : [];
    this.setState({
      actions,
      showActionCodes,
      moreActionCodes,
    });
  }

  @Bind()
  async handleSubmit(approvalType, closeApprovalModal) {
    const { approvalData, approvalNeedOpinionFlag, approvalRefuseOpinionFlag } = this.state;
    const { task, formDs, getFormRef } = this.props;
    const { nextNodeApprover, owner, formKey, processInstanceId } = task;
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    // 先把验证清掉
    formDs.current.getField('approvalOpinion').set('required', false);
    // 审批通过的时候 之前设置审批意见必填就加验证
    if (approvalType === 'Approved' && approvalNeedOpinionFlag) {
      formDs.current.getField('approvalOpinion').set('required', true);
      const validateResult = await this.props.formDs.validate();
      if (!validateResult) {
        return;
      }
    }
    // 审批拒绝的时候 之前设置审批意见必填就加验证
    if (approvalType === 'Rejected' && approvalRefuseOpinionFlag) {
      formDs.current.getField('approvalOpinion').set('required', true);
    }
    // 配置了审批意见必输 或 审批动作是非审批同意时, 需校验表单必输
    if (approvalType !== 'Approved') {
      if (approvalType !== 'Rejected') {
        formDs.current.getField('approvalOpinion').set('required', true);
      }
      const validateResult = await this.props.formDs.validate();
      if (!validateResult) {
        return;
      }
    }
    // 加签，转交，驳回时需校验是否选择人
    if (!['Approved', 'Rejected'].includes(approvalType) && isEmpty(approvalData[approvalType])) {
      Modal.warning({
        center: true,
        children:
          // eslint-disable-next-line
          approvalType === 'AddSign' || approvalType === 'ApproveAndAddSign'
            ? intl.get('hwfp.task.view.message.pleaseChooseSigner').d('请至少选择一个加签人')
            : approvalType === 'delegate'
            ? intl.get('hwfp.task.view.message.pleaseChooseDelegater').d('请选择转交人')
            : approvalType === 'Jumped'
            ? intl.get('hwfp.task.view.message.pleaseChooseJumpNode').d('请指定驳回节点')
            : '',
      });
      return;
    }
    // 驳回不校验
    // 校验是否需要指定下一节点审批人
    if (approvalType !== 'Jumped' && !isEmpty(nextNodeApprover)) {
      let checkNextNodeApprover = true;
      const requiredNode = nextNodeApprover.find(
        (item) => item.rejectedNeedAppoint === (approvalType === 'Rejected' ? 'Y' : 'N')
      );
      if (requiredNode) {
        const nextActId = approvalData[`nextNode-${requiredNode.nextActId}`];
        if (approvalType === 'Rejected' && isEmpty(nextActId)) {
          checkNextNodeApprover = false;
        } else if (
          approvalType !== 'Rejected' &&
          requiredNode.needAppoint === 'Y' &&
          isEmpty(nextActId)
        ) {
          checkNextNodeApprover = false;
        }
      }
      // 加签、转交，驳回，回退上一审批人（暂无该按钮）都不判断，同意、拒绝、同意并加签需要判断
      // 被加签人不需要判断
      if (!isAddSign && !['AddSign', 'delegate'].includes(approvalType) && !checkNextNodeApprover) {
        Modal.warning({
          center: true,
          children: intl
            .get('hwfp.task.view.message.title.needNextApprover', {
              nextActName: requiredNode.nextActName,
            })
            .d(`请指定【${requiredNode.nextActName}】的审批人`),
        });
        return;
      }
    }

    if (approvalType === 'Jumped') {
      this.jumpActivity(closeApprovalModal);
    } else if (approvalType === 'delegate' || approvalType === 'AddSign') {
      this.setState({ loading: true });
      this.setModalLoading(true);
      this.taskAction({ action: approvalType }, closeApprovalModal);
    } else {
      // 如果没有审批表单或不需要回调 直接执行审批动作；
      // 否则向审批表单界面发送审批意见消息,监听审批表单返回消息后再执行审批动作
      // const approveFormChildren = approveFormRef;
      // 单纯传值取不到最新的approveFormRef
      const approveFormChildren = getFormRef();
      this.setState({ loading: true });
      this.setModalLoading(true);
      if (!formKey || !formKey.includes('include://')) {
        this.taskAction({ approveResult: approvalType }, closeApprovalModal);
      } else if (isAddSign) {
        let flag = false;
        if (this.props.processRemote) {
          flag = await this.props.processRemote.process(
            'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_ADDSIGN',
            false,
            {}
          );
        }
        if (flag && approveFormChildren) {
          // 向审批表单界面 发送审批意见消息
          this.setState({ processStatus: PROCESS_EXCUTE_STATUS.FORM_VALIDATING });
          approveFormChildren.submit(
            { approveResult: approvalType, processInstanceId, task },
            () => {
              // this.setState({ processStatus: PROCESS_EXCUTE_STATUS.FORM_VALID_ERROR });
              this.setState({ processStatus: undefined });
              this.setState({ loading: false });
              this.setModalLoading(false);
              this.setState({ approvalDrawerModal: null });
              if (closeApprovalModal) {
                closeApprovalModal();
              }
            }
          );
        } else {
          this.taskAction({ approveResult: approvalType }, closeApprovalModal);
        }
      } else if (approveFormChildren) {
        // 向审批表单界面 发送审批意见消息
        this.setState({ processStatus: PROCESS_EXCUTE_STATUS.FORM_VALIDATING });
        approveFormChildren.submit({ approveResult: approvalType, processInstanceId, task }, () => {
          // this.setState({ processStatus: PROCESS_EXCUTE_STATUS.FORM_VALID_ERROR });
          this.setState({ processStatus: undefined });
          this.setState({ loading: false });
          this.setModalLoading(false);
          this.setState({ approvalDrawerModal: null });
          if (closeApprovalModal) {
            closeApprovalModal();
          }
        });
      } else {
        this.setState({ loading: false });
        this.setModalLoading(false);
      }
    }
  }

  @Bind()
  taskAction(dataParams, closeApprovalModal) {
    this.setState({ processStatus: PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS });
    const { approvalData, attachmentUuid, submitTime, formLoadTime } = this.state;
    const {
      formDs,
      task = {},
      newTabFlag,
      handleCancel,
      handleNextProcess,
      match,
      matchParams,
      modal,
      pageLoadTime,
      inEmbedPage,
      onSuccess,
    } = this.props;
    const taskId = matchParams && !isNil(matchParams.id) ? matchParams.id : match.params.id;
    const processInstanceId =
      matchParams && !isNil(matchParams.processInstanceId)
        ? matchParams.processInstanceId
        : match.params.processInstanceId;
    const { nextNodeApprover, owner, processDefinitionId } = task;
    const taskDetails = task;
    const data = dataParams || {};
    // 如果data.action不存在 有可能是 Rejected/Approved/ApproveAndAddSign
    data.action =
      data.action ||
      (dataParams.approveResult && dataParams.approveResult === 'ApproveAndAddSign'
        ? 'ApproveAndAddSign'
        : 'complete');

    // 由于加签，转交，抄送用的同一个值集，因此对应valuefield都为同一个
    // 除了指派审批人和驳回不用修改，其他都传值lovValueField
    const type =
      dataParams && dataParams.approveResult
        ? dataParams.approveResult === 'ApproveAndAddSign'
          ? 'AddSign'
          : dataParams.approveResult
        : 'AddSign';
    const employeeName = {
      AddSign: 'addSign', // 加签
      ApproveAndAddSign: 'addSign', // 同意并加签
      delegate: 'delegate', // 转交
      addCc: 'addCc', // 抄送
      Jumped: 'jumped', // 驳回
    };
    const fieldName = type.includes('nextNode-') ? 'approval' : employeeName[type] || 'addSign';
    const lovValueField =
      fieldName === 'approval'
        ? 'employeeId'
        : formDs.getField(fieldName).get('valueField', formDs.current);

    if (taskDetails.delegationState === 'pending' && data.action !== 'delegate') {
      data.action = 'resolve';
    }
    const variables = [];
    let comment = formDs.current.get('approvalOpinion') || approvalData.approvalOpinion;
    // 同意申请时设置默认审议意见
    if (!comment) {
      const value = intl.get('hwfp.task.view.option.approved', { name: '审批通过' }).d('审批通过');
      if (isObject(value)) {
        comment = value.msg;
      } else {
        comment = value;
      }
    }
    if (data.action !== 'delegate') {
      const formVars = {};
      formVars.approveResult =
        !data.approveResult || data.approveResult === 'ApproveAndAddSign'
          ? 'Approved'
          : data.approveResult;
      formVars.comment = comment;
      // 可以指定审批人时才处理
      const isAddSign =
        owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
      if (!isAddSign && nextNodeApprover) {
        nextNodeApprover.map((item) => {
          const appointorData = approvalData[`nextNode-${item.nextActId}`];
          const appointor = isEmpty(appointorData)
            ? ''
            : appointorData.map((r) => r.employeeCode || r.employeeNum).join();
          variables.push({
            name:
              item.check !== 'Y' && (item.needAppoint === 'Y' || item.rejectedNeedAppoint === 'Y')
                ? `nextActId-specify-${item.nextActId}`
                : `nextActId-${item.nextActId}`,
            value: appointor,
          });
          return variables;
        });
      }
      for (const k in formVars) {
        if ({}.hasOwnProperty.call(formVars, k)) {
          variables.push({ name: k, value: formVars[k] });
        }
      }
    }
    this.setState({ loading: true });
    this.setModalLoading(true);
    this.setState({ processStatus: PROCESS_EXCUTE_STATUS.SERVICE_EXCUTEING });
    this.handleFetchCount().then((result) => {
      this.setState({ loading: false });
      this.setModalLoading(false);
      const res = getResponse(result);
      if (res !== undefined) {
        const params = {
          tenantId: getCurrentOrganizationId(),
          comment,
          processInstanceId,
          processDefinitionId,
          variables: variables.filter((r) => r.value !== ''),
          carbonCopyUsers: isEmpty(approvalData.addCc)
            ? ''
            : approvalData.addCc.map((item) => item[lovValueField]).join(),
          currentTaskId: taskDetails.id,
          action: data.action,
          jumpTarget: data.jumpTarget || null,
          jumpTargetName: data.jumpTargetName || null,
          attachmentUuid: res > 0 ? attachmentUuid : null,
          rebutAutoJumpFlag: approvalData.rebutAutoJumpFlag,
          refuseAutoJumpFlag: approvalData.refuseAutoJumpFlag,
          formLock: data.formLock,
        };
        if (data.action === 'AddSign' || data.action === 'ApproveAndAddSign') {
          const assignListData = approvalData[data.action];
          if (isEmpty(assignListData)) {
            notification.warning({
              message: intl.get('hwfp.task.view.title.pleaseChooseAddSigner').d('请选择选择加签人'),
            });
            return;
          }
          params.assignList = assignListData.map((item) => item[lovValueField]);
        } else if (data.action === 'delegate') {
          params.assignee = isEmpty(approvalData[data.action])
            ? null
            : approvalData[data.action][0][lovValueField];
        } else {
          params.assignee = null;
        }
        this.setState({ loading: true });
        this.setModalLoading(true);
        saveTask(params, {
          submitTime,
          pageLoadTime,
          formLoadTime,
        }).then((response) => {
          this.setState({ loading: false });
          this.setModalLoading(false);
          const r = getResponse(response);
          if (r && r.warnDesc) {
            notification.warning({
              message: r.warnDesc,
            });
            this.setState({ processStatus: PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_ERROR });
            return;
          }
          this.setState({ processStatus: PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS });
          // todo审批完跳转到列表页面(并要刷新) 当列表界面和办理页面之间还有其他Tab标签页时，会跳到那个标签页
          this.setState(
            {
              approvalDrawerVisible: false,
            },
            () => {
              if (r) {
                if (!r.warnDesc) {
                  message.success(
                    intl.get('hzero.common.notification.success').d('操作成功'),
                    2.5,
                    'top'
                  );
                }
                if (isFunction(this.props.refreshNumber)) {
                  this.props.refreshNumber();
                }
              }
              // 如果是加签，提交成功时候清空审批意见
              if (type === 'AddSign') {
                this.handleSaveCommentDraft('');
              }
              this.setState({ approvalDrawerModal: null });
              if (closeApprovalModal && !['Approved'].includes(type)) {
                closeApprovalModal();
              }
              if (newTabFlag) {
                if (inEmbedPage) {
                  if (modal && modal.close) {
                    modal.close();
                  }
                  if (onSuccess) {
                    onSuccess();
                  }
                } else {
                  this.afterApproval();
                  if (modal) {
                    modal.close();
                  }
                  closeTab(
                    `/hwfp/approval/task/detail/${taskId}/${processInstanceId}`,
                    undefined,
                    false
                  );
                }
              } else if (isFunction(handleNextProcess) && r && !r.warnDesc) {
                // 强制关闭弹框并清除数据
                if (this.approvalModal) {
                  this.approvalModal.close();
                  formDs.current.reset();
                  this.changeApprovalOpinionRequired(true);
                }
                // 工作流审批通过或拒绝时可以自动跳出下一个审批表单
                handleNextProcess();
              } else {
                handleCancel();
              }
            }
          );
        });
      }
    });
  }

  @Bind()
  handleLoadFlag(result) {
    this.setState({
      loadFlag: result,
      formLoadTime: result ? new Date().getTime() : '',
    });
  }

  @Bind()
  handleFetchCount() {
    const { attachmentUuid } = this.state;
    return fetchFileCount({
      attachmentUUID: attachmentUuid,
    });
  }

  @Bind()
  setModalLoading(loading) {
    if (this.approvalModal) {
      this.approvalModal.update({
        footer: () => {
          return (
            <>
              <Button
                color="primary"
                funcType="raised"
                onClick={() =>
                  this.getApproveDataAndSubmit(this.modalApprovalType, this.handleModalCancel)
                }
                loading={loading}
              >
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>
              <Button funcType="raised" onClick={this.handleModalCancel} disabled={loading}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </>
          );
        },
      });
    }
  }

  @Bind()
  jumpActivity(closeApprovalModal) {
    this.setState({ processStatus: PROCESS_EXCUTE_STATUS.FORM_VALID_SUCCESS });
    const { approvalData, attachmentUuid, submitTime, formLoadTime } = this.state;
    const { assignee, jumpTarget, jumpTargetName } = approvalData.Jumped;
    const {
      formDs,
      task = {},
      match,
      matchParams,
      newTabFlag,
      handleCancel,
      handleNextProcess,
      modal,
      pageLoadTime,
      inEmbedPage,
      onSuccess,
    } = this.props;
    const id = matchParams && !isNil(matchParams.id) ? matchParams.id : match.params.id;
    const processInstanceId =
      matchParams && !isNil(matchParams.processInstanceId)
        ? matchParams.processInstanceId
        : match.params.processInstanceId;
    const { processDefinitionId } = task;
    const comment = formDs.current.get('approvalOpinion');
    this.setState({ loading: true });
    this.setModalLoading(true);
    const assigneeCodes = assignee;
    const lovValueField = formDs.getField('addCc').get('valueField', formDs.current);
    this.setState({ processStatus: PROCESS_EXCUTE_STATUS.SERVICE_EXCUTEING });
    this.handleFetchCount().then((response) => {
      this.setState({ loading: false });
      this.setModalLoading(false);
      const r = getResponse(response);
      if (r !== undefined) {
        this.setModalLoading(true);
        this.setState({ loading: true });
        saveTask(
          {
            action: 'jump',
            currentTaskId: task.id,
            tenantId: getCurrentOrganizationId(),
            attachmentUuid: r > 0 ? attachmentUuid : null,
            carbonCopyUsers: isEmpty(approvalData.addCc)
              ? ''
              : approvalData.addCc.map((item) => item[lovValueField]).join(),
            assignee: assigneeCodes,
            comment,
            jumpTarget,
            jumpTargetName,
            processInstanceId,
            processDefinitionId,
            rebutAutoJumpFlag: formDs.current && formDs.current.get('rebutAutoJumpFlag'),
            refuseAutoJumpFlag: formDs.current && formDs.current.get('refuseAutoJumpFlag'),
          },
          {
            submitTime,
            pageLoadTime,
            formLoadTime,
          }
        ).then((result) => {
          this.setModalLoading(false);
          this.setState({ loading: false });
          if (isFunction(this.props.refreshNumber)) {
            this.props.refreshNumber();
          }
          const res = getResponse(result);
          this.setState({ visible: false }, () => {
            if (res) {
              this.setState({ processStatus: PROCESS_EXCUTE_STATUS.SERVICE_EXCUTE_SUCCESS });
              message.success(
                intl.get('hzero.common.notification.success').d('操作成功'),
                2.5,
                'top'
              );
            }
            this.setState({ approvalDrawerModal: null });
            if (closeApprovalModal) {
              closeApprovalModal();
            }
            if (newTabFlag) {
              if (inEmbedPage) {
                if (modal && modal.close) {
                  modal.close();
                }
                if (onSuccess) {
                  onSuccess();
                }
              } else {
                this.afterApproval();
                if (modal) {
                  modal.close();
                }
                closeTab(`/hwfp/approval/task/detail/${id}/${processInstanceId}`, undefined, false);
              }
            } else if (isFunction(handleNextProcess)) {
              handleNextProcess();
            } else {
              handleCancel();
            }
          });
        });
      }
    });
  }

  @Bind()
  openWorkbench() {
    const { dispatch, taskMenu: originTaskMenu } = this.props;
    // 有待办跳转到待办，没有就跳转到审批工作台
    const menuValue = getDetailDispatchRouter(originTaskMenu);
    if (menuValue.approvalMenu) {
      dispatch(
        routerRedux.push({
          pathname: this.state.isRoleWorkbench ? '/swbh/role-workbench' : `/hwfp/approval/list`,
        })
      );
    } else if (menuValue.taskMenu) {
      dispatch(
        routerRedux.push({
          pathname: this.state.isRoleWorkbench ? '/swbh/role-workbench' : `/hwfp/task/list`,
          search: stringify({ from: 'TaskNew' }),
        })
      );
    } else {
      dispatch(
        routerRedux.push({
          pathname: this.state.isRoleWorkbench ? '/swbh/role-workbench' : `/workplace`,
        })
      );
    }
  }

  @Bind()
  async afterApproval() {
    const { processRemote } = this.props;
    let flag = true;
    if (processRemote) {
      flag = await processRemote.process(
        'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_AFTER_APPROVAL',
        true,
        {}
      );
    }
    if (!flag) {
      return;
    }
    const { isClose } = parse(window.location.search.slice(1)) || {};
    if (isClose === 'true') {
      // 隔3s执行便于确保外部系统接收到 postMessage 发送的数据c
      Modal.info({
        title: intl.get('hwfp.task.view.title.taskFinished').d('待办已完成'),
        children: intl.get('hwfp.task.view.message.pageAutoClose').d(`3秒后页面自动关闭`),
        closeOnLocationChange: false,
        maskClosable: false,
        closable: false,
        movable: false,
        autoCenter: true,
      });
      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage(JSON.stringify({ srmApprovalClose: true }), '*');
        }
        window.close();
      }, 3000);
    } else {
      this.openWorkbench();
    }
  }

  @Bind()
  handleApproveActions(approveActions = {}) {
    const { jumpList = [] } = this.state;
    const {
      task: { owner },
    } = this.props;
    // 前加签、后加签只需要审批同意或拒绝
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    const actions = [];
    // 将拒绝，同意前置
    if (approveActions.Rejected) {
      actions.push({
        action: 'Rejected',
        actionName: approveActions.Rejected,
        color: 'red',
      });
    }

    if (approveActions.Approved) {
      actions.push({
        action: 'Approved',
        actionName: approveActions.Approved,
        color: 'green',
      });
    }
    keys(approveActions).forEach((item) => {
      // 加签只需要审批同意或拒绝
      if (!['Approved', 'Rejected'].includes(item)) {
        let flag = true;
        if (isAddSign && item !== 'comment') {
          flag = false;
        } else if (item === 'Jumped' && jumpList.length < 1) {
          flag = false;
        }
        if (flag) {
          actions.push({
            action: item,
            actionName: approveActions[item],
            color: 'default',
          });
        }
      }
    });

    // 当审批通过/拒绝只有一个的情况时,保证通过/拒绝在后
    if (
      ((!approveActions.Approved && approveActions.Rejected) ||
        (approveActions.Approved && !approveActions.Rejected)) &&
      actions.length > 1
    ) {
      [actions[0], actions[1]] = [actions[1], actions[0]];
    }
    return actions;
  }

  @Debounce(200)
  @Bind()
  async handleApprove(approveAction) {
    const { processRemote, formDs, task } = this.props;
    let beforeApproveFlag;
    if (processRemote) {
      this.setState({ beforeApproveLoading: true });
      beforeApproveFlag = await processRemote.process(
        'SWFL_APPROVAL_WORKBENCH_FOOTER_BUTTONS_BEFORE_APPROVE',
        {
          action: approveAction,
          task,
        }
      );
    }
    this.setState({ beforeApproveLoading: false });
    if (beforeApproveFlag === false) {
      return;
    }
    this.setState({ submitTime: new Date().getTime() });
    const {
      approvalRefuseOpinionFlag,
      hasRefuseOpinionFlag,
      rejectJumpConfigRefuseFlag,
      rejectAgainSubmitPathDefault,
    } = this.state;
    formDs.current.getField('refuseAutoJumpFlag').set('required', false);
    formDs.current.set('refuseAutoJumpFlag', rejectAgainSubmitPathDefault || 0);
    const employeeName = {
      AddSign: 'addSign', // 加签
      ApproveAndAddSign: 'addSign', // 同意并加签
      delegate: 'delegate', // 转交
      addCc: 'addCc', // 抄送
      Jumped: 'jumped', // 驳回
    };
    if (approveAction === 'comment') {
      this.handleComment();
      return;
    }
    const comment = formDs.current.get('approvalOpinion');
    if (approveAction === 'Rejected' && !hasRefuseOpinionFlag) {
      formDs.current.getField('approvalOpinion').set('required', true);
    }
    if (
      approveAction === 'Rejected' &&
      !comment &&
      !approvalRefuseOpinionFlag &&
      hasRefuseOpinionFlag
    ) {
      formDs.current.set(
        'approvalOpinion',
        intl.get('hzero.common.button.approvalRefuse').d('审批拒绝')
      );
    }
    if (!['Approved'].includes(approveAction)) {
      const { approvalData } = this.state;
      const allActions = ['delegate', 'AddSign', 'ApproveAndAddSign', 'Jumped', 'Rejected'];
      allActions.forEach((item) => {
        if (item !== approveAction) {
          // 首次点击 / 关闭加签再去点击转交时，清空除转交以外所选的值
          approvalData[item] = null;
          formDs.current.set(employeeName[item], null);
        }
      });
      if (approveAction === 'Rejected') {
        if (rejectJumpConfigRefuseFlag) {
          const refuseAutoJumpFlag = formDs.current.get('refuseAutoJumpFlag');
          formDs.current.getField('refuseAutoJumpFlag').set('required', rejectJumpConfigRefuseFlag);
          formDs.current.set(
            'refuseAutoJumpFlag',
            refuseAutoJumpFlag || rejectAgainSubmitPathDefault || 0
          );
          this.setState(
            {
              approvalData,
              approvalType: approveAction,
              approvalDrawerVisible: true,
            },
            () => this.handleApprovalDrawerVisible()
          );
        } else {
          this.setState({
            approvalType: approveAction,
          });
          if (approvalRefuseOpinionFlag || !hasRefuseOpinionFlag) {
            const validateResult = await this.props.formDs.validate();
            if (!validateResult) {
              return;
            }
          }
          Modal.open({
            movable: false,
            closable: true,
            className: styles['common-modal'],
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: intl.get('hzero.common.message.confirm.callback').d('是否确认提交?'),
            onOk: () => this.handleSubmit(approveAction),
          });
        }
      } else {
        this.setState(
          {
            approvalData,
            approvalType: approveAction,
            approvalDrawerVisible: true,
          },
          () => this.handleApprovalDrawerVisible()
        );
      }
    } else {
      this.setState({
        approvalType: approveAction,
      });
      this.handleSubmit(approveAction);
    }
  }

  /**
   * 打开弹框后设置 approvalOpinion 为必输， 关闭弹框后还原状态
   * @param {Boolean} resetFlag 是否重置
   */
  @Bind()
  changeApprovalOpinionRequired(resetFlag) {
    const { formDs } = this.props;
    const { preApprovalOpinionStatus, approvalNeedOpinionFlag } = this.state;
    const approvalOpinion = formDs.current.getField('approvalOpinion');
    const fieldRequired = approvalOpinion.get('required');
    if (resetFlag) {
      // 撤销 addSign、rebutAutoJumpFlag、delegate 的必输
      formDs.current.getField('addSign').set('required', false);
      formDs.current.getField('rebutAutoJumpFlag').set('required', false);
      formDs.current.getField('delegate').set('required', false);
      formDs.current.getField('jumpedName').set('required', false);
      this.setState({
        preApprovalOpinionStatus: {},
        approvalNeedOpinionFlag: preApprovalOpinionStatus.approvalNeedOpinionFlag,
      });
      approvalOpinion.set('required', preApprovalOpinionStatus.fieldRequired);
    } else {
      approvalOpinion.set('required', true);
      this.setState({
        preApprovalOpinionStatus: {
          approvalNeedOpinionFlag,
          fieldRequired,
        },
        approvalNeedOpinionFlag: true,
      });
    }
  }

  @Bind()
  getApproveDataAndSubmit(approvalType, handleCancel) {
    this.modalApprovalType = approvalType;
    this.handleModalCancel = handleCancel;
    const { assignApproveDs = {}, formDs } = this.props;
    const { approvalData } = this.state;
    const assignApproveObj = {};
    (assignApproveDs.toData() || []).forEach((d = {}) => {
      assignApproveObj[d.key] = d.approval;
    });
    const rebutAutoJumpFlag = formDs.current && formDs.current.get('rebutAutoJumpFlag');
    const refuseAutoJumpFlag = formDs.current && formDs.current.get('refuseAutoJumpFlag');
    const approvalOpinion = formDs.current && formDs.current.get('approvalOpinion');
    this.changeApprovalData(
      {
        ...approvalData,
        ...assignApproveObj,
        rebutAutoJumpFlag,
        refuseAutoJumpFlag,
        approvalOpinion,
      },
      () => this.handleSubmit(approvalType, handleCancel)
    );
  }

  // 打开转交/加签等侧弹窗
  @Bind()
  handleApprovalDrawerVisible() {
    const {
      approveActions,
      approveCommentNotice,
      approveCommentTitle,
      approvalType,
      approvalData,
      loading,
      attachmentUuid,
      attachments = [],
      jumpList,
      rejectJumpConfigRebutFlag,
      rejectJumpConfigRefuseFlag,
      rejectAgainSubmitPathDefault,
      rebutAgainSubmitPathDefault,
    } = this.state;
    const {
      formDs,
      task,
      assignApproveDs,
      processRemote,
      newTask,
      stepRebutFlag: propsStepRebutFlag,
    } = this.props;
    const { stepRebutFlag } = newTask || {};
    const stepRebut = isNil(propsStepRebutFlag) ? stepRebutFlag : propsStepRebutFlag;

    const self = this;
    this.changeApprovalOpinionRequired();
    // eslint-disable-next-line
    const modal = (this.approvalModal = Modal.open({
      maskClosable: false,
      closable: true,
      title: approveActions[approvalType],
      style: {
        width: 520,
      },
      className: classnames(styles['modal-drawer'], styles['approval-drawer']),
      bodyStyle: { flex: '1 1' },
      onCancel: handleCancel,
      drawer: true,
      footer: () => {
        return (
          <>
            <Button
              color="primary"
              funcType="raised"
              onClick={() => this.getApproveDataAndSubmit(approvalType, handleCancel)}
              loading={loading}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button funcType="raised" onClick={handleCancel} disabled={loading}>
              {intl.get('hzero.common.button.cancel').d('取消')}
            </Button>
          </>
        );
      },
      children: (
        <ApprovalDrawer
          formDs={formDs}
          task={task}
          attachmentUuid={attachmentUuid}
          attachments={attachments}
          jumpList={jumpList}
          uploadModalRef={this.uploadModalRef}
          approvalType={approvalType}
          approveCommentTitle={approveCommentTitle}
          approvalData={approvalData}
          approveCommentNotice={approveCommentNotice}
          handleCleanEmployee={this.handleCleanEmployee}
          changeApprovalData={this.changeApprovalData}
          handleChooseEmployee={this.handleChooseEmployee}
          handleToogleVisible={this.handleMoreDrawer}
          handleSaveCommentDraft={this.handleSaveCommentDraft}
          setAttachmentUuid={this.setAttachmentUuid}
          setAttachments={this.setAttachments}
          assignApproveDs={assignApproveDs}
          rejectJumpConfigRebutFlag={rejectJumpConfigRebutFlag}
          rejectJumpConfigRefuseFlag={rejectJumpConfigRefuseFlag}
          processRemote={processRemote}
          stepRebut={stepRebut}
          rejectAgainSubmitPathDefault={rejectAgainSubmitPathDefault}
          rebutAgainSubmitPathDefault={rebutAgainSubmitPathDefault}
        />
      ),
    }));
    function handleCancel() {
      self.changeApprovalOpinionRequired(true);
      formDs.current.reset();
      modal.close();
    }
  }

  @Bind()
  handleCloseApprovalModal() {
    this.changeApprovalOpinionRequired(true);
    const { formDs } = this.props;
    formDs.current.reset();
    if (this.approvalModal) {
      this.approvalModal.close();
    }
  }

  // 打开指派审批人侧弹窗
  @Bind()
  handleAssignDrawerVisible() {
    const self = this;
    const { approvalData } = this.state;
    const { formDs, task, assignApproveDs } = this.props;
    const oldAssignApprove = assignApproveDs.toData();
    const modal = Modal.open({
      closable: true,
      maskClosable: false,
      drawer: true,
      title: intl.get('hwfp.task.view.message.addNextApprover').d('指派审批人'),
      className: classnames(styles['modal-drawer'], styles['approval-drawer']),
      bodyStyle: { flex: '1 1' },
      onCancel: handleCancel,
      footer: () => {
        return (
          <Button color="primary" funcType="raised" onClick={submitApprovalData}>
            {intl.get('hzero.common.button.ok').d('提交')}
          </Button>
        );
      },
      children: (
        <AssignDrawer
          formDs={formDs}
          assignApproveDs={assignApproveDs}
          task={task}
          approvalData={approvalData}
          changeApprovalData={this.changeApprovalData}
          handleChooseEmployee={this.handleChooseEmployee}
        />
      ),
    });
    function handleCancel() {
      // 取消变更，恢复原值
      assignApproveDs.loadData(oldAssignApprove);
      modal.close();
    }
    function submitApprovalData() {
      const assignApproveObj = {};
      (assignApproveDs.toData() || []).forEach((d = {}) => {
        assignApproveObj[d.key] = d.approval;
      });
      self.changeApprovalData({
        ...approvalData,
        ...assignApproveObj,
      });
      modal.close();
    }
  }

  // 选择人
  @Bind()
  handleChooseEmployee(type, otherParams = {}) {
    // type等于node-xxx的为指定下节点审批人
    // 有candidates的表示指定特定的人，不需要调接口查
    if (
      type.startsWith('nextNode') &&
      otherParams &&
      otherParams.check === 'Y' &&
      !isEmpty(otherParams.candidates)
    ) {
      this.setState({
        specifyEmployeeData: otherParams.candidates,
        carbonCopyFlag: false,
        nextNodeFlag: type,
        approvalType: this.state.approvalType,
      });
    } else {
      this.setState({
        carbonCopyFlag: type === 'addCc',
        nextNodeFlag: type.startsWith('nextNode') ? type : false,
        approvalType:
          type === 'addCc' || type.startsWith('nextNode') ? this.state.approvalType : type,
      });
    }
  }

  @Bind()
  handleCleanEmployee(value, type) {
    const { approvalData } = this.state;
    const { formDs } = this.props;
    const employeeName = {
      AddSign: 'addSign', // 加签
      ApproveAndAddSign: 'addSign', // 同意并加签
      delegate: 'delegate', // 转交
      addCc: 'addCc', // 抄送
      Jumped: 'jumped', // 驳回
    };
    const fieldName = type.includes('nextNode-') ? 'approval' : employeeName[type];
    // 驳回只能选择一个节点，故不用数组
    if (type === 'Jumped' || type === 'delegate') {
      approvalData[type] = null;
    } else {
      approvalData[type] = value;
    }
    formDs.current.set(fieldName, approvalData[type]);
    this.setState({
      approvalData,
    });
  }

  @Bind()
  handlSelectedEmployee(records) {
    const { carbonCopyFlag, nextNodeFlag, approvalType, approvalData } = this.state;
    const dataType = carbonCopyFlag ? 'addCc' : nextNodeFlag || approvalType;
    this.setState({
      carbonCopyFlag: false,
      nextNodeFlag: false,
      approvalData: {
        ...approvalData,
        [dataType]: records,
      },
    });
  }

  @Bind()
  handleMoreDrawer() {
    this.setState({
      approvalDrawerVisible: !this.state.approvalDrawerVisible,
    });
  }

  @Bind()
  changeApprovalData(approvalData, callback) {
    this.setState(
      {
        approvalData,
      },
      callback
    );
  }

  @Bind()
  handleComment() {
    const { taskId, match, matchParams } = this.props;
    const processInstanceId =
      matchParams && !isNil(matchParams.processInstanceId)
        ? matchParams.processInstanceId
        : match.params.processInstanceId;
    Modal.open({
      title: intl.get('hwfp.task.button.comment').d('评论'),
      footer: null,
      drawer: true,
      bodyStyle: {
        padding: 0,
        background: '#F8F9FB',
      },
      closable: true,
      children: <ApprovalReply taskId={taskId} processInstanceId={processInstanceId} />,
    });
  }

  @Bind()
  handleSortAction(allActionCodes) {
    const approvalActionSeqDataMap = cloneDeep(this.props.task.approvalActionSeqDataMap) || {
      Approved: 1,
      Rejected: 2,
      More: 3,
    };
    // 如果没有审批同意按钮，就删除
    if (!allActionCodes.includes('Approved')) {
      delete approvalActionSeqDataMap.Approved;
    }
    // 如果没有审批拒绝按钮，就删除
    if (!allActionCodes.includes('Rejected')) {
      delete approvalActionSeqDataMap.Rejected;
    }
    // 按钮数小于3不显示更多按钮
    if (allActionCodes.length <= 3) {
      // eslint-disable-next-line no-param-reassign
      delete approvalActionSeqDataMap.More;
    }
    const sortActionCodes = Object.values(approvalActionSeqDataMap)
      .sort()
      .map((v) => {
        if (approvalActionSeqDataMap.Approved === v) {
          return 'Approved';
        }
        if (approvalActionSeqDataMap.Rejected === v) {
          return 'Rejected';
        }
        if (approvalActionSeqDataMap.More === v) {
          return 'More';
        }
        return null;
      })
      .filter(Boolean);
    let sortCodes = sortActionCodes.concat(
      allActionCodes.filter((code) => !sortActionCodes.includes(code))
    );
    // 检查more按钮位置
    if (sortCodes.length > 3) {
      const displayActions = sortCodes.filter((code) => ['Approved', 'Rejected'].includes(code));
      const moreIndex = sortCodes.findIndex((code) => code === 'More');
      // 如果只有more 没有同意和拒绝按钮，则更多按钮放到最后
      // 如果有同意或拒绝按钮，但更多按钮不在最后，也要调整
      if (moreIndex !== 2 && (displayActions.length === 0 || moreIndex !== 0)) {
        sortCodes = sortCodes.filter((code) => code !== 'More');
        sortCodes.splice(2, 0, 'More');
      }
    }
    return [sortCodes.slice(0, 3), sortCodes.slice(3)];
  }

  @Bind()
  renderApprovalAction() {
    const {
      approveActions = {},
      loading,
      approvalType,
      loadFlag,
      moreBtnVisible,
      beforeApproveLoading,
      actions,
      showActionCodes,
      moreActionCodes,
    } = this.state;
    const {
      newTask: { approvalActionTooltipMap = {} },
    } = this.props;
    if (isEmpty(approveActions)) {
      return null;
    }
    const moreActions = moreActionCodes
      .map((code) => actions.find(({ action }) => action === code))
      .filter(Boolean);
    return (
      <>
        {showActionCodes.map((_action, index) => {
          const useLastBtnStyle = index === showActionCodes.length - 1;
          if (_action === 'More') {
            return (
              <Dropdown
                placement="topLeft"
                disabled={!loadFlag || beforeApproveLoading}
                onVisibleChange={(v) => {
                  this.setState({
                    moreBtnVisible: v,
                  });
                }}
                overlay={
                  <Menu className={styles['more-action-menu-list']}>
                    {moreActions.map((item) => (
                      <Menu.Item
                        key={item.action}
                        onClick={() => {
                          if (moreBtnVisible) {
                            this.setState({
                              moreBtnVisible: false,
                            });
                            this.handleApprove(item.action);
                          }
                        }}
                      >
                        {approvalActionTooltipMap[
                          (item.action || '').toLowerCase() === 'jumped'
                            ? 'rebut'
                            : (item.action || '').toLowerCase()
                        ] ? (
                          <Tooltip
                            title={
                              approvalActionTooltipMap[
                                (item.action || '').toLowerCase() === 'jumped'
                                  ? 'rebut'
                                  : (item.action || '').toLowerCase()
                              ]
                            }
                            placement="left"
                          >
                            <a>{item.actionName}</a>
                          </Tooltip>
                        ) : (
                          <a>{item.actionName}</a>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <Button
                  style={{
                    marginRight: useLastBtnStyle ? 0 : '10px',
                  }}
                >
                  {intl.get('hzero.common.button.option').d('更多')}
                </Button>
              </Dropdown>
            );
          }
          const currentAction = actions.find((item) => item.action === _action) || {};
          const isNormalAction = !['Approved', 'Rejected'].includes(currentAction.action);
          const btnStyle = {
            backgroundColor:
              currentAction.customBgColor ||
              (currentAction.color === 'green'
                ? '#47B881'
                : currentAction.color === 'red'
                ? '#F56349'
                : 'unset'),
            color: currentAction.customColor || (isNormalAction ? 'unset' : '#fff'),
            marginRight: useLastBtnStyle ? 0 : '10px',
          };
          return approvalActionTooltipMap[(currentAction.action || '').toLowerCase()] ? (
            <Tooltip title={approvalActionTooltipMap[(currentAction.action || '').toLowerCase()]}>
              <Button
                className={classnames(styles['space-btn'], {
                  [styles['btn-no-border']]: !isNormalAction,
                })}
                onClick={() => this.handleApprove(currentAction.action)}
                color={currentAction.color}
                loading={loading && approvalType === currentAction.action}
                disabled={
                  (loading && approvalType !== currentAction.action) ||
                  !loadFlag ||
                  beforeApproveLoading
                }
                style={btnStyle}
              >
                {currentAction.actionName}
              </Button>
            </Tooltip>
          ) : (
            <Button
              className={classnames(styles['space-btn'], {
                [styles['btn-no-border']]: !isNormalAction,
              })}
              onClick={() => this.handleApprove(currentAction.action)}
              color={currentAction.color}
              loading={loading && approvalType === currentAction.action}
              disabled={
                (loading && approvalType !== currentAction.action) ||
                !loadFlag ||
                beforeApproveLoading
              }
              style={btnStyle}
            >
              {currentAction.actionName}
            </Button>
          );
        })}
      </>
    );
  }

  @Bind()
  renderApproveProcessNotification() {
    return ReactDOM.createPortal(
      <ApproveProcessNotification
        status={this.state.processStatus}
        onClose={() => this.setState({ processStatus: undefined })}
      />,
      document.getElementById('root')
    );
  }

  // 点击表格某条数据，查询详情页按钮所需数据
  openDrawer = () => {
    const { formDs } = this.props;
    // 处理流程自定义信息
    this.handleProcessCuszInfo();
    // 加载审批意见草稿
    this.handleLoadCommentDraft();

    // 首屏加载优化：存在驳回操作后再查询驳回节点
    // getJumpList({
    //   tenantId: getCurrentOrganizationId(),
    //   taskId,
    // }).then((res) => {
    //   const result = getResponse(res);
    //   if (result) {
    //     this.setState({
    //       jumpList: result,
    //     });
    //   }
    // });

    queryUUID({
      tenantId: getCurrentOrganizationId(),
    }).then((res) => {
      const result = getResponse(res);
      if (result) {
        this.setState({
          attachmentUuid: result.content,
        });
      }
    });

    // 监听ds值更新
    formDs.addEventListener('update', this.handleDsUpdate);
  };

  // 判断人员选择框是否更新值
  handleDsUpdate = ({ name, value }) => {
    const {
      task: { nextNodeApprover = [] },
    } = this.props;
    if (
      name === 'addCc' ||
      name === 'delegate' ||
      name === 'addSign' ||
      name === 'jumped' ||
      name === 'approval'
    ) {
      const { carbonCopyFlag, nextNodeFlag, approvalType, approvalData } = this.state;
      let dataType = carbonCopyFlag || name === 'addCc' ? 'addCc' : nextNodeFlag || approvalType;
      if (name === 'approval' && !isEmpty(nextNodeApprover)) {
        dataType = `nextNode-${nextNodeApprover[0].nextActId}`;
      }
      this.setState({
        approvalData: {
          ...approvalData,
          [dataType]: value,
        },
      });
    }
  };

  handleFocus = (value) => {
    const {
      newTask: { replyQueryFlag },
      newTabFlag,
    } = this.props;
    // newTab的审批页面，未查询过快捷回复时再去查询内容
    if (value && newTabFlag && !replyQueryFlag) {
      this.queryQuickReplyArr();
    }
    this.setState({ showQuickReply: value });
  };

  // 查询快捷回复
  queryQuickReplyArr = () => {
    const { dispatch } = this.props;
    queryQuickReply().then((res) => {
      const result = getResponse(res);
      if (result) {
        dispatch({
          type: 'task/updateQuickReplyArr',
          payload: result,
        });
      }
    });
  };

  handleShowAllScreen = (showValue) => {
    const {
      formDs,
      newTask: { replyValueNew },
    } = this.props;
    if (formDs.current.get('approvalOpinion') === replyValueNew?.replace(/\n|\r/g, '')) {
      formDs.current.set('approvalOpinion', replyValueNew);
    }
    this.setState({
      showAllScreen: showValue,
      showQuickReply: showValue,
    });
  };

  // 点击非快捷回复的div，关闭快捷回复
  closeQuickReply = () => {
    const {
      formDs,
      newTask: { replyValueNew },
    } = this.props;
    if (formDs.current.get('approvalOpinion') === replyValueNew?.replace(/\n|\r/g, '')) {
      formDs.current.set('approvalOpinion', replyValueNew);
    }
    const quickReplyDom = document.getElementById('quick-reply-content');
    if (quickReplyDom) {
      this.setState({ showQuickReply: false, showAllScreen: false });
    }
  };

  setAttachmentUuid = (value) => {
    this.setState({ attachmentUuid: value });
  };

  setAttachments = (value) => {
    this.setState({ attachments: value });
  };

  openNotification = () => {
    notification.warning({
      message: intl.get('hzero.common.upload.attachmentUuid').d('未获取到文件批次号，请稍后重试'),
    });
  };

  handleCcDisabled = () => {
    const { formDs } = this.props;
    // 抄送数据不可选
    const addSignData = toJS(formDs.current.get('addSign')) || [];
    const delegateData = toJS(formDs.current.get('delegate')) || [];
    const otherTypeData =
      addSignData && addSignData.length > 0
        ? addSignData
        : delegateData && delegateData.length > 0
        ? delegateData
        : [];
    const otherTypeCodeNew = [];
    const fieldName = addSignData && addSignData.length > 0 ? 'addSign' : 'delegate';
    const lovValueField = formDs.getField(fieldName).get('valueField', formDs.current);
    otherTypeData.forEach((item) => {
      if (item && item[lovValueField]) {
        otherTypeCodeNew.push(item[lovValueField]);
      }
    });
    return otherTypeCodeNew;
  };

  // 解码URL
  handleUrlDecode = () => {
    const {
      location: { href, origin, pathname },
    } = window;
    console.log(href, origin, pathname);

    let newUrl = `${origin}${pathname}?`;
    const urlObj = new URL(href);
    const searchParams = new URLSearchParams(urlObj.search);
    searchParams.forEach((value, key) => {
      if (['processName', 'startUserName'].includes(key)) {
        const decodeValue = decodeURIComponent(searchParams.get(key));
        newUrl = `${newUrl}${key}=${decodeValue}&`;
      } else {
        newUrl = `${newUrl}${key}=${value}&`;
      }
    });
    console.log('newUrl: -----', newUrl.slice(0, -1));

    return newUrl.slice(0, -1);
  };

  handleGroupOrAdd = async () => {
    const { groupData } = this.state;
    const { dd } = window;
    if (dd.env.platform !== 'notInDingTalk') {
      const res = await starGroupChat(groupData);
      console.log('starGroupChat:', res);
      if (getResponse(res)) {
        this.setState({ groupFlag: true });
        const { groupId } = res;
        const newDdUrl = this.handleUrlDecode();
        getDdConfig({ url: newDdUrl }).then((configRes) => {
          console.log('configRes: ', configRes);
          if (getResponse(configRes)) {
            dd.config({
              ...configRes,
              jsApiList: ['openChatByConversationId', 'biz.util.openLink'],
              type: 0,
            });
            dd.error((err) => {
              dd.checkJsApi({ jsApiList: ['openChatByConversationId'] }).then((q) => {
                // eslint-disable-next-line no-alert
                alert(`checkJsApi: ${q}----dd error: ${JSON.stringify(err)}`);
              });
            });
            dd.ready(() => {
              // console.log('dd ready: ', dd);
              dd.checkJsApi({ jsApiList: ['openChatByConversationId'] }).then((q) =>
                console.log('11111111111111', q)
              );
              dd.openChatByConversationId({
                openConversationId: groupId,
                success: () => {},
                fail: () => {},
                complete: () => {},
              });
            });
          } else {
            notification.warning({
              message: intl.get('hwfp.common.model.getDdConfig.message').d('获取钉钉JSAPI配置失败'),
            });
          }
        });
      }
    } else {
      notification.warning({
        message: intl
          .get('hwfp.common.model.handleGroupOrAdd.message')
          .d('请在钉钉环境中打开本链接'),
      });
    }
  };

  render() {
    const {
      approveCommentTitle,
      approvalData,
      loadFlag,
      attachmentUuid,
      attachments = [],
      showQuickReply,
      showAllScreen,
      loading,
      groupFlag,
      groupStatus,
    } = this.state;
    const { processRemote } = this.props;

    const { handleFooterButton = undefined } = processRemote?.props?.process || {};

    const { formDs, task } = this.props;
    let needNextNodeApprover = [];
    let isAddSign = false;
    if (!isEmpty(task)) {
      const {
        task: { owner, nextNodeApprover = [] },
      } = this.props;
      isAddSign = owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
      needNextNodeApprover =
        !isAddSign && !isEmpty(nextNodeApprover)
          ? nextNodeApprover.filter(
              (node) =>
                node.check === 'Y' || node.needAppoint === 'Y' || node.rejectedNeedAppoint === 'Y'
            )
          : [];
    }
    const attachmentProps = {
      labelLayout: 'float',
      viewMode: 'popup',
    };
    return (
      <div
        style={{ padding: '12px 20px' }}
        ref={(ref) => {
          this.footerContent = ref;
        }}
      >
        {showQuickReply && showAllScreen && (
          <QuickReplyAllScreen
            width="100%"
            left="0"
            dataSetValue={formDs}
            dataSetName="approvalOpinion"
            isShowAllScreen={this.handleShowAllScreen}
            handleSaveCommentDraft={this.handleSaveCommentDraft}
            closeQuickReply={this.closeQuickReply}
            footerRef={this.footerContent}
          />
        )}
        <div
          className={styles['header-buttons']}
          id="header-buttons"
          style={{ position: 'relative', alignItems: `${showQuickReply ? 'flex-end' : 'center'}` }}
        >
          <div style={{ marginTop: '-2px', lineHeight: '32px' }}>
            {!attachmentUuid && (
              <Button
                funcType="flat"
                onClick={this.openNotification}
                disabled={loading}
                style={{ color: '#29bece', height: '32px', lineHeight: '32px' }}
              >
                <Icon type="file_upload" style={{ fontSize: '14px', margin: '-3px 4px 0 0' }} />
                {intl.get('hzero.common.button.uploadButton').d('上传附件')}
              </Button>
            )}
            {attachmentUuid && (
              <Attachment
                {...attachmentProps}
                bucketName={PRIVATE_BUCKET}
                value={attachmentUuid}
                onChange={this.setAttachmentUuid}
                attachments={attachments}
                disabled={loading}
                onAttachmentsChange={this.setAttachments}
              />
            )}
          </div>
          <div className={styles['footer-contact-lov']}>
            <Button
              icon="person_add-o"
              funcType="flat"
              className={classnames('no-border-btn', styles['space-btn'])}
              onClick={() => this.handleChooseEmployee('addCc')}
              disabled={!loadFlag}
            >
              {intl.get('hwfp.task.view.message.carbonCopyUsers').d('抄送人')}
              {!isEmpty(approvalData.addCc) && `(${approvalData.addCc.length})`}
            </Button>
            <ContactLov
              className={styles['contact-lov-select-multiple']}
              dataSet={formDs}
              name="addCc"
              mode="button"
              clearButton={false}
              viewMode="drawer"
              modalProps={{
                style: { width: 900, maxWidth: 900 },
              }}
              disabledKeys={this.handleCcDisabled()}
              selectionProps={{
                placeholder: intl.get('hzero.common.select.people').d('请从左侧选择人员'),
              }}
              disabled={!loadFlag}
            >
              {intl.get('hwfp.task.view.message.carbonCopyUsers').d('抄送人')}
              {!isEmpty(approvalData.addCc) && `(${approvalData.addCc.length})`}
            </ContactLov>
          </div>
          {getCurrentUser().tenantNum === 'SRM-GOLDRAIN' && (
            <Button
              className={classnames('no-border-btn', styles['space-btn'])}
              funcType="flat"
              disabled={!loadFlag || !groupStatus}
              onClick={this.handleGroupOrAdd}
            >
              {groupFlag
                ? intl.get('hwfp.task.view.button.addGroup').d('入群讨论')
                : intl.get('hwfp.task.view.button.createGroup').d('创建群聊')}
            </Button>
          )}
          {!isEmpty(needNextNodeApprover) && (
            <Button
              icon="authorize"
              funcType="flat"
              className={classnames('no-border-btn', styles['space-btn'])}
              onClick={this.handleAssignDrawerVisible}
              disabled={!loadFlag}
            >
              {intl.get('hwfp.task.view.message.addNextApprover').d('指派审批人')}
              {
                keys(approvalData).filter(
                  (item) => item.startsWith('nextNode') && !isEmpty(approvalData[item])
                ).length
              }
              /{needNextNodeApprover.length}
            </Button>
          )}
          {showQuickReply && !showAllScreen && (
            <QuickReply
              width={document.getElementById('textContent')?.getBoundingClientRect()?.width}
              left={
                document.getElementById('textContent')?.parentElement?.parentElement?.offsetLeft
              }
              dataSetValue={formDs}
              dataSetName="approvalOpinion"
              isShowAllScreen={this.handleShowAllScreen}
              handleSaveCommentDraft={this.handleSaveCommentDraft}
              closeQuickReply={this.closeQuickReply}
              footerRef={this.footerContent}
            />
          )}
          <TextField
            dataSet={formDs}
            name="approvalOpinion"
            className={styles['reply-text-field']}
            placeholder={approveCommentTitle}
            clearButton
            showValidation="tooltip"
            style={{
              marginRight: '24px',
              marginLeft: '14px',
              flex: '1 1 auto',
              display: `${showQuickReply && !showAllScreen ? 'none' : ''}`,
              zIndex: `${showQuickReply && showAllScreen ? '-100' : ''}`,
            }}
            suffix={
              <span style={{ cursor: 'pointer', marginLeft: '4px' }} onClick={this.openEditModal}>
                <Tooltip title={intl.get('hwfp.task.button.fullScrennEdit').d('全屏编辑')}>
                  <Icon type="zoom_out_map" style={{ fontSize: '14px' }} />
                </Tooltip>
              </span>
            }
            id="textContent"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              this.handleFocus(true);
            }}
          />
          {isFunction(handleFooterButton)
            ? handleFooterButton(approvalData, { ...this.props })
            : null}
          {this.renderApprovalAction()}
          {this.renderApproveProcessNotification()}
        </div>
      </div>
    );
  }
}
