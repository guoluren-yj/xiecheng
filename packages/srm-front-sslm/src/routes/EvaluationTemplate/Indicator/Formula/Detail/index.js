import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import EditorForm from './Form';
// import styles from './index.less';

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // formDataSource: {},
    };

    // 方法注册
    ['cancel', 'handleSave'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, applicationId } = this.props;
    return visible
      ? applicationId !== prevProps.applicationId
        ? applicationId
          ? 'edit'
          : 'create'
        : null
      : null;
  }

  // applicationId !== prevProps.applicationId
  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot === 'edit') {
      this.handleFetchDetail();
    } else if (snapshot === 'create') {
      this.handleFetchClientInfo();
    }
  }

  cancel() {
    const { close = (e) => e } = this.props;
    // const { resetFields = e => e } = this.editorForm;
    // resetFields();
    close();
  }

  handleSave() {
    const { validateFields = (e) => e } = this.editorForm;
    const { handleSaveIndicatorFmls = (e) => e, dataSource = {} } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        handleSaveIndicatorFmls({ ...dataSource, ...values }, () => {
          this.cancel();
        });
      }
    });
  }

  render() {
    const { visible, processing = {}, dataSource = {}, status } = this.props;
    // const {
    //   formDataSource = {},
    // } = this.state;
    const { indicatorFmlId } = dataSource;

    const title = indicatorFmlId
      ? intl.get('hzero.common.button.edit').d('编辑')
      : intl.get('hzero.common.button.add').d('新增');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 500,
    };

    const formProps = {
      dataSource,
      ref: (node) => {
        this.editorForm = node;
      },
      processing: processing.queryClientInfo,
      status,
    };

    return (
      <Drawer {...drawerProps}>
        <EditorForm {...formProps} />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'right',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button
            onClick={this.cancel}
            disabled={processing.save || processing.create}
            style={{ marginRight: 8 }}
          >
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
          <Button type="primary" loading={processing.save} onClick={this.handleSave}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
