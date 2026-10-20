/**
 * InstanceDrawer - 新建/编辑实例弹窗
 * @date: 2019/8/27
 * @author: hulingfangzi <lingfangzi.hu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import {
  Modal as C7nModal,
  Form,
  DataSet,
  TextField,
  NumberField,
  Switch,
  Output,
  Lov,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import { FieldMapping, DataMapping } from '@/components/Transform';
import MappingClassModal from '@/components/MappingClassModal';
import getLang from '@/langs/typeDefinitionLang';
import getServiceLang from '@/langs/serviceLang';
import { queryMappingClass, testMappingClass } from '@/services/typeDefinitionService';
import { instFormDS } from '@/stores/TypeDefinition/typeDefinitionDS';

/**
 * 新建/编辑实例弹窗
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class InstanceDrawer extends Component {
  constructor(props) {
    super(props);

    this.formDS = new DataSet(instFormDS());

    this.state = {
      isCreate: false,
      currentCode: '',
      isShowModal: false,
    };
  }

  componentDidMount() {
    const { applicationInstId } = this.props;
    if (!isUndefined(applicationInstId)) {
      this.formDS.setQueryParameter('applicationInstId', applicationInstId);
      this.formDS.query();
    } else {
      this.formDS.create();
    }
    this.props.modal.update({
      onOk: this.handleSave,
    });
    this.setState({
      isCreate: isUndefined(applicationInstId),
    });
  }

  /**
   * 创建应用实例
   */
  @Bind()
  async handleSave() {
    const { applicationId, tenantId, onSave } = this.props;
    this.formDS.current.set('applicationId', applicationId);
    this.formDS.current.set('tenantId', tenantId);
    const validate = await this.formDS.validate();
    if (validate) {
      return onSave(() => this.formDS.submit());
    }
  }

  /**
   * 显示映射类弹窗
   */
  @Bind()
  async handleOpenMappingClassModal() {
    const { applicationInstId, mappingClass } = this.formDS.current.toData();
    const { currentCode } = this.state;
    const params = applicationInstId ? { applicationInstId } : {};
    let code = '';
    if (currentCode) {
      code = currentCode;
    } else if (mappingClass) {
      code = mappingClass;
    } else {
      await queryMappingClass(params).then((res) => {
        if (res && !res.failed) {
          code = res.template;
        }
      });
    }
    this.setState({
      currentCode: code,
      isShowModal: true,
    });
  }

  /**
   * 关闭映射类弹窗
   */
  @Bind()
  handleCloseMappingClassModal(value) {
    this.setState({
      isShowModal: false,
      currentCode: value,
    });
  }

  /**
   * 测试映射类
   * @param {string} value - 映射类代码
   */
  @Bind()
  handleTestMappingClass(value, cb = (e) => e) {
    const { applicationInstId } = this.formDS.current.toData();
    this.setState({
      currentCode: value,
    });
    const payload = { value };
    if (!isUndefined(applicationInstId)) {
      payload.applicationInstId = applicationInstId;
    }
    return testMappingClass(payload).then((res) => {
      if (res && !res.failed) {
        notification.success();
        cb(res);
      }
    });
  }

  /**
   * 打开字段映射弹窗
   */
  @Bind()
  handleOpenFieldMappingDrawer(level) {
    const {
      tenantId,
      namespace,
      serverCode,
      interfaceCode,
      instInterfaceId,
      applicationInstId,
      applicationCode,
    } = this.props;
    const fieldMappingProps = {
      readOnly: false,
      tenantId,
      namespace,
      serverCode,
      interfaceCode,
      applicationCode,
      applicationInstId,
      interfaceId: instInterfaceId,
      transformLevel: level,
      sourceFunc: 'typeDefinition',
      sourceRef: 'HZERO-INTERFACE-COMPOSITE',
    };
    C7nModal.open({
      title: getServiceLang('MAINTAIN_FIELD_MAPPING'),
      drawer: true,
      closable: true,
      style: { width: 1300 },
      children: <FieldMapping {...fieldMappingProps} />,
    });
  }

  /**
   * 打开数据映射弹窗
   */
  @Bind()
  handleOpenDataMappingDrawer(level) {
    const {
      tenantId,
      namespace,
      serverCode,
      interfaceCode,
      instInterfaceId,
      applicationInstId,
      applicationCode,
      serviceType,
    } = this.props;
    const dataMappingProps = {
      readOnly: false,
      tenantId,
      namespace,
      serverCode,
      interfaceCode,
      applicationInstId,
      applicationCode,
      castLevel: level,
      interfaceId: instInterfaceId,
      dataType: serviceType,
      sourceFunc: 'typeDefinition',
      sourceRef: 'HZERO-INTERFACE-COMPOSITE',
    };
    C7nModal.open({
      title: getServiceLang('MAINTAIN_DATA_MAPPING'),
      drawer: true,
      closable: true,
      style: { width: 1200 },
      children: <DataMapping {...dataMappingProps} />,
    });
  }

  render() {
    const { composePolicy } = this.props;
    const { isCreate, currentCode, isShowModal } = this.state;
    return (
      <>
        <Form dataSet={this.formDS} columns={2} labelWidth={120} labelLayout="horizontal">
          <Lov name="instInterfaceLov" disabled={!isCreate} />
          <TextField name="interfaceName" disabled={!isCreate} />
          {composePolicy === 'WEIGHT' ? (
            <NumberField name="weight" />
          ) : (
            <NumberField name="orderSeq" />
          )}
          <TextField name="remark" />
          <Switch name="enabledFlag" />
          <Output
            name="instanceClass"
            renderer={() => {
              return (
                <a onClick={this.handleOpenMappingClassModal}>{getLang('MAPPING_CLASS_DETAIL')}</a>
              );
            }}
          />
          <Output
            name="requestMapping"
            renderer={() => {
              return (
                <a disabled={isCreate} onClick={() => this.handleOpenFieldMappingDrawer('REQUEST')}>
                  {getServiceLang('MAINTAIN_REQUEST_MAPPING')}
                </a>
              );
            }}
          />
          <Output
            name="responseMapping"
            renderer={() => {
              return (
                <a
                  disabled={isCreate}
                  onClick={() => this.handleOpenFieldMappingDrawer('RESPONSE')}
                >
                  {getServiceLang('MAINTAIN_RESPONSE_MAPPING')}
                </a>
              );
            }}
          />
          <Output
            name="requestDataMapping"
            renderer={() => {
              return (
                <a disabled={isCreate} onClick={() => this.handleOpenDataMappingDrawer('REQUEST')}>
                  {getServiceLang('MAINTAIN_REQUEST_DATA_MAPPING')}
                </a>
              );
            }}
          />
          <Output
            name="responseDataMapping"
            renderer={() => {
              return (
                <a disabled={isCreate} onClick={() => this.handleOpenDataMappingDrawer('RESPONSE')}>
                  {getServiceLang('MAINTAIN_RESPONSE_DATA_MAPPING')}
                </a>
              );
            }}
          />
        </Form>
        <MappingClassModal
          data={currentCode}
          loading={false}
          testLoading={false}
          visible={isShowModal}
          onCancel={this.handleCloseMappingClassModal}
          onTest={this.handleTestMappingClass}
        />
      </>
    );
  }
}
