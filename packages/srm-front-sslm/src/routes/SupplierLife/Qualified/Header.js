/**
 * 申请单头部
 * @date: 2018-9-10
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import { getCurrentTenant } from 'utils/utils';
import { yesOrNoRender, dateTimeRender } from 'utils/renderer';
import '@/routes/index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 合格评审单头部
 * @extends {Component} - PureComponent
 * @return React.element
 */
@connect(({ commonApplication }) => ({
  commonApplication,
}))
export default class QualifiedHeader extends PureComponent {
  @Bind()
  scoreTemplateOnChange(record) {
    const {
      form,
      updateTemplate,
      emptyTemplate,
      data: { supplierCompanyId, toStageId } = {},
      dispatch,
      handleClearScorer,
      clearScorerSelectRow = () => {},
    } = this.props;
    const { templateName, templateId } = record;
    dispatch({
      type: 'commonApplication/validateSuitable',
      payload: {
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
      form,
      customizeForm,
      form: { getFieldDecorator },
      data = {},
      isEdit,
      scoreEdit,
      custLoading,
      pubEditFlag = false,
    } = this.props;
    const { processStatus } = data;

    const headerData = {
      ...data,
      // 给个性化二开tab这种的需求取禁用标识
      headerReadOnlyFlag: !(isEdit || scoreEdit || pubEditFlag) && processStatus !== 'SCORED',
    };

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.QUALIFIED_HEADER',
        form,
        dataSource: headerData,
        readOnly: !(isEdit || scoreEdit || pubEditFlag) && processStatus !== 'SCORED',
      },
      <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.applicationNumber').d('申请单号')}
            >
              {getFieldDecorator('qualifiedNumber', {
                initialValue: data.qualifiedNumber,
              })(<span>{data.qualifiedNumber}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.supplierCompanyNum')
                .d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: data.supplierCompanyNum,
              })(<span>{data.supplierCompanyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.supplierCompanyName')
                .d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: data.supplierCompanyName,
              })(<span>{data.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.stageDescription').d('当前阶段')}
            >
              {getFieldDecorator('stageDescription', {
                initialValue: data.stageDescription,
              })(<span>{data.stageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.creationDate').d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: data.creationDate,
              })(<span>{dateTimeRender(data.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: data.realName || data.loginName,
              })(<span>{data.realName || data.loginName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.commonApplication.model.coApp.targetStageDescription')
                .d('目标阶段')}
            >
              {getFieldDecorator('toStageDescription', {
                initialValue: data.toStageDescription || data.targetStageDescription,
              })(<span>{data.toStageDescription || data.targetStageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyNum').d('公司编码')}
            >
              {getFieldDecorator('companyNum', { initialValue: data.companyNum })(
                <span>{data.companyNum}</span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyName').d('公司名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: data.companyName,
              })(<span>{data.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.templateId').d('评分要素编码')}
            >
              {getFieldDecorator('templateId', {
                initialValue: data.templateId,
              })(
                scoreEdit ? (
                  <Lov
                    code="SSLM.KPI_EVAL_TPL_HGGYSZR"
                    textValue={data.templateCode}
                    onOk={this.scoreTemplateOnChange}
                    queryParams={{
                      tenantId: getCurrentTenant().tenantId,
                      companyId: data.companyId,
                    }}
                    onClear={this.scoreLovClear}
                  />
                ) : (
                  <span>{data.templateCode}</span>
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
                initialValue: data.templateName,
              })(<span>{data.templateName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus', {
                initialValue: processStatus,
              })(<span>{data.processStatusMeaning}</span>)}
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
                initialValue: data.score,
              })(<span>{data.score}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.score.scoreLevelDesc').d('等级')}
            >
              {getFieldDecorator('scoreLevelDesc', {
                initialValue: data.scoreLevelDesc,
              })(<span>{data.scoreLevelDesc}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.authorized').d('特准供应商')}
            >
              {getFieldDecorator('authorizeFlag', {
                initialValue: data.authorizeFlag || 0,
              })(isEdit ? <Checkbox /> : yesOrNoRender(data.authorizeFlag || 0))}
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
                initialValue: data.weightedFlag || 0,
              })(yesOrNoRender(data.weightedFlag || 0))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.triggerEvent').d('触发事件')}
            >
              {getFieldDecorator('triggerEvent', {
                initialValue: data.triggerEvent,
              })(<span>{data.triggerEventMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={24}>
            <FormItem label={intl.get('sslm.commonApplication.model.qualified.remark').d('说明')}>
              {getFieldDecorator('remark', {
                initialValue: data.remark,
              })(
                isEdit ? (
                  <TextArea style={{ resize: 'none' }} />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{data.remark}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
