import React, { PureComponent } from 'react';
import { Button, Drawer } from 'hzero-ui';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
// import { getCodeMeaning } from 'utils/utils';
import EditorForm from './Form';
// import styles from './index.less';

export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // formDataSource: {},
    };

    // 方法注册
    ['cancel', 'handleCreate', 'handleSave'].forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  // getSnapshotBeforeUpdate(prevProps) {
  //   const { visible, applicationId } = this.props;
  //   return visible
  //     ? applicationId !== prevProps.applicationId
  //       ? isNumber(applicationId) ? 'edit' : 'create'
  //       : null
  //     : null;
  // }
  // // applicationId !== prevProps.applicationId
  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // If we have a snapshot value, we've just added new items.
  //   // Adjust scroll so these new items don't push the old ones out of view.
  //   // (snapshot here is the value returned from getSnapshotBeforeUpdate)
  //   if (snapshot === 'edit') {
  //     this.handleFetchDetail();
  //   } else if (snapshot === 'create') {
  //     this.handleFetchClientInfo();
  //   }
  // }

  /**
   * cancel - 关闭公式抽屉
   */
  cancel() {
    const { close = (e) => e } = this.props;
    const { resetFields = (e) => e } = this.editorForm;
    resetFields();
    close();
  }

  /**
   * handleCreate - 创建公式
   */
  handleCreate() {
    const { validateFields = (e) => e } = this.editorForm;
    const { createIndicator = (e) => e, dataSource = {} } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        createIndicator({ ...dataSource, ...values }, () => {
          this.cancel();
        });
      }
    });
  }

  /**
   * handleSave - 修改公式
   */
  handleSave() {
    const { validateFields = (e) => e } = this.editorForm;
    const { updateIndicator = (e) => e, dataSource = {} } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        updateIndicator({ ...dataSource, ...values }, () => {
          this.cancel();
        });
      }
    });
  }

  render() {
    const {
      visible,
      processing = {},
      dataSource = {},
      status,
      scoreTypeCode = [],
      indicatorTypeCode = [],
    } = this.props;
    // const {
    //   formDataSource = {},
    // } = this.state;
    const actionMap = {
      addParentIndicator: intl
        .get(`spfm.supplierKpiIndicator.view.title.addIndicator`)
        .d('新增指标'),
      addChildIndicator: intl
        .get(`spfm.supplierKpiIndicator.view.title.addIndicator`)
        .d('新增指标'),
      edit: intl.get(`spfm.supplierKpiIndicator.view.title.editIndicator`).d('编辑指标'),
    };

    const title = actionMap[status];
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
      indicatorTypeCode,
      dataSource: Object.assign(
        dataSource,
        status !== 'edit'
          ? {
              // scoreType: 'SYSTEM',
              // scoreTypeMeaning: getCodeMeaning('SYSTEM', scoreTypeCode),
              enabledFlag: 1,
            }
          : {}
      ),
      ref: (node) => {
        this.editorForm = node;
      },
      processing: processing.queryClientInfo,
      status,
      scoreTypeCode,
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
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          {status === 'edit' ? (
            <Button type="primary" loading={processing.update} onClick={this.handleSave}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          ) : (
            <Button type="primary" loading={processing.create} onClick={this.handleCreate}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          )}
        </div>
      </Drawer>
    );
  }
}
