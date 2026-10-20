/**
 * index - 弹性域汇总查询页面-新建模型
 * @date: 2019-4-25
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Drawer, Spin } from 'hzero-ui';
import { isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import EditorForm from './Form';
// import styles from './index.less';

// 设置sinv国际化前缀 - view.title
// const viewTitlePrompt = 'hpfm.flexModel.view.title';
// 设置sinv国际化前缀 - view.button
// const viewButtonPrompt = 'spfm.flexRule.view.button';
// 设置通用国际化前缀

/**
 *
 *
 * @export
 * @class Editor
 * @extends {PureComponent}
 */
export default class Editor extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: {},
      queryDetailLoading: false,
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, currentEditingRowData = {}, primaryKey } = this.props;
    return (
      visible &&
      isNumber(currentEditingRowData[primaryKey]) &&
      currentEditingRowData[primaryKey] !== prevProps.currentEditingRowData[primaryKey]
    );
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    if (snapshot) {
      this.handleFetchDetail();
    }
  }

  /**
   * cancel - 关闭指标详情抽屉
   */
  @Bind()
  cancel() {
    const { close = e => e } = this.props;
    const { resetFields = e => e } = this.editorForm;
    this.setState({
      dataSource: {},
    });
    resetFields();
    close();
  }

  /**
   * handleCreate - 新建指标
   */
  @Bind()
  handleCreate() {
    const { validateFields = e => e } = this.editorForm || {};
    const { create = e => e } = this.props;
    validateFields((error, values) => {
      if (isEmpty(error)) {
        create(
          {
            ...values,
            enabledFlag: values.enabledFlag ? 1 : 0,
            tenantId: getCurrentOrganizationId(),
          },
          () => {
            this.cancel();
          }
        );
      }
    });
  }

  /**
   * handleSave - 保存指标详情
   */
  @Bind()
  handleSave() {
    const { validateFields = e => e } = this.editorForm || {};
    const { dataSource = {} } = this.state;
    const { save = e => e } = this.props;

    validateFields((error, values) => {
      if (isEmpty(error)) {
        const { ruleDetailId } = dataSource;
        const editable = isNumber(ruleDetailId);
        const data = { ...dataSource, ...values, enabledFlag: values.enabledFlag ? 1 : 0 };
        if (!editable) {
          data.tenantId = getCurrentOrganizationId();
        }
        save(data, () => {
          this.cancel();
        });
      }
    });
  }

  @Bind()
  handleFetchDetail() {
    const { fetchDetail = () => {} } = this.props;
    this.setState({
      queryDetailLoading: true,
    });
    fetchDetail().then(res => {
      if (res) {
        this.setState({
          dataSource: res,
          queryDetailLoading: false,
        });
      }
    });
  }

  render() {
    const { visible, saveLoading } = this.props;
    const { dataSource = {}, queryDetailLoading } = this.state;
    const { ruleDetailId } = dataSource;
    const editable = isNumber(ruleDetailId);
    const title = editable
      ? intl.get(`hzero.common.button.edit`).d('编辑')
      : intl.get('hzero.common.button.create').d('新建');
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.cancel,
      width: 550,
    };
    const formProps = {
      dataSource,
      onRef: (node = {}) => {
        this.editorForm = node.props.form;
      },
      editable,
    };
    return (
      <Drawer {...drawerProps}>
        <Spin spinning={queryDetailLoading}>
          <EditorForm {...formProps} />
        </Spin>
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
          <Button onClick={this.cancel} disabled={saveLoading} style={{ marginRight: 8 }}>
            {intl.get(`hzero.common.button.cancel`).d('取消')}
          </Button>
          <Button type="primary" loading={saveLoading} onClick={this.handleSave}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
