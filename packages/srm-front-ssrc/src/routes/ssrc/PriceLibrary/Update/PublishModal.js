import React from 'react';
import { Modal, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import { FIlESIZE } from '@/utils/SsrcRegx';

const { TextArea } = Input;
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class PublishModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {};
  }

  render() {
    const {
      visible,
      hideModal,
      form: { getFieldDecorator },
      releasePriceLib,
      confirmLoading,
      header,
    } = this.props;
    return (
      <Modal
        visible={visible}
        width={700}
        onCancel={hideModal}
        title={intl.get(`ssrc.priceLibrary.model.library.publishConfirm`).d('发布确定')}
        onOk={releasePriceLib}
        okText={intl.get('hzero.common.button.release').d('发布')}
        confirmLoading={confirmLoading}
      >
        <Form layout="horizontal">
          <FormItem
            label={intl.get(`ssrc.priceLibrary.model.library.reason`).d('手动修改价格库原因')}
          >
            {getFieldDecorator('publishReason', {
              initialValue: (header && header.publishReason) || '',
            })(<TextArea rows={4} />)}
          </FormItem>
          <FormItem
            label={intl.get(`ssrc.bidEventQuery.model.bidHall.upload`).d('附件上传')}
            style={{ display: 'flex' }}
          >
            {getFieldDecorator('attachmentUuid')(
              <Upload
                filePreview
                icon="upload"
                bucketName={PRIVATE_BUCKET}
                fileSize={FIlESIZE}
                bucketDirectory="ssrc-rfx-priceLibrary"
                attachmentUUID={(header && header.attachmentUuid) || null}
              />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
