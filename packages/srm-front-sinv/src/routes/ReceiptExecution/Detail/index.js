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
import styles from '../index.less';
import { Bind } from 'lodash-decorators';
import { isNumber, isNil } from 'lodash';
import { Header, Content } from 'components/Page';
import Upload from '_components/C7NUpload';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import cuxRemote from 'hzero-front/lib/utils/remote';
import C7nPrecisionInputNumber from '@/components/Precision/C7nPrecisionInputNumber';
import { handleSubmit, handleSave, print } from '@/services/receiptExecutionService';
import { formDS, tableDS } from './store/lineDS';
import CustomModal from '../components/CustomModal';
import { showBigNumber, globalPrint, queryCalcRuleConfig } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

function getUnitCode() {
  const code = [];
  for (let i = 0; i < 10; i++) {
    const index = String.fromCharCode(65 + i);
    code.push(
      `SINV.RECEIPT_EXECUTE_DETAIL.BUTTON`,
      `SINV.RECEIPT_EXECUTE_DETAIL.HEADER_${index}`,
      `SINV.RECEIPT_EXECUTE_DETAIL.LINE_${index}`
    );
  }
  return code;
}

@WithCustomize({
  unitCode: getUnitCode(),
})
@formatterCollections({ code: ['sinv.receiptExecution', 'hzero.common', 'sinv.common'] })
@cuxRemote(
  {
    code: 'RECEIPT_EXECUTION_DETAIL',
  },
  {
    events: {
      approvalPromise: () => {
        return new Promise((resolve) => {
          resolve();
        });
      },
    },
  }
)
export default class ExecutionDetail extends Component {
  constructor(props) {
    super(props);
    const {
      match: { params = {}, path },
      location: { search },
    } = this.props;
    const { type, execFlag, nodeIndex, permissionFlag } = qs.parse(search.substr(1));
    this.state = {
      nodeIndex,
      rcvTrxHeaderId: path.includes('pub') ? params.rcvTrxHeaderId : params.id,
      editFlag: type === 'DOING' && execFlag === 'EXEC' && permissionFlag !== 'disabled',
      spinning: false,
      sourceFromPub: path.includes('pub'),
      customData: [], // 定制化属性Modal的Table数据源
      customVisible: false, // 定制化属性Modal显示
      permissionFlag: permissionFlag !== 'disabled',
    };
  }

  formDs = new DataSet(formDS());

  tableDs = new DataSet(
    this.props.remote
      ? this.props.remote.process(
          'RECEIPT_EXECUTION_DETAIL_PROCESS_TABLE_DS',
          tableDS(this.formDs),
          { that: this }
        )
      : tableDS(this.formDs)
  );

  // 查询金额计算配置
  @Bind()
  async fetchCalcRuleConfig() {
    const result = await queryCalcRuleConfig();
    this.tableDs.setState('amountCalcRule', result);
  }

