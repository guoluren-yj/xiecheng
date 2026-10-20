import React, { Fragment } from 'react';
import {
  Lov,
  Form,
  Spin,
  Modal,
  Button,
  Attachment,
  Output,
  Row,
  TelField,
  Select,
  TextField,
  TextArea,
  DatePicker,
  NumberField,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import moment from 'moment';
import { PRIVATE_BUCKET } from '_utils/config';
import {
  dateRender, // 日期格式化
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import { handleFieldsFormRender } from '@/routes/components/utils/utils';
import { colorRender } from '../../globalFunction';
import { showBigNumber } from '@/routes/components/utils';
import CustomLinkIndex from '../../../components/CustomModal';
import styles from '../index.less';

// 待创建明细头
const HeaderInfo = (props) => {
  const { edit, formDs, customizeForm, sourceFromPub, nodeTemplateCode } = props;
  // 标签 - 不生成唯一标签编码
  const labelHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-edit']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="float"
              dataSet={formDs}
              columns={3}
            >
              <TextField name="displayLabelNum" />
              <TextField name="nodeConfigName" />
              <TextField name="companyName" />
              <TextField name="supplierCompanyName" />
              <TextField name="createdName" />
              <DatePicker name="creationDate" />
              <Lov name="createdUnitAll" />
              <TextField name="statusCodeMeaning" />
              <TextArea
                name="purchaseRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
              <TextArea
                name="supplierRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>,
  ];

  // 标签 - 不生成唯一标签编码 - 只读
  const readOnlyLabelHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
              readOnly: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="vertical"
              dataSet={formDs}
              columns={3}
            >
              <Output name="displayLabelNum" />
              <Output name="nodeConfigName" />
              <Output name="companyName" />
              <Output name="supplierCompanyName" />
              <Output name="createdName" />
              <Output name="creationDate" />
              <Output
                name="createdUnitAll"
                renderer={({ record }) => record?.get('createdUnitName') || null}
              />
              <Output
                name="statusCodeMeaning"
                renderer={({ value, record }) => colorRender(value, record, 'statusCode')}
              />
              <Output name="purchaseRemark" />
              <Output name="supplierRemark" />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>,
  ];

  // 标签 - 生成唯一标签编码- 只读 readOnlyLabelSoleHeaderInfo
  const readOnlyLabelSoleHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
              readOnly: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="vertical"
              dataSet={formDs}
              columns={3}
            >
              <Output name="displayLabelNum" />
              <Output name="nodeConfigName" />
              <Output name="companyName" />
              <Output name="supplierCompanyName" />
              <Output
                name="statusCodeMeaning"
                renderer={({ value, record }) => colorRender(value, record, 'statusCode')}
              />
              <Output name="createdName" />
              <Output name="creationDate" />
              <Output
                name="createdUnitAll"
                renderer={({ record }) => record?.get('createdUnitName') || null}
              />
              <Output name="packageMethod" required />
              <Output
                name="purchaseRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
              <Output
                name="supplierRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>,
  ];

  // 标签 - 生成唯一标签编码
  const labelSoleHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-edit']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="float"
              dataSet={formDs}
              columns={3}
            >
              <TextField name="displayLabelNum" />
              <TextField name="nodeConfigName" />
              <TextField name="companyName" />
              <TextField name="supplierCompanyName" />
              <TextField name="statusCodeMeaning" />
              <TextField name="createdName" />
              <DatePicker name="creationDate" />
              <Lov name="createdUnitAll" />
              <TextField name="packageMethod" required />
              <TextArea
                name="purchaseRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
              <TextArea
                name="supplierRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>,
  ];

  // 计划
  const planHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-edit']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="float"
              dataSet={formDs}
              columns={3}
            >
              <TextField name="displayPlanNum" />
              <TextField name="nodeConfigName" />
              <TextField name="companyName" />
              <TextField disabled name="supplierCompanyName" />
              <TextField name="createdName" />
              <DatePicker name="creationDate" />
              <Lov disabled name="createdUnitAll" />
              <TextField name="statusCodeMeaning" />
              <TextField
                disabled
                name="shipTotalQuantity"
                renderer={({ value }) => showBigNumber(value)}
              />
              <TextField
                disabled
                name="changingFlag"
                renderer={({ value }) => {
                  if (Number(value) === 1) {
                    return (
                      <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>
                    );
                  }
                  if (Number(value) === 0) {
                    return <span>{intl.get('hzero.common.no').d('否')}</span>;
                  }
                }}
              />
              <TextArea
                name="purchaseRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
              <TextArea
                name="supplierRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>,
  ];

  // 计划 - 只读 readOnlyPlanHeaderInfo
  const readOnlyPlanHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
              readOnly: !sourceFromPub,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="vertical"
              dataSet={formDs}
              columns={3}
            >
              <Output name="displayPlanNum" />
              <Output name="nodeConfigName" />
              <Output name="companyName" />
              <Output name="supplierCompanyName" />
              <Output name="createdName" />
              <Output name="creationDate" />
              <Output
                name="createdUnitAll"
                renderer={({ record }) => record?.get('createdUnitName') || null}
              />
              <Output
                name="statusCodeMeaning"
                renderer={({ value, record }) => colorRender(value, record, 'statusCode')}
              />
              <Output name="shipTotalQuantity" />
              <Output
                name="changingFlag"
                renderer={({ value }) => {
                  if (Number(value) === 1) {
                    return (
                      <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>
                    );
                  }
                  if (Number(value) === 0) {
                    return <span>{intl.get('hzero.common.no').d('否')}</span>;
                  }
                }}
              />
              <Output
                name="purchaseRemark"
                newLine
                resize="both"
                colSpan={2}
                autoSize={{ minRows: 2, maxRows: 8 }}
                renderer={({ value, record }) =>
                  handleFieldsFormRender(value, record?.get('changeFieldMap'), 'purchaseRemark')
                }
              />
              <Output
                name="supplierRemark"
                renderer={({ value, record }) =>
                  handleFieldsFormRender(value, record?.get('changeFieldMap'), 'supplierRemark')
                }
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>,
  ];

  // 送货-基础信息 -只读
  const readOnlyAsnHeaderBasicInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <Row type="flex" style={{ flexWrap: 'nowrap' }}>
          <div className={styles['form-info-detail-readolny']}>
            {customizeForm(
              {
                code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
                __force_record_to_update__: true,
                readOnly: !sourceFromPub,
              },
              <Form
                useWidthPercent
                style={{ padding: '0px' }}
                labelLayout="vertical"
                dataSet={formDs}
                columns={3}
              >
                <Output name="displayAsnNum" />
                <Output name="nodeConfigName" />
                <Output name="asnTypeCodeMeaning" />
                <Output
                  name="statusCodeMeaning"
                  renderer={({ value, record }) => colorRender(value, record, 'statusCode')}
                />
                <Output name="createdName" />
                <Output
                  name="createdUnitAll"
                  renderer={({ record }) => record?.get('createdUnitName') || null}
                />
                <Output name="creationDate" />
                <Output
                  name="changingFlag"
                  renderer={({ value }) => {
                    if (Number(value) === 1) {
                      return (
                        <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>
                      );
                    }
                    if (Number(value) === 0) {
                      return <span>{intl.get('hzero.common.no').d('否')}</span>;
                    }
                  }}
                />
              </Form>
            )}
          </div>
        </Row>
      </Spin>
    </Fragment>,
  ];

  // 送货-基础信息 asnHeaderBasicInfo
  const asnHeaderBasicInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <Row type="flex" style={{ flexWrap: 'nowrap' }}>
          <div className={styles['form-info-edit']}>
            {customizeForm(
              {
                code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
                __force_record_to_update__: true,
              },
              <Form
                useWidthPercent
                style={{ padding: '0px' }}
                labelLayout="float"
                dataSet={formDs}
                columns={3}
              >
                <TextField name="displayAsnNum" />
                <TextField name="nodeConfigName" />
                <TextField name="asnTypeCodeMeaning" />
                <TextField name="statusCodeMeaning" />
                <TextField name="createdName" />
                <Lov disabled name="createdUnitAll" />
                <DatePicker name="creationDate" />
                <TextField
                  disabled
                  name="changingFlag"
                  renderer={({ value }) => {
                    if (Number(value) === 1) {
                      return (
                        <span style={{ color: 'red' }}>{intl.get('hzero.common.yes').d('是')}</span>
                      );
                    }
                    if (Number(value) === 0) {
                      return <span>{intl.get('hzero.common.no').d('否')}</span>;
                    }
                  }}
                />
              </Form>
            )}
          </div>
        </Row>
      </Spin>
    </Fragment>,
  ];

  if (nodeTemplateCode === 'LABEL') {
    return edit ? labelHeaderInfo : readOnlyLabelHeaderInfo;
  } else if (nodeTemplateCode === 'PLAN') {
    return edit ? planHeaderInfo : readOnlyPlanHeaderInfo;
  } else if (nodeTemplateCode === 'ASN') {
    return edit ? asnHeaderBasicInfo : readOnlyAsnHeaderBasicInfo;
  } else {
    return edit ? labelSoleHeaderInfo : readOnlyLabelSoleHeaderInfo;
  }
};

