/**
 * ScoreInformationTable - 评分信息表
 * @date: 2018-9-19
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Table, Form, InputNumber, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isEmpty, isNil } from 'lodash';
import Checkbox from 'components/Checkbox';
import { yesOrNoRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';
import OptionsSelect from '@/routes/components/OptionsSelect';

const FormItem = Form.Item;

const organizationId = getCurrentOrganizationId();

/**
 * 评分信息表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplierReview'],
})
export default class ScoreInformationTable extends PureComponent {
  @Bind()
  handleUpdateState(record, flag) {
    const {
      tableProps: { onUpdateState },
    } = this.props;
    onUpdateState(record, flag);
  }

  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      isEdit,
      tableProps: {
        dataSource,
        form,
        isVeto,
        customizeTable = (e) => e,
        custLoading,
        tableCode = '',
        viewTableCode = '',
      },
    } = this.props;
    const columns = [
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.indicateCode`).d('评价项目编号'),
        width: 150,
        dataIndex: 'indicateCode',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.indicatorName`).d('评价项目'),
        width: 150,
        dataIndex: 'indicatorName',
        onCell: this.onCell,
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.evalStandard`).d('评分标准'),
        width: 150,
        dataIndex: 'evalStandard',
        onCell: this.onCell,
        // render: (val) => (
        //   <Tooltip title={val} placement="top">
        //     <div
        //       style={{
        //         width: '100%',
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //         whiteSpace: 'nowrap',
        //       }}
        //     >
        //       {val}
        //     </div>
        //   </Tooltip>
        // ),
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.scoreFrom`).d('合理分值从'),
        width: 100,
        dataIndex: 'scoreFrom',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.scoreTo`).d('合理分值至'),
        width: 100,
        dataIndex: 'scoreTo',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.score`).d('得分'),
        width: 120,
        dataIndex: 'score',
        render: (val, record) =>
          isEdit ? (
            <FormItem>
              {form.getFieldDecorator(`score#${record.scorerLineId}`, {
                rules: [
                  {
                    // indicatorType 为null时 走“打分式”逻辑
                    required: (!record.indicatorType || record.indicatorType === 'SCORE') && isVeto,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.supplierReview.model.supplierReview.score').d('得分'),
                    }),
                  },
                ],
                initialValue: isNil(val) ? record.defaultScore : val,
              })(
                <InputNumber
                  // {...(record.indicatorType !== 'OPT'
                  //   ? {
                  //       max: record.scoreTo,
                  //     }
                  //   : {})}
                  max={record.scoreTo}
                  precision={2}
                  // style={{ width: 60 }}
                  disabled={record.indicatorType && record.indicatorType !== 'SCORE'}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.isStandard`).d('符合评分标准'),
        dataIndex: 'isStandard',
        width: 120,
        render: (val, record) =>
          isEdit ? (
            <FormItem>
              {form.getFieldDecorator(`isStandard#${record.scorerLineId}`, {
                initialValue: val || 0,
              })(<Checkbox disabled={record.indicatorType !== 'TICK'} />)}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.isVeto`).d('否决该项'),
        dataIndex: 'isVeto',
        width: 100,
        render: (val, record) =>
          isEdit ? (
            <FormItem>
              {form.getFieldDecorator(`isVeto#${record.scorerLineId}`, {
                initialValue: val || 0,
              })(
                <Checkbox
                  disabled={record.indicatorType !== 'VETO'}
                  onChange={(e) => {
                    setTimeout(() => {
                      if (isVeto) {
                        form.validateFields({ force: true });
                      }
                    }, 300);
                    this.handleUpdateState(record, e.target.checked);
                  }}
                />
              )}
            </FormItem>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get('sslm.supplierReview.model.supplierReview.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 120,
        render: (val, record) => {
          if (isEdit) {
            form.getFieldDecorator(`evalTplIndOptId#${record.scorerLineId}`, {
              initialValue: record.evalTplIndOptId,
            });
            return (
              <Form.Item>
                {form.getFieldDecorator(`indOptName#${record.scorerLineId}`, {
                  initialValue: val,
                })(
                  <OptionsSelect
                    record={record}
                    lovCode="SSLM.KPI.INDICATOR.OPT.CFG"
                    payload={{
                      evalTplIndId: record.indicateId,
                      tenantId: organizationId,
                      page: 0,
                      size: 0,
                    }}
                    disabled={record.indicatorType !== 'OPT'}
                    onChange={(_, option = {}) => {
                      const { props: { optionRecord: { value = null, score } = {} } = {} } = option;
                      form.setFieldsValue({
                        [`evalTplIndOptId#${record.scorerLineId}`]: value,
                        [`score#${record.scorerLineId}`]: score,
                      });
                    }}
                  />
                )}
              </Form.Item>
            );
          } else {
            return val;
          }
        },
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.scoreRemark`).d('评分说明'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) =>
          isEdit ? (
            <FormItem>
              {form.getFieldDecorator(`remark#${record.scorerLineId}`, {
                initialValue: val,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.raters`).d('评分人'),
        width: 100,
        dataIndex: 'realName',
        render: (val, record) => (isEmpty(val) ? record.loginName : val),
      },
    ];
    const reviewedColumns = [
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.indicateCode`).d('评价项目编号'),
        width: 150,
        dataIndex: 'indicateCode',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.indicatorName`).d('评价项目'),
        width: 150,
        dataIndex: 'indicatorName',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.evalStandard`).d('评分标准'),
        width: 150,
        dataIndex: 'evalStandard',
        onCell: this.onCell,
        // render: val => (
        //   <Tooltip title={val} placement="top">
        //     <div
        //       style={{
        //         width: '100%',
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //         whiteSpace: 'nowrap',
        //       }}
        //     >
        //       {val}
        //     </div>
        //   </Tooltip>
        // ),
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.scoreType`).d('评分方式'),
        width: 100,
        dataIndex: 'scoreTypeMeaning',
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.indicatorType`).d('指标类型'),
        dataIndex: 'indicatorTypeMeaning',
        width: 100,
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.scoreFrom`).d('分值从'),
        width: 100,
        dataIndex: 'scoreFrom',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.scoreTo`).d('分值至'),
        width: 100,
        dataIndex: 'scoreTo',
      },
      {
        title: intl.get(`sslm.commonApplication.model.commonApplication.indiScore`).d('指标分值'),
        dataIndex: 'indicatorScore',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.score`).d('得分'),
        width: 100,
        dataIndex: 'score',
      },
      {
        title: intl.get(`sslm.common.model.archiveFilled.isStandard`).d('符合评分标准'),
        dataIndex: 'isStandard',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sslm.common.model.archiveFilled.isVeto').d('否决该项'),
        dataIndex: 'isVeto',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get('sslm.supplierReview.model.supplierReview.indOptName').d('评分选项'),
        dataIndex: 'indOptName',
        width: 120,
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.scoreRemark`).d('评分说明'),
        dataIndex: 'remark',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplierReview.model.supplierReview.raters`).d('评分人'),
        width: 100,
        dataIndex: 'realName',
        render: (val, record) => (isEmpty(val) ? record.loginName : val),
      },
    ];

    const newColumns = (isEdit ? columns : reviewedColumns).map((i) => ({
      ...i,
      onCell: i.onCell || this.onCell,
    }));

    return (
      <Fragment>
        {customizeTable(
          {
            code: isEdit ? tableCode : viewTableCode,
          },
          <Table
            bordered
            className={styles.table}
            rowKey="scorerLineId"
            columns={newColumns}
            pagination={false}
            dataSource={dataSource}
            custLoading={custLoading}
          />
        )}
      </Fragment>
    );
  }
}