  componentDidMount() {
    const { rcvTrxHeaderId, nodeIndex, sourceFromPub } = this.state;
    const { onLoad, onFormLoaded, remote } = this.props;
    this.fetchCalcRuleConfig();
    this.setState({ spinning: true });
    this.formDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_DETAIL.HEADER_${nodeIndex}`,
    });

    this.tableDs.setQueryParameter('params', {
      rcvTrxHeaderId,
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_DETAIL.LINE_${nodeIndex}`,
    });
    Promise.all([
      this.formDs.query().then((res) => {
        if (res && !res.failed) {
          this.setState({
            orderTypeCode: res.orderTypeCode,
            initialNodeFlag: res.initialNodeFlag,
            rcvStatusCode: res.rcvStatusCode,
          });
        }
      }),
      this.tableDs.query(),
    ])
      .then(() => {
        this.setState({ spinning: false });
      })
      .finally(() => {
        this.setState({
          spinning: false,
        });
      });

    if (sourceFromPub && onLoad) {
      onLoad({
        submit: (approveResult) => {
          if (remote?.event) {
            return remote.event.fireEvent(
              'approvalPromise',
              {
                that: this,
                approveResult,
              },
              approveResult
            );
          }
        },
      });
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  async handleSave() {
    const { nodeIndex } = this.state;
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_DETAIL.HEADER_${nodeIndex},SINV.RECEIPT_EXECUTE_DETAIL.LINE_${nodeIndex}`,
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
    const validateList = this.tableDs
      .toData()
      .filter(
        (i) =>
          isNumber(i.executeReverseQuantity) &&
          (i.executeReverseQuantity > i.quantity || !i.executeReverseNodeConfigId)
      );
    const saveData = {
      customizeUnitCode: `SINV.RECEIPT_EXECUTE_DETAIL.HEADER_${nodeIndex},SINV.RECEIPT_EXECUTE_DETAIL.LINE_${nodeIndex}`,
      data: {
        ...this.formDs.toData()[0],
        sinvRcvTrxLineDTOS: this.tableDs.toData(),
      },
    };
    const headerFlag = await this.formDs.validate();
    const flag = await this.tableDs.validate();
    if (headerFlag && flag) {
      if (validateList.length > 0) {
        const warning = (
          <ul>
            {validateList.map((i) => {
              return (
                <Fragment>
                  {i.executeReverseQuantity > i.quantity ? (
                    <li>
                      {intl
                        .get('sinv.receiptExecution.view.message.executeReverseQuantity', {
                          name: i.displayTrxLineNum,
                        })
                        .d(`第【${i.displayTrxLineNum}】事务行：退回数量不可＞执行数量！`)}
                    </li>
                  ) : (
                    ''
                  )}
                  {!i.executeReverseNodeConfigId ? (
                    <li>
                      {intl
                        .get('sinv.receiptExecution.view.message.reverseNodeConfigId', {
                          name: i.displayTrxLineNum,
                        })
                        .d(`第【${i.displayTrxLineNum}】事务行:【执行退回节点】未维护!`)}
                    </li>
                  ) : (
                    ''
                  )}
                </Fragment>
              );
            })}
          </ul>
        );
        notification.error({
          description: warning,
        });
        return;
      }
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

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const params = [];
    const { rcvTrxHeaderId } = this.state;
    params.push(rcvTrxHeaderId);
    getResponse(print(params)).then((res) => {
      globalPrint(res);
    });
  }

  render() {
    const {
      editFlag,
      nodeIndex,
      spinning,
      sourceFromPub,
      orderTypeCode,
      initialNodeFlag,
      rcvStatusCode,
      customData,
      customVisible,
      permissionFlag,
    } = this.state;
    const { customizeForm, customizeTable, customizeBtnGroup, custLoading, remote } = this.props;
    const opreateFlag = rcvStatusCode === '10_NEW' || rcvStatusCode === '30_REJECTED';
    const backPath = sourceFromPub ? false : '/sinv/receipt-execution/list';
    const columns = [
      {
        name: 'lineNum',
        width: 100,
        renderer: ({ record }) => record.index + 1,
      },
      {
        name: 'itemCode',
        width: 160,
      },
      {
        name: 'itemName',
        width: 160,
      },
      {
        name: 'quantity',
        width: 120,
        editor: (record) =>
          rcvStatusCode !== '20_SUBMITTED' &&
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
        name: 'leftQuantity',
        width: 120,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'taxIncludedAmount',
        width: 130,
        editor: (record) =>
          rcvStatusCode !== '20_SUBMITTED' && record.get('subjectType') === 'AMOUNT' && editFlag,
        renderer: ({ value, record }) => showBigNumber(value, record.get('financialPrecision')),
      },
      {
        name: 'leftTaxAmount',
        width: 120,
        renderer: ({ value, record }) => showBigNumber(value, record.get('financialPrecision')),
      },
      {
        name: 'taxRateLov',
        editor: (record) =>
          rcvStatusCode !== '20_SUBMITTED' &&
          (orderTypeCode === 'ASN' || orderTypeCode === 'ORDER' || orderTypeCode === 'PC') &&
          initialNodeFlag === 1 &&
          record.get('subjectType') === 'QUANTITY' &&
          editFlag,
      },
      {
        name: 'netPrice',
        width: 120,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'taxIncludedPrice',
        width: 120,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'rcvTypeName',
        width: 120,
      },
      {
        name: 'trxDate',
        width: 160,
        editor: rcvStatusCode !== '20_SUBMITTED' && editFlag,
      },
      {
        name: 'inventoryNameLov',
        width: 160,
        editor: rcvStatusCode !== '20_SUBMITTED' && editFlag,
      },
      {
        name: 'locationNameLov',
        width: 160,
        editor: rcvStatusCode !== '20_SUBMITTED' && editFlag,
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
        width: 130,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'poQuantity',
        width: 150,
        renderer: ({ value }) => showBigNumber(value),
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
        name: 'deliverTime',
        width: 150,
      },
      {
        name: 'remark',
        width: 150,
        editor: rcvStatusCode !== '20_SUBMITTED' && editFlag,
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
        name: 'checkType',
        width: 100,
      },
      {
        name: 'stageName',
        width: 80,
      },
      {
        name: 'executeReverseQuantity',
        width: 120,
        editor: (record) => record.get('subjectType') === 'QUANTITY' && editFlag,
        renderer: ({ value }) => showBigNumber(value),
      },
      {
        name: 'reverseNodeLov',
        width: 120,
        editor: (record) => record.get('subjectType') === 'QUANTITY' && editFlag,
      },
      {
        name: 'customSpecsJson',
        width: 120,
        renderer: ({ value }) => {
          return (
            <a
              onClick={() => {
                this.setState({
                  customData: value ? JSON.parse(value) : [],
                  customVisible: true,
                });
              }}
            >
              {intl.get(`sinv.receiptExecution.model.title.customSpecsJson`).d('定制品属性')}
            </a>
          );
        },
      },
    ];

    const customProps = {
      visible: customVisible,
      dataSource: customData,
      hideModal: () => {
        this.setState({ customVisible: false });
      },
    };
    return (
      <Fragment>
        <Spin spinning={spinning || false}>
          <Header
            title={intl.get('sinv.receiptExecution.view.title.detail.maintain').d('明细维护')}
            backPath={backPath}
          >
            {!sourceFromPub && (
              <Fragment>
                {customizeBtnGroup({ code: 'SINV.RECEIPT_EXECUTE_DETAIL.BUTTON' }, [
                  <Button
                    icon="check"
                    color="primary"
                    data-name="submit"
                    loading={spinning || custLoading || false}
                    disabled={!editFlag || !opreateFlag}
                    onClick={this.handleSubmit}
                  >
                    {intl.get('hzero.common.button.submit').d('提交')}
                  </Button>,
                  <Button
                    icon="save"
                    color="primary"
                    data-name="save"
                    loading={spinning || custLoading || false}
                    disabled={rcvStatusCode === '20_SUBMITTED' || !permissionFlag}
                    onClick={this.handleSave}
                  >
                    {intl.get('hzero.common.button.save').d('保存')}
                  </Button>,
                  <Button
                    icon="delete"
                    data-name="delete"
                    loading={spinning || custLoading || false}
                    disabled={!editFlag || !opreateFlag}
                    onClick={this.handleDelete}
                  >
                    {intl.get(`hzero.common.button.delete`).d('删除')}
                  </Button>,
                  <Button // icon="printer"
                    icon="print"
                    // funcType="flat"
                    data-name="print"
                    onClick={this.handlePrint}
                  >
                    {intl.get(`sinv.common.view.message.button.print`).d('打印')}
                  </Button>,
                ])}
              </Fragment>
            )}
          </Header>
          <Content className={styles.content}>
            {customizeForm(
              {
                code: `SINV.RECEIPT_EXECUTE_DETAIL.HEADER_${nodeIndex}`,
                readOnly: rcvStatusCode === '20_SUBMITTED',
              },
              <Form dataSet={this.formDs} columns={3}>
                <Output name="displayTrxNum" />
                <Output name="rcvTypeName" />
                <Output name="returnedFlag" renderer={({ value }) => yesOrNoRender(+value)} />
                <Output name="companyName" />
                <Output name="supplierCompanyName" />
                <Output name="creationName" />
                <Output name="creationDate" />
                <Upload
                  filePreview
                  viewOnly
                  name="attachmentTemplateUuid"
                  bucketName="private-bucket"
                  bucketDirectory="sinv-delivery"
                  tenantId={organizationId}
                />
                <Upload
                  filePreview
                  name="sinvHeaderAttachmentUuid"
                  bucketName="private-bucket"
                  bucketDirectory="sinv-delivery"
                  tenantId={organizationId}
                  viewOnly={!editFlag}
                  isMultiple
                />
                <Output
                  name="totalTaxIncludedAmount"
                  renderer={({ value, record }) =>
                    showBigNumber(value, record && record.get('financialPrecision'))
                  }
                />
                <Output name="totalQuantity" renderer={({ value }) => showBigNumber(value)} />
                <TextArea
                  name="remark"
                  newLine
                  resize="both"
                  colSpan={1.5}
                  readOnly={rcvStatusCode === '20_SUBMITTED' || !editFlag}
                  disabled={rcvStatusCode === '20_SUBMITTED'}
                />
              </Form>
            )}
            {customizeTable(
              {
                code: `SINV.RECEIPT_EXECUTE_DETAIL.LINE_${nodeIndex}`,
                readOnly: rcvStatusCode === '20_SUBMITTED',
              },
              <Table
                dataSet={this.tableDs}
                custLoading={custLoading || spinning}
                columns={
                  remote
                    ? remote.process('RECEIPT_EXECUTION_DETAIL_PROCESS_TABLE_COLUMN', columns, {
                        that: this,
                      })
                    : columns
                }
                loading={spinning}
                queryFieldsLimit={3}
              />
            )}
            {customVisible && <CustomModal {...customProps} />}
          </Content>
        </Spin>
      </Fragment>
    );
  }
}
