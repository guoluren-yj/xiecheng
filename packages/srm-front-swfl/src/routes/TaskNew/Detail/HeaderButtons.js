/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import classnames from 'classnames';
import { connect } from 'dva';
import { withRouter, routerRedux } from 'dva/router';
import moment from 'moment';
import { stringify } from 'querystring';
import { Button, TextArea, Modal as ModalPro } from 'choerodon-ui/pro';
import { Divider, Tooltip, Icon, Dropdown, Menu, Modal } from 'choerodon-ui';
import { isEmpty, forEach, keys, cloneDeep, isObject, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import remote from 'hzero-front/lib/utils/remote';
import UploadModal from '_components/Upload';
import intl from 'utils/intl';
import { HZERO_FILE, BKT_HWFP } from 'utils/config';
import { closeTab } from 'utils/menuTab';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  getResponse,
  isTenantRoleLevel,
  getCurrentUser,
} from 'utils/utils';

import {
  saveTaskComment,
  fetchFileCount, saveTask,
  checkGroupButFlag,
  getForecastLists,
  starGroupChat,
  getDdConfig,
} from '@/services/taskService';
import { getDetailDispatchRouter } from '@/utils/util';

import EmployeeModalNew from './EmployeeModalNew';
import SpecifyEmployeeModal from './SpecifyEmployeeModal';
import AssignDrawer from './AssignDrawer';
import ApprovalDrawer from './ApprovalDrawer';
import Reply from '../List/Reply';
import styles from './index.less';

const editModalKey = ModalPro.key();

