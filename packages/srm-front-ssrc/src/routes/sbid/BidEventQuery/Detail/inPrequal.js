/**
 * InPrequal -招标事件查询-预审
 * @date: 2020-05-25
 * @author: lvshuo <shuo.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Row, Col, Collapse, Icon, Table, Popover } from 'hzero-ui';

import { FORM_COL_3_LAYOUT, EDIT_FORM_ITEM_LAYOUT, EDIT_FORM_ROW_LAYOUT } from 'utils/constants';
import { tableScrollWidth } from 'utils/utils';
import Upload from 'srm-front-boot/lib/components/Upload';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import CPopover from '@/routes/components/CPopover/';
import { phoneRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

const { Panel } = Collapse;

export default class InPrequal extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderFormContent(dataSource = {}) {
    const {
      UEDDisplayFormItem,
      organizationId,
      FormItem,
      header = null,
      showPretrialPanel = () => {},
      showScoringElement = () => {},
    } = this.props;

    return (
      <Form className="read-row-custom">
        <Row type="flex" justify="start" gutter={48} className="read-row-custom">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get('ssrc.common.company').d('公司')}
              value={<CPopover content={dataSource.companyName}>{dataSource.companyName}</CPopover>}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceCategory`).d('寻源类别')}
              value={dataSource.sourceCategoryMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.sourceMethod`).d('寻源方式')}
              value={dataSource.sourceMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.prequalEndDate`).d('预审截止时间')}
              value={dataSource.prequalEndDate}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.qualificationType`).d('审查方式')}
              value={dataSource.reviewMethodMeaning}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.qualiExam.model.qualiExam.qualifiedLimit`).d('合格上限')}
              value={dataSource.qualifiedLimit}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.bidHall.model.bidHall.prequalLocation`).d('申请提交地点')}
              value={dataSource.prequalLocation}
            />
          </Col>
          <Col span={8}>
            <FormItem
              label={intl
                .get(`ssrc.bidEventQuery.model.bidEventQuery.enableScoreFlag`)
                .d('启用评分细项')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {yesOrNoRender(header.enableScoreFlag)}
              {header.enableScoreFlag ? (
                <a onClick={showScoringElement}>{intl.get('hzero.common.button.view').d('查看')}</a>
              ) : null}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.qualiExam.model.qualiExam.prequalAttachmentUuid`)
                .d('资格预审文件')}
              value={
                <Upload
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="ssrc-rfx-prequal"
                  attachmentUUID={
                    header.prequalAttachmentUuid ? header.prequalAttachmentUuid : undefined
                  }
                  tenantId={organizationId}
                  viewOnly
                  icon="download"
                />
              }
            />
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`ssrc.common.pretrialPanel`).d('预审小组')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              <a onClick={() => showPretrialPanel(true)}>
                {intl.get('hzero.common.button.view').d('查看')}
              </a>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.common.qualRequirements`).d('资质要求')}
              value={header.prequalRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  renderPrequalHeader() {
    const { header = {}, InPrequalCollapseKeys = [] } = this.props;

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>
              {header.bidNum}
              {header.bidTitle ? `-${header.bidTitle}` : null}
            </h3>
            <a>
              {InPrequalCollapseKeys.includes('prequalHeader')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={InPrequalCollapseKeys.includes('prequalHeader') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="prequalHeader"
      >
        {this.renderFormContent(header)}
      </Panel>
    );
  }

  renderTableColumns() {
    return [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.contacts`).d('联系人'),
        dataIndex: 'name',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.tel`).d('联系电话'),
        dataIndex: 'mobilephone',
        width: 120,
        render: (_, record) => phoneRender(record.internationalTelCodeMeaning, record.mobilephone),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.prequalRequestted`).d('预审申请'),
        dataIndex: 'prequalStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.prequalResult`).d('预审结果'),
        dataIndex: 'lineApprovedStatusMeaning',
        width: 100,
      },
    ];
  }

  renderPrequalSupplier() {
    const {
      prequalDetailBidDetailLoading,
      prequalDetailList = [],
      prequalDetailPagination = {},
      prequalDetailBidDetail,
      InPrequalCollapseKeys = [],
    } = this.props;

    const columns = this.renderTableColumns();
    const scrollX = tableScrollWidth(columns);

    return (
      <Panel
        showArrow={false}
        header={
          <React.Fragment>
            <h3>{intl.get('ssrc.bidEventQuery.view.title.prequalDetails').d('预审详情')}</h3>
            <a>
              {InPrequalCollapseKeys.includes('prequalDetail')
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
            </a>
            <Icon type={InPrequalCollapseKeys.includes('prequalDetail') ? 'up' : 'down'} />
          </React.Fragment>
        }
        key="prequalDetail"
      >
        <Table
          bordered
          rowKey="supplierCompanyId"
          loading={prequalDetailBidDetailLoading}
          columns={columns}
          scroll={{ x: scrollX }}
          dataSource={prequalDetailList}
          pagination={prequalDetailPagination}
          onChange={(page) => prequalDetailBidDetail(page)}
        />
      </Panel>
    );
  }

  render() {
    const { InPrequalCollapseKeys = [], setCollapseByKey } = this.props;

    return (
      <Collapse
        onChange={(keys) => setCollapseByKey('InPrequalCollapseKeys', keys)}
        className="form-collapse"
        defaultActiveKey={InPrequalCollapseKeys}
      >
        {this.renderPrequalHeader()}
        {this.renderPrequalSupplier()}
      </Collapse>
    );
  }
}
