/**
 * LadderLevelModal - 寻源服务/询价大厅-维护-阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Button, Input, Drawer } from 'hzero-ui';
import { Form as ChoerodonForm, Output, Button as ChoerodonBtn, Icon } from 'choerodon-ui/pro';
import { isEmpty, noop, debounce } from 'lodash';
import { Bind, Debounce } from 'lodash-decorators';
import classnames from 'classnames';

import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import inquiryNewUpdateStyle from '@/routes/ssrc/InquiryHallNew/Update/index.less';
import { calculateBasicQty, getLadderFrom, getLadderTo } from '@/utils/utils';
import styles from './LadderLevelModal.less';

export default class LadderLevelModal extends React.Component {
  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 检查表格内容值发生变化
   */
  @Bind()
  hasChangeData(record, changeValues) {
    const { onChangeLadderTableData } = this.props;
    if (!isEmpty(changeValues)) {
      onChangeLadderTableData();
    }
  }

  /**
   * 删除
   */
  @Bind()
  haeRemoveData(rfxLineItemId) {
    const { onDeleteLadderLines } = this.props;
    onDeleteLadderLines(rfxLineItemId);
  }

  /**
   * 新建
   */
  @Bind()
  haeAddData(rfxLineItemId) {
    const { onCreateLadderLine } = this.props;
    onCreateLadderLine(rfxLineItemId);
  }

  /**
   * 保存
   */
  @Bind()
  @Debounce(500)
  haeSaveData(rfxLineItemId, type = '') {
    const { onSaveLadderLine = noop, record = {} } = this.props;
    onSaveLadderLine(rfxLineItemId, type === 'ok');

    if (record.set) {
      record.set('ladderOffer', 1);
    }

    // if (type === 'ok') {
    //   hideModal();
    // }
  }

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const { itemCode, itemName } = this.props.LadderLevelHeaderData;
    return (
      <ChoerodonForm
        labelLayout="vertical"
        columns={2}
        labelAlign="left"
        className="c7n-pro-vertical-form-display"
      >
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
          value={itemCode}
        />
        <Output
          label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
          value={itemName}
        />
      </ChoerodonForm>
    );
  }

  // 改变基本数量
  handleLadder = debounce((val, record = {}, type = 'secondaryLadderFrom') => {
    const { doubleUnitFlag, LadderLevelHeaderData = {} } = this.props;
    const { itemId = '', secondaryUomId = '', uomId = '' } = LadderLevelHeaderData;
    const {
      $form: { setFieldsValue, getFieldValue },
    } = record;
    if (val) {
      if (doubleUnitFlag && itemId) {
        if (getFieldValue(type) && secondaryUomId) {
          calculateBasicQty({
            secondaryQuantity: getFieldValue(type),
            itemId,
            businessKey: -1,
            doublePrimaryUomId: uomId,
            secondaryUomId,
          }).then((res) => {
            if (!res) {
              return;
            }

            setFieldsValue({
              [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: res ?? undefined,
            });
          });
        } else {
          setFieldsValue({
            [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: 0,
          });
        }
      } else {
        setFieldsValue({
          [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: getFieldValue(type),
        });
      }
    } else if (val === 0) {
      setFieldsValue({
        [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: 0,
      });
    } else {
      setFieldsValue({
        [type === 'secondaryLadderFrom' ? 'ladderFrom' : 'ladderTo']: undefined,
      });
    }
  }, 100);

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const {
      ladderLevelData,
      doubleUnitFlag = false,
      ladderLevelRowSelection,
      fetchLadderLevelLoading,
      LadderLevelHeaderData = {},
    } = this.props;
    const { secondaryUomId = null, uomId = null } = LadderLevelHeaderData;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 60,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从'),
            dataIndex: 'secondaryLadderFrom',
            width: 80,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryLadderFrom', {
                    initialValue: val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`)
                            .d('数量从'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      uom={secondaryUomId}
                      min="0"
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                      onChange={(value) => this.handleLadder(value, record, 'secondaryLadderFrom')}
                    />
                  )}
                </Form.Item>
              ) : (
                val
              ),
          }
        : null,
      doubleUnitFlag
        ? {
            title: (
              <span>
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
                {`(<)`}
              </span>
            ),
            dataIndex: 'secondaryLadderTo',
            width: 80,
            render: (val, record) =>
              ['update', 'create'].includes(record._status) ? (
                <Form.Item>
                  {record.$form.getFieldDecorator('secondaryLadderTo', {
                    initialValue: val,
                    rules: [
                      {
                        required:
                          record.ladderInquiryId !==
                          ladderLevelData[ladderLevelData.length - 1].ladderInquiryId,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至'),
                        }),
                      },
                    ],
                  })(
                    <PrecisionInputNumber
                      type="hzero"
                      uom={secondaryUomId}
                      min="0"
                      max="99999999999999999999"
                      style={{ width: '100%' }}
                      onChange={(value) => this.handleLadder(value, record, 'secondaryLadderTo')}
                    />
                  )}
                </Form.Item>
              ) : (
                val
              ),
          }
        : null,
      {
        title: (
          <span>
            {getLadderFrom(doubleUnitFlag)} {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderFrom', {
                initialValue: val,
                rules: [
                  {
                    required: !doubleUnitFlag,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getLadderFrom(doubleUnitFlag),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={uomId}
                  min="0"
                  disabled={doubleUnitFlag}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <span>
            {getLadderTo(doubleUnitFlag)}
            {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 100,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('ladderTo', {
                initialValue: val,
                rules: [
                  {
                    required:
                      !doubleUnitFlag &&
                      record.ladderInquiryId !==
                        ladderLevelData[ladderLevelData.length - 1].ladderInquiryId,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: getLadderTo(doubleUnitFlag),
                    }),
                  },
                ],
              })(
                <PrecisionInputNumber
                  type="hzero"
                  uom={uomId}
                  min="0"
                  disabled={doubleUnitFlag}
                  max="99999999999999999999"
                  style={{ width: '100%' }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);

    return (
      <React.Fragment>
        <EditTable
          bordered
          scroll={{ x: scrollWidth, y: 'calc(100vh - 370px)' }}
          rowKey="ladderInquiryId"
          columns={columns}
          pagination={false}
          dataSource={ladderLevelData}
          onDataChange={this.hasChangeData}
          loading={fetchLadderLevelLoading}
          rowSelection={ladderLevelRowSelection}
        />
      </React.Fragment>
    );
  }

  render() {
    const {
      hideModal,
      visible,
      saveLadderLevelLoading = false,
      LadderLevelHeaderData: { rfxLineItemId },
      ladderLevelSelectedRowKeys,
    } = this.props;
    return (
      <Drawer
        closable
        destroyOnClose
        visible={visible}
        width={742}
        footer={null}
        onClose={hideModal}
        title={intl.get(`ssrc.inquiryHall.view.message.title.ladderLevelQuot`).d('阶梯报价')}
      >
        <div className={inquiryNewUpdateStyle['rfx-detail-list-card']}>
          <h4 className={inquiryNewUpdateStyle['rfx-card-item-title-level-two']}>
            <div className={inquiryNewUpdateStyle['rfx-card-item-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.itemInfo').d('物料信息')}
          </h4>
          {this.fetchLadderLevelyHeader()}
          <h4
            className={classnames(
              inquiryNewUpdateStyle['rfx-card-item-title-level-two'],
              inquiryNewUpdateStyle['m-t-m']
            )}
            style={{ marginTop: '32px' }}
          >
            <div className={inquiryNewUpdateStyle['rfx-card-item-title-line']} />
            {intl.get('ssrc.rf.view.card.subtitle.quotationInfo').d('报价信息')}
          </h4>
          <div className={styles['operate-btn']}>
            <Form layout="inline">
              <ChoerodonBtn
                funcType="flat"
                style={{ marginRight: '8px' }}
                onClick={() => this.haeAddData(rfxLineItemId)}
              >
                <Icon type="playlist_add" />
                <span>{intl.get('hzero.common.button.create').d('新建')}</span>
              </ChoerodonBtn>
              <ChoerodonBtn
                funcType="flat"
                style={{ marginRight: '8px' }}
                onClick={() => this.haeSaveData(rfxLineItemId)}
                loading={saveLadderLevelLoading}
              >
                <Icon type="save" />
                <span>{intl.get('hzero.common.button.save').d('保存')}</span>
              </ChoerodonBtn>
              <ChoerodonBtn
                funcType="flat"
                onClick={() => this.haeRemoveData(rfxLineItemId)}
                disabled={ladderLevelSelectedRowKeys.length === 0}
              >
                <Icon type="delete" />
                <span>{intl.get('hzero.common.button.delete').d('删除')}</span>
              </ChoerodonBtn>
            </Form>
          </div>
          <div style={{ marginBottom: '50px' }}>{this.feedLadderLevelyTable()}</div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e8e8e8',
            padding: '10px 16px',
            textAlign: 'left',
            left: 0,
            background: '#fff',
            borderRadius: '0 0 4px 4px',
            zIndex: 1,
          }}
        >
          <Button
            type="primary"
            onClick={() => this.haeSaveData(rfxLineItemId, 'ok')}
            style={{ marginRight: '8px' }}
            loading={saveLadderLevelLoading}
          >
            {intl.get('hzero.common.button.confirm').d('确认')}
          </Button>
          <Button onClick={hideModal}>
            {intl.get('hzero.common.view.button.cancel').d('取消')}
          </Button>
        </div>
      </Drawer>
    );
  }
}