// 送货-发货信息
const AsnHeaderShipmentsInfo = (props) => {
  const {
    formDs,
    edit,
    tplInfo,
    remote,
    customizeForm,
    nodeTemplateCode,
    nodeConfigId,
    customizeTable,
    customizeBtnGroup,
    sourceFromPub = false,
  } = props;
  const onOpenLinkChange = (linesId, headersId, linkOrder = null, record) => {
    const basicProps = {
      linesId,
      tplInfo,
      headersId,
      isForm: 1,
      campKey: 'p',
      editor: false,
      nodeConfigId,
      nodeTemplateCode,
      type: linkOrder,
      customizeTable,
      customizeBtnGroup,
      lineRecord: record,
    };
    const modal = Modal.open({
      drawer: true,
      style: { width: '852px' },
      children: <CustomLinkIndex {...basicProps} />,
      footer: (
        <Button color="primary" onClick={() => modal.close()}>
          {intl.get('hzero.common.status.closed').d('关闭')}
        </Button>
      ),
    });
  };

  const getReadOnlyFields = () => {
    const fields = [
      <Output name="supplierCompanyName" />,
      <Output
        name="shipDate"
        renderer={({ value, record }) => {
          const data =
            value && !isNil(value) ? dateRender(moment(value).format('YYYY-MM-DD')) : '-';
          return handleFieldsFormRender(data, record?.get('changeFieldMap'), 'shipDate');
        }}
      />,
      <Output
        name="expectedArriveDate"
        renderer={({ value, record }) => {
          const data = dateTimeRender(value) || '-';
          // const data =
          //   value && !isNil(value) ? moment(value).format('YYYY-MM-DD hh:mm:ss') : '-';
          return handleFieldsFormRender(data, record?.get('changeFieldMap'), 'expectedArriveDate');
        }}
      />,
      <Output
        name="deliveryAddress"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'deliveryAddress')
        }
      />,
      <Output name="shipTotalQuantity" renderer={({ value }) => showBigNumber(value)} />,
      <Output
        name="shipTaxIncludedAmount"
        renderer={({ value, record }) =>
          showBigNumber(value, record && record.get('financialPrecision'))
        }
      />,
      <Output
        name="transportType"
        renderer={({ value, record }) => {
          const val = (value && record?.get('transportTypeMeaning')) || '-';
          return handleFieldsFormRender(val, record?.get('changeFieldMap'), 'transportType');
        }}
      />,
      <Output
        name="logisticsCompanyCode"
        renderer={({ value, record }) => {
          const val = (value && record?.get('logisticsCompanyName')) || '-';
          return handleFieldsFormRender(val, record?.get('changeFieldMap'), 'logisticsCompanyCode');
        }}
      />,
      <Output
        name="carNumber"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'carNumber')
        }
      />,
      <Output
        name="expressNum"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'expressNum')
        }
      />,
      <Output
        name="logisticsCost"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'logisticsCost')
        }
      />,
      <Output
        name="logisticsStaff"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'logisticsStaff')
        }
      />,
      <Output
        name="logisticsPhoneNum"
        renderer={({ value, record }) => {
          return handleFieldsFormRender(value, record?.get('changeFieldMap'), 'logisticsPhoneNum');
        }}
      />,
      <Output
        name="purchaseRemark"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'purchaseRemark')
        }
      />,
      <Output
        name="supplierRemark"
        renderer={({ value, record }) =>
          handleFieldsFormRender(value, record?.get('changeFieldMap'), 'supplierRemark')
        }
      />,
      <Output
        name="linkFirst"
        renderer={({ record }) => (
          <a
            onClick={() =>
              onOpenLinkChange(
                record?.get('asnLineId'),
                record?.get('asnHeaderId'),
                Number(1),
                record
              )
            }
          >
            {intl.get('hzero.common.button.look').d('查看')}
          </a>
        )}
      />,
    ];
    return remote
      ? remote.process('SLOD_ALL_DETAIL_REMOTE_PROCESS_SHIPMENT_READONLY_FIELDS', fields, {
          edit,
          formDs,
        })
      : fields;
  };
  const readOnlyForm = [
    <div className={styles['form-info-detail-readolny']}>
      {customizeForm(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_SHIPMENTS`,
          __force_record_to_update__: true,
          readOnly: !sourceFromPub,
        },
        <Form
          useWidthPercent
          style={{ padding: '0px' }}
          labelLayout="vertical"
          dataSet={formDs}
          columns={3}
        >
          {getReadOnlyFields()}
        </Form>
      )}
    </div>,
  ];

  const getEditFields = () => {
    const fields = [
      <TextField name="supplierCompanyName" />,
      <DatePicker name="shipDate" />,
      <DatePicker name="expectedArriveDate" mode="dateTime" />,
      <TextField name="deliveryAddress" />,
      <TextField name="shipTotalQuantity" renderer={({ value }) => showBigNumber(value)} />,
      <TextField
        name="shipTaxIncludedAmount"
        renderer={({ value, record }) =>
          showBigNumber(value, record && record.get('financialPrecision'))
        }
      />,
      <Select name="transportType" />,
      <Lov
        name="logisticsCompanyCode"
        renderer={({ record }) => record?.get('logisticsCompanyName')}
      />,
      <TextField name="carNumber" />,
      <TextField name="expressNum" />,
      <NumberField name="logisticsCost" />,
      <TextField name="logisticsStaff" />,
      <TelField name="logisticsPhoneNum" />,
      <TextArea
        name="purchaseRemark"
        newLine
        resize="both"
        colSpan={2}
        autoSize={{ minRows: 2, maxRows: 8 }}
      />,
      <TextArea
        name="supplierRemark"
        newLine
        resize="both"
        colSpan={2}
        autoSize={{ minRows: 2, maxRows: 8 }}
      />,
      <Output
        name="linkFirst"
        renderer={({ record }) => (
          <a
            onClick={() =>
              onOpenLinkChange(
                record?.get('asnLineId'),
                record?.get('asnHeaderId'),
                Number(1),
                record
              )
            }
          >
            {intl.get('hzero.common.button.look').d('查看')}
          </a>
        )}
      />,
    ];
    return remote
      ? remote.process('SLOD_ALL_DETAIL_REMOTE_PROCESS_SHIPMENT_EDIT_FIELDS', fields, {
          edit,
          formDs,
        })
      : fields;
  };

  const editForm = [
    <div className={styles['form-info-edit']}>
      {customizeForm(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_SHIPMENTS`,
          __force_record_to_update__: true,
        },
        <Form useWidthPercent labelLayout="float" dataSet={formDs} columns={3}>
          {getEditFields()}
        </Form>
      )}
    </div>,
  ];
  return (
    <Fragment>
      <Spin dataSet={formDs}>{!edit ? readOnlyForm : editForm}</Spin>
    </Fragment>
  );
};

