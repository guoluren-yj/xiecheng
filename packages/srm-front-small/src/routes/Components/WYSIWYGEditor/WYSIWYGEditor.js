import React, { Component, Fragment } from 'react';
import { Modal } from 'choerodon-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import BaseEditor from './BaseEditor';

const defaultProps = {
  mode: 'edit',
};

@formatterCollections({
  code: ['small.common', 'small.wysiwygeditor'],
})
class WYSIWYGEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isFullScreen: false,
    };
    this.oldValue = null; // 全屏弹出之前的值，用来处理取消
    this.value = props.value || props.defaultValue;
  }

  saveRef = (name) => (ref) => {
    this[name] = ref;
    const { saveRef } = this.props;
    if (saveRef) {
      saveRef(ref);
    }
  };

  handleFullScreenClick = () => {
    this.oldValue = this.Editor?.value;
    this.setState({
      isFullScreen: true,
    });
  };

  handleFullScreenCancel = () => {
    if (this.Editor) {
      this.Editor.props.setValue(this.oldValue);
    }
    this.value = this.oldValue;
    this.setState({
      isFullScreen: false,
    });
  };

  handleCancel = () => {
    const { handleDelete } = this.props;
    if (handleDelete) {
      handleDelete();
    }
  };

  handleSave = async () => {
    this.setState({
      loading: true,
    });
    const { handleSave } = this.props;
    if (handleSave) {
      try {
        await handleSave(this.value);
        this.setState({
          isFullScreen: false,
        });
      } finally {
        this.setState({
          loading: false,
        });
      }
    }
  };

  handleChange = (value) => {
    this.value = value;
    const { onChange } = this.props;
    if (onChange) {
      onChange(value);
    }
  };

  render() {
    const {
      toolbarHeight,
      handleDelete,
      handleSave,
      mode,
      defaultValue,
      value,
      ...restProps
    } = this.props;
    const readOnly = mode === 'read';
    const { loading, isFullScreen } = this.state;
    return (
      <Fragment>
        <BaseEditor
          {...restProps}
          value={value || this.value}
          onChange={this.handleChange}
          ref={this.saveRef('Editor')}
          mode={mode}
          readOnly={readOnly}
          onFullScreenClick={this.handleFullScreenClick}
          onCancel={this.handleCancel}
          onSave={this.handleSave}
          loading={loading}
        />
        {isFullScreen && (
          <Modal
            title={intl.get('small.wysiwygeditor.modal.description').d('描述')}
            maskClosable={false}
            visible
            width={1200}
            wrapClassName="c7n-agile-editDescription"
            style={{
              height: '85%',
            }}
            onCancel={this.handleFullScreenCancel}
            onOk={this.handleSave}
          >
            <BaseEditor
              {...restProps}
              value={value || this.value}
              onChange={this.handleChange}
              mode={mode}
              readOnly={readOnly}
              bottomBar={false}
              hideFullScreen
              style={{ height: '100%', marginTop: 20, width: '100%' }}
            />
          </Modal>
        )}
      </Fragment>
    );
  }
}
WYSIWYGEditor.defaultProps = defaultProps;
export default WYSIWYGEditor;
