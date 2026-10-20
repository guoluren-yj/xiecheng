import React, { Fragment } from 'react';
import { Form, Spin, TextArea, Attachment, Output, Modal, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import { isNil } from 'lodash';
import moment from 'moment';
import {
  dateRender, // 日期格式化
  dateTimeRender, // 日期时间格式化
} from 'hzero-front/lib/utils/renderer';
import { showBigNumber } from '@/routes/components/utils';
import { handleFieldsFormRender } from '@/routes/components/utils/utils';
import CustomLinkIndex from '../../../components/CustomModal';
import { detailAttachmentUuidChange, colorRender } from '../../globalFunction';

import styles from '../index.less';

// const organizationId = getCurrentOrganizationId();
// const tenantId = getUserOrganizationId();

// 待确认明细头
const HeaderInfo = (props) => {
  const { formDs, nodeTemplateCode, customizeForm } = props;
  // 标签 - 不生成唯一标签编码
  const labelHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
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
              <Output name="createdUnitAll" />
              <Output
                name="statusCodeMeaning"
                renderer={({ value, record }) => colorRender(value, record, 'statusCode')}
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

  // 标签 - 生成唯一标签编码
  const labelSoleHeaderInfo = [
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
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
              <Output name="createdUnitAll" />
              <Output name="packageMethod" />
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
      <Spin spinning={false}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
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
              <Output name="createdUnitAll" />
              <Output
                name="statusCodeMeaning"
                renderer={({ value, record }) => colorRender(value, record, 'statusCode')}
              />
              <Output name="shipTotalQuantity" renderer={({ value }) => showBigNumber(value)} />
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

  // 送货-基础信息
  const asnHeaderBasicInfo = [
    <Fragment>
      <Spin spinning={false}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_HEADER`,
              __force_record_to_update__: true,
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
              <Output name="createdUnitAll" />
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
      </Spin>
    </Fragment>,
  ];

  // return labelHeaderInfo;

  if (nodeTemplateCode === 'LABEL') {
    return labelHeaderInfo;
  } else if (nodeTemplateCode === 'PLAN') {
    return planHeaderInfo;
  } else if (nodeTemplateCode === 'ASN') {
    return asnHeaderBasicInfo;
  } else {
    return labelSoleHeaderInfo;
  }
};

// 送货-发货信息
const AsnHeaderShipmentsInfo = (props) => {
  const {
    formDs,
    remote,
    customizeForm,
    nodeTemplateCode,
    tplInfo,
    nodeConfigId,
    customizeTable,
    customizeBtnGroup,
  } = props;
  const onOpenLinkChange = (linesId, headersId, linkOrder = null, record) => {
    const basicProps = {
      linesId,
      tplInfo,
      headersId,
      isForm: 1,
      campKey: 's',
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

  const getFields = () => {
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
        // mode="dateTime"
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
        // pattern={/1[3-9]\d{9}/g}
        renderer={({ value, record }) => {
          const phone = value || '';
          const area = !isNil(record?.get('internationalTelCode'))
            ? record?.get('internationalTelCode')
            : '';
          const val = !isNil(record?.get('internationalTelCode')) ? `${area}-${phone}` : `${phone}`;
          return handleFieldsFormRender(val, record?.get('changeFieldMap'), 'logisticsPhoneNum');
        }}
      />,
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
      ? remote.process(
          'SLOD_SUPPLIER_AFFIRMDETAILS_DETAIL_REMOTE_PROCESS_SHIPMENT_FIELDS',
          fields,
          { formDs }
        )
      : fields;
  };

  return (
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_SHIPMENTS`,
              __force_record_to_update__: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              labelLayout="vertical"
              dataSet={formDs}
              columns={3}
            >
              {getFields()}
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>
  );
};

// 送货-收货信息
const AsnHeaderReceivingInfo = (props) => {
  const { formDs, customizeForm, nodeTemplateCode } = props;
  return (
    <Fragment>
      <Spin dataSet={formDs}>
        <div className={styles['form-info-detail-readolny']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_DELIVERY`,
              __force_record_to_update__: true,
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
              {/* <TextField disabled name="carriersName" />
              <TextField disabled name="processingPlantAddress" /> */}
              <Output
                name="contactName"
                renderer={({ value, record }) =>
                  handleFieldsFormRender(value, record?.get('changeFieldMap'), 'contactName')
                }
              />
              <Output
                name="contactTelNum"
                renderer={({ value, record }) => {
                  const phone = value || '';
                  const area = !isNil(record?.get('contactsTelCode'))
                    ? record?.get('contactsTelCode')
                    : '';
                  const val = !isNil(record?.get('contactsTelCode'))
                    ? `${area}-${phone}`
                    : `${phone}`;
                  return handleFieldsFormRender(
                    val,
                    record?.get('changeFieldMap'),
                    'contactTelNum'
                  );
                }}
              />
            </Form>
          )}
        </div>
      </Spin>
    </Fragment>
  );
};

// 附件信息
const AttachmentList = (props) => {
  const { formDs, attachmentDs, customizeForm, nodeTemplateCode } = props;
  return (
    <Fragment>
      <Spin spinning={false}>
        <div className={styles['footer-form']}>
          {customizeForm(
            {
              code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_ATTACHMENT`,
              __force_record_to_update__: true,
            },
            <Form
              useWidthPercent
              style={{ padding: '0px' }}
              columns={2}
              labelLayout="vertical"
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
                labelLayout="float"
                onAttachmentsChange={() => detailAttachmentUuidChange({ formDs, attachmentDs })}
                // readOnly={({record})=>!['PURCHASER_PUBLISHED', 'PURCHASER_REJECTED'].includes(record.get('statusCode'))}
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
