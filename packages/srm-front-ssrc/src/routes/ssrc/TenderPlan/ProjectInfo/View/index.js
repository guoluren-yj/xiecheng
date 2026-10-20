/**
 * ProjectInfoForm - 项目信息维护子界面
 * @date: 2019-4-17
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Spin } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz';
import common from '@/routes/ssrc/common.less';
import CPopover from '@/routes/ssrc/components/CPopover';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';

const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const promptCode = 'ssrc.tenderPlan.model.tenderPlan';
const { TextArea } = Input;

@withCustomize({
  unitCode: ['SSRC.PROJECT_UPDATE.DETAIL_VIEW'],
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
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidMount() {
    this.handelSearchProjectInfo();
    this.queryValueCode();
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'tenderPlan/updateState',
      payload: {
        projectInfo: {},
      },
    });
  }

  // 判断是否/pub 页面
  isPubPage = () => {
    const {
      match: { path = null },
    } = this.props;
    const IsPublic = path && path.includes('/pub');
    return IsPublic;
  };

  /**
   * 查询项目信息- 明细
   */
  @Bind()
  handelSearchProjectInfo() {
    const {
      dispatch,
      match: { params = {} },
    } = this.props;
    const { projectId = null } = params;

    if (projectId) {
      dispatch({
        type: 'tenderPlan/fetchProjectInfoDetail',
        payload: {
          projectId,
          customizeUnitCode: 'SSRC.PROJECT_UPDATE.DETAIL_VIEW',
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

  /**
   * 基本信息表单渲染
   */
  renderBaseForm() {
    const {
      form,
      customizeForm,
      tenderPlan: { projectInfo = {} },
    } = this.props;
    const { getFieldDecorator } = form;
    const { projectPurAgents = [] } = projectInfo;
    const agentNameFormatted = form.getFieldValue('projectPurAgentNames');
    const agentNames = agentNameFormatted && agentNameFormatted.join(',');

    return customizeForm(
      {
        code: 'SSRC.PROJECT_UPDATE.DETAIL_VIEW',
        form: this.props.form,
        dataSource: projectInfo,
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
              {getFieldDecorator('companyName', {
                initialValue: projectInfo.companyName,
              })(<span>{projectInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.ouName`).d('业务实体')} {...formLayOut}>
              {getFieldDecorator('ouName', {
                initialValue: projectInfo.ouName,
              })(<span>{projectInfo.ouName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.projectUserName`).d('项目负责人')}
              {...formLayOut}
            >
              {getFieldDecorator('realName', {
                initialValue: projectInfo.realName,
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
              {getFieldDecorator('fundsSourceMeaning', {
                initialValue: projectInfo.fundsSourceMeaning,
              })(<span>{projectInfo.fundsSourceMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.creationDate`).d('创建日期')} {...formLayOut}>
              {getFieldDecorator('creationDate', {
                initialValue: projectInfo.creationDate,
              })(<span>{projectInfo.creationDate}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.createdByName`).d('创建人')} {...formLayOut}>
              {getFieldDecorator('createdByName', {
                initialValue: projectInfo.createdByName,
              })(<span>{projectInfo.createdByName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.enabledFlag`).d('是否启用')} {...formLayOut}>
              {getFieldDecorator('enabledFlag', {
                initialValue: projectInfo.enabledFlag,
              })(<span>{yesOrNoRender(projectInfo.enabledFlag)}</span>)}
            </FormItem>
          </Col>
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
              })(
                <CPopover placement="topLeft" content={agentNames} trigger="hover">
                  <span>{agentNameFormatted}</span>
                </CPopover>
              )}
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
              })(<TextArea style={{ marginLeft: '-20px' }} disabled rows={2} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  renderParent = () => {
    let url = '/ssrc/project-maintenance/list';
    const isPub = this.isPubPage();
    if (isPub) {
      url = null;
    }
    return url;
  };

  render() {
    const { loading = false } = this.props;

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('ssrc.tenderPlan.view.message.title.editProjectInfoView')
            .d('项目信息明细')}
          backPath={this.renderParent()}
        />
        <Content>
          <Spin spinning={loading}>{this.renderBaseForm()}</Spin>
        </Content>
      </React.Fragment>
    );
  }
}
