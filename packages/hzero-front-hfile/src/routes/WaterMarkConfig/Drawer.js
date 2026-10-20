import React from 'react';
import { Form, TextField, Lov, TextArea, NumberField, Select, ColorPicker } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import UrlAttachment from 'srm-front-boot/lib/components/UrlAttachment';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

const { Option } = Select;
@observer
export default class Drawer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isImg: false, // 水印类型是否为图片
    };
  }

  componentDidMount() {
    const { watermarkId } = this.props;
    if (watermarkId) {
      this.handleQuery(watermarkId);
    }
  }

  /**
   * 查询详情
   * @param {string} value
   */
  @Bind()
  async handleQuery(value) {
    const { ds } = this.props;
    ds.setQueryParameter('watermarkId', value);
    await ds.query();
    if (!ds.current) {
      return;
    }
    ds.current.status = 'update';
    const { detail, watermarkType } = ds.current.get(['detail', 'watermarkType']);
    const isImg = watermarkType === 'IMAGE' || watermarkType === 'TILE_IMAGE';
    if (!isImg) {
      ds.current.set('detail1', detail);
    }
    this.setState({
      isImg,
    });
  }

  /**
   * 选择器值改变时触发
   * @param {string} value
   */
  @Bind()
  onSelectChange(value) {
    const isImg = value === 'IMAGE' || value === 'TILE_IMAGE';
    this.setState({ isImg });
    const { ds } = this.props;
    if (!isImg) {
      ds.current.set('detail1', '');
    }
  }

  render() {
    const { ds, isTenant, isCreate } = this.props;
    const { isImg } = this.state;
    return (
      <Form dataSet={ds} labelLayout="float" columns={2}>
        {!isTenant && <Lov name="tenantLov" disabled={!isCreate} />}
        <TextField name="watermarkCode" disabled={!isCreate} />
        <TextField name="description" />
        <Select name="watermarkType" onChange={this.onSelectChange} />
        <NumberField name="fillOpacity" min={0} step={0.1} max={1} />
        {!isImg && <ColorPicker name="color" />}
        {!isImg && <NumberField name="fontSize" min={1} step={1} />}
        {isImg && <NumberField name="weight" min={1} step={1} />}
        {isImg && <NumberField name="height" min={1} step={1} />}
        <NumberField name="xAxis" min={0} step={1} />
        <NumberField name="yAxis" min={0} step={1} />
        <Select name="align">
          <Option value={0}>
            {intl.get('hfile.waterMark.view.waterMark.leftAlign').d('左对齐')}
          </Option>
          <Option value={1}>{intl.get('hfile.waterMark.view.waterMark.center').d('居中')}</Option>
          <Option value={2}>
            {intl.get('hfile.waterMark.view.waterMark.rightAlign').d('右对齐')}
          </Option>
        </Select>
        <NumberField name="rotation" min={0} step={1} />
        {!isImg && <TextArea name="detail1" />}
        {isImg && (
          <UrlAttachment
            name="detail"
            accept={['image/jpeg', 'image/png']}
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="hfle01"
          />
        )}
        {!isImg && (
          <UrlAttachment name="fontUrl" bucketName={PRIVATE_BUCKET} bucketDirectory="hfle01" />
        )}
      </Form>
    );
  }
}
