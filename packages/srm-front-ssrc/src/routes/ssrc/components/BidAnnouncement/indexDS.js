import intl from 'utils/intl';

const formDS = () => {
  return {
    autoQuery: false,
    paging: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'bidAnnouncementType',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementType`)
          .d('唱标价格公开范围'),
        lookupCode: 'SSRC.BID_ANNOUNCEMENT_TYPE',
        disabled: true,
      },
      {
        name: 'bidAnnouncementContent',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementContent`)
          .d('唱标内容选择'),
        lookupCode: 'SSRC.BID_ANNOUNCEMENT_SCOPE_CODE',
        disabled: true,
      },
      {
        name: 'bidAnnouncementTarget',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.bidAnnouncementTarget`)
          .d('接收对象选择'),
        lookupCode: 'SSRC.BID_ANNOUNCEMENT_SCOPE_CODE',
        disabled: true,
      },
      {
        name: 'showSupplierName',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.showSupplierName`)
          .d('是否显示供应商名称'),
        type: 'boolean',
        disabled: true,
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'showHistoricalPriceVersion',
        label: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.showHistoricalPriceVersion`)
          .d('是否展示历史价格版本'),
        type: 'boolean',
        disabled: true,
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
};

const contentTableDS = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'supplierCompanyNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyCode`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
      },
      {
        name: 'bidAnnouncementContentFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggest`).d('选用'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
};

const targetTableDS = () => {
  return {
    autoQuery: false,
    paging: false,
    selection: false,
    dataToJSON: 'all',
    fields: [
      {
        name: 'supplierCompanyNum',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCompanyCode`).d('供应商编码'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
      },
      {
        name: 'bidAnnouncementTargetFlag',
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.suggest`).d('选用'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
};

export { formDS, contentTableDS, targetTableDS };
