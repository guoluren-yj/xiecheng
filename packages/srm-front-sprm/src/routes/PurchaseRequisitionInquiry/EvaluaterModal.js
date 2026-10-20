/**
 * evaluateModal-- 评分组件
 * @date: 2019-12-09
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Rate, Input, Form, Button } from 'hzero-ui';
import { getCurrentOrganizationId } from 'utils/utils';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import notification from 'utils/notification';
import style from './index.less';

const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';

// const RadioGroup = Radio.Group;
const { TextArea } = Input;
const FormItem = Form.Item;

@Form.create()
@connect(({ purchaseRequisitionInquiry }) => ({
  purchaseRequisitionInquiry,
  organizationId: getCurrentOrganizationId(),
}))
export default class EvaluateModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: null,
      evaluateFlag: 0,
    };
  }

  componentDidMount() {
    this.modalSearch();
  }

  /*
   *查询评价数据
   */
  @Bind()
  modalSearch() {
    const { prHeaderId, dispatch, organizationId } = this.props;
    const {
      form: { setFieldsValue },
    } = this.props;
    dispatch({
      type: 'purchaseRequisitionInquiry/evaluate',
      payload: { prHeaderId, organizationId },
    }).then((res) => {
      if (res) {
        this.setState({
          values: res.satisfactionDegreeCode,
          evaluateFlag: res.evaluateFlag === null ? 0 : res.evaluateFlag,
        });
        setFieldsValue({ evaluateRemark: res.evaluateRemark });
      }
    });
  }

  /*
   *保存评价数据
   */
  @Bind()
  modalSave() {
    const { values } = this.state;
    const {
      modalList,
      form: { validateFields },
      dispatch,
      hideModal = (e) => e,
      handleSearchWholeOrder = (e) => e,
    } = this.props;
    validateFields((err, val) => {
      const Prheader = {
        ...modalList,
        satisfactionDegreeCode: values,
        evaluateRemark: val.evaluateRemark || null,
      };
      if (!err) {
        if (values <= 2 && val.evaluateRemark === null) {
          notification.warning({
            message: intl.get(`${modelPrompt}.userRemarkNotbeNull`).d('备注内容不能为空'),
          });
        } else {
          dispatch({
            type: 'purchaseRequisitionInquiry/modalSave',
            payload: Prheader,
          }).then(() => {
            notification.success();
            hideModal();
            handleSearchWholeOrder();
          });
        }
      }
    });
  }

  @Bind()
  onChange(e) {
    const { form } = this.props; // 校验输入框
    this.setState(
      {
        values: e,
      },
      () => form.validateFields(['evaluateRemark'], { force: true })
    );
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { visible, hideModal = (e) => e } = this.props;
    const { values, evaluateFlag } = this.state;
    const modalProps = {
      visible,
      width: 450,
      footer: null,
      // destoryOnClose: true,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '400px', overflow: 'auto' },
      title: intl.get(`${modelPrompt}.happy`).d('满意度调查'),
    };
    return (
      <Modal {...modalProps}>
        <div style={{ marginBottom: 100 }}>
          <div>
            <div className={style['rate-box']}>
              <div className={style['rate-box-left']}>
                <span style={{ display: values === null || values === 0 ? 'block' : 'none' }}>
                  {intl.get(`${modelPrompt}.userMarktitle`).d('用户评价')}
                </span>
                <span style={{ display: +values === 1 ? 'block' : 'none' }}>
                  {intl.get(`${modelPrompt}.userMarkUnhappy`).d('非常不满意')}
                </span>
                <span style={{ display: +values === 2 ? 'block' : 'none' }}>
                  {intl.get(`${modelPrompt}.userMarknotOk`).d('不满意')}
                </span>
                <span style={{ display: +values === 3 ? 'block' : 'none' }}>
                  {intl.get(`${modelPrompt}.userMarkOk`).d('一般满意')}
                </span>
                <span style={{ display: +values === 4 ? 'block' : 'none' }}>
                  {intl.get(`${modelPrompt}.userMarkGood`).d('比较满意')}
                </span>
                <span style={{ display: +values === 5 ? 'block' : 'none' }}>
                  {intl.get(`${modelPrompt}.userMarkNice`).d('非常满意')}
                </span>
              </div>
              <div className={style['rate-box-right']}>
                <Rate
                  className={style['rate-box']}
                  allowClear
                  value={values}
                  onChange={this.onChange}
                  disabled={evaluateFlag === 1}
                />
              </div>
            </div>
          </div>
          <div className={style['remark-box']}>
            {intl.get(`${modelPrompt}.userRemark`).d('备注')}
          </div>
          <div className={style['textarea-box']}>
            <Form>
              <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
                {getFieldDecorator('evaluateRemark', {
                  rules: [
                    {
                      required: values === 1 || values === 2, // 打死不改
                      message: intl
                        .get('hzero.common.validation.notNull', {
                          name: intl.get(`${modelPrompt}.textRemark`).d('内容'),
                        })
                        .d(`${intl.get(`${modelPrompt}.textRemark`).d('内容')}不能为空`),
                    },
                    {
                      max: 160,
                      message: intl
                        .get(`hzero.common.validation.max`, {
                          max: 160,
                        })
                        .d(`长度不能超过${160}个字符`),
                    },
                  ],
                })(
                  <TextArea
                    className={style['text-area']}
                    disabled={evaluateFlag === 1 || values === null || values === 0}
                    autosize={{ minRows: 2, maxRows: 3 }}
                    rows={4}
                  />
                )}
              </FormItem>
            </Form>
          </div>
        </div>

        {evaluateFlag === 0 && (
          <div className={style['btn-box']}>
            <Button
              disabled={values === null || values === 0}
              onClick={this.modalSave}
              type="primary"
              className={style['btn-ok']}
            >
              {intl.get(`hzero.common.button.confrim`).d('确定')}
            </Button>
            <Button onClick={hideModal} className={style['btn-no']}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          </div>
        )}
      </Modal>
    );
  }
}
