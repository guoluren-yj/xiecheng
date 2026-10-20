/**
 * 申请单头部
 * @date: 2018-10-22
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Row, Col, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import notification from 'utils/notification';
import { getCurrentTenant } from 'utils/utils';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import Checkbox from 'components/Checkbox';
import '@/routes/index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 申请单头部
 * @extends {Component} - PureComponent
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@connect(({ commonApplication }) => ({
  commonApplication,
}))
export default class HeaderInfo extends PureComponent {
  @Bind()
  scoreTemplateOnChange(record) {
    const {
      form,
      updateTemplate,
      emptyTemplate,
      headerInfo: { supplierCompanyId, toStageId, requisitionId } = {},
      dispatch,
      handleClearScorer,
      clearScorerSelectRow = () => {},
    } = this.props;
    const { templateName, templateId } = record;
    dispatch({
      type: 'commonApplication/validateSuitable', // 评分模版校验
      payload: {
        requisitionId,
        templateId, // 模板id
        supplierCompanyId, // 供应商id
        toStageId, // 目标阶段id
      },
    }).then(res => {
      if (res === 1) {
        updateTemplate(templateId); // 更新评分模板查询
        form.setFieldsValue({
          templateName,
        });
        // 清空评分勾选信息
        clearScorerSelectRow();
      } else {
        emptyTemplate(dispatch); // 更新评分模板查询
        handleClearScorer();
        form.setFieldsValue({
          templateName: null,
          templateCode: null,
          templateId: null,
        });
        notification.info({
          message: intl
            .get('sslm.commonApplication.model.qualifyApplic.validateErr')
            .d('该评分要素编码不包含在供货能力清单下的品类代码中！'),
        });
      }
    });
  }

  // 清空评分要素编码时清空评分信息
  @Bind()
  scoreLovClear() {
    const { form, emptyTemplate, dispatch, handleClearScorer } = this.props;
    emptyTemplate(dispatch);
    form.setFieldsValue({
      templateName: null,
      templateCode: null,
      templateId: null,
    });
    handleClearScorer();
  }

  render() {
    const {
      isEdit,
      scoreEdit,
      customizeForm = () => {},
      custLoading,
      form: { getFieldDecorator },
      headerInfo = {},
      pubEditFlag = false,
    } = this.props;
    const {
      companyId, // 公司Id
      processStatus, // 状态
    } = headerInfo;

    const headerData = {
      ...headerInfo,
      // 给个性化二开tab这种的需求取禁用标识
      headerReadOnlyFlag: !(isEdit || scoreEdit || pubEditFlag) || processStatus === 'SCORED',
    };

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.RECOMMEND_HEADER',
        form: this.props.form,
        dataSource: headerData,
        readOnly: !(isEdit || scoreEdit || pubEditFlag) || processStatus === 'SCORED',
      },
      <Form className="ued-edit-form" custLoading={custLoading} style={{ padding: '0 16px' }}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.commonApplication.appNumber`)
                .d('申请单号')}
            >
              {getFieldDecorator('recommendNumber', {
                initialValue: headerInfo.recommendNumber,
              })(<span>{headerInfo.recommendNumber}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: headerInfo.supplierCompanyNum,
              })(<span>{headerInfo.supplierCompanyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: headerInfo.supplierCompanyName,
              })(<span>{headerInfo.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.commonApplication.stageDesc`)
                .d('当前阶段')}
            >
              {getFieldDecorator('stageDescription', {
                initialValue: headerInfo.stageDescription,
              })(<span>{headerInfo.stageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.commonApplication.creationDate`)
                .d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateTimeRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: headerInfo.realName || headerInfo.loginName,
              })(<span>{headerInfo.realName || headerInfo.loginName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.commonApplication.targetStage`)
                .d('目标阶段')}
            >
              {getFieldDecorator('targetStageDescription', {
                initialValue: headerInfo.toStageDescription || headerInfo.targetStageDescription,
              })(<span>{headerInfo.toStageDescription || headerInfo.targetStageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.commonApplication.companyNum`)
                .d('公司编码')}
            >
              {getFieldDecorator('companyNum', {
                initialValue: headerInfo.companyNum,
              })(<span>{headerInfo.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.commonApplication.model.commonApplication.companyName`)
                .d('公司名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: headerInfo.companyName,
              })(<span>{headerInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.templateId').d('评分要素编码')}
            >
              {getFieldDecorator('templateId', {
                initialValue: headerInfo.templateId,
              })(
                scoreEdit ? (
                  <Lov
                    code="SSLM.KPI_EVAL_TPL_HGGYSZR"
                    textValue={headerInfo.templateCode}
                    onOk={this.scoreTemplateOnChange}
                    queryParams={{
                      tenantId: getCurrentTenant().tenantId,
                      companyId,
                    }}
                    onClear={this.scoreLovClear}
                  />
                ) : (
                  <span>{headerInfo.templateCode}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.templateName').d('评分要素描述')}
            >
              {getFieldDecorator('templateName', {
                initialValue: headerInfo.templateName,
              })(<span>{headerInfo.templateName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus', {
                initialValue: headerInfo.processStatus,
              })(<span>{headerInfo.processStatusMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.score.goal').d('得分')}
            >
              {getFieldDecorator('score', {
                initialValue: headerInfo.score,
              })(<span>{headerInfo.score}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.score.scoreLevelDesc').d('等级')}
            >
              {getFieldDecorator('scoreLevelDesc', {
                initialValue: headerInfo.scoreLevelDesc,
              })(<span>{headerInfo.scoreLevelDesc}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.authorized').d('特准供应商')}
            >
              {getFieldDecorator('authorizeFlag', {
                initialValue: headerInfo.authorizeFlag || 0,
              })(isEdit ? <Checkbox /> : yesOrNoRender(headerInfo.authorizeFlag || 0))}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.weightFlag').d('权重式计算')}
            >
              {getFieldDecorator('weightedFlag', {
                initialValue: headerInfo.weightedFlag || 0,
              })(yesOrNoRender(headerInfo.weightedFlag || 0))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.triggerEvent').d('触发事件')}
            >
              {getFieldDecorator('triggerEvent', {
                initialValue: headerInfo.triggerEvent,
              })(<span>{headerInfo.triggerEventMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={24}>
            <FormItem label={intl.get(`sslm.commonApplication.model.recommend.remark`).d('说明')}>
              {getFieldDecorator('remark', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`sslm.commonApplication.model.recommend.remark`).d('说明'),
                    }),
                  },
                ],
                initialValue: headerInfo.remark,
              })(
                isEdit ? (
                  <TextArea style={{ resize: 'none' }} />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{headerInfo.remark}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
