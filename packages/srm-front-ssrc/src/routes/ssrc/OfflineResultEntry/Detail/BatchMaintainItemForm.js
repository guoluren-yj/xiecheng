import React, { Component } from 'react';
import {
  Form,
  DatePicker,
  Icon,
  NumberField,
  Lov,
  EmailField,
  TextField,
  Select,
  Output,
} from 'choerodon-ui/pro';
import { isEmpty, noop } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { BID } from '@/utils/globalVariable';
import SupplierLov from 'srm-front-boot/lib/components/SupplierLov';
import notification from 'hzero-front/lib/utils/notification';

@observer
export default class BatchMaintainItemForm extends Component {
  componentWillUnmount() {
    const { clearProperties = () => {}, rfx = {} } = this.props;
    const { sourceKey } = rfx;

    clearProperties(function clearCache() {
      this.cache[
        `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM`
      ] = {};
      this.cache[
        `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM`
      ].computeRes = {};
    }, []);
  }

  // supplier lov props
  getSupplierLovProps = (options = {}) => {
    const { header = {}, fetchSourceSupplierRelativeConfigData = noop } = this.props;
    const { companyId } = header || {};

    const queryData = {
      companyId,
    };
    const supplierLovProps = {
      clearButton: false,
      modalProps: {
        style: { maxWidth: '1500px', width: '1000px' },
        onOk: () => this.newBulkAddSupplier(),
      },
      beforeQuery: fetchSourceSupplierRelativeConfigData,
      onChange: () => this.newBulkAddSupplier(),
    };

    return {
      // queryParams: {}, // 初始化查询参数 url
      queryData, // 初始化查询参数 body payload
      ...supplierLovProps,
      ...options,
    };
  };

