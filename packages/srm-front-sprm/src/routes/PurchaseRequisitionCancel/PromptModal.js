/**
 * index - 需求关闭取消提示框
 * @date: 2020-6-10
 * @author: guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import React, { useEffect, useState } from 'react';
import { Modal, Input, Row, Col, Form } from 'hzero-ui';
import { Spin, Card } from 'choerodon-ui';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCloseInfo } from '@/services/purchaseRequisitionCancelService';

import styles from './index.less';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};
const { TextArea } = Input;

const PromptModal = ({ promptTitle, params, form, flag, handleOk, handleCancel, visible }) => {
  const modalProps = {
    visible,
    width: 500,
    bodyStyle: {
      height: flag !== 'closedRemark' ? 148 : 448,
    },
    onOk: () => {
      form.validateFields((err) => {
        if (!err) handleOk();
      });
    },
    onCancel: () => handleCancel(),
  };
  const [closeInfo, setCloseInfo] = useState([]);
  const [closeInfoLoading, setCloseInfoLoading] = useState(true);

  useEffect(() => {
    if (flag === 'closedRemark') {
      const { prHeaderId, prLineIds } = params || {};
      getCloseInfo({ prLineIds, prHeaderId }).then((res) => {
        const data = getResponse(res);
        if (data) {
          setCloseInfo(data);
          setCloseInfoLoading(false);
        }
      });
    }
  }, [flag]);
  return (
    <Modal {...modalProps}>
      <Form layout="inline" className="more-fields-search-form" style={{ marginTop: '20px' }}>
        <Row {...EDIT_FORM_ROW_LAYOUT} className={styles.udpstyle}>
          <Col span={20}>
            <Form.Item label={promptTitle} {...formItemLayout}>
              {flag === 'cancelledRemark'
                ? form.getFieldDecorator('cancelledRemark', {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('hzero.common.validation.notNull', {
                            name: promptTitle,
                          })
                          .d(`${promptTitle}不能为空`),
                      },
                    ],
                  })(<TextArea style={{ marginBottom: '8px' }} rows={3} />)
                : flag === 'closedRemark'
                ? form.getFieldDecorator('closedRemark', {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('hzero.common.validation.notNull', {
                            name: promptTitle,
                          })
                          .d(`${promptTitle}不能为空`),
                      },
                    ],
                  })(<TextArea rows={3} />)
                : flag === 'sendBackRemark'
                ? form.getFieldDecorator('sendBackRemark', {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('hzero.common.validation.notNull', {
                            name: promptTitle,
                          })
                          .d(`${promptTitle}不能为空`),
                      },
                    ],
                  })(<TextArea rows={3} />)
                : null}
            </Form.Item>
          </Col>
        </Row>
      </Form>
      {flag === 'closedRemark' && (
        <Spin spinning={closeInfoLoading}>
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            title={intl.get(`sprm.common.model.closeInfo.title`).d('采购申请关闭提醒')}
          >
            <div style={{ height: 200, overflowY: 'auto' }}>
              {closeInfo
                ? closeInfo?.map((e) => (
                  <p>
                    {e.executionNewLinkTenantFlag &&
                      ['SOURCE_AND_ORDER', 'BEFORE_SOURCE_AFTER_ORDER'].includes(
                        e.executionStrategyCode
                      )
                        ? intl
                            .get('sprm.common.model.closeNoticeNew', {
                              name: `${e.displayPrNum}-${e.displayLineNum}`,
                              restSourceQuantity: e.restSourceQuantity,
                              restPoQuantity: e.restPoQuantity,
                            })
                            .d(
                              `【${e.displayPrNum}-${e.displayLineNum}】当前申请单据数量未被执行完，寻源链路剩余数量${e.restSourceQuantity}、履约链路剩余数量${e.restPoQuantity}。`
                            )
                        : intl
                            .get('sprm.common.model.closeNoticeOld', {
                              name: `${e.displayPrNum}-${e.displayLineNum}`,
                              restQuantity:
                                e.executionStrategyCode === 'SOURCE'
                                  ? e.restSourceQuantity
                                  : e.restPoQuantity,
                            })
                            .d(
                              `【${e.displayPrNum}-${
                                e.displayLineNum
                              }】当前申请单据数量未被执行完，剩余数量${
                                e.executionStrategyCode === 'SOURCE'
                                  ? e.restSourceQuantity
                                  : e.restPoQuantity
                              }`
                            )}
                  </p>
                  ))
                : null}
            </div>
          </Card>
        </Spin>
      )}
    </Modal>
  );
};

export default PromptModal;
