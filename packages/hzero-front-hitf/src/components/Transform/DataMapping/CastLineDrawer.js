import React, { PureComponent } from 'react';
import { Spin } from 'choerodon-ui';
import { Form, TextField, Select, DataSet, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { isUndefined } from 'lodash';
import notification from 'hzero-front/lib/utils/notification';
import { castLineFormDS } from '@/stores/components/Transform/DataMappingDS';
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
   * 确定
   */
  @Bind()
  async handleSave() {
    const { castHeaderId, onFetchLine, onFetchDetail, onCreateHeader } = this.props;
    const validate = await this.castLineFormDS.validate();
    if (validate) {
      if (isUndefined(castHeaderId)) {
        const res = await onCreateHeader();
        if (res && !res.failed) {
          const { castHeaderId: tempId } = res.content[0] || {};
          this.castLineFormDS.current.set('castHeaderId', tempId);
        }
      }
      const result = await this.castLineFormDS.submit();
      if (getResponse(result)) {
        onFetchDetail().then(() => onFetchLine());
        this.props.modal.close();
      }
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  /**
   * 明细查询
   */
  async handleFetchDetail() {
    const { castLineId } = this.props;
    this.setState({ detailLoading: true });
    this.castLineFormDS.setQueryParameter('castLineId', castLineId);
    await this.castLineFormDS.query();
    this.setState({ detailLoading: false, castType: this.castLineFormDS.current.get('castType') });
  }

  @Bind()
  forbiddenInputChinese(e) {
    const event = e;
    event.target.value = event.target.value.replace(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/g, '');
  }

  render() {
    const { detailLoading, castType } = this.state;
    const { readOnly } = this.props;
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
