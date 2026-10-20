import intl from 'utils/intl';
import { SRM_SSRC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

const promptCode = 'ssrc.expert';

// 银行信息
const bankInfoTableDS = ({ isReq = true, isEdit = false, customizeUnitCode }) => {
  return {
    primaryKey: isReq ? 'expertBankReqId' : 'expertBankId',
    paging: false,
    // autoCreate: true,
    selection: isEdit ? 'multiple' : false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'bankCode',
        label: intl.get(`${promptCode}.model.expert.bankCode`).d('银行代码'),
      },
      {
        name: 'bankName',
        label: intl.get(`${promptCode}.model.expert.bankName`).d('银行名称'),
      },
      {
        name: 'bankId',
        label: intl.get(`${promptCode}.model.expert.bankFirmMeaning`).d('联行行号'),
        type: 'object',
        lovCode: 'SMDM.BANK_BRANCH_FIRM',
        ignore: 'never',
        textField: 'bankFirm',
        valueField: 'bankId',
        required: !!isEdit,
        transformRequest: (value = {}) => value && value?.bankId,
        transformResponse: (value, data) => {
          return value ? { bankId: value, bankFirm: data?.bankFirm } : null;
        },
      },
      {
        name: 'bankFirm',
        label: intl.get(`${promptCode}.model.expert.bankFirmMeaning`).d('联行行号'),
        bind: 'bankId.bankFirm',
      },
      {
        name: 'bankBranchName',
        label: intl.get(`${promptCode}.model.expert.bankBranchName`).d('开户行名称'),
      },
      {
        name: 'bankAccountName',
        label: intl.get(`${promptCode}.model.expert.bankAccountName`).d('账户名称'),
        required: !!isEdit,
      },
      {
        name: 'bankAccountNum',
        label: intl.get(`${promptCode}.model.expert.bankAccountNum`).d('银行账户'),
        required: !!isEdit,
        type: 'number',
        placeholder: intl.get(`${promptCode}.view.message.onlyNumber`).d('只能输入整数'),
        numberGrouping: false,
      },
      {
        name: 'masterFlag',
        label: intl.get(`${promptCode}.model.expert.masterFlag`).d('主账户'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'enabledFlag',
        label: intl.get(`${promptCode}.model.expert.enabledFlag`).d('启用'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'remark',
        label: intl.get(`${promptCode}.model.expert.remark`).d('备注'),
        dynamicProps: {
          disabled: ({ record }) => {
            return !record.getState('editing');
          },
        },
      },
      {
        name: 'operate',
        label: intl.get(`${promptCode}.model.expert.operate`).d('操作'),
      },
    ],
    events: {
      update: ({ record, name, value = null }) => {
        if (name === 'bankId') {
          record.set({
            // bankId: value?.bankId,
            // bankFirm: value?.bankFirm,
            bankCode: value?.bankCode,
            bankName: value?.bankName,
            bankBranchName: value?.bankBranchName,
          });
        }
      },
    },
    transport: {
      destroy: ({ data }) => {
        if (isReq) {
          // 专家注册申请tab
          if (isEmpty(data)) {
            return;
          }
          return {
            url: `${SRM_SSRC}/v1/${organizationId}/expert-bank-req`,
            method: 'DELETE',
            params: { customizeUnitCode },
            data,
          };
        } else {
          const currentData = (data || [])[0];
          if (isEmpty(currentData)) {
            return;
          }

          return {
            // 专家信息维护（管理员、个人）
            url: `${SRM_SSRC}/v1/${organizationId}/expert-bank`,
            method: 'DELETE',
            params: { customizeUnitCode },
            data: currentData,
          };
        }
      },
    },
  };
};

export { bankInfoTableDS };
