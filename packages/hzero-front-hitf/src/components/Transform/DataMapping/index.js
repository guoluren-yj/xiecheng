/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/7/8
 * @copyright HAND ® 2020
 */
import React from 'react';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { DataSet, Form, Button, Select, Table, Modal, TextField } from 'choerodon-ui/pro';
import notification from 'hzero-front/lib/utils/notification';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { CAST_TYPE_MAP, CAST_TYPE_TAGS, TRANSFORM_STATUS } from '@/constants/constants';
import {
  headerFormDS,
  castLineTableDS,
  enableDS,
  disableDS,
} from '@/stores/components/Transform/DataMappingDS';
import {
  dataMappingTest,
  mappingFlowTest,
  queryValueList,
  queryExpRules,
} from '@/services/dataMappingService';
import getLang from '@/langs/dataMappingLang';
import CollapsePanel from '@/components/CollapsePanel';
import QuestionPopover from '@/components/QuestionPopover';
import { MappingDebugArea } from '@/components/DataMapping';
import CastLineDrawer from './CastLineDrawer';
import MappingDrawer from './MappingDrawer';
import FormulaDrawer from './FormulaDrawer';

export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: isTenantRoleLevel() ? getCurrentOrganizationId() : props.tenantId,
      castHeaderId: props.castHeaderId,
      debugLoading: false,
      mappingTraceContent: '',
    };
    this.headerFormDS = new DataSet({
      ...headerFormDS({ sourceFunc: props.sourceFunc }),
    });
    this.castLineTableDS = new DataSet({
      ...castLineTableDS(),
    });
  }

  componentDidMount() {
    this.handleFetchDetail().then(() => {
      this.handleFetchLine();
    });
  }

  /**
   * 查询值转换
   * @param {*} castLineId
   */
  async getValueList(castLineId) {
    const valueList = await queryValueList({
      castLineId,
    });
    return valueList.content;
  }

  /**
   * 查询公式转换
   * @param {*} castLineId
   */
  async getExpRules(castLineId) {
    const valueList = await queryExpRules({
      castLineId,
    });
    return valueList.content;
  }

  /**
   * 获取行配置
   */
  @Bind()
  async getMappingLineConfigs() {
    let valueMappingLineConfigs = [];
    let configs = [];
    let valConfigs = [];
    let exprConfigs = [];
    this.castLineTableDS.toData().map((record) => {
      valConfigs = [];
      exprConfigs = [];
      if (record.castType === CAST_TYPE_MAP.VAL) {
        valConfigs = this.getValueList(record.castLineId);
        configs.push(valConfigs);
      } else if (record.castType === CAST_TYPE_MAP.EXPR) {
        exprConfigs = this.getExpRules(record.castLineId);
        configs.push(exprConfigs);
      }
      return valueMappingLineConfigs.push({
        ...record,
        valConfigs,
        exprConfigs,
      });
    });
    configs = await Promise.all(configs);
    let i = 0;
    valueMappingLineConfigs = valueMappingLineConfigs.map((line) => {
      const record = line;
      if (record.castType === CAST_TYPE_MAP.VAL) {
        record.valConfigs = configs[i];
        i += 1;
      } else if (record.castType === CAST_TYPE_MAP.EXPR) {
        record.exprConfigs = configs[i];
        i += 1;
      }
      return record;
    });
    return valueMappingLineConfigs;
  }

  /**
   * 调试
   */
  @Bind()
  async handleDebugExecute(sourceContent) {
    const { interfaceId, namespace, serverCode, interfaceCode, castLevel } = this.props;
    const { tenantId } = this.state;
    const { dataType } = this.headerFormDS.current.toData();
    if (!this.castLineTableDS.toData() || this.castLineTableDS.toData().length === 0) {
      notification.error({
        message: getLang('CAST_LINE_REQUIRED'),
      });
      return false;
    }
    if (!sourceContent) {
      notification.error({
        message: getLang('SOURCE_DATA_REQUIRED'),
      });
      return false;
    }
    this.setState({ targetContent: '', mappingTraceContent: '', debugLoading: true });
    const valueMappingLineConfigs = await this.getMappingLineConfigs();
    const res = await dataMappingTest({
      tenantId,
      interfaceId,
      namespace,
      serverCode,
      interfaceCode,
      level: castLevel,
      sourceContent,
      configVO: {
        dataType,
        valueMappingConfig: { valueMappingLineConfigs },
      },
    });
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
  }

  /**
   * 流程调试
   */
  @Bind()
  async handleFlowDebugExecute(sourceContent) {
    const { interfaceId, namespace, serverCode, interfaceCode, castLevel } = this.props;
    const { tenantId } = this.state;
    const { dataType } = this.headerFormDS.current.toData();
    this.setState({ targetContent: '', mappingTraceContent: '', debugLoading: true });
    let params = {};
    const valueMappingLineConfigs = await this.getMappingLineConfigs();
    if (valueMappingLineConfigs && valueMappingLineConfigs.length !== 0) {
      params = {
        sourceContent,
        configVO: {
          dataType,
          valueMappingConfig: { valueMappingLineConfigs },
        },
      };
    }
    const res = await mappingFlowTest({
      tenantId,
      interfaceId,
      namespace,
      serverCode,
      interfaceCode,
      level: castLevel,
      ...params,
    });
    if (res.failed) {
      notification.error({
        message: res.message,
      });
      this.setState({ debugLoading: false });
      return false;
    } else {
      this.setState({
        targetContent: res.targetContent,
        mappingTraceContent: res.mappingTraceContent,
        debugLoading: false,
      });
    }
  }

  /**
   * 下线
   */
  @Bind()
  handleOffline() {
    const { sourceFunc } = this.props;
    const { castHeaderId } = this.state;
    const tempDisableDS = new DataSet(disableDS({ sourceFunc }));
    const data = this.headerFormDS.current.toData();
    tempDisableDS.create({ ...data, castHeaderId });

    return tempDisableDS.submit().then((res) => {
      if (res && !res.failed) {
        this.handleFetchDetail().then(() => {
          this.handleFetchLine();
        });
      }
    });
  }

  /**
   * 启用
   */
  @Bind()
  handleOnline() {
    const { sourceFunc } = this.props;
    const { castHeaderId } = this.state;
    const tempEnableDS = new DataSet(enableDS({ sourceFunc }));
    const data = this.headerFormDS.current.toData();
    tempEnableDS.create({ ...data, castHeaderId });
    return tempEnableDS.submit().then((res) => {
      if (res && !res.failed) {
        this.handleFetchDetail().then(() => {
          this.handleFetchLine();
        });
      }
    });
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp(res) {
    const { modal } = this.props;
    const { PUBLISHED } = TRANSFORM_STATUS;
    modal.update({
      footer: (_okBtn, cancelBtn) => (
        <>
          {cancelBtn}
          {res && PUBLISHED !== res.statusCode && (
            <ButtonPermission type="c7n-pro" color="primary" onClick={this.handleOnline}>
              {getLang('RELEASE')}
            </ButtonPermission>
          )}
          {res && PUBLISHED === res.statusCode && (
            <ButtonPermission type="c7n-pro" color="primary" onClick={this.handleOffline}>
              {getLang('OFFLINE')}
            </ButtonPermission>
          )}
        </>
      ),
    });
  }

  /**
   * 查询
   */
  @Bind()
  async handleFetchDetail() {
    const {
      namespace,
      serverCode,
      interfaceCode,
      castLevel,
      applicationCode,
      applicationInstId,
      sourceRef,
      readOnly,
      dataType,
    } = this.props;
    const { tenantId } = this.state;
    const { PUBLISHED } = TRANSFORM_STATUS;

    this.headerFormDS.setQueryParameter('namespace', namespace);
    this.headerFormDS.setQueryParameter('serverCode', serverCode);
    this.headerFormDS.setQueryParameter('interfaceCode', interfaceCode);
    this.headerFormDS.setQueryParameter('castLevel', castLevel);
    this.headerFormDS.setQueryParameter('applicationCode', applicationCode);
    this.headerFormDS.setQueryParameter('level', castLevel);
    this.headerFormDS.setQueryParameter('sourceRef', sourceRef);
    this.headerFormDS.setQueryParameter('tenantId', tenantId);
    const res = await this.headerFormDS.query();
    let castHeaderId;
    let statusCode;
    if (!res) {
      this.headerFormDS.create({
        tenantId,
        namespace,
        serverCode,
        interfaceCode,
        dataType,
        castLevel,
      });
    } else {
      const { statusCode: tempStatusCode, castHeaderId: tempCastHeaderId } = res;
      castHeaderId = tempCastHeaderId;
      statusCode = tempStatusCode;
    }
    this.headerFormDS.current.set('applicationCode', applicationCode);
    this.headerFormDS.current.set('interfaceCode', interfaceCode);
    this.headerFormDS.current.set('applicationInstId', applicationInstId);
    this.setState({ castHeaderId, readOnly: readOnly || statusCode === PUBLISHED });
    this.handleUpdateModalProp(res);
    return res;
  }

  /**
   * 行列表查询
   */
  @Bind()
  async handleFetchLine() {
    const { castHeaderId } = this.state;
    if (castHeaderId) {
      this.castLineTableDS.setQueryParameter('castHeaderId', castHeaderId);
      await this.castLineTableDS.query();
    }
  }

  /**
   * 新建的时候先创建头
   */
  @Bind()
  handleCreateHeader() {
    return this.headerFormDS.submit();
  }

  /**
   * 打开castLine滑窗
   */
  @Bind()
  handleOpenCastLineDrawer(isNew, record) {
    const { tenantId, castHeaderId, readOnly } = this.state;
    const castLineDrawerProps = {
      readOnly,
      isNew,
      tenantId,
      castHeaderId,
      castLineId: isNew ? null : record.get('castLineId'),
      onFetchLine: this.handleFetchLine,
      onFetchDetail: this.handleFetchDetail,
      onCreateHeader: this.handleCreateHeader,
    };
    Modal.open({
      title: isNew ? getLang('CREATE_LINE') : getLang('EDIT_LINE'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 600 },
      okText: getLang('SAVE'),
      okProps: { disabled: readOnly },
      children: <CastLineDrawer {...castLineDrawerProps} />,
    });
  }

  /**
   * 转化映射滑窗
   */
  @Bind()
  handleOpenMappingDrawer(record) {
    const { tenantId, readOnly } = this.state;
    const { castType } = record.toData();
    const mappingDrawerProps = {
      tenantId,
      readOnly,
      castLineData: record.toData(),
      onFetchLine: this.handleFetchLine,
    };
    Modal.open({
      title: getLang('CAST_VAL_MAINTAIN'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 1000 },
      okText: castType === 'SQL' ? getLang('SAVE') : getLang('SURE'),
      okProps: { disabled: castType === 'SQL' ? readOnly : false },
      children: <MappingDrawer {...mappingDrawerProps} />,
    });
  }

  /**
   * 公式滑窗
   */
  @Bind()
  handleOpenFormulaDrawer(record) {
    const { tenantId, readOnly } = this.state;
    const formulaDrawerProps = {
      tenantId,
      readOnly,
      castLineId: record.get('castLineId'),
      highlightedCastExpr: record.get('highlightedCastExpr'),
      onFetchLine: this.handleFetchLine,
    };
    Modal.open({
      title: getLang('CAST_FORMULA'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 1000 },
      okText: getLang('SAVE'),
      okProps: { disabled: readOnly },
      children: <FormulaDrawer {...formulaDrawerProps} />,
    });
  }

  @Bind()
  getCastLineColumns() {
    const { readOnly } = this.state;
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
        // header: getLang('CAST_TYPE'),
        width: 120,
        align: 'center',
        renderer: ({ value, record }) => {
          return TagRender(value, CAST_TYPE_TAGS, record.get('castTypeMeaning'));
        },
      },
      {
        name: 'castExpr',
        // width: 250,
        renderer: ({ value, record }) => (
          <a onClick={() => this.handleOpenFormulaDrawer(record)}>
            {isUndefined(value) && record.get('castType') === CAST_TYPE_MAP.EXPR
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
        name: 'desensitizeRuleName',
        width: 150,
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
                <ButtonPermission
                  type="text"
                  onClick={() => this.handleOpenCastLineDrawer(false, record)}
                >
                  {getLang('EDIT')}
                </ButtonPermission>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  disabled={readOnly}
                  onClick={() => this.castLineTableDS.delete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
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

  render() {
    const { targetContent, mappingTraceContent, debugLoading, readOnly } = this.state;
    const mappingDebugAreaProps = {
      mappingType: this.headerFormDS.current && this.headerFormDS.current.get('dataType'),
      debugLoading,
      targetContent,
      mappingTraceContent,
      onDebugExecute: this.handleDebugExecute,
      onFlowDebugExecute: this.handleFlowDebugExecute,
    };
    return (
      <CollapsePanel
        eles={[
          {
            key: 'basic',
            title: getLang('BASIC_INFO'),
            ele: (
              <Form disabled labelLayout="horizontal" dataSet={this.headerFormDS} columns={3}>
                <Select name="dataType" />
                <TextField name="versionDesc" />
                <Select name="statusCode" />
              </Form>
            ),
          },
          {
            key: 'detail',
            title: getLang('DETAIL_INFO'),
            ele: (
              <>
                {!readOnly && (
                  <div style={{ width: '100%', textAlign: 'right', marginBottom: '5px' }}>
                    <Button color="primary" onClick={() => this.handleOpenCastLineDrawer(true)}>
                      {getLang('CREATE')}
                    </Button>
                  </div>
                )}
                <Table dataSet={this.castLineTableDS} columns={this.getCastLineColumns()} />
              </>
            ),
          },
          {
            key: 'debug',
            defaultExpand: false,
            title: <QuestionPopover text={getLang('DEBUG')} message={getLang('DEBUG_TIP')} />,
            ele: <MappingDebugArea {...mappingDebugAreaProps} />,
          },
        ]}
      />
    );
  }
}