// 送货-收货信息
const AsnHeaderReceivingInfo = (props) => {
  const { formDs, customizeForm, edit, nodeTemplateCode, sourceFromPub = false } = props;
  const readOnlyForm = [
    <div className={styles['form-info-detail-readolny']}>
      {customizeForm(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_DELIVERY`,
          __force_record_to_update__: true,
          readOnly: !sourceFromPub,
          // extTextRenderIntercept: (line, node) => {
          //   // const {record} = line;
          //   // console.log(record?.get('changeFieldMap'), 'line');
          //   console.log(line, 'node');
          //   console.log(node, 'node');
          //   return node;
          // },
        },
        <Form
          useWidthPercent
          style={{ padding: '0px' }}
          labelLayout="vertical"
          dataSet={formDs}
          columns={3}
        >
          <Output name="companyName" />
          <Output name="invOrganizationName" />
          <Output
            name="receiveAddress"
            renderer={({ value, record }) =>
              handleFieldsFormRender(value, record?.get('changeFieldMap'), 'receiveAddress')
            }
          />
          {/* <Output name="carriersName" />
        <Output name="processingPlantAddress" /> */}
          <Output
            name="contactName"
            renderer={({ value, record }) =>
              handleFieldsFormRender(value, record?.get('changeFieldMap'), 'contactName')
            }
          />
          <Output
            name="contactTelNum"
            renderer={({ value, record }) => {
              return handleFieldsFormRender(value, record?.get('changeFieldMap'), 'contactTelNum');
            }}
          />
        </Form>
      )}
    </div>,
  ];

  const editForm = [
    <div className={styles['form-info-edit']}>
      {customizeForm(
        {
          code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_DELIVERY`,
          __force_record_to_update__: true,
        },
        <Form labelLayout="float" dataSet={formDs} columns={3}>
          <TextField name="companyName" />
          <TextField name="invOrganizationName" />
          <TextField name="receiveAddress" />
          <TextField name="contactName" />
          <TelField name="contactTelNum" />
        </Form>
      )}
    </div>,
  ];

  return (
    <Fragment>
      <Spin dataSet={formDs}>{!edit ? readOnlyForm : editForm}</Spin>
    </Fragment>
  );
};

// 附件信息
const AttachmentList = (props) => {
  const { attachmentDs, customizeForm, edit, nodeTemplateCode, sourceFromPub = false } = props;
  return (
    <Fragment>
      <Spin dataSet={attachmentDs}>
        <div className={styles['footer-form']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ATTACHMENT`,
              __force_record_to_update__: true,
              readOnly: sourceFromPub ? false : !edit,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              columns={2}
              labelLayout="float"
              dataSet={attachmentDs}
            >
              <Attachment
                readOnly
                labelLayout="float"
                bucketName={PRIVATE_BUCKET}
                name="purchaseAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
              <Attachment
                readOnly
                labelLayout="float"
                bucketName={PRIVATE_BUCKET}
                name="supplierAttachmentUuid"
                help={
                  <span>
                    {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}:
                    .rar .zip .doc .docx .pdf .jpg...
                  </span>
                }
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>
  );
};

export { HeaderInfo, AsnHeaderShipmentsInfo, AsnHeaderReceivingInfo, AttachmentList };
