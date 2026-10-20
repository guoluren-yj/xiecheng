/**
 * @author fengwanjun<wanjun.feng@hand-china.com>
 * @creationDate 2021/1/18
 * @copyright HAND ® 2021
 */
import React from 'react';
import {
  DataSet,
  CodeArea,
  Spin,
  Button,
  Table,
  Modal,
  Form,
  Select,
  Lov,
  TextField,
} from 'choerodon-ui/pro';
import { Collapse, Card } from 'choerodon-ui';
import { Header, Content } from 'hzero-front/lib/components/Page';
import notification from 'hzero-front/lib/utils/notification';
import { Bind } from 'lodash-decorators';
import { isEmpty, keys } from 'lodash';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import {
  CAST_TYPE_MAP,
  CAST_TYPE_TAGS,
  SERVICE_CONSTANT,
  TRANSFORM_TYPE,
} from '@/constants/constants';
import {
  fieldMappingTest,
  dataMappingTest,
  mappingFlowTest,
  packetMappingLink,
} from '@/services/mappingDebugService';
import getLang from '@/langs/mappingDebugLang';
import JSONFormatter from 'choerodon-ui/pro/lib/code-area/formatters/JSONFormatter';
import YAMLFormatter from 'choerodon-ui/pro/lib/code-area/formatters/YAMLFormatter';
import QuestionPopover from '@/components/QuestionPopover';
import XmlFormatter from '@/components/XmlFormatter';
import FieldMapping from '@/components/FieldMapping';
import {
  headerFormDS,
  fieldConfigDS,
  fieldDataDrawerDS,
  dataConfigDS,
} from '@/stores/MappingDebug/MappingDebugDS';
import { MappingDebugArea } from '@/components/DataMapping';
import LogArea from '@/components/LogArea';
import DataConfigDrawer from './DataConfigLine';
import FormulaDrawer from './FormulaDrawer';
import MappingDrawer from './MappingDrawer';
import ImportMappingConfig from './ImportMappingConfig';

const { Panel } = Collapse;

