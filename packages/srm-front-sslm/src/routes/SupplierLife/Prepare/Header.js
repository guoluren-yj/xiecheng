/**
 * 申请单头部
 * @date: 2018-9-10
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { Row, Col, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';
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
 * 预留评审单头部
 * @extends {Component} - PureComponent
 * @return React.element
 */
@connect(({ commonApplication }) => ({
  commonApplication,
}))
export default class PrepareHeader extends PureComponent {
  @Bind()
  scoreTemplateOnChange(record) {
    const {
      form,
      updateTemplate,
      emptyTemplate,
      prepareHeader: { supplierCompanyId, toStageId } = {},
      dispatch,
      handleClearScorer,
      clearScorerSelectRow = () => {},
    } = this.props;
    const { templateName, templateId } = record;
    dispatch({
      type: 'commonApplication/validateSuitable', // 评分模版校验
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
      isEdit,
      scoreEdit,
      custLoading,
      customizeForm,
      form: { getFieldDecorator },
      prepareHeader,
      pubEditFlag = false,
      preparedRemote,
    } = this.props;
    const {
      processStatus,
      companyId, // 公司Id
    } = prepareHeader;

    const headerData = {
      ...prepareHeader,
      // 给个性化二开tab这种的需求取禁用标识
      headerReadOnlyFlag: !(isEdit || scoreEdit || pubEditFlag) && processStatus !== 'SCORED',
    };

    // 埋点参数
    const headerRemoteProps = {
      form,
      isEdit,
      FormItem,
      formItemLayout,
      dataSource: headerData,
    };

    // 埋点行
    const remoteRows = preparedRemote ? (
      preparedRemote.process('SSLM_SUPPlIERLIFE_PREPARE.PREPARE_HEADER', <></>, headerRemoteProps)
    ) : (
      <></>
    );

    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.PREPARE_HEADER',
        form: this.props.form,
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
              {getFieldDecorator('prepareNumber', {
                initialValue: prepareHeader.prepareNumber,
              })(<span>{prepareHeader.prepareNumber}</span>)}
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
                initialValue: prepareHeader.supplierCompanyNum,
              })(<span>{prepareHeader.supplierCompanyNum}</span>)}
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
                initialValue: prepareHeader.supplierCompanyName,
              })(<span>{prepareHeader.supplierCompanyName}</span>)}
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
                initialValue: prepareHeader.stageDescription,
              })(<span>{prepareHeader.stageDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.creationDate').d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: prepareHeader.creationDate,
              })(<span>{dateTimeRender(prepareHeader.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: prepareHeader.realName || prepareHeader.loginName,
              })(<span>{prepareHeader.realName || prepareHeader.loginName}</span>)}
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
              {getFieldDecorator('targetStageDescription', {
                initialValue:
                  prepareHeader.toStageDescription || prepareHeader.targetStageDescription,
              })(
                <span>
                  {prepareHeader.toStageDescription || prepareHeader.targetStageDescription}
                </span>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyNum').d('公司编码')}
            >
              {getFieldDecorator('companyNum', {
                initialValue: prepareHeader.companyNum,
              })(<span>{prepareHeader.companyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.coApp.companyName').d('公司名称')}
            >
              {getFieldDecorator('companyName', {
                initialValue: prepareHeader.companyName,
              })(<span>{prepareHeader.companyName}</span>)}
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
                initialValue: prepareHeader.templateId,
              })(
                scoreEdit ? (
                  <Lov
                    code="SSLM.KPI_EVAL_TPL_HGGYSZR"
                    textValue={prepareHeader.templateCode}
                    onOk={this.scoreTemplateOnChange}
                    // disabled={!!qualifiedNumber}
                    queryParams={{
                      tenantId: getCurrentTenant().tenantId,
                      companyId,
                    }}
                    onClear={this.scoreLovClear}
                  />
                ) : (
                  <span>{prepareHeader.templateCode}</span>
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
                initialValue: prepareHeader.templateName,
              })(<span>{prepareHeader.templateName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('processStatus', {
                initialValue: prepareHeader.processStatus,
              })(<span>{prepareHeader.processStatusMeaning}</span>)}
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
                initialValue: prepareHeader.score,
              })(<span>{prepareHeader.score}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.score.scoreLevelDesc').d('等级')}
            >
              {getFieldDecorator('scoreLevelDesc', {
                initialValue: prepareHeader.scoreLevelDesc,
              })(<span>{prepareHeader.scoreLevelDesc}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.authorized').d('特准供应商')}
            >
              {getFieldDecorator('authorizeFlag', {
                initialValue: prepareHeader.authorizeFlag || 0,
              })(isEdit ? <Checkbox /> : yesOrNoRender(prepareHeader.authorizeFlag || 0))}
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
                initialValue: prepareHeader.weightedFlag || 0,
              })(yesOrNoRender(prepareHeader.weightedFlag || 0))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.commonApplication.model.supplier.triggerEvent').d('触发事件')}
            >
              {getFieldDecorator('triggerEvent', {
                initialValue: prepareHeader.triggerEvent,
              })(<span>{prepareHeader.triggerEventMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={24}>
            <FormItem label={intl.get('sslm.commonApplication.model.prepare.remark').d('说明')}>
              {getFieldDecorator('remark', {
                initialValue: prepareHeader.remark,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.commonApplication.model.prepare.remark').d('说明'),
                    }),
                  },
                ],
              })(
                isEdit ? (
                  <TextArea style={{ resize: 'none' }} />
                ) : (
                  <span style={{ whiteSpace: 'pre-wrap' }}>{prepareHeader.remark}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        {remoteRows}
      </Form>
    );
  }
}
