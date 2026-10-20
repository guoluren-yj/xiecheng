import intl from 'utils/intl';
import { isString } from 'lodash';
// import { getDateFormat } from 'utils/utils';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'hzero-front/lib/utils/regExp';

const promptCode = 'ssrc.offlineResultEntry';

const BatchMaintainItemDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        label: intl.get(`${promptCode}.model.offlineEntry.qVFrom`).d('报价有效期从'),
        name: 'currentExpiryDateFrom',
        type: 'date',
        // format: getDateFormat(),
        // max: 'currentExpiryDateTo',
      },
      {
        label: intl.get(`${promptCode}.model.offlineEntry.qVTo`).d('报价有效期至'),
        name: 'currentExpiryDateTo',
        type: 'date',
        // format: getDateFormat(),
        min: 'currentExpiryDateFrom',
      },
      {
        label: intl.get(`${promptCode}.model.offlineEntry.deliveryPeriod`).d('供货周期'),
        name: 'currentDeliveryCycle',
        type: 'number',
        min: 0,
        step: 1,
      },
      {
        label: intl.get(`${promptCode}.model.offlineEntry.promDelDate`).d('承诺交货期'),
        name: 'currentPromisedDate',
        type: 'date',
        // format: getDateFormat(),
        defaultValue: null,
      },
      {
        name: 'supplierCompanyNumLov',
        type: 'object',
        label: intl.get(`${promptCode}.model.offlineEntry.supplierCode`).d('供应商编码'),
        lovCode: 'SSRC.SUPPLIER',
        ignore: 'always',
        valueField: 'supplierCompanyId',
        textField: 'supplierCompanyNum',
        dynamicProps: {
          lovPara({ dataSet }) {
            const { companyId, templateId, rfxHeaderId: sourceHeaderId, userId, organizationId } =
              dataSet.queryParameter?.rfxHeader || {};

            const params = {
              organizationId,
              userId,
              companyId,
              templateId,
              sourceHeaderId,
              itemId: null,
              sourceFrom: 'RFX',
              offlineFlag: 1, // HACK 区分是寻源维护还是线下寻源结果录入维护供应商信息, 固定值
            };

            return params;
          },
        },
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyNum',
      },
      {
        name: 'supplierCompanyId',
        type: 'string',
        bind: 'supplierCompanyNumLov.supplierCompanyId',
      },
      {
        name: 'supplierCompanyName', // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
        type: 'object',
        lovCode: 'SSRC.SUPPLIER',
        label: intl.get(`${promptCode}.model.offlineEntry.supplierName`).d('供应商名称'),
        maxLength: 360,
        textField: 'supplierCompanyName',
        transformRequest: (val) => val?.supplierCompanyName,
        dynamicProps: {
          lovPara({ record, dataSet }) {
            const { companyId, templateId, sourceHeaderId, userId, organizationId } =
              dataSet.queryParameter.rfxHeader || {};
            return {
              organizationId,
              userId,
              companyId,
              templateId,
              sourceHeaderId,
              itemId: record.get('itemId'),
              sourceFrom: 'RFX',
              offlineFlag: 1, // HACK 区分是寻源维护还是线下寻源结果录入维护供应商信息, 固定值
            };
          },
          disabled({ record }) {
            return record.get('supplierCompanyNum');
          },
        },
      },
      {
        name: 'contactName',
        type: 'string',
        label: intl.get(`${promptCode}.model.offlineEntry.contacts`).d('联系人'),
        maxLength: 360,
        // dynamicProps: {
        //   disabled({ record }) {
        //     const { supplierType = 'internal', supplierCompanyNum = null } = record.get([
        //       'supplierType',
        //       'supplierCompanyNum',
        //     ]);
        //     const result = supplierCompanyNum && supplierType !== 'external';
        //     return result;
        //   },
        // },
      },
      {
        name: 'contactMobilephoneContainer',
        // label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactMobilePhone`).d('联系方式'),
      },
      {
        name: 'internationalTelCode',
        type: 'string',
        lookupCode: 'HPFM.IDD',
        defaultValue: '+86',
      },
      {
        name: 'contactMobilephone',
        type: 'string',
        label: intl.get(`${promptCode}.model.offlineEntry.tel`).d('联系电话'),
        dynamicProps: {
          pattern({ record }) {
            const patternFlag =
              (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
            return patternFlag;
          },
        },
      },
      {
        name: 'contactMail',
        label: intl.get(`${promptCode}.model.offlineEntry.email`).d('电子邮件'),
        maxLength: 100,
        validator: (value, _, record) => {
          if (value && !EMAIL.test(record.get('contactMail'))) {
            return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
          }
          return true;
        },
      },
      { name: 'supplierId' },
      { name: 'supplierName' },
      { name: 'supplierNum' },
      { name: 'supplierType' },
      {
        name: 'supplierTenantId',
        defaultValue: null,
      },
      { name: 'supplierContactId', defaultValue: null },
      {
        name: 'taxRateType',
      }
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'supplierCompanyNumLov') {
          const currentValue = value || {};
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            supplierCompanyName = null,
            supplierName = null,
            supplierNum = null,
            name: supplierContactName = null,
            contactName = null,
            supplierCompanyId = null,
            mobilephone = null,
            internationalTelCode = null,
            mail,
            supplierId,
          } = currentValue;
          const newSupplierCompanyNum = supplierCompanyNum || supplierNum;
          const newSupplierCompanyName = {
            ...currentValue,
            supplierCompanyName: supplierCompanyName || supplierName,
          };
          // let newSupplierCompanyNum = supplierCompanyNum;
          // let newSupplierCompanyName = supplierCompanyName;
          // if (supplierType === 'external') { 不可靠
          //   newSupplierCompanyNum = supplierNum;
          //   newSupplierCompanyName = supplierName;
          // }

          record.set('supplierCompanyId', supplierCompanyId);
          record.set('supplierCompanyNum', newSupplierCompanyNum);
          record.set(
            'supplierCompanyName',
            supplierCompanyName || supplierName ? newSupplierCompanyName : null
          );
          record.set('supplierType', supplierType);
          record.set('contactName', contactName || supplierContactName);
          record.set('contactMobilephone', mobilephone);
          record.set('internationalTelCode', internationalTelCode);
          record.set('contactMail', mail);
          record.set('supplierId', supplierId || null);
        } else if (name === 'supplierCompanyName') {
          if (isString(value)) {
            return;
          }
          const currentValue = value || {};
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            supplierCompanyName = null,
            supplierName = null,
            supplierNum = null,
            name: supplierContactName = null,
            contactName = null,
            supplierCompanyId,
          } = currentValue;
          const newSupplierCompanyNum = supplierCompanyNum || supplierNum;
          const supplierCompanyNumLov = {
            ...currentValue,
            supplierCompanyName: supplierCompanyName || supplierName,
            supplierCompanyNum: newSupplierCompanyNum,
            supplierCompanyId: newSupplierCompanyNum ? supplierCompanyId : null,
          };
          record.set('supplierCompanyId', currentValue.supplierCompanyId);
          record.set('supplierCompanyNum', newSupplierCompanyNum);
          record.set('supplierType', supplierType);
          record.set('supplierCompanyNumLov', supplierCompanyNumLov);
          record.set('contactName', contactName || supplierContactName);
          record.set('contactMobilephone', currentValue.mobilephone);
          record.set('internationalTelCode', currentValue.internationalTelCode);
          record.set('contactMail', currentValue.mail);
          record.set('supplierId', currentValue.supplierId || null);
        }
      },
    },
  };
};

export default BatchMaintainItemDS;
