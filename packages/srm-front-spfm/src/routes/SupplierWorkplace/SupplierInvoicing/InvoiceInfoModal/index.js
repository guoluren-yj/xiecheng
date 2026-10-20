/**
 * 发票信息弹窗
 * @Author qingxiang.luo@going-link.com
 * @Date 2022-01-07
 */
import React, { useEffect, useState } from 'react';
import { Modal, Popconfirm } from 'choerodon-ui'; // Upload
import {
  Form,
  Button,
  TextField,
  NumberField,
  Switch,
  Output,
  Select,
  DatePicker,
  Icon,
} from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import classNames from 'classnames';
import notification from 'utils/notification';
import {
  queryInvoiceInfo,
  saveInvoiceInfo,
  fetchRemoveFile, // 删除附件
} from '@/services/supplier/supplierInvoicingService';

import styles from './index.less';

const { Sidebar } = Modal;
const BKT_HFILE = 'private-bucket';

let saveKey = 1;
let loading = false;

const InvoiceInfoModal = (props) => {
  const { visible, dataSet, localRecord, onCancel = () => {}, isCanEdit = false } = props;

  const [hidden, setHidden] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (localRecord && localRecord.get('supplierInvoiceId')) {
      handleQueryDetail(localRecord.get('supplierInvoiceId'));
    } else {
      const amount = localRecord.get('paymentFee') || 0;
      const taxFee = parseFloat(amount * 0.06).toFixed(2);
      dataSet.create(
        {
          invoiceType: 'ELEC_VAT',
          taxRate: '6',
          feeIncludeTax: parseFloat(amount),
          taxFee,
          feeNoTax: parseFloat(amount - taxFee),
        },
        0
      );
    }

    return () => {
      saveKey = 1;
      loading = false;
    };
  }, []);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 查询详情信息
   * @param {*} id
   */
  const handleQueryDetail = (id) => {
    queryInvoiceInfo({ supplierInvoiceId: id }).then((res) => {
      if (getResponse(res)) {
        if (res.invoiceType === 'ELEC_VAT') {
          setHidden(true);
        } else {
          setHidden(false);
        }
        const obj = res || {};
        dataSet.data = [
          {
            ...obj,
            ticketFlag: obj.ticket
              ? intl.get('hzero.common.button.yes').d('是')
              : intl.get('hzero.common.button.no').d('否'),
          },
        ];
        if (res && res.attachmentFiles && res.attachmentFiles.length) {
          setFileList(res.attachmentFiles);
        }
      }
    });
  };

  const handleCloseModal = () => {
    dataSet.data = [];
    dataSet.reset();
    onCancel();
  };

  /**
   * 保存数据
   */
  const handleSave = async () => {
    const isValid = await dataSet.validate();
    const isEdit = dataSet.filter(
      (record) => record.status === 'add' || record.status === 'update'
    );

    if (isValid) {
      if (isEdit.length && saveKey === 1) {
        saveKey = 0;
        loading = true;
        setRefresh(true);
        const data = dataSet.toData()[0];

        saveInvoiceInfo({ ...data }).then((res) => {
          saveKey = 1;
          loading = false;
          setRefresh(true);

          if (getResponse(res)) {
            notification.success();
            if (res.supplierInvoiceId) {
              handleQueryDetail(res.supplierInvoiceId);
            }
          }
        });
      } else {
        handleCloseModal();
      }
    }
  };

  /**
   * 切换发票类型
   * @param {*} type
   */
  const handleChangeType = (type) => {
    if (type === 'ELEC_VAT') {
      // 全电发票
      setHidden(true);
      setRefresh(true);
    } else {
      setHidden(false);
      setRefresh(true);
    }
  };

  /**
   * 移除附件
   */
  const handleRemoveFile = () => {
    const attachId = dataSet && dataSet.current ? dataSet.current.get('attachmentUuid') : '';

    fetchRemoveFile({
      bucketName: BKT_HFILE,
      attachmentUuid: attachId,
    }).then((res) => {
      if (getResponse(res)) {
        setFileList([]);
      }
    });
  };

  /**
   * 下载文件
   */
  const handleDownLoad = () => {
    const url = fileList && fileList.length ? fileList[0].downLoadUrl : '';
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.click();
    }
  };

  const labelLayout = isCanEdit ? 'float' : 'vertical';
  const FieldType = isCanEdit ? TextField : Output;
  const TaxRateType = isCanEdit ? Select : Output;
  const NumberType = isCanEdit ? NumberField : Output;
  const SwitchType = isCanEdit ? Switch : Output;
  const DateType = isCanEdit ? DatePicker : Output;

  return (
    <Sidebar
      title={intl.get('spfm.supplierInvoic.model.invoiceInformation').d('发票信息')}
      visible={visible}
      closable
      destroyOnClose
      maskClosable={false}
      onCancel={handleCloseModal}
      className={classNames(styles['points-modal-footer'])}
      width={380}
      footer={
        <div>
          {isCanEdit && (
            <Button color="primary" loading={loading} onClick={handleSave}>
              {intl.get(`hzero.common.button.ok`).d('确定')}
            </Button>
          )}
          {!isCanEdit && (
            <Button color="primary" onClick={handleCloseModal}>
              {intl.get(`hzero.common.button.close`).d('关闭')}
            </Button>
          )}
          {isCanEdit && (
            <Button onClick={handleCloseModal}>
              {intl.get(`hzero.common.button.cancel`).d('取消')}
            </Button>
          )}
        </div>
      }
    >
      <div className="invoice-modal-form">
        <Form labelLayout={labelLayout} dataSet={dataSet} columns={1}>
          <FieldType name="invoiceTypeMeaning" disabled={!isCanEdit} onChange={handleChangeType} />
          {hidden ? null : <FieldType name="invoiceCode" disabled={!isCanEdit} />}
          <FieldType name="invoiceNo" disabled={!isCanEdit} />
          <DateType name="invoiceDate" disabled={!isCanEdit} />
          <FieldType name="taxRateMeaning" disabled={!isCanEdit} />
          <NumberType name="taxFee" disabled={!isCanEdit} />
          <NumberType name="feeNoTax" disabled={!isCanEdit} />
          <NumberType name="feeIncludeTax" disabled={!isCanEdit} />
          <SwitchType name="ticketFlag" disabled={!isCanEdit} />
          {hidden ? null : <TaxRateType name="expressCompanyMeaning" disabled={!isCanEdit} />}
          {hidden ? null : <FieldType name="expressNum" disabled={!isCanEdit} />}
          {!isCanEdit ? <FieldType name="handleUserName" disabled /> : null}
          {!isCanEdit ? <FieldType name="submitDate" disabled /> : null}
        </Form>
      </div>

      <div style={{ marginTop: '20px', marginLeft: '20px' }}>
        {fileList.length ? (
          <>
            <div style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
              {intl.get('spfm.supplierInvoic.view.model.attachmentFile').d('附件信息')}
            </div>
            <div>
              <a onClick={handleDownLoad}>{fileList[0].name || fileList[0].fileName}</a>
              {isCanEdit ? (
                <Popconfirm
                  title={intl
                    .get('spfm.supplierInvoic.view.message.delAttachmentList')
                    .d('是否确认删除当前附件信息')}
                  onConfirm={handleRemoveFile}
                  okText={intl.get('hzero.common.button.ok')}
                  cancelText={intl.get('hzero.common.status.cancel')}
                >
                  <Icon
                    type="close"
                    style={{
                      marginLeft: '20px',
                      cursor: 'pointer',
                    }}
                  />
                </Popconfirm>
              ) : null}
            </div>
          </>
        ) : (
          <>
            {hidden ? (
              <div>
                <span style={{ color: 'red' }}>*</span>
                <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
                  {intl.get('spfm.supplierInvoic.view.model.attachmentFile').d('附件信息')}
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default InvoiceInfoModal;
