import React, { PureComponent } from 'react';
import { Spin } from 'choerodon-ui';
import { Form, TextField, Select, DataSet, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { castLineFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/dataMappingLang';

export default class CastLineDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      detailLoading: false,
    };
    this.castLineFormDS = new DataSet({
      ...castLineFormDS({ tenantId: props.tenantId }),
    });
  }

  componentDidMount() {
    const { isNew, castHeaderId, tenantId } = this.props;
    if (!isNew) {
      this.handleFetchDetail();
    } else {
      this.castLineFormDS.create({
        castHeaderId,
        tenantId,
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
    const validate = await this.castLineFormDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.castLineFormDS.submit().then((res) => {
      if (res && res.success) {
        onFetchLine();
      }
    });
  }

  /**
   * 明细查询
   */
  async handleFetchDetail() {
    const { castLineId, historyFlag, version } = this.props;
    this.setState({ detailLoading: true });
    this.castLineFormDS.setQueryParameter('castLineId', castLineId);
    if (historyFlag) {
      this.castLineFormDS.setQueryParameter('formerVersionFlag', historyFlag);
      this.castLineFormDS.setQueryParameter('version', version);
    }
    await this.castLineFormDS.query();
    this.setState({ detailLoading: false, castType: this.castLineFormDS.current.get('castType') });
  }

  @Bind()
  forbiddenInputChinese(e) {
    const event = e;
    event.target.value = event.target.value.replace(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/g, '');
  }

  render() {
    const { readOnly } = this.props;
    const { detailLoading, castType } = this.state;
    return (
      <Spin spinning={detailLoading}>
        <Form dataSet={this.castLineFormDS} columns={1} disabled={readOnly}>
          <TextField name="castRoot" onInput={this.forbiddenInputChinese} />
          <TextField name="castField" restrict="a-zA-Z0-9-_./" />
          <Select name="castType" onChange={(val) => this.setState({ castType: val })} />
          {castType === 'LOV' && <Lov name="castLovCodeLov" />}
          {castType === 'LOV' && <TextField name="castLovField" />}
          {castType === 'LOV' && <Lov name="langLov" />}
          {castType === 'DESENSITIZE' && <Lov name="desensitizeRuleLov" />}
        </Form>
      </Spin>
    );
  }
}
