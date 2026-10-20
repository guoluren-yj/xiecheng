import React, { PureComponent } from 'react';
import { Form, TextField, DataSet, Select, Spin } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { mappingLineFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/dataMappingLang';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.mappingLineFormDS = new DataSet({
      ...mappingLineFormDS(),
    });
  }

  componentDidMount() {
    const { isNew, tenantId, castLineData } = this.props;
    const { castLineId, castField } = castLineData;
    if (!isNew) {
      this.handleFetchDetail();
    } else {
      this.mappingLineFormDS.create({
        tenantId,
        castLineId,
        mappingField: castField,
      });
    }
    this.handleUpdateModalProp();
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
    const { onFetchLine } = this.props;
    const validate = await this.mappingLineFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.mappingLineFormDS.submit().then((res) => {
      if (res && res.success) {
        onFetchLine();
      }
    });
  }

  /**
   * 明细查询
   */
  async handleFetchDetail() {
    const { mappingTargetId, historyFlag, version } = this.props;
    this.mappingLineFormDS.setQueryParameter('mappingTargetId', mappingTargetId);
    if (historyFlag) {
      this.mappingLineFormDS.setQueryParameter('formerVersionFlag', historyFlag);
      this.mappingLineFormDS.setQueryParameter('version', version);
    }
    await this.mappingLineFormDS.query();
  }

  render() {
    const { readOnly } = this.props;
    return (
      <Spin dataSet={this.mappingLineFormDS}>
        <Form
          labelLayout="horizontal"
          dataSet={this.mappingLineFormDS}
          columns={1}
          disabled={readOnly}
        >
          <TextField name="targetValue" />
          <Select name="fieldType" />
          {/* <Select name="conjunction" /> */}
        </Form>
      </Spin>
    );
  }
}
