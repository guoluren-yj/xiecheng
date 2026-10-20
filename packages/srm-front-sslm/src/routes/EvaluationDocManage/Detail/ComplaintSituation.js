/* 供应商申诉情况
 * @Date: 2022-03-31 15:57:10
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Form, InputNumber, Input, Button, Tooltip } from 'hzero-ui';
import intl from 'utils/intl';
import Upload from '_components/Upload';
import EditTable from '_components/EditTable';
import { PRIVATE_BUCKET, SRM_SSLM } from '_utils/config';
import ExcelExportPro from 'components/ExcelExportPro';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();

export default class ComplaintSituation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
  }

  @Bind()
  onSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  clearRows() {
    this.setState({ selectedRows: [] });
  }

  render() {
    const {
      dataSource,
      pagination,
      onQuery,
      openModal,
      allLodaing,
      granularity,
      onPublish,
      onSave,
      isPub,
      isEdit,
      evalHeaderId,
      customizeCode,
      customizeTable,
    } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      selectedRows,
      selectedRowKeys: selectedRows.map(n => n.evalLineId),
      onChange: this.onSelectChange,
      getCheckboxProps: record => {
        return {
          disabled: !['appealing', 'appealApprovaRejected'].includes(record.lineStatus),
        };
      },
    };
    const columns = [
      {
        dataIndex: 'lineStatusMeaning',
        width: 100,
        title: intl.get('hzero.common.status').d('状态'),
      },
      {
        dataIndex: 'supplierNum',
        width: 120,
        title: intl.get(`sslm.common.view.supplier.code`).d('供应商编码'),
      },
      {
        dataIndex: 'supplierName',
        width: 150,
        title: intl.get(`sslm.common.view.supplier.name`).d('供应商名称'),
      },
      {
        dataIndex: 'lineScore',
        width: 90,
        title: intl.get(`sslm.supplierDocManage.model.docManage.sumScore`).d('汇总得分'),
        // 跟评分汇总同一个弹框
        render: (val, record) => (
          <a onClick={() => openModal('sumScore', record, 'complaints')}>{val}</a>
        ),
      },
      {
        dataIndex: 'levelCode',
        width: 80,
        title: intl.get('sslm.supplierDocManage.model.docManage.oldGrade').d('原等级'),
      },
      {
        dataIndex: 'rankNum',
        width: 80,
        title: intl.get('sslm.supplierDocManage.model.docManage.oldRanking').d('原排名'),
      },
      {
        dataIndex: 'appealRemark',
        width: 150,
        title: intl.get(`sslm.common.model.feedback.complaintRemark`).d('申诉说明'),
      },
      {
        title: intl.get(`sslm.common.model.evaluation.supplierAttachment`).d('供方上传附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
        render: val => (
          <Upload
            viewOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="sslm-evaluation"
            attachmentUUID={val}
          />
        ),
      },
      {
        dataIndex: 'appealCheckCollectScore',
        width: 120,
        title: intl.get(`sslm.common.model.feedback.calibrationGrade`).d('校准分数'),
        render: (val, record) =>
          ['appealing', 'appealApprovaRejected'].includes(record.lineStatus) &&
          ['update'].includes(record._status) ? (
            <FormItem>
              {record.$form &&
                record.$form.getFieldDecorator(`appealCheckCollectScore`, {
                  initialValue: record.appealCheckCollectScore,
                })(<InputNumber max={record.scoreTo} min={record.scoreFrom} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        dataIndex: 'appealLevelCode',
        width: 100,
        title: intl.get(`sslm.common.model.feedback.newRank`).d('新等级'),
      },
      {
        dataIndex: 'appealRankNum',
        width: 100,
        title: intl.get(`sslm.common.model.feedback.newRanking`).d('新排名'),
      },
      {
        dataIndex: 'appealReply',
        width: 160,
        title: intl.get(`sslm.common.model.feedback.appealReply`).d('采购方回复'),
        render: (val, record) =>
          ['appealing', 'appealApprovaRejected'].includes(record.lineStatus) &&
          ['update'].includes(record._status) ? (
            <FormItem>
              {record.$form &&
                record.$form.getFieldDecorator(`appealReply`, {
                  initialValue: record.appealReply,
                })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    if (granularity === 'SU+CA') {
      columns.splice(
        columns.findIndex(item => item.dataIndex === 'supplierName') + 1,
        0,
        {
          dataIndex: 'categoryCode',
          width: 150,
          title: intl.get('sslm.common.category.categoryCode').d('品类编码'),
        },
        {
          dataIndex: 'categoryName',
          width: 150,
          title: intl.get('sslm.common.category.categoryName').d('品类名称'),
        }
      );
    }
    if (granularity === 'SU+IT') {
      columns.splice(
        columns.findIndex(item => item.dataIndex === 'supplierName') + 1,
        0,
        {
          dataIndex: 'itemCode',
          width: 150,
          title: intl.get('sslm.common.item.itemCode').d('物料编码'),
        },
        {
          dataIndex: 'itemName',
          width: 150,
          title: intl.get('sslm.common.item.itemName').d('物料名称'),
        }
      );
    }
    return (
      <Fragment>
        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <ExcelExportPro
            requestUrl={`${SRM_SSLM}/v1/${tenantId}/eval-line/appeal/export/${evalHeaderId}`}
            templateCode="SRM_C_SRM_SSLM_KPI_EVAL_APPEAL"
            buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
            otherButtonProps={{
              type: 'h0',
              icon: '',
              permissionList: [
                {
                  code: 'srm.partner.evaluation-manage.eval-doc.button.appeal.export',
                  type: 'button',
                  meaning: '供应商申诉情况-新导出',
                },
              ],
            }}
          />
          <Tooltip
            placement="top"
            title={intl
              .get('sslm.supplierDocManage.view.tooltip.releaseWarn')
              .d('仅针对申诉内容进行发布')}
          >
            <Button
              hidden={isPub || !isEdit}
              loading={allLodaing}
              style={{ marginLeft: 8 }}
              onClick={() => onPublish(selectedRows, this.clearRows)}
            >
              {intl.get(`sslm.supplierDocManage.view.button.complaintsIssued`).d('申诉发布')}
            </Button>
          </Tooltip>
          <Button
            type="primary"
            hidden={isPub || !isEdit}
            loading={allLodaing}
            style={{ marginLeft: 8 }}
            onClick={() => onSave(this.clearRows)}
          >
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
        </div>
        {customizeTable(
          {
            code: customizeCode,
          },
          <EditTable
            bordered
            rowKey="evalLineId"
            columns={columns}
            onChange={onQuery}
            dataSource={dataSource}
            pagination={pagination}
            loading={allLodaing}
            rowSelection={rowSelection}
          />
        )}
      </Fragment>
    );
  }
}