@formatterCollections({ code: ['hzero.common', getLang('PERFIX')] })
export default class MappingDebug extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceType: 'REST',
      targetType: 'REST',
      fieldSourceContent: '',
      fieldTargetContent: '',
      tenantId: getCurrentOrganizationId(),
      dataDebugLoading: false,
      fieldDebugLoading: false,
      mappingType: SERVICE_CONSTANT.REST,
      mappingTraceContent: '',
    };
    this.headerFormDS = new DataSet(
      headerFormDS({
        onFieldUpdate: this.handleFieldUpdate,
      })
    );
    this.fieldConfigDS = new DataSet({
      ...fieldConfigDS({ _required: false }),
    });
    this.fieldDataDrawerDS = new DataSet(fieldDataDrawerDS());
    this.dataConfigDS = new DataSet({
      ...dataConfigDS(),
    });
  }

  componentDidMount() {
    const { tenantId } = this.state;
    this.fieldConfigDS.create({ tenantId });
    this.headerFormDS.create();
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'dataType') {
      const [sourceType, targetType] = isEmpty(value) ? [] : value.split('_TO_');
      this.setState({ sourceType, targetType, mappingType: this.getTransformType(value) });
    }
  }

  /**
   * 字段映射调试
   */
  @Bind()
  handleFieldDebugExecute() {
    const { tenantId, fieldSourceContent, script, mappingType } = this.state;
    // 映射类型必输
    if (!mappingType) {
      notification.error({
        message: getLang('MAPPING_TYPE_REQUIRED'),
      });
      return false;
    }
    if (!fieldSourceContent) {
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
    this.setState({ resultTargetContent: '', fieldDebugLoading: true });
    fieldMappingTest({
      tenantId,
      sourceContent: fieldSourceContent,
      configVO: {
        dataType: mappingType,
        fieldMappingConfig: {
          transformScript: script,
        },
      },
    }).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      }
      if (res && res.targetContent) {
        this.setState({
          resultTargetContent: res.targetContent,
          fieldMappingTraceContent: res.mappingTraceContent,
        });
      }
      this.setState({ fieldDebugLoading: false });
    });
  }

  /**
   * 数据映射调试
   */
  @Bind()
  async handleDataDebugExecute(sourceContent) {
    const { tenantId, mappingType } = this.state;
    // 映射类型必输
    if (!mappingType) {
      notification.error({
        message: getLang('MAPPING_TYPE_REQUIRED'),
      });
      return false;
    }
    if (!this.dataConfigDS.toData() || this.dataConfigDS.toData().length === 0) {
      notification.error({
        message: getLang('DATA_CONFIG_REQUIRED'),
      });
      return false;
    }
    if (!sourceContent) {
      notification.error({
        message: getLang('SOURCE_DATA_REQUIRED'),
      });
      return false;
    }
    this.setState({ dataTargetContent: '', mappingTraceContent: '', dataDebugLoading: true });
    const res = await dataMappingTest({
      tenantId,
      sourceContent,
      configVO: {
        dataType: mappingType,
        valueMappingConfig: {
          valueMappingLineConfigs: this.dataConfigDS.toData(),
        },
      },
    });
    if (res && res.failed) {
      notification.error({
        message: res.message,
      });
    }
    if (res && res.targetContent) {
      this.setState({
        dataTargetContent: res.targetContent,
        mappingTraceContent: res.mappingTraceContent,
      });
    }
    this.setState({ dataDebugLoading: false });
  }

  /**
   * 流程调试
   */
  @Bind()
  async handleFlowDebugExecute(sourceContent) {
    const { tenantId, fieldSourceContent, fieldTargetContent, script, mappingType } = this.state;
    // 映射类型必输
    if (!mappingType) {
      notification.error({
        message: getLang('MAPPING_TYPE_REQUIRED'),
      });
      return false;
    }
    // 至少需要配置【字段映射】或【数据映射】中的一个
    if (
      (!fieldSourceContent || !fieldTargetContent || !script) &&
      (!sourceContent || !this.dataConfigDS.toData() || this.dataConfigDS.toData().length === 0)
    ) {
      notification.error({
        message: getLang('FIELD_DATA_CONFIG_REQUIRED'),
      });
      return false;
    }
    let params = {};
    if (fieldSourceContent && fieldTargetContent && script) {
      params = {
        tenantId,
        sourceContent: fieldSourceContent,
        configVO: {
          dataType: mappingType,
          fieldMappingConfig: {
            transformScript: script,
          },
        },
      };
    }
    if (sourceContent && this.dataConfigDS.toData() && this.dataConfigDS.toData().length !== 0) {
      params = {
        tenantId,
        sourceContent,
        configVO: {
          dataType: mappingType,
          valueMappingConfig: {
            valueMappingLineConfigs: this.dataConfigDS.toData(),
          },
        },
      };
    }
    this.setState({ dataTargetContent: '', mappingTraceContent: '', dataDebugLoading: true });
    mappingFlowTest(params).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      }
      if (res && res.targetContent) {
        this.setState({
          dataTargetContent: res.targetContent,
          mappingTraceContent: res.mappingTraceContent,
        });
      }
      this.setState({ dataDebugLoading: false });
    });
  }

  /**
   * 打开dataConfig滑窗
   */
  @Bind()
  handleOpenDataConfigDrawer(isNew, record) {
    const { tenantId } = this.state;
    const dataConfigDrawerProps = {
      isNew,
      tenantId,
      onUpdateDataConfig: this.handleUpdateDataConfigLine,
      castRoot: record && record.get('castRoot'),
      castField: record && record.get('castField'),
      castType: record && record.get('castType'),
      castLovCode: record && record.get('castLovCode'),
      castLovField: record && record.get('castLovField'),
      langLov: record && record.get('langLov'),
      castLovLang: record && record.get('castLovLang'),
      castLovLangMeaning: record && record.get('castLovLangMeaning'),
      desensitizeRuleId: record && record.get('desensitizeRuleId'),
      desensitizeRuleName: record && record.get('desensitizeRuleName'),
    };
    Modal.open({
      title: isNew ? getLang('CREATE_LINE') : getLang('EDIT_LINE'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 600 },
      children: <DataConfigDrawer {...dataConfigDrawerProps} />,
      okText: getLang('SURE'),
    });
  }

  @Bind()
  handleUpdateDataConfigLine(isNew, record) {
    if (isNew) {
      this.dataConfigDS.create(record);
    } else {
      this.dataConfigDS.current.set('castRoot', record.castRoot);
      this.dataConfigDS.current.set('castField', record.castField);
      this.dataConfigDS.current.set('castType', record.castType);
      this.dataConfigDS.current.set('castLovCode', record.castLovCode);
      this.dataConfigDS.current.set('castLovField', record.castLovField);
      this.dataConfigDS.current.set('langLov', record.langLov);
      this.dataConfigDS.current.set('castLovLang', record.castLovLang);
      this.dataConfigDS.current.set('castLovLangMeaning', record.castLovLangMeaning);
    }
  }

  /**
   * 转化映射滑窗
   */
  @Bind()
  handleOpenMappingDrawer(record) {
    const { tenantId } = this.state;
    const mappingDrawerProps = {
      tenantId,
      dataConfigLine: record.toData(),
      valConfigs: record.get('valConfigs') && record.get('valConfigs'),
      sqlConfig: record.get('sqlConfig') && record.get('sqlConfig'),
      onUpdateSqlConfig: this.handleUpdateSqlConfig,
    };
    Modal.open({
      title: getLang('CAST_VAL_MAINTAIN'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 1000 },
      children: <MappingDrawer {...mappingDrawerProps} />,
      okText: getLang('SURE'),
    });
  }

  @Bind()
  handleUpdateSqlConfig(config) {
    if (this.dataConfigDS.current.get('castType') === 'SQL') {
      // 原本的代码写得太烂了，没法救了，后面重构吧
      // this.dataConfigDS.current.set('castSql', config.castSql);
      // this.dataConfigDS.current.set('sqlConfig', config);
      const data = config[0] || {};
      keys(data).forEach((key) => {
        const value = data[key];
        this.dataConfigDS.current.set(key, value);
      });
    } else {
      this.dataConfigDS.current.set('valConfigs', config);
    }
  }

  /**
   * 公式滑窗
   */
  @Bind()
  handleOpenFormulaDrawer(record) {
    const { tenantId } = this.state;
    const formulaDrawerProps = {
      tenantId,
      highlightedCastExpr: record.get('highlightedCastExpr'),
      exprConfigs: record.get('exprConfigs') || [],
      onUpdateFormula: this.handleUpdateFormula,
    };
    Modal.open({
      title: getLang('CAST_FORMULA'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 1000 },
      children: <FormulaDrawer {...formulaDrawerProps} />,
      okText: getLang('SURE'),
    });
  }

  @Bind()
  handleUpdateFormula(castExpr, highlightedCastExpr, exprConfigs) {
    this.dataConfigDS.current.set('castExpr', castExpr);
    this.dataConfigDS.current.set('highlightedCastExpr', highlightedCastExpr);
    this.dataConfigDS.current.set('exprConfigs', exprConfigs);
  }

  get dataConfigColumns() {
    return [
      {
        name: 'castRoot',
        width: 150,
      },
      {
        name: 'castField',
        width: 150,
      },
      {
        name: 'castType',
        width: 120,
        align: 'center',
        renderer: ({ value, text }) => {
          return TagRender(value, CAST_TYPE_TAGS, text);
        },
      },
      {
        name: 'castExpr',
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleOpenFormulaDrawer(record)}>
            {!value && record.get('castType') === CAST_TYPE_MAP.EXPR
              ? getLang('FORMULA_MAINTAIN')
              : value}
          </a>
        ),
      },
      {
        name: 'castVal',
        width: 100,
        renderer: ({ record }) => (
          <a onClick={() => this.handleOpenMappingDrawer(record)}>
            {getLang([`CAST_${record.get('castType')}`]) || ''}
          </a>
        ),
      },
      {
        header: getLang('OPERATOR'),
        width: 110,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <a onClick={() => this.handleOpenDataConfigDrawer(false, record)}>
                  {getLang('EDIT')}
                </a>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            {
              ele: <a onClick={() => this.dataConfigDS.delete(record)}>{getLang('DELETE')}</a>,
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  @Bind()
  handleSetValue(params) {
    const { script, sourceInputData, targetInputData } = params;
    if (script) {
      this.fieldConfigDS.current.set('script', script);
      this.setState({ script });
    }
    if (sourceInputData) {
      this.fieldConfigDS.current.set('fieldSourceContent', sourceInputData);
      this.setState({ fieldSourceContent: sourceInputData });
    }
    if (targetInputData) {
      this.fieldConfigDS.current.set('fieldTargetContent', targetInputData);
      this.setState({ fieldTargetContent: targetInputData });
    }
  }

  /**
   * 同步映射配置
   */
  @Bind()
  handleOpenSyncMappingConfig() {
    Modal.open({
      title: (
        <QuestionPopover
          text={getLang('SYNC_MAPPING_CONFIG')}
          message={getLang('SYNC_MAPPING_CONFIG_TIP')}
        />
      ),
      closable: true,
      destroyOnClose: true,
      style: { width: 450 },
      children: (
        <Form dataSet={this.headerFormDS}>
          {!isTenantRoleLevel() && <Lov name="tenantLov" />}
          <Lov name="invokeAbleInterface" />
          <TextField name="namespace" disabled />
          <TextField name="serverCode" disabled />
          <TextField name="interfaceUrl" disabled />
          <Select name="level" />
        </Form>
      ),
      okText: getLang('SYNC'),
      onOk: this.handleSyncMappingConfig,
    });
  }

  @Bind()
  async handleSyncMappingConfig() {
    const { tenantId, fieldSourceContent, fieldTargetContent, script, mappingType } = this.state;
    // 映射类型必输
    if (!mappingType) {
      notification.error({
        message: getLang('MAPPING_TYPE_REQUIRED'),
      });
      return false;
    }
    if (!(await this.headerFormDS.validate())) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    // 至少需要配置【字段映射】或【数据映射】中的一个
    if (
      (!fieldSourceContent || !fieldTargetContent || !script) &&
      (!this.dataConfigDS.toData() || this.dataConfigDS.toData().length === 0)
    ) {
      notification.error({
        message: getLang('FIELD_DATA_CONFIG_REQUIRED'),
      });
      return false;
    }
    const configVO = {};
    if (fieldSourceContent && fieldTargetContent && script) {
      configVO.fieldMappingConfig = {
        sourceStructure: fieldSourceContent,
        targetStructure: fieldTargetContent,
        transformScript: script,
      };
    }
    if (this.dataConfigDS.toData() && this.dataConfigDS.toData().length > 0) {
      configVO.valueMappingConfig = {
        valueMappingLineConfigs: this.dataConfigDS.toData(),
      };
    }
    const params = {
      ...this.headerFormDS.current.toData(),
      configVO: {
        dataType: mappingType,
        enableTraceMappingLogs: true,
        tenantId,
        ...configVO,
      },
    };
    packetMappingLink(params).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      } else {
        notification.success();
        this.headerFormDS.current.reset();
      }
    });
  }

  /**
   * 导入映射配置
   */
  @Bind()
  handleOpenImportMappingConfig() {
    const { fieldSourceContent, fieldTargetContent, script, mappingType } = this.state;
    const importProps = {
      onImportMappingConfig: this.handleImportMappingConfig,
      sourceContent: fieldSourceContent,
      targetContent: fieldTargetContent,
      script,
      dataType: mappingType,
      valueMappingLineConfigs: this.dataConfigDS.toData(),
    };
    this.configModal = Modal.open({
      title: (
        <QuestionPopover
          text={getLang('IMPORT_MAPPING_CONFIG')}
          message={getLang('IMPORT_MAPPING_CONFIG_TIP')}
        />
      ),
      closable: true,
      destroyOnClose: true,
      style: { width: 750 },
      children: <ImportMappingConfig {...importProps} />,
    });
  }

  /**
   * 导入映射配置
   */
  @Bind()
  handleImportMappingConfig(mappingConfigStr) {
    try {
      const mappingConfigJson = JSON.parse(mappingConfigStr);
      const {
        configVO: {
          dataType = SERVICE_CONSTANT.REST,
          fieldMappingConfig: { transformScript = '', sourceStructure = {}, targetStructure = {} },
          valueMappingConfig: { valueMappingLineConfigs = [] },
        },
      } = mappingConfigJson;
      this.headerFormDS.current.set('dataType', this.getDataType(dataType));
      this.fieldConfigDS.current.set('script', transformScript);
      this.fieldConfigDS.current.set('fieldSourceContent', JSON.stringify(sourceStructure));
      this.fieldConfigDS.current.set('fieldTargetContent', JSON.stringify(targetStructure));
      this.dataConfigDS.reset();
      this.dataConfigDS.loadData(valueMappingLineConfigs);
      this.setState({
        mappingType: dataType,
        script: transformScript,
        fieldSourceContent: JSON.stringify(sourceStructure),
        fieldTargetContent: JSON.stringify(targetStructure),
      });
    } catch (e) {
      notification.error({
        message: getLang('JSON_FORMATTER'),
      });
      return false;
    }
    return true;
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

  getDataType(type) {
    switch (type) {
      case SERVICE_CONSTANT.REST:
        return TRANSFORM_TYPE.REST_TO_REST;
      case SERVICE_CONSTANT.REST_SOAP:
        return TRANSFORM_TYPE.REST_TO_SOAP;
      case SERVICE_CONSTANT.SOAP:
        return TRANSFORM_TYPE.SOAP_TO_SOAP;
      case SERVICE_CONSTANT.SOAP_REST:
        return TRANSFORM_TYPE.SOAP_TO_REST;
      default:
        return type;
    }
  }

  @Bind()
  openLogAreaDrawer() {
    const { fieldMappingTraceContent } = this.state;
    const logAreaProps = {
      content: fieldMappingTraceContent,
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
    const {
      script,
      mappingType,
      fieldSourceContent,
      fieldTargetContent,
      resultTargetContent,
      fieldDebugLoading,
      dataTargetContent,
      dataDebugLoading,
      sourceType,
      targetType,
      mappingTraceContent,
    } = this.state;
    const fieldMappingProps = {
      script,
      sourceType,
      targetType,
      sourceInputData: fieldSourceContent,
      targetInputData: fieldTargetContent,
      edit: true,
      arrowId: 'mappingDebug',
      onGetValue: this.handleSetValue,
    };
    const mappingDebugAreaProps = {
      mappingType,
      mappingTraceContent,
      debugLoading: dataDebugLoading,
      targetContent: dataTargetContent,
      onDebugExecute: this.handleDataDebugExecute,
      onFlowDebugExecute: this.handleFlowDebugExecute,
    };
    return (
      <>
        <Header title={getLang('MAPPING_DEBUG')}>
          <Button onClick={() => this.handleOpenImportMappingConfig()}>
            {getLang('IMPORT_MAPPING_CONFIG')}
          </Button>
          <Button color="primary" onClick={() => this.handleOpenSyncMappingConfig()}>
            {getLang('SYNC_MAPPING_CONFIG')}
          </Button>
        </Header>
        <Content>
          <Card
            extra={
              <Form labelLayout="horizontal" dataSet={this.headerFormDS} columns={3}>
                <Select name="dataType" />
              </Form>
            }
          >
            <Collapse
              defaultActiveKey={[
                'fieldConfig',
                'fieldDebugResult',
                'dataConfig',
                'dataDebugResult',
              ]}
            >
              <Panel header={getLang('FIELD_CONFIG')} key="fieldConfig">
                <FieldMapping {...fieldMappingProps} />
              </Panel>
              <Panel header={getLang('FIELD_MAPPING_DEBUG')} key="fieldDebugResult">
                <Spin spinning={fieldDebugLoading}>
                  <div style={{ float: 'left', marginBottom: '5px' }}>
                    {getLang('RESULT_DATA')}:
                  </div>
                  <div style={{ float: 'right', marginBottom: '5px' }}>
                    <Button onClick={() => this.openLogAreaDrawer()}>{getLang('DEBUG_LOG')}</Button>
                    <Button color="primary" onClick={() => this.handleFieldDebugExecute()}>
                      {getLang('DEBUG')}
                    </Button>
                  </div>
                  <div style={{ clear: 'both' }} />
                  <CodeArea
                    style={{ height: 300 }}
                    value={
                      resultTargetContent &&
                      ([SERVICE_CONSTANT.REST, SERVICE_CONSTANT.SOAP_REST].includes(mappingType)
                        ? JSON.stringify(JSON.parse(resultTargetContent), null, 4)
                        : XmlFormatter(resultTargetContent))
                    }
                    formatter={
                      [SERVICE_CONSTANT.REST, SERVICE_CONSTANT.SOAP_REST].includes(mappingType)
                        ? JSONFormatter
                        : YAMLFormatter
                    }
                    options={{
                      mode: [SERVICE_CONSTANT.REST, SERVICE_CONSTANT.SOAP_REST].includes(
                        mappingType
                      )
                        ? { name: 'javascript', json: true }
                        : 'yaml',
                      lineWrapping: true,
                      styleActiveLine: true,
                    }}
                    readOnly
                  />
                </Spin>
              </Panel>
              <Panel header={getLang('DATA_CONFIG')} key="dataConfig">
                <div style={{ float: 'right', marginBottom: '5px' }}>
                  <Button color="primary" onClick={() => this.handleOpenDataConfigDrawer(true)}>
                    {getLang('CREATE')}
                  </Button>
                </div>
                <div style={{ clear: 'both' }} />
                <Table dataSet={this.dataConfigDS} columns={this.dataConfigColumns} />
              </Panel>
              <Panel
                header={
                  <QuestionPopover
                    text={getLang('DATA_MAPPING_DEBUG')}
                    message={getLang('DATA_MAPPING_TIP')}
                  />
                }
                key="dataDebugResult"
              >
                <MappingDebugArea {...mappingDebugAreaProps} />
              </Panel>
            </Collapse>
          </Card>
        </Content>
      </>
    );
  }
}