@remote({
  code: 'SWFL_TASK_FOOTER_BUTTONS',
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
    this.script = null; // 用于存储script标签的引用
    this.state = {
      approveActions: {},
      approveCommentTitle: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      formInvokeFlag: false,
      approvalNeedOpinionFlag: false,
      approvalRefuseOpinionFlag: false,
      hasRefuseOpinionFlag: false,
      approveCommentNotice: '',
      employeeModalVisible: false,
      assignDrawerVisible: false,
      specifyEmployeeModalVisible: false,
      approvalDrawerVisible: false,
      approvalType: 'Approved',
      carbonCopyFlag: false,
      nextNodeFlag: false,
      approvalData: {},
      specifyEmployeeData: [],
      specifyEmployeeDataObj: {},
      opinionValue: '',
      count: 0,
      showDropDownMenu: true,
      downCount: 5,
      rejectJumpConfigRebutFlag: false,
      rejectJumpConfigRefuseFlag: false,
      loadFlag: props.loadFlag,
      submitTime: '', // 点击审批按钮时间
      groupFlag: false, // 是否有群聊 （金雨科技租户使用）
      groupStatus: false, // 校验群聊接口是否正常调用 （金雨科技租户使用）
      groupData: {}, // 发起群聊或者加入群聊 入参
    };
  }

  componentDidMount() {
    const {
      task: { formKey },
    } = this.props;
    if (!formKey || !formKey.includes('include://')) {
      // 没有表单或者非include表单，页脚按钮无需loading
      this.setState({ loadFlag: true });
    }
    // 处理流程自定义信息
    this.handleProcessCuszInfo();
    // 加载审批意见草稿
    this.handleLoadCommentDraft();
    // 下拉菜单首次渲染菜单展开5s
    this.handleDropDownMenu();
    // 判断是否需要展示群聊按钮  然后判断展示创建群聊或者加入群聊
    const { tenantNum } = getCurrentUser();
    if(tenantNum === 'SRM-GOLDRAIN'){
      this.handleConfigDd();
      this.handleGolorainConfig();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.loadFlag !== nextProps.loadFlag) {
      this.setState({ loadFlag: nextProps.loadFlag });
    }
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
      if(dd.env.platform !== "notInDingTalk" ) {
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
        processInstanceId, description, startUserId, processName,
        processDefinitionId, historicTaskExtList,
      },
    } = this.props;
    checkGroupButFlag({processInstanceId}).then(async res =>{
      if(getResponse(res)){
        // groupFlag 为 true 加入群聊 false 创建群聊
        const { groupFlag, groupId } = res;
        this.setState({groupFlag});
        this.setState({groupStatus: true});
        const response1 = await getForecastLists({
          tenantId: getCurrentOrganizationId(),
          processInstanceId,
          processDefinitionId,
        });
        const employeeCodes = [...new Set([...response1, ...historicTaskExtList].filter(item => item.assignee).map(item => item.assignee))];
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
        this.setState({groupData});
      }
    });
  }

  @Bind()
  handleLoadCommentDraft() {
    const {
      formDs,
      task: { comment },
    } = this.props;
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
  handleDropDownMenu() {
    const { downCount } = this.state;
    let downCountValue = downCount;
    this.setState({ showDropDownMenu: true });
    const timer = setInterval(() => {
      downCountValue--;
      if (downCountValue === 0) {
        this.setState({ downCount: 0 });
      }
      if (downCountValue < 0) {
        clearInterval(timer);
        this.setState({ showDropDownMenu: false });
      }
    }, 1000);
  }

  @Bind()
  openEditModal() {
    const { formDs } = this.props;
    const { approvalOpinion } = formDs.current.toData();
    ModalPro.open({
      key: editModalKey,
      movable: true,
      maskClosable: true,
      className: styles['opionion-edit-modal'],
      title: intl.get('hwfp.task.view.message.comment').d('审批意见'),
      children: (
        <Reply
          onRef={(ref) => {
            this.textAreaRef = ref;
          }}
          originValue={approvalOpinion}
        />
      ),
      onOk: () => {
        const opinion = this.textAreaRef.state.replyValue;
        formDs.current.set('approvalOpinion', opinion);
        this.handleSaveCommentDraft(opinion);
        return true;
      },
    });
  }

  @Bind()
  setOpinionValue() {
    const { formDs } = this.props;
    this.setState({ opinionValue: formDs.current.get('approvalOpinion') });
  }

  @Bind()
  handleMaxLength(value) {
    const result = value ? value.match(/\n|\r/g) : [];
    this.setState({ count: result ? result.length : 0 });
  }

  @Bind()
  handleSaveCommentDraft(comment) {
    const { taskId, formDs } = this.props;
    const { opinionValue = '' } = this.state;
    if (comment === opinionValue?.replace(/\n|\r/g, '')) {
      // eslint-disable-next-line no-param-reassign
      comment = opinionValue;
      formDs.current.set('approvalOpinion', opinionValue);
    }
    const { timeZone } = getCurrentUser();
    const timeZoneValue = parseInt(timeZone.split('GMT')[1], 0);
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
        if (prop.id === 'REJECT_JUMP_CONFIG_REBUT_FLAG' && prop.name === 'Y') {
          rejectJumpConfigRebutFlag = true;
        }
        if (prop.id === 'REJECT_JUMP_CONFIG_REFUSE_FLAG' && prop.name === 'Y') {
          rejectJumpConfigRefuseFlag = true;
        }
      });
      this.setState({
        approveActions,
        approveCommentTitle,
        formInvokeFlag,
        approvalNeedOpinionFlag,
        approvalRefuseOpinionFlag,
        hasRefuseOpinionFlag,
        rejectJumpConfigRebutFlag,
        rejectJumpConfigRefuseFlag,
      });
    }
  }

  @Bind()
  async handleSubmit(approvalType) {
    const { approvalData, approvalNeedOpinionFlag, approvalRefuseOpinionFlag } = this.state;
    const { task, getApproveFormRef, formDs } = this.props;
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
        content:
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
          content: intl
            .get('hwfp.task.view.message.title.needNextApprover', {
              nextActName: requiredNode.nextActName,
            })
            .d(`请指定【${requiredNode.nextActName}】的审批人`),
        });
        return;
      }
    }
    if (approvalType === 'Jumped') {
      this.jumpActivity();
    } else if (approvalType === 'delegate' || approvalType === 'AddSign') {
      this.setState({ loading: true });
      this.taskAction({ action: approvalType });
    } else {
      // 如果没有审批表单或不需要回调 直接执行审批动作；
      // 否则向审批表单界面发送审批意见消息,监听审批表单返回消息后再执行审批动作
      const approveFormChildren = getApproveFormRef();
      this.setState({ loading: true });
      if (!formKey || !formKey.includes('include://')) {
        this.taskAction({ approveResult: approvalType });
      } else if (isAddSign) {
        let flag = false;
        if (this.props.processRemote) {
          flag = await this.props.processRemote.process(
            'SWFL_TASK_FOOTER_BUTTONS_ADDSIGN',
            false,
            {}
          );
        }
        if (flag && approveFormChildren) {
          // 向审批表单界面 发送审批意见消息
          approveFormChildren.submit(
            { approveResult: approvalType, processInstanceId, task },
            () => {
              this.setState({ loading: false });
            }
          );
        } else {
          this.taskAction({ approveResult: approvalType });
        }
      } else if (approveFormChildren) {
        // 向审批表单界面 发送审批意见消息
        approveFormChildren.submit({ approveResult: approvalType, processInstanceId, task }, () => {
          this.setState({ loading: false });
        });
      } else {
        this.setState({ loading: false });
      }
    }
  }

  @Bind()
  taskAction(dataParams) {
    const { approvalData, submitTime } = this.state;
    const {
      dispatch,
      formDs,
      match,
      attachmentUuid,
      task = {},
      pageLoadTime,
      formLoadTime,
      taskMenu: originTaskMenu,
    } = this.props;
    const { nextNodeApprover, owner, processDefinitionId, processDefinitionKey } = task;
    const taskDetails = task;
    const data = dataParams || {};
    data.action =
      data.action ||
      (dataParams.approveResult && dataParams.approveResult === 'ApproveAndAddSign'
        ? 'ApproveAndAddSign'
        : 'complete');
    if (taskDetails.delegationState === 'pending' && data.action !== 'delegate') {
      data.action = 'resolve';
    }
    const variables = [];
    let comment = formDs.current.get('approvalOpinion');
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
            : appointorData.map((r) => r.get('employeeCode') || r.get('employeeNum')).join();
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
    this.handleFetchCount().then((result) => {
      this.setState({ loading: false });
      const res = getResponse(result);
      if (res !== undefined) {
        const params = {
          tenantId: getCurrentOrganizationId(),
          comment,
          processInstanceId: match.params.processInstanceId,
          processDefinitionId,
          variables: variables.filter((r) => r.value !== ''),
          carbonCopyUsers: isEmpty(approvalData.addCc)
            ? ''
            : approvalData.addCc.map((item) => item.get('employeeNum')).join(),
          currentTaskId: taskDetails.id,
          action: data.action,
          jumpTarget: data.jumpTarget || null,
          jumpTargetName: data.jumpTargetName || null,
          attachmentUuid: res > 0 ? attachmentUuid : null,
          rebutAutoJumpFlag: formDs.current && formDs.current.get('rebutAutoJumpFlag'),
          refuseAutoJumpFlag: formDs.current && formDs.current.get('refuseAutoJumpFlag'),
          formLock: data.formLock,
        };
        if (data.action === 'AddSign' || data.action === 'ApproveAndAddSign') {
          params.assignList = isEmpty(approvalData[data.action])
            ? null
            : approvalData[data.action].map((item) => item.get('employeeNum'));
        } else if (data.action === 'delegate') {
          params.assignee = isEmpty(approvalData[data.action])
            ? null
            : approvalData[data.action][0].get('employeeNum');
        } else {
          params.assignee = null;
        }
        this.setState({ loading: true });
        saveTask(params, {
          submitTime,
          pageLoadTime,
          formLoadTime,
        }).then((response) => {
          this.setState({ loading: false });
          const r = getResponse(response);
          if (r && r.warnDesc) {
            notification.warning({
              message: r.warnDesc,
            });
            return;
          }
          // todo审批完跳转到列表页面(并要刷新) 当列表界面和办理页面之间还有其他Tab标签页时，会跳到那个标签页
          this.setState(
            {
              approvalDrawerVisible: false,
            },
            () => {
              if (r && !r.warnDesc) {
                notification.success();
              }
              // 如果是加签，提交成功时候清空审批意见
              if (data.action === 'AddSign') {
                this.handleSaveCommentDraft('');
              }
              // 有待办跳转到待办，没有就跳转到审批工作台，否则首页工作台
              const menuValue = getDetailDispatchRouter(originTaskMenu);
              if (menuValue.taskMenu) {
                dispatch(
                  routerRedux.push({
                    pathname: `/hwfp/task/list`,
                    search: stringify({ from: 'TaskNew' }),
                  })
                );
              } else if (menuValue.approvalMenu) {
                dispatch(routerRedux.push({ pathname: `/hwfp/approval/list` }));
              } else {
                dispatch(routerRedux.push({ pathname: `/workplace` }));
              }
              closeTab(
                `/hwfp/task/detail/:id/:processInstanceId-${processDefinitionKey}`,
                undefined,
                false
              );
            }
          );
        });
      }
    });
  }

  @Bind()
  handleLoadFlag(result) {
    this.setState({ loadFlag: result });
  }

  @Bind()
  handleFetchCount() {
    const { attachmentUuid } = this.props;
    return fetchFileCount({
      attachmentUUID: attachmentUuid,
    });
  }

  @Bind()
  jumpActivity() {
    const { approvalData, submitTime } = this.state;
    const { assignee, jumpTarget, jumpTargetName } = approvalData.Jumped;
    const {
      formDs,
      attachmentUuid,
      dispatch,
      match: {
        params: { id, processInstanceId },
      },
      task = {},
      pageLoadTime,
      formLoadTime,
      taskMenu: originTaskMenu,
    } = this.props;
    const { processDefinitionId, processDefinitionKey } = task;
    const comment = formDs.current.get('approvalOpinion');
    const rebutAutoJumpFlag = formDs.current && formDs.current.get('rebutAutoJumpFlag');
    const refuseAutoJumpFlag = formDs.current && formDs.current.get('refuseAutoJumpFlag');
    this.setState({ loading: true });

    this.handleFetchCount().then((response) => {
      this.setState({ loading: false });
      const r = getResponse(response);
      if (r !== undefined) {
        this.setState({ loading: true });
        saveTask(
          {
            action: 'jump',
            currentTaskId: id,
            tenantId: getCurrentOrganizationId(),
            attachmentUuid: r > 0 ? attachmentUuid : null,
            carbonCopyUsers: isEmpty(approvalData.addCc)
              ? ''
              : approvalData.addCc.map((item) => item.get('employeeNum')).join(),
            assignee,
            comment,
            jumpTarget,
            jumpTargetName,
            processInstanceId,
            processDefinitionId,
            rebutAutoJumpFlag,
            refuseAutoJumpFlag,
          },
          {
            submitTime,
            pageLoadTime,
            formLoadTime,
          }
        ).then((result) => {
          this.setState({ loading: false });
          const res = getResponse(result);
          this.setState({ visible: false }, () => {
            if (res) {
              notification.success();
            }
            // 有待办跳转到待办，没有就跳转到审批工作台
            const menuValue = getDetailDispatchRouter(originTaskMenu);
            if (menuValue.taskMenu) {
              dispatch(
                routerRedux.push({
                  pathname: `/hwfp/task/list`,
                  search: stringify({ from: 'TaskNew' }),
                })
              );
            } else if (menuValue.approvalMenu) {
              dispatch(routerRedux.push({ pathname: `/hwfp/approval/list` }));
            } else {
              dispatch(routerRedux.push({ pathname: `/workplace` }));
            }
            closeTab(
              `/hwfp/task/detail/:id/:processInstanceId-${processDefinitionKey}`,
              undefined,
              false
            );
          });
        });
      }
    });
  }

  @Bind()
  handleApproveActions(approveActions = {}) {
    const {
      task: { owner },
      jumpList = [],
    } = this.props;
    // 前加签、后加签只需要审批同意或拒绝
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    const actions = [];
    // 将同意，拒绝前置
    if (approveActions.Approved) {
      actions.push({
        action: 'Approved',
        actionName: approveActions.Approved,
        color: 'green',
      });
    }
    if (approveActions.Rejected) {
      actions.push({
        action: 'Rejected',
        actionName: approveActions.Rejected,
        color: 'red',
      });
    }
    keys(approveActions).forEach((item) => {
      // 加签只需要审批同意或拒绝
      if (!['Approved', 'Rejected'].includes(item)) {
        let flag = true;
        if (isAddSign) {
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
    return actions;
  }

  @Bind()
  async handleApprove(approveAction) {
    this.setState({ submitTime: new Date().getTime() });
    const { formDs } = this.props;
    const {
      approvalRefuseOpinionFlag,
      hasRefuseOpinionFlag,
      rejectJumpConfigRefuseFlag,
    } = this.state;
    formDs.current.getField('refuseAutoJumpFlag').set('required', false);
    formDs.current.set('refuseAutoJumpFlag', 0);
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
          approvalData[item] = null;
        }
      });
      if (approveAction === 'Rejected') {
        if (rejectJumpConfigRefuseFlag) {
          const refuseAutoJumpFlag = formDs.current.get('refuseAutoJumpFlag');
          formDs.current.getField('refuseAutoJumpFlag').set('required', rejectJumpConfigRefuseFlag);
          formDs.current.set('refuseAutoJumpFlag', refuseAutoJumpFlag || 0);
          this.setState({
            approvalData,
            approvalType: approveAction,
            approvalDrawerVisible: true,
          });
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
          ModalPro.confirm({
            center: true,
            children: intl.get('hzero.common.message.confirm.callback').d('是否确认提交?'),
            onOk: () => this.handleSubmit(approveAction),
          });
        }
      } else {
        this.setState({
          approvalData,
          approvalType: approveAction,
          approvalDrawerVisible: true,
        });
      }
    } else {
      this.setState({
        approvalType: approveAction,
      });
      this.handleSubmit(approveAction);
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
      (otherParams.check === 'Y' ||
        otherParams.needAppoint === 'Y' ||
        otherParams.rejectedNeedAppoint === 'Y') &&
      (!isEmpty(otherParams.candidates) ||
        otherParams.appointApproverEmpStr ||
        otherParams.appointApproverPostStr ||
        otherParams.appointApproverRoleStr)
    ) {
      this.setState({
        specifyEmployeeModalVisible: true,
        specifyEmployeeData: otherParams.candidates,
        specifyEmployeeDataObj: {
          appointApproverEmpStr: otherParams.appointApproverEmpStr,
          appointApproverPostStr: otherParams.appointApproverPostStr,
          appointApproverRoleStr: otherParams.appointApproverRoleStr,
        },
        carbonCopyFlag: false,
        nextNodeFlag: type,
        approvalType: this.state.approvalType,
        employeeModalVisible: false,
      });
    } else {
      this.setState({
        carbonCopyFlag: type === 'addCc',
        nextNodeFlag: type.startsWith('nextNode') ? type : false,
        approvalType:
          type === 'addCc' || type.startsWith('nextNode') ? this.state.approvalType : type,
        employeeModalVisible: true,
      });
    }
  }

  @Bind()
  handleCleanEmployee(key, type) {
    const { approvalData } = this.state;
    // 驳回只能选择一个节点，故不用数组
    if (type === 'Jumped') {
      approvalData[type] = null;
    } else {
      const newData = approvalData[type].filter((item) => item.get('employeeId') !== key);
      approvalData[type] = newData;
    }
    this.setState({
      approvalData,
    });
  }

  @Bind()
  handleEmployeeModal() {
    this.setState({
      employeeModalVisible: false,
    });
  }

  @Bind()
  handleSpecifyEmployeeModal() {
    this.setState({
      specifyEmployeeModalVisible: false,
      specifyEmployeeData: [],
      specifyEmployeeDataObj: {},
    });
  }

  @Bind()
  handlSelectedEmployee(records) {
    const { carbonCopyFlag, nextNodeFlag, approvalType, approvalData } = this.state;
    const dataType = carbonCopyFlag ? 'addCc' : nextNodeFlag || approvalType;
    this.setState({
      employeeModalVisible: false,
      specifyEmployeeModalVisible: false,
      carbonCopyFlag: false,
      nextNodeFlag: false,
      approvalData: {
        ...approvalData,
        [dataType]: records,
      },
    });
  }

  @Bind()
  handleAssignDrawer() {
    this.setState({
      assignDrawerVisible: !this.state.assignDrawerVisible,
    });
  }

  @Bind()
  handleMoreDrawer() {
    this.setState({
      approvalDrawerVisible: !this.state.approvalDrawerVisible,
    });
  }

  @Bind()
  changeApprovalData(approvalData) {
    this.setState({
      approvalData,
    });
  }

  @Bind()
  renderApprovalAction() {
    const {
      approveActions = {},
      loading,
      approvalType,
      showDropDownMenu,
      downCount,
      loadFlag,
    } = this.state;
    if (isEmpty(approveActions)) {
      return null;
    }
    const actions = this.handleApproveActions(approveActions);
    const dropDownProps = showDropDownMenu ? { visible: downCount > 0 } : {};
    const approvalActionSeqDataMap = cloneDeep(this.props.task.approvalActionSeqDataMap) || {
      Approved: 1,
      Rejected: 2,
      More: 3,
    };
    const actionsCode = actions.map(({ action }) => action);
    if (
      actionsCode &&
      (actionsCode.length > 2 ||
        actionsCode.filter((code) => !['Approved', 'Rejected'].includes(code)).length > 1)
    ) {
      // 操作数量大于2时，显示更多按钮
      approvalActionSeqDataMap.More = this.props.task.approvalActionSeqDataMap?.More || 3;
    } else {
      // 操作数量小于3时，不显示更多按钮
      delete approvalActionSeqDataMap.More;
    }
    // 如果没有审批同意按钮，就删除
    if (!actions.map(({ action }) => action).includes('Approved')) {
      delete approvalActionSeqDataMap.Approved;
    }
    // 如果没有审批拒绝按钮，就删除
    if (!actions.map(({ action }) => action).includes('Rejected')) {
      delete approvalActionSeqDataMap.Rejected;
    }
    const valuesSort = Object.values(approvalActionSeqDataMap).sort();
    let actionsSort = valuesSort.map((v) => {
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
    });
    const actionsLength = actions.length;
    // 如果只有两个按钮，并且这两个按钮里有一个是more的话,就需要将More按钮的位置替换给非审批拒绝和审批同意的
    if (actionsLength <= 3) {
      let index = actionsLength;
      if (actionsSort.includes('More')) {
        index = actionsSort.indexOf('More');
      }
      if (actionsSort.includes('Approved') || actionsSort.includes('Rejected')) {
        actionsSort[index] = actions.filter(
          ({ action }) => action !== 'Approved' && action !== 'Rejected'
        )[0]?.action;
      } else if (actionsSort.includes('More')) {
        actionsSort[index] = 'More';
      } else {
        actionsSort = actions.map(({ action }) => action);
      }
    }
    actionsSort = actionsSort.filter(Boolean);
    return (
      <>
        {actionsSort.map((_action, index) => {
          if (_action === 'More') {
            return (
              <Dropdown
                placement="bottomLeft"
                disabled={!loadFlag}
                overlay={
                  <Menu className={styles['more-action-menu-list']}>
                    {actions
                      .filter(({ action }) => action !== 'Approved' && action !== 'Rejected')
                      .map((item) => (
                        <Menu.Item
                          key={item.action}
                          onClick={() => this.handleApprove(item.action)}
                          disabled={!loadFlag}
                        >
                          {item.actionName}
                        </Menu.Item>
                      ))}
                  </Menu>
                }
                {...dropDownProps}
              >
                <span style={{ margin: '0 4px' }}>
                  {intl.get('hzero.common.button.more').d('更多')}
                  <Icon type="expand_more" style={{ verticalAlign: 'sub' }} />
                </span>
              </Dropdown>
            );
          }
          const filterAction = actions.filter((item) => item.action === _action);
          const [currentAction] = filterAction.length > 0 ? filterAction : [{}];
          const useLastBtnStyle =
            !['Approved', 'Rejected'].includes(_action) &&
            index === actionsSort.length - 1 &&
            actionsSort.length <= 3;
          const isNormalAction = !['Approved', 'Rejected'].includes(currentAction.action);
          const btnStyle = {
            backgroundColor:
              currentAction.color === 'green'
                ? '#47B881'
                : currentAction.color === 'red'
                ? '#F56349'
                : isNormalAction
                ? '#1984F7'
                : 'unset',
            color: '#fff',
          };
          return (
            <Button
              className={classnames({
                [styles['space-btn']]: true,
                [styles['btn-no-border']]: true,
              })}
              onClick={() => this.handleApprove(currentAction.action)}
              color={useLastBtnStyle ? 'default' : currentAction.color}
              loading={loading && approvalType === currentAction.action}
              disabled={(loading && approvalType !== currentAction.action) || !loadFlag}
              style={btnStyle}
            >
              {currentAction.actionName}
            </Button>
          );
        })}
      </>
    );
  }

  openNotification = () => {
    notification.warning({
      message: intl.get('hzero.common.upload.attachmentUuid').d('未获取到文件批次号，请稍后重试'),
    });
  };

  // 解码URL
  handleUrlDecode = () => {
    const {location: {href, origin, pathname}} = window;
    console.log(href, origin, pathname);

    let newUrl = `${origin}${pathname}?`;
    const urlObj = new URL(href);
    const searchParams = new URLSearchParams(urlObj.search);
    searchParams.forEach((value, key)=>{
      if(['processName', 'startUserName'].includes(key)){
        const decodeValue = decodeURIComponent(searchParams.get(key));
        newUrl = `${newUrl}${key}=${decodeValue}&`;
      }else{
        newUrl = `${newUrl}${key}=${value}&`;
      }
    });
    console.log('newUrl: -----', newUrl.slice(0, -1));

    return newUrl.slice(0, -1);
  };

  handleGroupOrAdd = async () => {
    const {
      groupData,
    } = this.state;
    const { dd } = window;
    if(dd.env.platform !== "notInDingTalk" ) {
      const res = await starGroupChat(groupData);
      if(getResponse(res)){
        this.setState({groupFlag: true});
        const {groupId} = res;
        const newDdUrl = this.handleUrlDecode();
        getDdConfig({url: newDdUrl }).then(configRes => {
          if(getResponse(configRes)){
            dd.config({
              ...configRes,
              jsApiList: [
                'openChatByConversationId',
                'biz.util.openLink',
              ],
              type: 0,
            });
            dd.error((err) => {
              dd.checkJsApi({ jsApiList: [
                'openChatByConversationId',
              ]}).then(q => {
                // eslint-disable-next-line no-alert
                alert(`checkJsApi: ${q}----dd error: ${ JSON.stringify(err)}`);
              });
            });
            dd.ready(() => {
              // console.log('dd ready: ', dd);
              // dd.checkJsApi({ jsApiList: [
              //   'openChatByConversationId',
              // ]}).then(q => console.log('11111111111111', q));
              dd.openChatByConversationId({
                openConversationId: groupId,
                success: () => {
                },
                fail: () => {
                },
                complete: () => {
                },
              });
            });
          }else {
            notification.warning({
              message: intl.get('hwfp.common.model.getDdConfig.message').d('获取钉钉JSAPI配置失败'),
            });
          }
        });
      }
    }else{
      notification.warning({
        message: intl.get('hwfp.common.model.handleGroupOrAdd.message').d('请在钉钉环境中打开本链接'),
      });
    }
  };

  render() {
    const {
      approveActions,
      approveCommentNotice,
      approveCommentTitle,
      employeeModalVisible,
      specifyEmployeeModalVisible,
      assignDrawerVisible,
      approvalDrawerVisible,
      carbonCopyFlag,
      nextNodeFlag,
      approvalType,
      approvalData,
      loadFlag,
      loading,
      specifyEmployeeData,
      specifyEmployeeDataObj,
      count,
      rejectJumpConfigRebutFlag,
      rejectJumpConfigRefuseFlag,
      groupFlag,
      groupStatus,
    } = this.state;
    const { task = {}, attachmentUuid, formDs, showProcessPic, jumpList, processRemote } = this.props;
    const {
      task: { owner, nextNodeApprover = [], processInstance = {} },
    } = this.props;
    const isAddSign =
      owner && (owner.startsWith('AddSign') || owner.startsWith('ApproveAndAddSign'));
    const needNextNodeApprover =
      !isAddSign && !isEmpty(nextNodeApprover)
        ? nextNodeApprover.filter(
            (node) =>
              node.check === 'Y' || node.needAppoint === 'Y' || node.rejectedNeedAppoint === 'Y'
          )
        : [];
    const { handleFooterButton = undefined } = processRemote?.props?.process || {};
    return (
      <div className={styles['header-buttons']}>
        <Button
          className="no-border-btn"
          icon="panorama-o"
          disabled={isEmpty(task)}
          onClick={showProcessPic}
        >
          {intl.get('hwfp.common.model.process.graph').d('流程图')}
        </Button>
        <Divider type="vertical" />
        {!attachmentUuid && (
          <Button funcType="flat" onClick={this.openNotification}>
            {intl.get('hzero.common.button.uploadButton').d('上传附件')}
          </Button>
        )}
        {attachmentUuid && (
          <UploadModal
            ref={(ref) => {
              this.uploadModalRef = ref;
            }}
            btnProps={{
              className: classnames('no-border-btn', styles['space-btn']),
              icon: 'upload',
            }}
            title={intl.get('hzero.common.button.uploadButton').d('上传附件')}
            action={
              isTenantRoleLevel()
                ? `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/attachment/multipart`
                : `${HZERO_FILE}/v1/files/attachment/multipart`
            }
            attachmentUUID={attachmentUuid}
            bucketName={BKT_HWFP}
            bucketDirectory="hwfp01"
          />
        )}
        <Button
          icon="add"
          className={classnames('no-border-btn', styles['space-btn'])}
          onClick={() => this.handleChooseEmployee('addCc')}
          disabled={!loadFlag}
        >
          {intl.get('hwfp.task.view.message.carbonCopyUsers').d('抄送人')}
          {!isEmpty(approvalData.addCc) && `(${approvalData.addCc.length})`}
        </Button>
        {
          (getCurrentUser().tenantNum === 'SRM-GOLDRAIN') && (
            <Button
              className={classnames('no-border-btn', styles['space-btn'])}
              funcType="flat"
              disabled={!loadFlag || !groupStatus}
              onClick={this.handleGroupOrAdd}
            >
              {groupFlag ? intl.get('hwfp.task.view.button.addGroup').d('入群讨论') : intl.get('hwfp.task.view.button.createGroup').d('创建群聊')}
            </Button>
        )}
        {!isEmpty(needNextNodeApprover) && (
          <Button
            icon="add"
            className={classnames('no-border-btn', styles['space-btn'])}
            onClick={this.handleAssignDrawer}
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
        <TextArea
          dataSet={formDs}
          name="approvalOpinion"
          placeholder={approveCommentTitle}
          clearButton
          style={{ width: '200px', height: '32px' }}
          maxLength={3500 + count}
          rows={1}
          trim="none"
          onClick={this.setOpinionValue}
          onBlur={(event) => this.handleSaveCommentDraft(event.target.value)}
          onChange={this.handleMaxLength}
        />
        <span style={{ cursor: 'pointer', margin: '0 8px' }} onClick={this.openEditModal}>
          <Tooltip title={intl.get('hwfp.task.button.fullScrennEdit').d('全屏编辑')}>
            <Icon type="zoom_out_map" />
          </Tooltip>
        </span>
        {isFunction(handleFooterButton)? handleFooterButton(approvalData, {...this.props}) : null}
        {this.renderApprovalAction()}
        {employeeModalVisible && (
          <EmployeeModalNew
            type={carbonCopyFlag ? 'addCc' : nextNodeFlag || approvalType}
            data={approvalData}
            onClose={this.handleEmployeeModal}
            onAfterSubmit={this.handlSelectedEmployee}
            startUser={processInstance ? processInstance.startUserId : ''}
          />
        )}
        {specifyEmployeeModalVisible && (
          <SpecifyEmployeeModal
            sourceData={specifyEmployeeData}
            specifyEmployeeDataObj={specifyEmployeeDataObj}
            targetData={approvalData}
            type={nextNodeFlag}
            onClose={this.handleSpecifyEmployeeModal}
            onAfterSubmit={this.handlSelectedEmployee}
          />
        )}
        {assignDrawerVisible && (
          <AssignDrawer
            task={task}
            approvalData={approvalData}
            changeApprovalData={this.changeApprovalData}
            handleChooseEmployee={this.handleChooseEmployee}
            handleToogleVisible={this.handleAssignDrawer}
          />
        )}
        {approvalDrawerVisible && (
          <ApprovalDrawer
            formDs={formDs}
            task={task}
            loading={loading}
            attachmentUuid={attachmentUuid}
            jumpList={jumpList}
            uploadModalRef={this.uploadModalRef}
            approvalType={approvalType}
            approveActions={approveActions}
            approveCommentTitle={approveCommentTitle}
            approvalData={approvalData}
            approveCommentNotice={approveCommentNotice}
            onSubmit={this.handleSubmit}
            handleCleanEmployee={this.handleCleanEmployee}
            changeApprovalData={this.changeApprovalData}
            handleChooseEmployee={this.handleChooseEmployee}
            handleToogleVisible={this.handleMoreDrawer}
            handleSaveCommentDraft={this.handleSaveCommentDraft}
            rejectJumpConfigRebutFlag={rejectJumpConfigRebutFlag}
            rejectJumpConfigRefuseFlag={rejectJumpConfigRefuseFlag}
          />
        )}
      </div>
    );
  }
}
