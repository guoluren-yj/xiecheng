/**
 * ProjectInfoForm - 项目信息维护子界面
 * @date: 2019-4-17
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Row,
  Col,
  Spin,
  Icon,
  Collapse,
  Table,
  // Tag,
} from 'hzero-ui';
import { Bind, Throttle } from 'lodash-decorators';
import classNames from 'classnames';
import { isEmpty, isString } from 'lodash';
import { Modal as C7NModal } from 'choerodon-ui/pro';
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';

import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import moment from 'moment';
import { getCurrentUser, getDateFormat, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import common from '@/routes/ssrc/common.less';
import { queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '@/utils/utils';
import { revokeWorkFlowByKey } from '@/services/tenderPlanService';
import OperationRecord from '../components/OperationRecord';
import tenderplanCss from './../Detail/ProjectInfoForm.less';

const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Panel } = Collapse;
const promptCode = 'ssrc.tenderPlan.model.tenderPlan';

@withCustomize({
  unitCode: [
    'SSRC.PROJECT_UPDATE.INFO',
    'SSRC.PROJECT_UPDATE.COLLAPSE',
    'SSRC.PROJECT_UPDATE.LINE_INFO',
  ],
})
@formatterCollections({
  code: ['ssrc.tenderPlan', 'ssrc.common'],
})
@connect(({ tenderPlan, loading }) => ({
  tenderPlan,
  loading: loading.effects['tenderPlan/fetchProjectInfoDetail'],
}))
@Form.create({ fieldNameProp: null })
export default class ProjectInfoForm extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    const {
      match: {
        path = null,
        params: { projectId },
      },
    } = props;
    const isPub = path && path.includes('/pub');
    this.state = {
      collapseKeys: ['headerInfo', 'lineInfo'],
      projectId,
      isPub,
      operationRecordModalVisible: false,
      approvaFlags: {},
      operationFlags: {},
      approveLoading: false,
    };
  }

  /**
   * 挂载后执行方法
   */
  componentDidMount() {
    this.handelSearchProjectInfo();
    this.queryValueCode();
  }

  componentWillUnmount() {
    const { isPub } = this.state;
    if (!isPub) {
      this.props.dispatch({
        type: 'tenderPlan/updateState',
        payload: {
          projectInfo: {},
          projectLinePage: {},
          projectLineInfo: [],
        },
      });
    }
  }

  /**
   * 查询项目信息- 明细
   */
  @Bind()
  handelSearchProjectInfo() {
    const { dispatch } = this.props;
    const { projectId } = this.state;
    if (projectId) {
      dispatch({
        type: 'tenderPlan/fetchProjectInfoDetail',
        payload: {
          projectId,
          customizeUnitCode: 'SSRC.PROJECT_UPDATE.INFO',
        },
      }).then(async () => {
        const {
          tenderPlan: { projectInfo = {} },
        } = this.props;
        const workFlowBussinessKeys = projectInfo.workflowBusinessKey
          ? [projectInfo.workflowBusinessKey]
          : [];
        if (!isEmpty(workFlowBussinessKeys)) {
          // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
          this.setState({ approvaFlags, operationFlags });
        }
      });
      dispatch({
        type: 'tenderPlan/fetchProjectLineInfo',
        payload: {
          projectId,
          customizeUnitCode: 'SSRC.PROJECT_UPDATE.LINE_INFO',
        },
      });
    }
  }

  /**
   * 查询资金来源值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'tenderPlan/queryValueCode',
    });
  }

  @Bind()
  getWarningStr(line = {}, title) {
    const renderExp = '、';
    const errorDate = intl.get('hzero.common.validation.notNull', { name: '' });

    const requiredLineErrs = [];

    const otherLineErrs = [];

    Object.values(line).forEach((item) => {
      const str = item.toString();
      let index = 0;
      index = str.indexOf(errorDate);
      if (index === -1) {
        otherLineErrs.push(`【${str}】`);
      } else {
        requiredLineErrs.push(`【${str.slice(0, index)}】`);
      }
    });
    return (
      (requiredLineErrs.length || otherLineErrs.length ? `${title}:` : '') +
      (requiredLineErrs.length > 0
        ? `${intl.get('hzero.common.validation.notNull', {
            name: requiredLineErrs.join(`${renderExp}`),
          })};`
        : '') +
      (otherLineErrs.length > 0 ? otherLineErrs.join(',') : '')
    );
  }

  /**
   * 同步 多选框 值节流以提高性能
   * @param {String} value - 多选框 组件变更值
   */
  @Bind()
  @Throttle(500)
  setValue(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  /**
   * 撤销审批
   * @returns React.element
   */
  @Bind()
  @Throttle(1000)
  handleRevoke(record) {
    const { dispatch } = this.props;
    this.setState({ approveLoading: true });
    return new Promise(async (resolve) => {
      C7NModal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip')
          .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
        onOk: async () => {
          const res = await revokeWorkFlowByKey({ businessKey: record.workflowBusinessKey });
          if (isString(res)) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: res,
            });
          } else if (res && !res?.failed) {
            resolve(true);
            notification.success();
            dispatch({
              type: 'tenderPlan/updateState',
              payload: {
                projectInfo: {},
                projectLinePage: {},
                projectLineInfo: [],
              },
            });
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/project-maintenance/list`,
              })
            );
          }
          resolve(false);
        },
        afterClose: () => {
          this.setState({ approveLoading: false });
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @Throttle(1000)
  handleApprove(record) {
    const { dispatch } = this.props;
    this.setState({ approveLoading: true });
    return new Promise(async (resolve) => {
      const res = await queryBatchApprovaFlag([record.workflowBusinessKey]);
      if (getResponse(res)) {
        openApproveModal({
          modalProps: {
            title: intl.get('hzero.common.button.approval').d('审批'),
            closable: true,
          },
          taskId: res[record.workflowBusinessKey]?.taskId,
          processInstanceId: res[record.workflowBusinessKey]?.processInstanceId,
          onSuccess: () => {
            dispatch({
              type: 'tenderPlan/updateState',
              payload: {
                projectInfo: {},
                projectLinePage: {},
                projectLineInfo: [],
              },
            });
            dispatch(
              routerRedux.push({
                pathname: `/ssrc/project-maintenance/list`,
              })
            );
          },
        });
      }
      this.setState({ approveLoading: false });
      resolve(true);
    });
  }

  /**
   * 基本信息表单渲染
   */
  renderBaseForm() {
    const {
      form,
      customizeForm,
      tenderPlan: { projectInfo = {} },
    } = this.props;
    const { enabledFlag = 1 } = this.state;

    const { getFieldDecorator } = form;
    const { projectPurAgents = [] } = projectInfo;

    return customizeForm(
      {
        code: 'SSRC.PROJECT_UPDATE.INFO',
        form: this.props.form,
        dataSource: projectInfo,
        readOnly: true,
      },
      <Form
        layout="horizontal"
        className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
      >
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.projectCode`).d('项目编号')} {...formLayOut}>
              {getFieldDecorator('projectNum', {
                initialValue: projectInfo.projectNum,
              })(<span>{projectInfo.projectNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.projectName`).d('项目名称')} {...formLayOut}>
              {getFieldDecorator('projectName', {
                initialValue: projectInfo.projectName,
              })(<span>{projectInfo.projectName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get('ssrc.common.company').d('公司')} {...formLayOut}>
              {getFieldDecorator('companyId', {
                initialValue: projectInfo.companyId,
              })(<span>{projectInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.ouName`).d('业务实体')} {...formLayOut}>
              {getFieldDecorator('ouId', {
                initialValue: projectInfo.ouId,
              })(<span>{projectInfo.ouName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.projectUserName`).d('项目负责人')}
              {...formLayOut}
            >
              {getFieldDecorator('principalUserId', {
                initialValue: projectInfo.principalUserId,
              })(<span>{projectInfo.realName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.phone`).d('手机号')} {...formLayOut}>
              {getFieldDecorator('phone', {
                initialValue: projectInfo.phone,
              })(<span>{projectInfo.phone}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.email`).d('邮箱')} {...formLayOut}>
              {getFieldDecorator('email', {
                initialValue: projectInfo.email,
              })(<span>{projectInfo.email}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.projectAddress`).d('项目地址')}
              {...formLayOut}
            >
              {getFieldDecorator('projectAddress', {
                initialValue: projectInfo.projectAddress,
              })(<span>{projectInfo.projectAddress}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.fundsSource`).d('资金来源')} {...formLayOut}>
              {getFieldDecorator('fundsSource', {
                initialValue: projectInfo.fundsSource,
              })(<span>{projectInfo.projectAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.creationDate`).d('创建日期')} {...formLayOut}>
              {getFieldDecorator('creationDate', {
                initialValue: projectInfo.creationDate
                  ? projectInfo.creationDate && moment(projectInfo.creationDate, getDateFormat())
                  : moment(moment(new Date()).format(DEFAULT_DATE_FORMAT)),
              })(<span>{projectInfo.creationDate}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.createdByName`).d('创建人')} {...formLayOut}>
              {getFieldDecorator('createdByName', {
                initialValue: projectInfo.createdByName
                  ? projectInfo.createdByName
                  : getCurrentUser().realName,
              })(<span>{projectInfo.createdByName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.enabledFlag`).d('是否启用')} {...formLayOut}>
              {getFieldDecorator('enabledFlag', {
                initialValue: projectInfo.enabledFlag === 0 ? projectInfo.enabledFlag : enabledFlag,
              })(<span>{yesOrNoRender(projectInfo.enabledFlag)}</span>)}
            </FormItem>
          </Col>
          {/* <Col span={8} /> */}
        </Row>
        <Row gutter={48}>
          <Col span={24}>
            <FormItem
              label={intl.get(`${promptCode}.projectPurAgents`).d('项目采购负责人')}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 13 }}
            >
              {getFieldDecorator('projectPurAgentNames', {
                initialValue: projectPurAgents.map((i) => i.userName),
              })(<span>{projectPurAgents.map((i) => i.userName)}</span>)}
              {getFieldDecorator('projectPurAgentIds', {
                initialValue: projectPurAgents.map((i) => i.userId),
              })(<div />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={24}>
            <FormItem
              label={intl.get('hzero.common.remark').d('备注')}
              labelCol={{ span: 3 }}
              wrapperCol={{ span: 13 }}
            >
              {getFieldDecorator('remark', {
                initialValue: projectInfo.remark,
              })(<span style={{ marginLeft: '-20px' }} rows={2} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading = false,
      tenderPlan: { projectInfo = {}, projectLineInfo = [], projectLinePage = {} },
      customizeCollapse,
      customizeTable,
    } = this.props;
    const columns = [
      {
        title: intl.get('ssrc.common.model.soSend.lineNumber').d('行号'),
        width: 80,
        dataIndex: 'lineNum',
      },
    ];
    const { projectId } = projectInfo;
    const { operationRecordModalVisible, collapseKeys, isPub } = this.state;
    const tableProps = {
      columns,
      dataSource: projectLineInfo,
      pagination: projectLinePage,
      rowKey: 'projectAttributeId',
    };

    const operationRecordProps = {
      visible: operationRecordModalVisible,
      hideModal: () => this.handleModalVisible('operationRecordModalVisible', false),
      projectId,
    };
    const { workflowBusinessKey } = projectInfo;
    const { operationFlags = {}, approvaFlags = {}, approveLoading } = this.state;

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('ssrc.tenderPlan.view.message.title.editProjectInfoView')
            .d('项目信息明细')}
          backPath={isPub ? null : '/ssrc/project-maintenance/list'}
        >
          {approvaFlags[workflowBusinessKey] && !isPub && (
            <PermissionButton
              icon="authorize"
              loading={approveLoading}
              data-name="approve"
              type="c7n-pro"
              onClick={() => this.handleApprove(projectInfo)}
            >
              {intl.get('hzero.common.button.approval').d('审批')}
            </PermissionButton>
          )}
          {operationFlags[workflowBusinessKey]?.REVOKE && !isPub && (
            <PermissionButton
              loading={approveLoading}
              icon="reply"
              type="c7n-pro"
              data-name="revock"
              onClick={() => this.handleRevoke(projectInfo)}
            >
              {intl.get(`hzero.common.button.revokeApproval`).d('撤销审批')}
            </PermissionButton>
          )}
          <Button
            icon="clock-circle-o"
            data-name="history"
            onClick={() => this.handleModalVisible('operationRecordModalVisible', true)}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={loading}>
            <div className={tenderplanCss.tender_plan}>
              {customizeCollapse(
                {
                  code: 'SSRC.PROJECT_UPDATE.COLLAPSE',
                },
                <Collapse
                  forceRender
                  className={tenderplanCss['form-collapse']}
                  defaultActiveKey={collapseKeys}
                  onChange={this.onCollapseChange}
                >
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get('ssrc.tenderPlan.view.message.title.collapseHeader')
                            .d('项目基础信息')}
                        </h3>
                        <a>
                          {collapseKeys.includes('headerInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('headerInfo') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="headerInfo"
                  >
                    {this.renderBaseForm()}
                  </Panel>
                  <Panel
                    showArrow={false}
                    header={
                      <Fragment>
                        <h3>
                          {intl
                            .get('ssrc.tenderPlan.view.message.title.collapseLine')
                            .d('项目行信息')}
                        </h3>
                        <a>
                          {collapseKeys.includes('lineInfo')
                            ? intl.get(`hzero.common.button.up`).d('收起')
                            : intl.get(`hzero.common.button.expand`).d('展开')}
                        </a>
                        <Icon type={collapseKeys.includes('lineInfo') ? 'up' : 'down'} />
                      </Fragment>
                    }
                    key="lineInfo"
                  >
                    <div>
                      {customizeTable(
                        { code: 'SSRC.PROJECT_UPDATE.LINE_INFO' },
                        <Table {...tableProps} />
                      )}
                    </div>
                  </Panel>
                </Collapse>
              )}
            </div>
          </Spin>
        </Content>
        {operationRecordModalVisible && <OperationRecord {...operationRecordProps} />}
      </React.Fragment>
    );
  }
}
