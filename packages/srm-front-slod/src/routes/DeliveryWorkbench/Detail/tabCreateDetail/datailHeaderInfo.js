/*
 * @Description: 发货工作台
 * @Date: 2021-12-09 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment } from 'react';
import {
  Lov,
  Form,
  Modal,
  Output,
  Button,
  TextField,
  TextArea,
  Select,
  TelField,
  Attachment,
  DatePicker,
  NumberField,
  DateTimePicker,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';

import { PRIVATE_BUCKET } from '_utils/config';
import CustomLinkIndex from '../../../components/CustomModal';

import styles from '../index.less';
import { showBigNumber } from '@/routes/components/utils';

// 待创建明细头
const HeaderInfo = (props) => {
  const { formDs, nodeTemplateCode, customizeForm } = props;

  // 标签 - 不生成唯一标签编码
  const labelHeaderInfo = [
    <Fragment>
      <div className={styles['form-info']}>
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
            <TextField disabled name="displayLabelNum" />
            <TextField disabled name="nodeConfigName" />
            <TextField disabled name="companyName" />
            <TextField disabled name="supplierCompanyName" />
            <TextField disabled name="createdName" />
            <DatePicker disabled name="creationDate" />
            <Lov name="createdUnitAll" />
            <TextField disabled name="statusCodeMeaning" />
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
              disabled
            />
          </Form>
        )}
      </div>
    </Fragment>,
  ];

  // 标签 - 生成唯一标签编码
  const labelSoleHeaderInfo = [
    <Fragment>
      <div className={styles['form-info']}>
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
            <TextField disabled name="displayLabelNum" />
            <TextField disabled name="nodeConfigName" />
            <TextField disabled name="companyName" />
            <TextField disabled name="supplierCompanyName" />
            <TextField disabled name="statusCodeMeaning" />
            <TextField disabled name="createdName" />
            <DatePicker disabled name="creationDate" />
            <Lov name="createdUnitAll" />
            <Select name="packageMethod" required />
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
              disabled
            />
          </Form>
        )}
      </div>
    </Fragment>,
  ];

  // 计划
  const planHeaderInfo = [
    <Fragment>
      <div className={styles['form-info']}>
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
            <TextField disabled name="displayPlanNum" />
            <TextField disabled name="nodeConfigName" />
            <TextField disabled name="companyName" />
            <TextField disabled name="createdName" />
            <DateTimePicker disabled name="creationDate" />
            <Lov name="createdUnitAll" />
            <TextField disabled name="statusCodeMeaning" />
            <TextField
              disabled
              name="shipTotalQuantity"
              renderer={({ value }) => showBigNumber(value)}
            />
            <TextField disabled name="supplierCompanyName" />
            <TextField
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
              disabled
            />
          </Form>
        )}
      </div>
    </Fragment>,
  ];

  // 送货-基础信息
  const asnHeaderBasicInfo = [
    <Fragment>
      <div className={styles['form-info']}>
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
            <TextField disabled name="displayAsnNum" />
            <TextField disabled name="nodeConfigName" />
            <TextField disabled name="asnTypeCodeMeaning" />
            <TextField disabled name="statusCodeMeaning" />
            <TextField disabled name="createdName" />
            <Lov name="createdUnitAll" />
            <DateTimePicker disabled name="creationDate" />
            <TextField
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
    </Fragment>,
  ];

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
      campKey: 'p',
      editor: true,
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
      <TextField disabled name="supplierCompanyName" />,
      <DatePicker name="shipDate" format="YYYY-MM-DD" />,
      <DatePicker name="expectedArriveDate" mode="dateTime" />,
      <TextField name="deliveryAddress" />,
      <TextField
        disabled
        name="shipTotalQuantity"
        renderer={({ value }) => showBigNumber(value)}
      />,
      <TextField
        disabled
        name="shipTaxIncludedAmount"
        renderer={({ value, record }) =>
          showBigNumber(value, record && record.get('financialPrecision'))
        }
      />,
      <Select name="transportType" />,
      <Lov name="logisticsCompanyCode" />,
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
        disabled
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
            {intl.get('hzero.common.view.button.edit').d('编辑')}
          </a>
        )}
      />,
    ];
    return remote
      ? remote.process('SLOD_PRDETAIL_REMOTE_PROCESS_SHIPMENT_FIELDS', fields, { formDs })
      : fields;
  };

  return (
    <Fragment>
      <div className={styles['form-info']}>
        {customizeForm(
          {
            code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_SHIPMENTS`,
            __force_record_to_update__: true,
          },
          <Form
            useWidthPercent
            style={{ padding: '0px' }}
            labelLayout="float"
            dataSet={formDs}
            columns={3}
          >
            {getFields()}
          </Form>
        )}
      </div>
    </Fragment>
  );
};

// 送货-收货信息
const AsnHeaderReceivingInfo = (props) => {
  const { formDs, customizeForm, nodeTemplateCode } = props;
  return (
    <Fragment>
      <div className={styles['form-info']}>
        {customizeForm(
          {
            code: `SLOD.DELIVERY__WORKBENCH_${nodeTemplateCode}_A.DETAIL_DELIVERY`,
            __force_record_to_update__: true,
          },
          <Form
            useWidthPercent
            style={{ padding: '0px' }}
            labelLayout="float"
            dataSet={formDs}
            columns={3}
          >
            <TextField disabled name="companyName" />
            <TextField disabled name="invOrganizationName" />
            <TextField name="receiveAddress" />
            {/* <TextField disabled name="carriersName" />
                <TextField name="processingPlantAddress" /> */}
            <TextField name="contactName" />
            <TelField name="contactTelNum" />
          </Form>
        )}
      </div>
    </Fragment>
  );
};

// 附件信息
const AttachmentList = (props) => {
  const { customizeForm, nodeTemplateCode, formDs } = props;
  return (
    <Fragment>
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
            labelLayout="float"
            dataSet={formDs}
          >
            <Attachment
              labelLayout="float"
              bucketName={PRIVATE_BUCKET}
              name="purchaseAttachmentUuid"
              help={
                <span>
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
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
                  {intl.get('sinv.common.view.attachment.supportExtensions').d('支持扩展名')}: .rar
                  .zip .doc .docx .pdf .jpg...
                </span>
              }
            />
          </Form>
        )}
      </div>
    </Fragment>
  );
};

export { HeaderInfo, AsnHeaderShipmentsInfo, AsnHeaderReceivingInfo, AttachmentList };
