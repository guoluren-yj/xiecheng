/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/7/8
 * @copyright HAND ® 2020
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { DataSet, Form, Modal, TextField, CodeArea, Select, Spin, Button } from 'choerodon-ui/pro';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import {
  getResponse,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'hzero-front/lib/utils/utils';
import { routerRedux } from 'dva/router';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import YAMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/YAMLFormatter';
import 'choerodon-ui/pro/lib/code-area/lint/json';
import CollapsePanel from '@/components/CollapsePanel';
import FieldMapping from '@/components/FieldMapping';
import { formDS, enableDS, disableDS } from '@/stores/components/Transform/FieldMappingDS';
import getLang from '@/langs/fieldMappingLang';
import getServiceLang from '@/langs/serviceLang';
import { SERVICE_CONSTANT, TRANSFORM_TYPE, TRANSFORM_STATUS } from '@/constants/constants';
import { fieldMappingTest, documentBodyContent } from '@/services/fieldMappingService';
import XmlFormatter from '@/components/XmlFormatter';
import LogArea from '@/components/LogArea';

export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: isTenantRoleLevel() ? getCurrentOrganizationId() : props.tenantId,
      debugLoading: false,
      transformType: '',
      sourceInputData: '',
      targetInputData: '',
      mappingTraceContent: '',
    };
    this.detailFormDS = new DataSet({
      ...formDS({
        sourceFunc: props.sourceFunc,
        onFieldUpdate: this.handleFieldUpdate,
      }),
    });
  }

  componentDidMount() {
    this.handleFetchDetail();
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'transformType') {
      const [sourceType, targetType] = isEmpty(value) ? [] : value.split('_TO_');
      this.setState({ sourceType, targetType, transformType: this.getTransformType(value) });
    }
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp(res) {
    const { readOnly } = this.state;
    const { PUBLISHED } = TRANSFORM_STATUS;
    this.props.modal.update({
      footer: (_okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          {res && PUBLISHED !== res.statusCode && (
            <ButtonPermission type="c7n-pro" onClick={this.handlePublish}>
              {getLang('RELEASE')}
            </ButtonPermission>
          )}
          {res && PUBLISHED === res.statusCode && (
            <ButtonPermission type="c7n-pro" onClick={this.handleOffline}>
              {getLang('OFFLINE')}
            </ButtonPermission>
          )}
          <ButtonPermission
            type="c7n-pro"
            color="primary"
            disabled={readOnly}
            onClick={this.handleSave}
          >
            {getLang('SAVE')}
          </ButtonPermission>
        </>
      ),
    });
  }

  getTransformType(transformType) {
    let type = transformType;
    switch (type) {
      case TRANSFORM_TYPE.REST_TO_REST:
        type = SERVICE_CONSTANT.REST;
        break;
      case TRANSFORM_TYPE.REST_TO_SOAP:
        type = SERVICE_CONSTANT.REST_SOAP;
        break;
      case TRANSFORM_TYPE.SOAP_TO_SOAP:
        type = SERVICE_CONSTANT.SOAP;
        break;
      case TRANSFORM_TYPE.SOAP_TO_REST:
        type = SERVICE_CONSTANT.SOAP_REST;
        break;
      default:
        type = SERVICE_CONSTANT.REST;
        break;
    }
    return type;
  }

  /**
   * 查询
   */
  async handleFetchDetail() {
    const {
      namespace,
      serverCode,
      interfaceCode,
      transformLevel,
      applicationCode,
      applicationInstId,
      sourceRef,
      readOnly,
    } = this.props;
    const { tenantId } = this.state;
    this.detailFormDS.setQueryParameter('namespace', namespace);
    this.detailFormDS.setQueryParameter('serverCode', serverCode);
    this.detailFormDS.setQueryParameter('interfaceCode', interfaceCode);
    this.detailFormDS.setQueryParameter('transformLevel', transformLevel);
    this.detailFormDS.setQueryParameter('level', transformLevel);
    this.detailFormDS.setQueryParameter('applicationCode', applicationCode);
    this.detailFormDS.setQueryParameter('sourceRef', sourceRef);
    this.detailFormDS.setQueryParameter('tenantId', tenantId);
    const res = await this.detailFormDS.query();
    if (res) {
      const { sourceStructure, targetStructure, transformScript, transformType, statusCode } = res;
      const [sourceType, targetType] = transformType.split('_TO_');
      this.setState({
        sourceType,
        targetType,
        script: transformScript,
        sourceInputData: sourceStructure,
        targetInputData: targetStructure,
        readOnly: readOnly || statusCode === TRANSFORM_STATUS.PUBLISHED,
        transformType: this.getTransformType(transformType),
      });
    } else {
      this.detailFormDS.create({
        tenantId,
        namespace,
        serverCode,
        interfaceCode,
        transformLevel,
      });
    }
    this.detailFormDS.current.set('applicationCode', applicationCode);
    this.detailFormDS.current.set('interfaceCode', interfaceCode);
    this.detailFormDS.current.set('applicationInstId', applicationInstId);

    this.handleUpdateModalProp(res);
  }

  /**
   * 接口文档数据导入
   */
  @Bind()
  handleFetchDocumentContent() {
    const { interfaceId, interfaceTenantId } = this.props;
    Modal.confirm({
      title: getLang('CONFIRM'),
      children: (
        <div>
          <p>{getLang('IMPORT_CONFIRM_TIP')}</p>
        </div>
      ),
    }).then((result) => {
      if (result) {
        documentBodyContent({ interfaceId, tenantId: interfaceTenantId }).then((res) => {
          if (getResponse(res)) {
            const { sourceContent, targetContent } = res;
            this.handleSetValue({
              sourceInputData: sourceContent,
              targetInputData: targetContent,
            });
          }
        });
      }
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.detailFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    if (isEmpty(this.detailFormDS.current.get('transformScript'))) {
      notification.error({
        message: getLang('EMPTY_SCRIPT'),
      });
      return false;
    }
    return this.detailFormDS.submit().then((res) => {
      if (res && !res.failed) {
        this.handleFetchDetail();
      }
    });
  }

  /**
   * 调试
   */
  @Bind()
  handleDebugExecute() {
    const { interfaceId, namespace, serverCode, interfaceCode, transformLevel } = this.props;
    const { tenantId, sourceInputData, script, transformType } = this.state;
    if (!transformType) {
      notification.error({
        message: getLang('TRANSFORM_TYPE_REQUIRED'),
      });
      return false;
    }
    if (!sourceInputData) {
      notification.error({
        message: getLang('FIELD_CONFIG_REQUIRED'),
      });
      return false;
    }
    if (!script) {
      notification.error({
        message: getLang('SCRIPT_REQUIRED'),
      });
      return false;
    }
    this.setState({ targetContent: '', debugLoading: true });
    fieldMappingTest({
      tenantId,
      interfaceId,
      namespace,
      serverCode,
      interfaceCode,
      level: transformLevel,
      sourceContent: sourceInputData,
      configVO: {
        dataType: transformType,
        fieldMappingConfig: {
          transformScript: script,
        },
      },
    }).then((res) => {
      if (res.failed) {
        notification.error({
          message: res.message,
        });
        this.setState({ debugLoading: false });
      } else {
        this.setState({
          targetContent: res.targetContent,
          mappingTraceContent: res.mappingTraceContent,
          debugLoading: false,
        });
      }
    });
  }

  /**
   * 下线
   */
  @Bind()
  handleOffline() {
    const { sourceFunc } = this.props;
    const data = this.detailFormDS.current.toData();
    const tempDisableDS = new DataSet(disableDS({ sourceFunc }));
    tempDisableDS.create(data);
    return tempDisableDS.submit().then((res) => {
      if (res && !res.failed) {
        this.handleFetchDetail();
      }
    });
  }

  /**
   * 发布
   */
  @Bind()
  handlePublish() {
    const { sourceFunc } = this.props;
    const data = this.detailFormDS.current.toData();
    const tempEnableDS = new DataSet(enableDS({ sourceFunc }));
    tempEnableDS.create(data);
    return tempEnableDS.submit().then((res) => {
      if (res && !res.failed) {
        this.handleFetchDetail();
      }
    });
  }

  /**
   * 跳转到明细页面
   * @param {*} id
   */
  @Bind()
  handleGotoDetail(id) {
    const { dispatch = () => {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/field-mapping/detail/${id}`,
      })
    );
  }

  @Bind()
  handleSetValue(params) {
    const { script, sourceInputData, targetInputData } = params;
    if (script) {
      this.detailFormDS.current.set('transformScript', script);
      this.setState({ script });
    }
    if (sourceInputData) {
      this.detailFormDS.current.set('sourceStructure', sourceInputData);
      this.setState({ sourceInputData });
    }
    if (targetInputData) {
      this.detailFormDS.current.set('targetStructure', targetInputData);
      this.setState({ targetInputData });
    }
  }

  @Bind()
  openLogAreaDrawer() {
    const { mappingTraceContent } = this.state;
    const logAreaProps = {
      content: mappingTraceContent,
    };
    Modal.open({
      title: getLang('DEBUG_LOG'),
      drawer: true,
      style: { width: 1000 },
      children: <LogArea {...logAreaProps} />,
      okText: getLang('CLOSE'),
      footer: (okBtn) => okBtn,
    });
  }

  render() {
    const { readOnly } = this.state;
    const {
      script,
      sourceType,
      targetType,
      targetContent,
      debugLoading,
      transformType = '',
      sourceInputData,
      targetInputData,
    } = this.state;
    const fieldMappingProps = {
      script,
      sourceType,
      targetType,
      sourceInputData,
      targetInputData,
      edit: !readOnly,
      arrowId: 'typeDefinition',
      otherButtons: [
        {
          key: 'document',
          show: true,
          title: getLang('DOCUMENT'),
          action: this.handleFetchDocumentContent,
        },
      ],
      onGetValue: this.handleSetValue,
    };
    return (
      <Spin dataSet={this.detailFormDS}>
        <CollapsePanel
          eles={[
            {
              key: 'basic',
              title: getLang('BASIC_INFO'),
              ele: (
                <Form
                  labelLayout="horizontal"
                  dataSet={this.detailFormDS}
                  columns={3}
                  disabled={readOnly}
                >
                  <Select name="transformType" />
                  <TextField name="versionDesc" disabled />
                  <Select name="statusCode" disabled />
                </Form>
              ),
            },
            {
              key: 'detail',
              title: getLang('DETAIL_INFO'),
              ele: <FieldMapping {...fieldMappingProps} />,
            },
            {
              key: 'debug',
              title: getLang('DEBUG'),
              defaultExpand: false,
              ele: (
                <Spin spinning={debugLoading}>
                  <div>
                    <div style={{ float: 'left', lineHeight: '28px' }}>
                      {getServiceLang('RESULT_DATA')}:
                    </div>
                    <div style={{ float: 'right', marginBottom: '5px' }}>
                      <Button onClick={() => this.openLogAreaDrawer()}>
                        {getLang('DEBUG_LOG')}
                      </Button>
                      <Button color="primary" onClick={() => this.handleDebugExecute()}>
                        {getLang('DEBUG')}
                      </Button>
                    </div>
                    <div style={{ clear: 'both' }} />
                  </div>
                  <CodeArea
                    style={{ height: 300 }}
                    value={
                      targetContent &&
                      (transformType === SERVICE_CONSTANT.REST
                        ? JSON.stringify(JSON.parse(targetContent), null, 4)
                        : XmlFormatter(targetContent))
                    }
                    formatter={transformType ? JSONFormatter : YAMLFormatter}
                    options={{
                      mode: transformType ? { name: 'javascript', json: true } : 'yaml',
                      lineWrapping: true,
                      styleActiveLine: true,
                    }}
                    readOnly
                  />
                </Spin>
              ),
            },
          ]}
        />
      </Spin>
    );
  }
}
