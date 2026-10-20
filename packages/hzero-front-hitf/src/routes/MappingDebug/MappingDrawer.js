import React, { PureComponent } from 'react';
import { Card } from 'choerodon-ui';
import {
  Form,
  TextField,
  DataSet,
  Button,
  Table,
  Modal,
  CodeArea,
  Select,
  Lov,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import notification from 'hzero-front/lib/utils/notification';
import { isUndefined } from 'lodash';
import { mappingLineTableDS, onlyReadFormDS, sqlFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/dataMappingLang';
import MappingFormDrawer from './MappingFormDrawer';
import FieldMappingModal from './FieldMappingModal';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.mappingLineTableDS = new DataSet({
      ...mappingLineTableDS(),
    });
    this.onlyReadFormDS = new DataSet({
      ...onlyReadFormDS(),
    });
    this.sqlFormDS = new DataSet({
      ...sqlFormDS(),
    });
    this.state = {
      ...props,
    };
  }

  componentDidMount() {
    this.loadData(this.props);
    this.handleUpdateModalProp();
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
    this.setState({
      ...nextProps,
    });
  }

  /**
   * 数据加载
   * @param {*} data
   */
  @Bind()
  loadData(data) {
    const { dataConfigLine, valConfigs, sqlConfig } = data;
    this.onlyReadFormDS.loadData([dataConfigLine]);
    if (dataConfigLine.castType === 'VAL') {
      if (valConfigs) {
        this.mappingLineTableDS.loadData(valConfigs);
      }
    }
    if (dataConfigLine.castType === 'SQL') {
      if (sqlConfig) {
        this.sqlFormDS.loadData(sqlConfig);
      }
    }
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    const { modal } = this.props;
    modal.update({
      footer: (_okBtn, cancelBtn) => (
        <div style={{ textAlign: 'right' }}>
          <Button color="primary" onClick={this.handleSave}>
            {getLang('SURE')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  }

  /**
   * 确定
   */
  @Bind()
  async handleSave() {
    const { modal, dataConfigLine = {}, onUpdateSqlConfig } = this.props;

    const { castType } = dataConfigLine;
    const validate = await this.sqlFormDS.validate();
    if (validate) {
      modal.close();
      if (castType === 'VAL') {
        onUpdateSqlConfig(this.mappingLineTableDS.toData());
      }
      if (castType === 'SQL') {
        onUpdateSqlConfig(this.sqlFormDS.toData());
      }
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  /**
   * 打开转化字段滑窗
   */
  @Bind()
  handleOpenMappingLineDrawer(isNew, record) {
    const { tenantId } = this.state;
    const mappingFormDrawerProps = {
      isNew,
      tenantId,
      mappingLine: record && record.toData(),
      onUpdateMappingLine: this.handleUpdateMappingLine,
    };
    this.modal = Modal.open({
      title: getLang('CONDITION_MAINTAIN'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 600 },
      children: <MappingFormDrawer {...mappingFormDrawerProps} />,
      okText: getLang('SURE'),
    });
  }

  @Bind()
  handleUpdateMappingLine(isNew, mappingLine) {
    if (isNew) {
      this.mappingLineTableDS.create(mappingLine);
    } else {
      const { targetValue, fieldType } = mappingLine;
      this.mappingLineTableDS.current.set('targetValue', targetValue);
      this.mappingLineTableDS.current.set('fieldType', fieldType);
    }
  }

  /**
   * 打开字段映射弹窗
   */
  @Bind()
  handleOpenFieldMappingModal(record) {
    const { tenantId, dataConfigLine } = this.state;
    const fieldMappingModalProps = {
      tenantId,
      logicValue: isUndefined(record.get('conditionJson'))
        ? {}
        : JSON.parse(record.get('conditionJson')),
      fieldMappingData: { ...dataConfigLine, ...record.toData() },
      onUpdateCondition: this.handleUpdateCondition,
    };
    this.modal = Modal.open({
      title: getLang('CONDITION_MAINTAIN'),
      closable: true,
      key: Modal.key(),
      style: { width: 900 },
      children: <FieldMappingModal {...fieldMappingModalProps} />,
    });
  }

  @Bind()
  handleUpdateCondition(data) {
    this.mappingLineTableDS.current.set('conditionJson', data.conditionJson);
    this.mappingLineTableDS.current.set('evaluateExpression', data.evaluateExpression);
    this.mappingLineTableDS.current.set('sourceMappingFields', data.sourceMappingFields);
  }

  get castLineColumns() {
    return [
      {
        name: 'targetValue',
        width: 150,
      },
      {
        name: 'fieldType',
        width: 120,
      },
      {
        name: 'sourceMappingFields',
      },
      {
        header: getLang('OPERATOR'),
        width: 180,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <a onClick={() => this.handleOpenMappingLineDrawer(false, record)}>
                  {getLang('EDIT')}
                </a>
              ),
              key: 'edit',
              len: 2,
              title: getLang('EDIT'),
            },
            {
              ele: (
                <a onClick={() => this.handleOpenFieldMappingModal(record)}>
                  {getLang('CONDITION_MAINTAIN')}
                </a>
              ),
              key: 'fieldMappingSetting',
              len: 4,
              title: getLang('CONDITION_MAINTAIN'),
            },
            {
              ele: (
                <a onClick={() => this.mappingLineTableDS.delete(record)}>{getLang('DELETE')}</a>
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
    const { dataConfigLine = {} } = this.state;
    return (
      <>
        {dataConfigLine.castType === 'VAL' && (
          <>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('BASIC_INFO')}</h3>}
            >
              <Form dataSet={this.onlyReadFormDS} columns={2} disabled>
                <TextField name="castField" />
                <Select name="castType" />
              </Form>
            </Card>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('DETAIL_INFO')}</h3>}
            >
              <div style={{ width: '100%', textAlign: 'right', marginBottom: '5px' }}>
                <Button color="primary" onClick={() => this.handleOpenMappingLineDrawer(true)}>
                  {getLang('CREATE')}
                </Button>
              </div>
              <Table dataSet={this.mappingLineTableDS} columns={this.castLineColumns} />
            </Card>
          </>
        )}
        {dataConfigLine.castType === 'SQL' && (
          <>
            <Form dataSet={this.onlyReadFormDS} columns={2} disabled>
              <TextField name="castField" />
              <Select name="castType" />
            </Form>
            <Form dataSet={this.sqlFormDS} columns={2}>
              <Lov name="castDatasourceLov" />
              <TextField name="castDatasourceSchema" restrict="a-zA-Z0-9-_./" />
              <CodeArea name="castSql" style={{ height: 550 }} colSpan={2} />
            </Form>
          </>
        )}
      </>
    );
  }
}