  // table line supplier Lov onOk
  newBulkAddSupplier = () => {
    const { BatchMaintainItemDS = {}, offlineResultRemote, rfx = {}, header } = this.props;
    const { sourceKey } = rfx || {};
    const CurrentRecord = BatchMaintainItemDS?.current;
    if (!CurrentRecord) {
      return;
    }

    const data = CurrentRecord?.toData();
    const { supplierCompanyNumLov = [] } = data || {};

    if (isEmpty(supplierCompanyNumLov)) {
      notification.warning({
        message: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
      return false;
    }

    const {
      supplierId = null,
      supplierNum = null,
      supplierName = null,
      supplierCompanyId = null,
      supplierCompanyName = null,
      supplierCompanyNum = null,
      name = null,
      mobilephone = null,
      mail = null,
      internationalTelCode = null,
    } = supplierCompanyNumLov || {};

    if (!supplierCompanyId && !supplierId) {
      notification.warning({
        message: intl.get('hzero.common.notification.warn').d('操作异常'),
      });
      return false;
    }

    /**
     * 1、有编码的供应商，保存后就不能改供应商和联系人
     *  联系方式和邮箱可以修改。那么在批量/全量编辑入口改了供应商和其他字段 那已保存的数据就只更新其他字段，不更新供应商字段。
     * 2、无编码的供应商，保存和提交后,供应商 联系人，联系方式，邮箱不做限制都可以修改
     * */
    // case when srls.supplier_id is not null and srls.supplier_company_id is null then 'external'
    //         else null end as supplier_type,

    const supplierTypeText = supplierId && !supplierCompanyId ? 'external' : 'internal';

    const newLovData = {
      ...supplierCompanyNumLov,
      supplierId,
      supplierName,
      supplierNum,
      supplierCompanyName: supplierCompanyName || supplierName,
      supplierCompanyNum: supplierCompanyNum || supplierNum,
      supplierCompanyId,
      contactName: name,
      contactMobilephone: mobilephone,
      supplierType: supplierTypeText,
      contactMail: mail,
      internationalTelCode,
    };

    CurrentRecord.set('supplierId', supplierId);
    CurrentRecord.set('supplierName', supplierName);
    CurrentRecord.set('supplierNum', supplierNum);
    CurrentRecord.set('supplierCompanyName', supplierCompanyName || supplierName);
    CurrentRecord.set('supplierCompanyNum', supplierCompanyNum || supplierNum);
    CurrentRecord.set('supplierCompanyId', supplierCompanyId);
    CurrentRecord.set('contactName', name);
    CurrentRecord.set('contactMobilephone', mobilephone);
    CurrentRecord.set('supplierType', supplierTypeText);
    CurrentRecord.set('contactMail', mail);
    CurrentRecord.set('internationalTelCode', internationalTelCode);
    CurrentRecord.set('supplierCompanyNumLov', newLovData);
    // 二开埋点方法
    if (offlineResultRemote && offlineResultRemote.event) {
      offlineResultRemote.event.fireEvent('handleRemoteBatchNewBulkAddSupplier', {
        header,
        record: CurrentRecord,
        supplierCompanyNumLov,
        bidFlag: sourceKey === BID,
      });
    }
  };

  render() {
    const {
      customizeForm,
      BatchMaintainItemDS,
      rfx = {},
      tableDs = {},
      supplierConfigOldFlag = false,
      allowOnlyNameSupplier,
    } = this.props;
    const { sourceKey } = rfx || {};
    const { ...resetProps } = this.getSupplierLovProps();

    return (
      <div>
        <div
          style={{
            margin: '-20px -20px 10px',
            background: 'rgb(230, 242, 253)',
            padding: '10px 24px',
            fontSize: '13px',
            color: 'rgb(48, 145, 242)',
          }}
        >
          <Icon type="icon icon-help" />
          &nbsp;&nbsp;
          {isEmpty(tableDs.selected)
            ? intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchAllDataToEdit')
                .d('针对全部数据进行批量编辑')
            : intl
                .get('ssrc.inquiryHall.model.inquiryHall.batchCheckDataToEdit', {
                  length: tableDs.selected.length,
                })
                .d(`已勾选${tableDs.selected.length}条数据进行批量编辑`)}
        </div>

        {customizeForm(
          {
            code: `SSRC.${sourceKey === BID ? 'BID_' : ''}OFFLINE_RESULT_ENTRY.BATCH_ITEM_FORM`,
            dataSet: BatchMaintainItemDS,
          },
          <Form dataSet={BatchMaintainItemDS} columns={1} labelLayout="float">
            <DatePicker name="currentExpiryDateFrom" />
            <DatePicker name="currentExpiryDateTo" />
            <NumberField name="currentDeliveryCycle" />
            <DatePicker name="currentPromisedDate" />
            {supplierConfigOldFlag ? (
              <Lov name="supplierCompanyNumLov" />
            ) : (
              <SupplierLov
                name="supplierCompanyNumLov"
                {...resetProps}
                dataSet={BatchMaintainItemDS}
              />
            )}
            {allowOnlyNameSupplier ? (
              supplierConfigOldFlag ? (
                <Lov
                  name="supplierCompanyName"
                  combo
                  noCache
                  valueChangeAction="input"
                  restrict="\S"
                />
              ) : (
                <SupplierLov
                  name="supplierCompanyName"
                  {...resetProps}
                  dataSet={BatchMaintainItemDS}
                  combo
                  noCache
                  valueChangeAction="input"
                  restrict="\S"
                />
              )
            ) : (
              <TextField name="supplierCompanyName" disabled={!allowOnlyNameSupplier} />
            )}
            <TextField name="contactName" />
            <Output
              name="contactMobilephoneContainer"
              renderer={({ record }) => {
                return (
                  <div>
                    <Select
                      clearButton={false}
                      name="internationalTelCode"
                      record={record}
                      style={{
                        width: '40%',
                        height: '0.28rem',
                        lineHeight: '0.26rem',
                        paddingTop: 0,
                      }}
                    />
                    <TextField
                      record={record}
                      name="contactMobilephone"
                      style={{
                        width: '60%',
                        marginLeft: '-0.02rem',
                        height: '0.28rem',
                        lineHeight: '0.26rem',
                        paddingTop: 0,
                      }}
                    />
                  </div>
                );
              }}
            />
            <EmailField name="contactMail" />
          </Form>
        )}
      </div>
    );
  }
}
