import React, { Component, Fragment } from 'react';
import { Modal, Form, Input, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload';

import intl from 'utils/intl';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { getResponse } from 'utils/utils';
import { getEnableDeleteArchiveFileFlag } from '@/services/contractCommonService';

import styles from '../index.less';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 14 },
};
@Form.create()
export default class componentName extends Component {
  constructor(props) {
    super(props);
    this.state = {
      enableDeleteArchiveFileFlag: 1,
    };
  }

  componentDidMount() {
    this.enableDeleteArchiveFileFlag();
  }

  @Bind()
  async enableDeleteArchiveFileFlag() {
    const { pcHeaderId } = this.props?.headerInfo || {};
    if (pcHeaderId) {
      const res = getResponse(await getEnableDeleteArchiveFileFlag({ pcHeaderId }));
      if (res) {
        this.setState({
          enableDeleteArchiveFileFlag: res?.enableDeleteArchiveFileFlag,
        });
      }
    }
  }

  /**
   * 确认回调
   */
  @Bind()
  handleOk() {
    const {
      onOk,
      headerInfo = {},
      form: { validateFields },
    } = this.props;
    const { pcHeaderId, pcStatusCode, electricSignFlag } = headerInfo;
    validateFields((err, values) => {
      if (!err) {
        if (onOk) {
          onOk({ ...values, pcHeaderId, pcStatusCode, electricSignFlag });
        }
      }
    });
  }

  @Bind()
  handleCancel() {
    const {
      onCancel,
      form: { resetFields },
    } = this.props;
    resetFields();
    onCancel();
  }

  @Bind()
  fileControl(fileList) {
    const { enableDeleteArchiveFileFlag } = this.state;
    const newMap = new Map();
    fileList.forEach((file) =>
      newMap.set(String(file.fileId || file.uid || file.attachmentId), {
        ...file,
        fileReadOnly: file.fileMark === 'readOnly' && enableDeleteArchiveFileFlag !== 1,
      })
    );
    return newMap;
  }

  render() {
    const {
      form,
      visible,
      archiveContractLoading,
      customizeForm,
      headerInfo = {},
      modalClassName,
    } = this.props;
    const { getFieldDecorator } = form;
    const uploadProps = {
      icon: false,
      attachmentUUID: headerInfo.archiveAttachmentUuid,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'spcm-supplier',
      fileControl: this.fileControl,
    };
    const { pcNum, pcName, createByRealName } = headerInfo || {};
    return (
      <Modal
        destroyOnClose
        visible={visible}
        className={modalClassName}
        title={intl.get(`spcm.common.view.button.file`).d('填写归档编码')}
        onCancel={this.handleCancel}
        footer={
          <Fragment>
            <Button onClick={this.handleCancel}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
            <Button type="primary" onClick={this.handleOk} loading={archiveContractLoading}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          </Fragment>
        }
      >
        {customizeForm(
          {
            code: 'SPCM.PURCHASE_CONTRACT_VIEW.ARCHIVE',
            form,
            dataSource: headerInfo,
          },
          <Form className={styles['archive-form']}>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.pcNum`).d('协议编号')}
                >
                  {getFieldDecorator('pcNum', {
                    initialValue: pcNum,
                  })(<span>{pcNum}</span>)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.pcName`).d('协议名称')}
                >
                  {getFieldDecorator('pcName', {
                    initialValue: pcName,
                  })(<span>{pcName}</span>)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.model.common.createByRealName`).d('创建人')}
                >
                  {getFieldDecorator('createByRealName', {
                    initialValue: createByRealName,
                  })(<span>{createByRealName}</span>)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.archiveCode`).d('归档码')}
                >
                  {getFieldDecorator('archiveCode', {
                    initialValue: headerInfo.archiveCode,
                  })(<Input rows={4} maxLength={120} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`spcm.common.attachmentUuid`).d('归档文件')}
                >
                  {getFieldDecorator('archiveAttachmentUuid', {
                    initialValue: headerInfo.archiveAttachmentUuid,
                  })(<Upload {...uploadProps} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Modal>
    );
  }
}
