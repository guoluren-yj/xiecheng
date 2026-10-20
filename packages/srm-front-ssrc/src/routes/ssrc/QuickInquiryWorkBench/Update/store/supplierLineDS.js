import { uniqWith } from 'lodash';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { SRM_SSRC } from '_utils/config';

const supplierTableDS = ({ rfqHeaderId = '', isNewInquiry = false }) => ({
  primaryKey: 'rfqSupplierId',
  autoQuery: !isNewInquiry,
  dataToJSON: 'all',
  pageSize: 20,
  fields: [
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.supplierCompanyNum`).d('供应商编码'),
      name: 'supplierCompanyNum',
    },
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
    },
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.contacts`).d('联系人'),
      name: 'supplierContactId',
      type: 'object',
      lovCode: 'SSRC.SUPPLIER_CONTANCTS',
      textField: 'contactName',
      valueField: 'supplierContactId',
      required: true,
      dynamicProps: {
        lovPara({ record }) {
          const supplierCompanyId = record.get('supplierCompanyId');

          return {
            supplierCompanyId,
            companyId: record.get('companyId'),
            tenantId: getCurrentOrganizationId(),
          };
        },
      },
      transformRequest: (value = {}) => {
        return value?.supplierContactId;
      },
      transformResponse: (value, data) => {
        return value
          ? {
              supplierContactId: value,
              contactName: data?.contactName,
            }
          : null;
      },
    },
    {
      name: 'contactName',
      bind: 'supplierContactId.contactName',
    },
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.contactPhone`).d('联系电话'),
      name: 'contactMobilephone',
      required: true,
      type: 'tel',
      regionField: 'contactAreaCode',
      dynamicProps: {
        pattern: ({ record }) =>
          (record.get('contactAreaCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE,
      },
    },
    {
      name: 'contactAreaCode',
      lookupCode: 'HPFM.IDD',
      required: true,
    },
    {
      label: intl.get(`ssrc.quickInquiry.model.quickInquiry.contactMail`).d('邮箱'),
      name: 'contactMail',
      type: 'email',
      required: true,
    },
  ],
  events: {
    update: ({ name, record = {} }) => {
      if (name === 'contactAreaCode') {
        // 设置自身 为了触发自定义校验
        record.set('contactMobilephone', record.get('contactMobilephone'));
      }
    },
  },
  transport: {
    read: ({ params = {} }) => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-suppliers/list`,
        method: 'POST',
        params: {
          ...(params || {}),
          customizeUnitCode: `SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER`,
        },
        data: {
          rfqHeaderId,
        },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-suppliers/delete`,
        method: 'POST',
        data: {
          rfqSupplierIds: data.map((i) => i.rfqSupplierId),
        },
      };
    },
  },
});

// 新配置添加供应商DS
const supplierLovDS = () => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'supplierLovList',
        type: 'object',
        lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
        multiple: true,
      },
    ],
  };
};

// 供应商分配物料ds
const supplierFilterItemDS = () => {
  return {
    primaryKey: 'rfqItemId',
    paging: true,
    cacheSelection: true,
    cacheModified: true,
    dataToJSON: 'all',
    pageSize: 20,
    fields: [
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.lineNo.`).d('行号'),
        name: 'rfqItemNum',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.quickInquiry.model.quickInquiry.itemName`).d('物料名称'),
        name: 'itemName',
      },
      // {
      //   label: intl.get(`ssrc.quickInquiry.model.quickInquiry.miniMumPrice`).d('最低限价'),
      //   name: 'minLimitPrice',
      //   type: 'number',
      //   min: 0,
      //   max: '99999999999999999999',
      // },
      // {
      //   label: intl.get(`ssrc.quickInquiry.model.quickInquiry.maxiMumPrice`).d('最高限价'),
      //   name: 'maxLimitPrice',
      //   type: 'number',
      //   min: 0,
      //   max: '99999999999999999999',
      //   validator: (value, name, record) => {
      //     const minValue = record.get('minLimitPrice');
      //     if ((value || value === 0) && value <= minValue) {
      //       return intl
      //         .get('ssrc.quickInquiry.view.quickInquiry.validate.maxLimitPrice', {
      //           minValue,
      //         })
      //         .d(`最高限价必须大于${minValue}。`);
      //     }
      //     return true;
      //   },
      // },
    ],
    transport: {
      read: ({ dataSet, params = {} }) => {
        const {
          queryParameter: { commonProps = {} },
        } = dataSet;

        return {
          url: `${SRM_SSRC}/v1/${getCurrentOrganizationId()}/quick-rfq-sup-item-assigns/items`,
          method: 'POST',
          params: {
            ...(params || {}),
            customizeUnitCode: `SSRC.QUICK_INQUIRY.EDIT.ITEM_SUP_ASSIGN`,
          },
          data: {
            ...commonProps,
          },
        };
      },
    },
    events: {
      // update: ({ record, name }) => {
      //   if (name === 'minLimitPrice') {
      //     // 设置自身 为了触发自定义校验
      //     record.set('maxLimitPrice', record.get('maxLimitPrice'));
      //   }
      // },
      load: ({ dataSet }) => {
        if (!dataSet) return;
        const selectDataListIds = new Set(dataSet.getState('selectDataListIds') || []);
        // const unSelectDataListIds = new Set(dataSet.getState('unSelectDataListIds') || []);
        const selectAllManually = dataSet.getState('selectAllManually');
        const cacheUnSelectedRecords = dataSet.getState('cacheUnSelectedRecords') || [];
        const unSelectDataListIds = new Set(
          cacheUnSelectedRecords.map((record) => record.get('rfqItemId')) || []
        ); // 未选中ids

        dataSet.forEach((record) => {
          if (selectAllManually === 0) {
            if (selectDataListIds.has(record.data.rfqItemId)) {
              Object.assign(record, { isSelected: true });
            }
          } else if (selectAllManually === 1) {
            if (!unSelectDataListIds.has(record.data.rfqItemId)) {
              Object.assign(record, { isSelected: true });
            }
          } else if (
            (selectDataListIds.size === 0 && unSelectDataListIds.size === 0) ||
            (!selectDataListIds.has(record.data.rfqItemId) &&
              !unSelectDataListIds.has(record.data.rfqItemId))
          ) {
            if (record.data.inviteFlag) {
              Object.assign(record, { isSelected: true });
            } else {
              Object.assign(record, { isSelected: false });
            }
          } else if (selectDataListIds.has(record.data.rfqItemId)) {
            Object.assign(record, { isSelected: true });
          }
        });
      },
      // 先这样写 手动记下未选择记录  因为ds.unSelected(目前只能拿到当前页数据)
      // 如果后续平台修复了，再修改回来，把注释的放开，把下面选中记录删掉 然后在提交地方获取unSelected数据
      batchSelect: ({ dataSet, records: selectRecords }) => {
        // 选中的ids
        const selectDataListIds = dataSet.getState('selectDataListIds') || [];
        const currentSelectedIds = selectRecords.map((record) => record.get('rfqItemId'));
        dataSet.setState('selectDataListIds', [...selectDataListIds, ...currentSelectedIds]);

        // 未选中的ids
        // const unSelectDataListIds = dataSet.getState('unSelectDataListIds') || []; // 未选中ids
        const setCurrentSelectedIds = new Set(currentSelectedIds);
        // 剔除勾选的
        // const diffCurrentUnSelectedIds = unSelectDataListIds.filter(unSelIds => !setCurrentSelectedIds.has(unSelIds));
        // dataSet.setState('unSelectDataListIds', diffCurrentUnSelectedIds);

        // 未选中记录
        const cacheUnSelectedRecords = dataSet.getState('cacheUnSelectedRecords') || [];
        const diffUnSelectedRecords = cacheUnSelectedRecords.filter(
          (record) => !setCurrentSelectedIds.has(record.get('rfqItemId'))
        );
        dataSet.setState('cacheUnSelectedRecords', diffUnSelectedRecords);
      },
      batchUnSelect: ({ dataSet, records: unSelectedRecords }) => {
        // 选中的ids
        const selectDataListIds = dataSet.getState('selectDataListIds') || [];
        const currentUnSelectedIds = unSelectedRecords.map((record) => record.get('rfqItemId'));
        // 剔除去掉勾掉选中的
        const setCurrentUnSelectedIds = new Set(currentUnSelectedIds);
        const diffCurrentSelectedIds = selectDataListIds.filter(
          (selIds) => !setCurrentUnSelectedIds.has(selIds)
        );
        dataSet.setState('selectDataListIds', diffCurrentSelectedIds);

        // 未选中的ids
        // const unSelectDataListIds = dataSet.getState('unSelectDataListIds') || []; // 未选中ids
        // dataSet.setState('unSelectDataListIds', [...unSelectDataListIds, ...currentUnSelectedIds]);

        // 未选中记录
        const cacheUnSelectedRecords = dataSet.getState('cacheUnSelectedRecords') || [];
        const newUnselectedRecords = uniqWith(
          [...cacheUnSelectedRecords, ...unSelectedRecords],
          (arrVal, othVal) => arrVal.get('rfqItemId') === othVal.get('rfqItemId')
        );
        dataSet.setState('cacheUnSelectedRecords', newUnselectedRecords);
      },
      unSelectAllPage: ({ dataSet }) => {
        // 取消全选设置标志
        dataSet.setState('selectAllManually', 0);

        const { currentUnSelected } = dataSet;
        const currentUnSelectedIds = currentUnSelected.map((record) => record.get('rfqItemId'));
        dataSet.setState('selectDataListIds', []);
        dataSet.setState('unSelectDataListIds', currentUnSelectedIds);
        dataSet.setState('cacheUnSelectedRecords', currentUnSelected);
      },
      selectAllPage: ({ dataSet }) => {
        // 全选设置标志
        dataSet.setState('selectAllManually', 1);

        const { currentSelected } = dataSet;
        const currentSelectedIds = currentSelected.map((record) => record.get('rfqItemId'));
        dataSet.setState('selectDataListIds', currentSelectedIds);
        // dataSet.setState('unSelectDataListIds', []);
        dataSet.setState('cacheUnSelectedRecords', []);
      },
      reset: ({ dataSet }) => {
        dataSet.setAllPageSelection(false);
        dataSet.setState('selectDataListIds', []);
        // dataSet.setState('unSelectDataListIds', []);
        dataSet.setState('selectAllManually', undefined);
        dataSet.setState('cacheUnSelectedRecords', []);
      },
    },
  };
};

export { supplierTableDS, supplierLovDS, supplierFilterItemDS };
