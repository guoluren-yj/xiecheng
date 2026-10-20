/*
 * ComponentAttrsModal - 组件属性
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import {
  Form,
  Table,
  Output,
  Modal,
  Button,
  DataSet,
  notification,
  Attachment,
  Tooltip,
  Icon,
  TextField,
} from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';

import { getResponse } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';

import FormField from '@/routes/components/FormField';
import ExpressionConfig from '@/routes/components/Investigation/components/ExpressionConfig';
import { num2CodeStr } from '@/routes/components/Investigation/components/ExpressionConfig/utils';
import {
  getExpressionFieldDs,
  getCustomizeExpressionDs,
} from '@/routes/components/Investigation/components/ExpressionConfig/stores';
import { handleSaveExpressionConfig } from '@/services/orgInvestigateTemplateService';
import '../index.less';

/**
 * 组件属性
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@observer
export default class ComponentAttrsModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * 公式配置
   */
  @Bind()
  onOpenExpressionModal(record) {
    const {
      express,
      objectVersionNumber,
      handleRefresh,
      modal,
      isEdit,
      defaultValueEditFlag,
      headerDs,
    } = this.props;
    const defaultValueType = headerDs?.current?.get('defaultValueType');
    const recordData = record.toData();
    const { investgCfHeaderId, investgCfLineId } = recordData;
    // 字段配置ds
    const expressionFieldLineDs = new DataSet(getExpressionFieldDs());
    const customizeExpressDs = new DataSet(getCustomizeExpressionDs());
    expressionFieldLineDs.setQueryParameter('investgCfHeaderId', investgCfHeaderId);
    Modal.open({
      key: Modal.key(),
      title: intl.get(`sslm.investDefOrg.model.investDefOrg.expressionConfig`).d('公式配置'),
      okText: intl.get('hzero.common.button.save').d('保存'),
      okButton: isEdit && defaultValueEditFlag,
      drawer: true,
      movable: false,
      style: { width: 742 },
      bodyStyle: { paddingTop: 0 },
      children: (
        <ExpressionConfig
          record={recordData}
          expressionFieldLineDs={expressionFieldLineDs}
          customizeExpressDs={customizeExpressDs}
          express={express}
        />
      ),
      onOk: async () => {
        const flag =
          (await expressionFieldLineDs.validate()) && (await customizeExpressDs.validate());
        if (flag) {
          const expressionLinesObj = {};
          (expressionFieldLineDs?.toData() || []).forEach((line, idx) => {
            expressionLinesObj[num2CodeStr(idx)] = { ...line };
          });
          const expressionConfig = customizeExpressDs?.current?.toJSONData() || {};
          return handleSaveExpressionConfig({
            express: JSON.stringify({ expressionLinesObj, expressionConfig }),
            objectVersionNumber,
            investgCfLineId,
            defaultValueType,
          }).then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              // 重新查询 todo
              if (handleRefresh) {
                handleRefresh();
              }
              if (modal) {
                modal.close();
              }
            } else {
              return false;
            }
          });
          // return false;
        } else {
          return false;
        }
      },
    });
  }

  // 获取属性描述
  @Bind()
  getAttrDesc(record) {
    const { attributeName, attributeDescription } = record.get([
      'attributeName',
      'attributeDescription',
    ]);
    switch (attributeName) {
      case 'validateRules':
        return (
          <Tooltip
            title={intl
              .get('sslm.common.toolTip.validateRules')
              .d('若填写的数值不在参考区间范围内，可配置强校验或弱校验提示')}
          >
            {attributeDescription}
            <Icon type="help_outline" style={{ marginLeft: 2, marginTop: -4 }} />
          </Tooltip>
        );
      case 'referenceRange':
        return (
          <Tooltip
            title={intl
              .get('sslm.common.toolTip.referenceRange')
              .d('参考区间维护时请按格式(a,b]、[a,b)、(a,b)、[a,b]')}
          >
            {attributeDescription}
            <Icon type="help_outline" style={{ marginLeft: 2, marginTop: -4 }} />
          </Tooltip>
        );
      default:
        return attributeDescription;
    }
  }

  @Bind()
  getColumns() {
    const {
      isEdit = false,
      componentType,
      headerDs,
      defaultValueEditFlag,
      openConditionModal,
    } = this.props;
    const defaultValueType = headerDs?.current.get('defaultValueType');
    const defaultValueExpression =
      ['InputNumber'].includes(componentType) && defaultValueType === 'EXPRESSION';
    const columns = [
      {
        name: 'attributeName',
      },
      {
        name: 'attributeDescription',
        renderer: ({ record }) => {
          return this.getAttrDesc(record);
        },
      },
      {
        name: 'attributeValue',
        width: 350,
        // style: { display: 'flex', justifyContent: 'center' },
        align: 'left',
        editor: record => {
          const attributeName = record.get('attributeName');
          switch (attributeName) {
            case 'defaultValue': {
              // 定义默认值属性
              const formFieldProps = {
                // name,
                isEdit,
                componentType,
                className: 'c7n-form-field-height',
                addonAfterStyle: { height: '0.28rem' },
              };
              if (defaultValueExpression) {
                // 返回false走renderer逻辑处理公式配置
                return false;
              } else {
                return isEdit && defaultValueEditFlag ? FormField(formFieldProps) : false;
              }
            }
            case 'templateAttachmentUUID':
              return (
                <Attachment
                  viewMode="popup"
                  readOnly={!isEdit}
                  bucketName={PRIVATE_BUCKET}
                  // funcType="link"
                />
              );
            case 'pattern':
              return (
                isEdit && (
                  <TextField
                    suffix={
                      <Button
                        funcType="link"
                        onClick={() => {
                          if (openConditionModal) {
                            openConditionModal(record, 'pattern');
                          }
                        }}
                      >
                        {intl.get('sslm.common.model.condition.fx').d('fx')}
                      </Button>
                    }
                  />
                )
              );
            default:
              return isEdit;
          }
        },
        renderer: defaultValueExpression
          ? ({ record, name }) => {
              const attributeName = record.get('attributeName');
              switch (attributeName) {
                case 'defaultValue':
                  if (defaultValueExpression) {
                    return (
                      <Button funcType="link" onClick={() => this.onOpenExpressionModal(record)}>
                        {intl
                          .get(`sslm.supplierModelDefine.model.define.expressionConfig`)
                          .d('公式配置')}
                      </Button>
                    );
                  } else {
                    return <Output record={record} name={name} />;
                  }
                default:
                  return <Output record={record} name={name} />;
              }
            }
          : null,
      },
    ];
    return columns;
  }

  render() {
    const { dataSet, headerDs, componentType, isEdit } = this.props;

    return (
      <React.Fragment>
        <div style={{ marginBottom: 20 }}>
          <Form
            dataSet={headerDs}
            columns={2}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            <FormField name="fieldDescription" isEdit={isEdit} disabled />
            <FormField name="componentTypeMeaning" isEdit={isEdit} disabled />
            {['InputNumber'].includes(componentType) && (
              <FormField componentType="SELECT" name="defaultValueType" isEdit={isEdit} />
            )}
          </Form>
        </div>
        <div style={{ height: 'calc(100% - 62px)' }}>
          <Table
            dataSet={dataSet}
            columns={this.getColumns()}
            virtualCell={false}
            selectionMode="click"
            style={{ maxHeight: '100%' }}
            customizedCode="sslm-investigation-component-attrs" // 没有个性化编码用这种方式实现配置
          />
        </div>
      </React.Fragment>
    );
  }
}
