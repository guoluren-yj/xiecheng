/**
 * index.js 收货执行明细
 * @date: 2020-09-06
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, Button, Table, Output, Form, TextArea, Spin } from 'choerodon-ui/pro';
import qs from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isNil } from 'lodash';
import styles from '../index.less';
import { Header, Content } from 'components/Page';
import Upload from '_components/C7NUpload';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import { showRecordModal } from '@/routes/components/CustomSpecsModal';
import { handleSubmit, handleSave } from '@/services/receiptExecutionService';
import { formDS, tableDS } from './store/lineDS';
import { showBigNumber, queryCalcRuleConfig } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

function getUnitCode() {
  const code = [];
  for (let i = 0; i < 10; i++) {
    const index = String.fromCharCode(65 + i);
    code.push(
      `SINV.RECEIPT_EXECUTE_RETURN.HEADER_${index}`,
      `SINV.RECEIPT_EXECUTE_RETURN.LINE_${index}`
    );
  }
  return code;
}

@WithCustomize({
  unitCode: getUnitCode(),
})
@formatterCollections({ code: ['sinv.receiptExecution', 'hzero.common'] })
export default class ExecutionDetail extends Component {
  formDs = new DataSet(formDS());

  tableDs = new DataSet(tableDS(this.formDs));

  constructor(props) {
    super(props);
    const {
      match: { params = {}, path },
      location: { search },
    } = this.props;
    const { type, execFlag, nodeIndex, permissionFlag } = qs.parse(search.substr(1));
    this.state = {
      nodeIndex,
      rcvTrxHeaderId: params.id,
      editFlag: type === 'DOING' && execFlag === 'EXEC' && permissionFlag !== 'disabled',
      spinning: false,
      sourceFromPub: path.includes('pub'),
      permissionFlag: permissionFlag !== 'disabled',
    };
  }

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.tableDs.setState('amountCalcRule', result);
  }

  componentDidMount() {
    const { rcvTrxHeaderId, nodeIndex } = this.state;
    this.fetchCalcRuleConfig();
    this.setState({
      spinning: true,
    });
    this.formDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_RETURN.HEADER_${nodeIndex}`,
    });
    this.tableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_RETURN.LINE_${nodeIndex}`,
    });
    Promise.all([this.formDs.query(), this.tableDs.query()])
      .then(() => {
        this.setState({
          spinning: false,
        });
      })
      .finally(() => {
        this.setState({
          spinning: false,
        });
      });
  }

  @Bind()
  async handleSave() {
    const { nodeIndex } = this.state;
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_RETURN.HEADER_${nodeIndex},SINV.RECEIPT_EXECUTE_RETURN.LINE_${nodeIndex}`,
      data: {
        ...this.formDs.toData()[0],
        sinvRcvTrxLineDTOS: this.tableDs.toData(),
      },
    };
    const headerFlag = await this.formDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag) {
      this.setState({ spinning: true });
      const res = getResponse(
        await handleSave(saveData).finally(() => {
          this.setState({ spinning: false });
        })
      );
      if (res) {
        notification.success();
        this.formDs.query();
        this.tableDs.query();
      }
    }
  }

  @Bind()
  async handleSubmit() {
    const { nodeIndex } = this.state;
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_RETURN.HEADER_${nodeIndex},SINV.RECEIPT_EXECUTE_RETURN.LINE_${nodeIndex}`,
      data: {
        ...this.formDs.toData()[0],
        sinvRcvTrxLineDTOS: this.tableDs.toData(),
      },
    };
    const headerFlag = await this.formDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag) {
      this.setState({ spinning: true });
      const res = getResponse(
        await handleSubmit(saveData).finally(() => {
          this.setState({ spinning: false });
        })
      );
      if (res) {
        notification.success();
        this.props.history.push({
          pathname: `/sinv/receipt-execution/list`,
        });
      }
    }
  }

  @Bind()
  async handleDelete() {
    const res = await this.tableDs.deleteAll();
    if (res) {
      this.props.history.push({
        pathname: `/sinv/receipt-execution/list`,
      });
    }
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const uomName = record.get('uomNameShow'); // 注意，因需求冲突此处取uomNameShow字段
    const uomCode = record.get('uomCode');
    const unitCodeIsShow = record.get('unitCodeIsShow');
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  render() {
    const { editFlag, nodeIndex, spinning, sourceFromPub, permissionFlag } = this.state;
    const { customizeForm, customizeTable, custLoading } = this.props;
    const backPath = sourceFromPub ? false : '/sinv/receipt-execution/list';

    const columns = [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'itemCode',
        width: 120,
      },
      {
        name: 'itemName',
        width: 160,
      },
      {
        name: 'quantity',
        width: 120,
        editor: (record) =>
          record.get('subjectType') === 'QUANTITY' &&
          editFlag && (
            <C7nPrecisionInputNumber
              name="quantity"
              record={record}
              precision={!isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10}
            />
          ),
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'moveReason',
        width: 160,
        editor: editFlag,
      },
      {
        name: 'leftQuantity',
        width: 120,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'taxIncludedAmount',
        width: 130,
        editor: (record) => record.get('subjectType') === 'AMOUNT' && editFlag,
        renderer: ({ value, record }) => showBigNumber(value, record.get('financialPrecision')),
      },
      {
        name: 'leftTaxAmount',
        width: 120,
        renderer: ({ value, record }) => showBigNumber(value, record.get('financialPrecision')),
      },
      {
        name: 'taxRateLov',
      },
      {
        name: 'rcvTypeName',
        width: 120,
      },
      {
        name: 'trxDate',
        width: 160,
        editor: editFlag,
      },
      {
        name: 'inventoryNameLov',
        width: 160,
      },
      {
        name: 'locationNameLov',
        width: 160,
      },
      {
        name: 'poTypeCodeMeaning',
        width: 150,
      },
      {
        name: 'sourceHeaderNum',
        width: 160,
      },
      {
        name: 'sourceLineNum',
        width: 70,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'uomName',
        width: 150,
        renderer: ({ record }) => this.showUomText(record),
      },
      {
        name: 'productNum',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'sinvLineAttachmentUuid',
        renderer: ({ record }) => (
          <Upload
            filePreview
            viewOnly={!editFlag}
            name="sinvLineAttachmentUuid"
            bucketName="private-bucket"
            bucketDirectory="sinv-delivery"
            tenantId={organizationId}
            record={record}
          />
        ),
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => {
          return (
            <a onClick={() => showRecordModal(value ? JSON.parse(value) : [])}>
              {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
            </a>
          );
        },
      },
    ];
    const CoHeader = observer(() => {
      return (
        <Header
          title={intl
            .get('sinv.receiptExecution.view.title.detail.return.maintain')
            .d('退回明细维护')}
          backPath={backPath}
        >
          {!sourceFromPub && (
            <Fragment>
              <Button
                icon="check"
                color="primary"
                loading={spinning || custLoading || false}
                disabled={!editFlag}
                onClick={this.handleSubmit}
              >
                {intl.get('hzero.common.button.submit').d('提交')}
              </Button>
              <Button
                icon="save"
                color="primary"
                loading={spinning || custLoading || false}
                onClick={this.handleSave}
                disabled={!permissionFlag}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                icon="delete"
                loading={spinning || custLoading || false}
                disabled={!editFlag}
                onClick={this.handleDelete}
              >
                {intl.get(`hzero.common.button.delete`).d('删除')}
              </Button>
            </Fragment>
          )}
        </Header>
      );
    });

    return (
      <Fragment>
        <Spin spinning={spinning || false}>
          <CoHeader dataSet={this.tableDs} formDataSet={this.formDs} />
          <Content className={styles.content}>
            {customizeForm(
              {
                code: `SINV.RECEIPT_EXECUTE_RETURN.HEADER_${nodeIndex}`,
              },
              <Form dataSet={this.formDs} columns={3}>
                <Output name="displayTrxNum" />
                <Output name="rcvTypeName" />
                <Output name="returnedFlag" renderer={({ value }) => yesOrNoRender(+value)} />
                <Output name="companyName" />
                <Output name="supplierCompanyName" />
                <Output name="creationName" />
                <Output name="creationDate" />
                {/* <Output
                  name="attachmentTemplateUuid"
                  renderer={({ value, record }) => (
                    <Upload
                      filePreview
                      viewOnly
                      bucketName="private-bucket"
                      bucketDirectory="'sinv-delivery'"
                      attachmentUUID={value}
                      tenantId={organizationId}
                      afterOpenUploadModal={(uuid) => {
                        record.set('attachmentTemplateUuid', uuid);
                      }}
                    />
                  )}
                /> */}
                {/* <Output
                  name="sinvHeaderAttachmentUuid"
                  renderer={({ value, record }) => (
                    <Upload
                      filePreview
                      bucketName="private-bucket"
                      bucketDirectory="'sinv-delivery'"
                      attachmentUUID={value}
                      tenantId={organizationId}
                      afterOpenUploadModal={(uuid) => {
                        record.set('sinvHeaderAttachmentUuid', uuid);
                      }}
                    />
                  )}
                /> */}
                <Upload
                  filePreview
                  name="sinvHeaderAttachmentUuid"
                  bucketName="private-bucket"
                  bucketDirectory="sinv-delivery"
                  tenantId={organizationId}
                  viewOnly={!editFlag}
                  isMultiple
                />
                <TextArea name="remark" newLine resize="both" colSpan={1.5} readOnly={!editFlag} />
              </Form>
            )}
            {customizeTable(
              {
                code: `SINV.RECEIPT_EXECUTE_RETURN.LINE_${nodeIndex}`,
              },
              <Table
                dataSet={this.tableDs}
                custLoading={custLoading || spinning}
                loading={spinning}
                columns={columns}
                queryFieldsLimit={3}
              />
            )}
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
