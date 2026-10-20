import React, { PureComponent } from 'react';
import { Spin, Card } from 'choerodon-ui';
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
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Bind } from 'lodash-decorators';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import notification from 'hzero-front/lib/utils/notification';
import { isUndefined } from 'lodash';
import {
  mappingLineTableDS,
  onlyReadFormDS,
  sqlFormDS,
} from '@/stores/components/Transform/DataMappingDS';
import getLang from '@/langs/dataMappingLang';
import MappingFormDrawer from './MappingFormDrawer';
import FieldMappingModal from './FieldMappingModal';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
    };
    this.mappingLineTableDS = new DataSet({
      ...mappingLineTableDS(),
    });
    this.onlyReadFormDS = new DataSet({
      ...onlyReadFormDS(),
    });
    this.sqlFormDS = new DataSet({
      ...sqlFormDS(),
    });
  }

  componentDidMount() {
    const { castLineData } = this.props;
    this.handleFetchDetail();
    this.init();
    if (castLineData.castType === 'SQL') {
      this.handleUpdateModalProp();
    }
  }

  init() {
    const { castLineData } = this.props;
    this.onlyReadFormDS.loadData([castLineData]);
  }

  /**
   * 明细查询
   */
  @Bind()
  async handleFetchDetail() {
    const { castLineData } = this.props;
    const { castLineId } = castLineData;
    this.setState({ detailLoading: true });
    if (castLineData.castType === 'VAL') {
      this.mappingLineTableDS.setQueryParameter('castLineId', castLineId);
      await this.mappingLineTableDS.query();
    }
    if (castLineData.castType === 'SQL') {
      this.sqlFormDS.setQueryParameter('castLineId', castLineId);
      await this.sqlFormDS.query();
      this.sqlFormDS.current.set('status', 'updated');
    }
    this.setState({ detailLoading: false });
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const validate = await this.sqlFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    const { onFetchLine = () => {} } = this.props;
    return this.sqlFormDS.submit().then((res) => {
      if (res && !res.failed) {
        onFetchLine();
      }
    });
  }

  /**
   * 打开转化字段滑窗
   */
  @Bind()
  handleOpenMappingLineDrawer(isNew, record) {
    const { tenantId, castLineData, readOnly } = this.props;
    const { castLineId } = castLineData;
    const mappingFormDrawerProps = {
      isNew,
      tenantId,
      castLineId,
      castLineData,
      readOnly,
      mappingTargetId: isNew ? null : record.get('mappingTargetId'),
      onFetchLine: this.handleFetchDetail,
    };
    this.modal = Modal.open({
      title: getLang('CONDITION_MAINTAIN'),
      drawer: true,
      closable: true,
      key: Modal.key(),
      style: { width: 600 },
      okText: getLang('SAVE'),
      okProps: { disabled: readOnly },
      children: <MappingFormDrawer {...mappingFormDrawerProps} />,
    });
  }

  /**
   * 打开字段映射弹窗
   */
  @Bind()
  handleOpenFieldMappingModal(record) {
    const { tenantId, castLineData, readOnly } = this.props;
    const fieldMappingModalProps = {
      tenantId,
      readOnly,
      mappingTargetId: record.get('mappingTargetId'),
      logicValue: isUndefined(record.get('conditionJson'))
        ? {}
        : JSON.parse(record.get('conditionJson')),
      fieldMappingData: { ...castLineData, ...record.toData() },
      onFetchLine: this.handleFetchDetail,
    };
    this.modal = Modal.open({
      title: getLang('CONDITION_MAINTAIN'),
      closable: true,
      key: Modal.key(),
      style: { width: 900 },
      okText: getLang('SAVE'),
      okProps: { disabled: readOnly },
      children: <FieldMappingModal {...fieldMappingModalProps} />,
    });
  }

  get castLineColumns() {
    const { readOnly } = this.props;
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
                <ButtonPermission
                  type="text"
                  onClick={() => this.handleOpenMappingLineDrawer(false, record)}
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
                  onClick={() => this.handleOpenFieldMappingModal(record)}
                >
                  {getLang('CONDITION_MAINTAIN')}
                </ButtonPermission>
              ),
              key: 'fieldMappingSetting',
              len: 4,
              title: getLang('CONDITION_MAINTAIN'),
            },
            {
              ele: (
                <ButtonPermission
                  type="text"
                  disabled={readOnly}
                  onClick={() => this.mappingLineTableDS.delete(record)}
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
    const { readOnly, castLineData = {} } = this.props;
    const { detailLoading } = this.state;
    return (
      <Spin spinning={detailLoading}>
        {castLineData.castType === 'VAL' && (
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
              {!readOnly && (
                <div style={{ width: '100%', textAlign: 'right', marginBottom: '5px' }}>
                  <Button color="primary" onClick={() => this.handleOpenMappingLineDrawer(true)}>
                    {getLang('CREATE')}
                  </Button>
                </div>
              )}
              <Table dataSet={this.mappingLineTableDS} columns={this.castLineColumns} />
            </Card>
          </>
        )}
        {castLineData.castType === 'SQL' && (
          <>
            <Form dataSet={this.onlyReadFormDS} columns={2} disabled>
              <TextField name="castField" />
              <Select name="castType" />
            </Form>
            <Form dataSet={this.sqlFormDS} columns={2}>
              <Lov name="castDatasourceLov" disabled={readOnly} />
              <TextField name="castDatasourceSchema" disabled={readOnly} restrict="a-zA-Z0-9-_./" />
              <CodeArea name="castSql" style={{ height: 550 }} colSpan={2} readOnly={readOnly} />
            </Form>
          </>
        )}
      </Spin>
    );
  }
}
