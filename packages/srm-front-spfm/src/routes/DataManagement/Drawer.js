import React, { PureComponent } from 'react';
import { isEmpty, isFunction } from 'lodash';
import PropTypes from 'prop-types';
import { Modal, Form, DatePicker, Input, Select } from 'hzero-ui';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import moment from 'moment';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';
import MultipleLov from '../components/MultipleLov';

/**
 * 资料管理配置-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
const tenantId = getCurrentOrganizationId();
const promptCode = 'spfm.dataManagement';
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: (e) => e,
    onCancel: (e) => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, targetItem, onOk, dispatch } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          // delete value._status
          // 校验通过，进行保存操作
          if (
            values.attachmentTarget === 'PART_SUPPLIER' &&
            isEmpty(values.attSupplierCategoryIds) &&
            isEmpty(values.stageIds)
          ) {
            notification.error({
              message: intl
                .get(`${promptCode}.view.message.saveFailed`)
                .d(
                  '保存失败，失败原因是可见供应商分类和可见供应商生命周期二者必输其一，请维护后重新保存。'
                ),
            });
            return;
          }
          if (values.companyId && (values.webUrl === null || values.webUrl === undefined)) {
            dispatch({
              type: 'dataManagement/queryAssign',
              payload: { companyId: values.companyId, tenantId },
            }).then((val) => {
              if (isEmpty(val)) {
                notification.error({
                  description: intl
                    .get('spfm.dataManagment.view.deliver.notification.NotwebUrl')
                    .d('该公司未分配域名地址，页面展示将无效'),
                });
              } else {
                onOk({ ...targetItem, ...values });
              }
            });
          } else {
            onOk({ ...targetItem, ...values });
          }
        }
      });
    }
  }

  @Bind()
  updateOperator() {
    const { dispatch, targetItem } = this.props;
    dispatch({
      type: 'dataManagement/updateOperator',
      payload: targetItem,
    });
  }

  @Bind()
  removeFile(file) {
    const { dispatch, targetItem } = this.props;
    const urlLink = file?.url?.split('&url=') || [];
    if (urlLink?.length > 0) {
      dispatch({
        type: 'dataManagement/removeFile',
        payload: {
          urls: [urlLink[1]],
          bucketName: PUBLIC_BUCKET,
          attachmentUUID: targetItem.attachmentUuid,
        },
      }).then(() => {
        const { creationDate } = targetItem;
        if (creationDate) {
          this.updateOperator();
        }
      });
    }
  }

  @Bind()
  handleDisabledDate(currentDate) {
    const { form, targetItem } = this.props;
    const { categoryCode, expireDate } = targetItem;
    const { getFieldValue } = form;
    const date = getFieldValue('parentExpireDate');
    if ((getFieldValue('categoryCode') || categoryCode) === 'DATA_CATEGORY') {
      if (moment(currentDate).format('YYYYMMDD') < moment(expireDate).format('YYYYMMDD')) {
        return true;
      }
    }
    if (moment(currentDate).format('YYYYMMDD') < moment().format('YYYYMMDD')) {
      return true;
    }
    if (date && moment(currentDate).format('YYYYMMDD') > moment(date).format('YYYYMMDD')) {
      return true;
    }
  }

  @Bind()
  handleDisabledForever() {
    const { form } = this.props;
    const { getFieldValue } = form;
    const parentForeverFlag = getFieldValue('parentForeverFlag');
    if (parentForeverFlag === 0) {
      return true;
    }
    return false;
  }

  @Bind()
  handleOnchange(lovRecord) {
    const { form, targetItem } = this.props;
    const { categoryCode } = targetItem;
    const { foreverFlag, expireDate } = lovRecord;
    const { setFieldsValue, getFieldValue } = form;
    if (expireDate) {
      // if ((getFieldValue('categoryCode') || categoryCode) === 'DATA_CATEGORY') {
      if (
        getFieldValue('expireDate') &&
        moment(expireDate).format('YYYYMMDD') < getFieldValue('expireDate').format('YYYYMMDD')
      ) {
        const ref = Modal.confirm({
          title: intl.get(`${promptCode}.view.message.model.tipTitle`).d('到期日变更提醒'),
          onOk: () => {
            setFieldsValue({ expireDate: moment(expireDate), parentExpireDate: expireDate });
            ref.destroy();
          },
          onCancel: () => {
            setFieldsValue({ parentAttachmentId: null });
            ref.destroy();
          },
          okText: intl.get('hzero.common.button.confrim').d('确认'),
          cancelText: intl.get('hzero.common.button.cancel').d('取消'),
          content:
            (getFieldValue('categoryCode') || categoryCode) === 'DATA_CATEGORY'
              ? intl
                  .get(`${promptCode}.view.message.model.tipInfo`)
                  .d(
                    '资料移动目标大类到期日早于当前所属资料大类，移动后资料到期日将与目标大类保持一致，请确认是否移动'
                  )
              : intl
                  .get(`${promptCode}.view.message.model.tipDataInfo`)
                  .d(
                    '资料移动目标大类到期日早于当前所属资料，移动后资料到期日将与目标大类保持一致，请确认是否移动'
                  ),
        });
        return;
      }
      if (!getFieldValue('expireDate')) {
        setFieldsValue({ expireDate: moment(expireDate) });
      }
      setFieldsValue({ parentExpireDate: expireDate });
    } else {
      setFieldsValue({ parentExpireDate: expireDate });
    }

    if (foreverFlag === 1) {
      setFieldsValue({ expireDate: undefined, foreverFlag: 1 });
    } else {
      setFieldsValue({ foreverFlag: 0 });
    }
    setFieldsValue({
      parentExpireDate: expireDate,
      parentForeverFlag: foreverFlag,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      visible,
      title,
      form,
      loading,
      targetItem,
      onCancel,
      targetEnum,
      categoryStatus,
      groupMsg = {},
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const { attachmentId } = targetItem;
    if (isFunction(getFieldDecorator)) {
      getFieldDecorator('parentExpireDate', {
        initialValue: targetItem.parentExpireDate,
      });
      getFieldDecorator('parentForeverFlag', {
        initialValue: targetItem.parentForeverFlag,
      });
    }
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        confirmLoading={loading}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.save').d('保存')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.dataClassCode`).d('资料分类编码')}
            {...formLayout}
          >
            {getFieldDecorator('dataClassCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`${promptCode}.view.message.model.dataClassCode`)
                      .d('资料分类编码'),
                  }),
                },
              ],
              initialValue: targetItem.dataClassCode,
            })(<Input disabled={targetItem.dataClassCode} inputChinese={false} />)}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`${promptCode}.view.message.model.categoryCode`).d('类别')}
          >
            {getFieldDecorator('categoryCode', {
              initialValue: targetItem.categoryCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.message.model.categoryCode`).d('类别'),
                  }),
                },
              ],
            })(
              <Select
                disabled={attachmentId}
                onChange={() => {
                  setFieldsValue({
                    attachmentTarget: null,
                    attSupplierCategoryIds: null,
                    attSupplierCategoryArr: [],
                    attPurchaseIds: null,
                    attPurchaseArr: [],
                    stageIds: null,
                    stageArr: [],
                  });
                }}
              >
                {categoryStatus.map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.dataManagementTitle`).d('标题')}
            {...formLayout}
          >
            {getFieldDecorator('title', {
              // rules: [
              //   {
              //     required: true,
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl
              //         .get(`${promptCode}.view.message.model.dataManagementTitle`)
              //         .d('标题'),
              //     }),
              //   },
              // ],
              initialValue: targetItem.title,
            })(
              <Input
                disabled={(getFieldValue('categoryCode') || targetItem.categoryCode) !== 'DATA'}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.dataClassName`).d('分类名称')}
            {...formLayout}
          >
            {getFieldDecorator('dataClassName', {
              // rules: [
              //   {
              //     required: true,
              //     message: intl.get('hzero.common.validation.notNull', {
              //       name: intl
              //         .get(`${promptCode}.view.message.model.dataClassName`)
              //         .d('分类名称'),
              //     }),
              //   },
              // ],
              initialValue: targetItem.dataClassName,
            })(
              <Input
                disabled={
                  (getFieldValue('categoryCode') || targetItem.categoryCode) !== 'DATA_CATEGORY'
                }
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.parentAttachmentId`).d('所属分类')}
            {...formLayout}
          >
            {getFieldDecorator('parentAttachmentId', {
              initialValue: targetItem.parentAttachmentId,
              rules: [
                {
                  required: (getFieldValue('categoryCode') || targetItem.categoryCode) === 'DATA',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`${promptCode}.view.message.model.parentAttachmentId`)
                      .d('所属分类'),
                  }),
                },
              ],
            })(
              <Lov
                code="SPFM.EXHIBIT_PORTAL_ATTACHMENT_TREE"
                textValue={
                  targetItem.parentDataClassCode &&
                  `${targetItem.parentDataClassCode}${
                    targetItem.parentDataClassName ? `-${targetItem.parentDataClassName}` : ''
                  }`
                }
                queryParams={{ tenantId, attachmentId }}
                onChange={(_, lovRecord) => this.handleOnchange(lovRecord)}
              />
            )}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`${promptCode}.view.message.model.attachmentTarget`).d('展出对象')}
          >
            {getFieldDecorator('attachmentTarget', {
              initialValue: targetItem.attachmentTarget,
              rules: [
                {
                  required: (getFieldValue('categoryCode') || targetItem.categoryCode) === 'DATA',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl
                      .get(`${promptCode}.view.message.model.attachmentTarget`)
                      .d('展出对象'),
                  }),
                },
              ],
            })(
              <Select
                onChange={() => {
                  setFieldsValue({
                    attSupplierCategoryIds: null,
                    attSupplierCategoryArr: [],
                    attPurchaseIds: null,
                    attPurchaseArr: [],
                    stageIds: null,
                    stageArr: [],
                  });
                }}
                disabled={(getFieldValue('categoryCode') || targetItem.categoryCode) !== 'DATA'}
              >
                {targetEnum.map((n) => (
                  <Select.Option key={n.value} value={n.value}>
                    {n.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl
              .get(`${promptCode}.view.message.model.attSupplierCategoryIds`)
              .d('可见供应商分类')}
            {...formLayout}
          >
            {getFieldDecorator('attSupplierCategoryIds', {
              initialValue: targetItem.attSupplierCategoryIds,
            })(
              <MultipleLov
                disabled={
                  (getFieldValue('attachmentTarget') || targetItem.attachmentTarget) !==
                  'PART_SUPPLIER'
                }
                code="SSLM.SUPPLIER_CATEGORY_TREE"
                allowClear
                tooltipHidden
                oldValueField="attSupplierCategoryArr"
                oldValue={targetItem.attSupplierCategoryArr || []}
                textValue={targetItem.attSupplierCategoryNames}
                queryParams={{ tenantId }}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.stageIds`).d('可见供应商生命周期')}
            {...formLayout}
          >
            {getFieldDecorator('stageIds', {
              initialValue: targetItem.stageIds,
            })(
              <MultipleLov
                disabled={
                  (getFieldValue('attachmentTarget') || targetItem.attachmentTarget) !==
                  'PART_SUPPLIER'
                }
                code="SSLM.LIFE_CYCLE_STAGE"
                allowClear
                tooltipHidden
                oldValueField="stageArr"
                oldValue={targetItem.stageArr || []}
                textValue={targetItem.stageDescriptions}
                queryParams={{ tenantId }}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.attPurchaseIds`).d('可见组织')}
            {...formLayout}
          >
            {getFieldDecorator('attPurchaseIds', {
              initialValue: targetItem.attPurchaseIds,
              rules: [
                {
                  required:
                    (getFieldValue('attachmentTarget') || targetItem.attachmentTarget) ===
                    'PART_PURCHASE',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.message.model.attPurchaseIds`).d('可见组织'),
                  }),
                },
              ],
            })(
              <MultipleLov
                disabled={
                  (getFieldValue('attachmentTarget') || targetItem.attachmentTarget) !==
                  'PART_PURCHASE'
                }
                textValue={targetItem.attPurchaseNames}
                code="SPFM.UNIT.DEPARTMENT"
                oldValue={targetItem.attPurchaseArr || []}
                oldValueField="attPurchaseArr"
                allowClear
                tooltipHidden
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.foreverFlag`).d('是否长期')}
            {...formLayout}
          >
            {getFieldDecorator('foreverFlag', {
              initialValue: targetItem.foreverFlag,
            })(
              <Switch
                onChange={() => {
                  setFieldsValue({
                    expireDate: null,
                  });
                }}
                disabled={this.handleDisabledForever()}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.expireDate`).d('到期日')}
            {...formLayout}
          >
            {getFieldDecorator('expireDate', {
              initialValue: targetItem.expireDate ? moment(targetItem.expireDate) : null,
              rules: [
                {
                  required: getFieldValue('foreverFlag') !== 1,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.view.message.model.expireDate`).d('到期日'),
                  }),
                },
              ],
            })(
              <DatePicker
                disabled={getFieldValue('foreverFlag') === 1}
                style={{ width: '100%' }}
                placeholder=""
                format={DEFAULT_DATE_FORMAT}
                disabledDate={this.handleDisabledDate}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.groupName`).d('集团名称')}
            {...formLayout}
          >
            {getFieldDecorator('groupName', {
              initialValue: targetItem._status ? targetItem.groupName : groupMsg.groupName,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.companyNum`).d('公司编码')}
            {...formLayout}
          >
            {getFieldDecorator('companyId', {
              initialValue: targetItem.companyId,
            })(
              <Lov
                // textValue={targetItem.receiverTypeName}
                code="HPFM.COMPANY"
                textValue={targetItem.companyNum}
                queryParams={{ tenantId }}
                lovOptions={{ valueField: 'companyId', displayField: 'companyNum' }}
                onChange={(_, item) => {
                  setFieldsValue({
                    companyName: item.companyName,
                    webUrl: null,
                  });
                }}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.companyName`).d('公司名称')}
            {...formLayout}
          >
            {getFieldDecorator('companyName', {
              initialValue: targetItem.companyName,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`${promptCode}.view.message.model.webUrl`).d('企业域名')}
            {...formLayout}
          >
            {getFieldDecorator('assignId', {
              initialValue: targetItem.assignId,
            })(
              <Lov
                // textValue={targetItem.receiverTypeName}
                code="SPFM.PORTAL_ENTERPRISE_DOMAIN"
                queryParams={{ tenantId, companyId: getFieldValue('companyId') }}
                // lovOptions={{displayField: 'webUrl', valueField: 'webUrl'}}
                textValue={targetItem.webUrl}
              />
            )}
          </Form.Item>

          {(getFieldValue('categoryCode') || targetItem.categoryCode) === 'DATA' && (
            <Form.Item
              {...formLayout}
              label={intl.get(`${promptCode}.view.message.model.file`).d('上传附件')}
              // extra={intl
              //   .get('hzero.common.upload.support', { type: '*.jpg;*.png;*.jpeg;*.pdf' })
              //   .d('上传格式：*.jpg;*.png;*.jpeg;*.pdf')}
            >
              {getFieldDecorator('attachmentUuid', {
                initialValue: targetItem.attachmentUuid,
              })(<div />)}
              <Upload
                attachmentUUID={targetItem.attachmentUuid}
                showRemoveIcon
                filePreview
                bucketName={PUBLIC_BUCKET}
                bucketDirectory="spfm-comp"
                listType="picture-card"
                onRemove={(file) => {
                  this.removeFile(file);
                }}
                onChange={() => {
                  if (targetItem._status) {
                    this.updateOperator();
                  }
                }}
              />
            </Form.Item>
          )}
          <Form.Item label={intl.get(`hzero.common.entity.creator`).d('创建人')} {...formLayout}>
            {getFieldDecorator('realName', {
              initialValue: targetItem.realName,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item
            label={intl.get(`himp.commentImport.model.commentImport.creationDate`).d('创建日期')}
            {...formLayout}
          >
            {getFieldDecorator('creationDate', {
              initialValue: targetItem.creationDate ? moment(targetItem.creationDate, DEFAULT_DATETIME_FORMAT) : null,
            })(<DatePicker disabled showTime />)}
          </Form.Item>
          {/* <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('expireDate', { initialValue: targetItem.expireDate })}
          </Form.Item> */}
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('groupId', {
              initialValue: targetItem._status ? targetItem.groupId : groupMsg.groupId,
            })}
          </Form.Item>
          <Form.Item style={{ display: 'none' }}>
            {getFieldDecorator('attachmentUpdateFlag', {
              initialValue: targetItem.attachmentUpdateFlag,
            })}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
