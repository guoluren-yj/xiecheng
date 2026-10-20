import React, { PureComponent } from 'react';
import { Modal, Form, Input, Icon, Button } from 'hzero-ui';
import { isUndefined, isEmpty } from 'lodash';
import classNames from 'classnames';
import uuid from 'uuid/v4';
import { Bind, Debounce } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import styles from './index.less';

@formatterCollections({ code: ['sslm.supplierLifeConfig'] })
@Form.create({ fieldNameProp: null })
export default class NodeContainerModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      addFlag: false,
      tempNode: {
        stageId: uuid(),
        stageCode: uuid(),
      },
    };
  }

  @Bind()
  handleAddNode() {
    this.setState({ addFlag: true });
  }

  @Bind()
  handleCancelNode() {
    this.setState({ addFlag: false });
  }

  /**
   * 保存新增节点信息
   * @param {string} targetStageCode - 目标节点ID
   */
  @Debounce(500)
  handleSaveNode(targetStageId, targetStageCode) {
    const { form, onSave } = this.props;
    const stageDescription = form.getFieldValue(targetStageId);
    const stageCode = form.getFieldValue(targetStageCode);
    if (isUndefined(stageCode) || isEmpty(stageCode)) {
      notification.warning({
        message: intl.get('sslm.supplierLifeConfig.view.stageCode.warning').d('节点编码不能为空'),
      });
    } else if (isUndefined(stageDescription) || isEmpty(stageDescription)) {
      notification.warning({
        message: intl.get('sslm.supplierLifeConfig.view.validation.warning').d('节点名称不能为空'),
      });
    } else {
      form.validateFields(err => {
        if (!err) {
          onSave({ stageDescription, stageCode }).then(res => {
            if (res) {
              const { nodes = [], stages = [], targetIndex, onChange } = this.props;
              stages.splice(targetIndex + 1, 0, res);
              onChange(
                {
                  lifeStage: stages,
                  nodeList: [...nodes, res],
                },
                false
              );
            }
            this.setState({ addFlag: false });
          });
        } else if (!isEmpty(err)) {
          for (const key in err) {
            if (Object.hasOwnProperty.call(err, key)) {
              const { errors } = err[key] || {};
              if (!isEmpty(errors)) {
                const message = errors.map(error => <dv>{error.message}</dv>);
                notification.warning({
                  message,
                });
              }
            }
          }
        }
      });
    }
  }

  /**
   * 选中要添节点
   * @param {object} node - 节点对象
   */
  @Bind()
  handleSelectNode(node) {
    const { onSelect, targetIndex, stages } = this.props;
    const supplierStage = [
      ...stages.slice(0, targetIndex + 1),
      { ...node },
      ...stages.slice(targetIndex + 1),
    ];
    onSelect(supplierStage);
  }

  /**
   * 从节点池中删除自建且未被引用的节点
   * @param {number} stageId - 节点索引
   */
  @Bind()
  handleRemoveNode(stageId) {
    this.setState({ addFlag: false });
    const { nodes, onDelete } = this.props;
    const node = nodes.find(i => i.stageId === stageId);
    onDelete(node);
  }

  @Bind()
  handleCancel() {
    const { onCancel } = this.props;
    this.setState({ addFlag: false }, onCancel());
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      visible,
      style,
      availableNodes,
      noFlag,
      form: { getFieldDecorator },
    } = this.props;
    const { addFlag = false, tempNode = {} } = this.state;
    return (
      <Modal
        destroyOnClose
        maskClosable
        width={245}
        closable={false}
        visible={visible}
        onCancel={this.handleCancel}
        footer={null}
        style={style}
        className={classNames(styles['modal-style'])}
      >
        <div className={classNames(styles['node-modal'])}>
          {availableNodes.map(node => (
            <div
              key={node.stageId}
              className={classNames({
                [styles['node-item']]: true,
              })}
              onDoubleClick={() => this.handleSelectNode(node)}
            >
              <p className={classNames(styles['node-item-text'])}>
                {node.cycleStages.stageDescription}
              </p>
              <Icon
                type="close"
                theme="outlined"
                className={classNames(styles['node-item-delete'])}
                onClick={() => this.handleRemoveNode(node.stageId)}
                style={{ display: node.cycleStages.allowDisableFlag === 1 ? 'block' : 'none' }}
              />
            </div>
          ))}
          {(addFlag || noFlag) && (
            <div
              className={classNames(styles['node-edit'])}
              style={{ borderTop: noFlag ? 'none' : '1px solid #e8e8e8' }}
            >
              {getFieldDecorator(`${tempNode.stageCode}`, {
                rules: [
                  {
                    pattern: /^[0-9A-Z]*$/,
                    message: intl
                      .get('sslm.supplierLifeConfig.view.stageCode.patternErrorMsg')
                      .d('节点编码需由大写字母和数字组成'),
                  },
                ],
              })(
                <Input
                  trim
                  className={classNames(styles['node-item-input'])}
                  placeholder={intl
                    .get(`sslm.supplierLifeConfig.view.stageCode.placeHolder`)
                    .d('请输入新增节点编码')}
                />
              )}
              {getFieldDecorator(`${tempNode.stageId}`, {})(
                <Input
                  trim
                  className={classNames(styles['node-item-input'])}
                  placeholder={intl
                    .get(`sslm.supplierLifeConfig.view.nodeInput.placeHolder`)
                    .d('请输入新增节点名称')}
                />
              )}
              <Button
                size="small"
                style={{ display: noFlag ? 'none' : 'inline-flex' }}
                className={classNames(styles['del-btn'])}
                onClick={() => this.handleCancelNode()}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
              <Button
                size="small"
                type="primary"
                className={classNames(styles['save-btn'])}
                onClick={() => this.handleSaveNode(tempNode.stageId, tempNode.stageCode)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
            </div>
          )}
          {!addFlag && !noFlag && (
            <div
              className={classNames({
                [styles['node-add']]: true,
              })}
            >
              <Icon type="plus" onClick={this.handleAddNode} />
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
