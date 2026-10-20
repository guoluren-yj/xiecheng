import intl from 'utils/intl';

// tab切换配置表
export const isTab = mustCompanyTabObj => ({
  sslmInvestgFin: {
    // 近三年财务状况
    // configDescription: intl
    //   .get('sslm.enterpriseInform.view.model.sslmInvestgFin.title')
    //   .d('财务信息'),
    // configName: 'caiwuxinxi',
    isRequired: mustCompanyTabObj.FIN,
  },
  // sslmInvestgFinBranch: {
  //   // 分支机构
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgFin.title')
  //     .d('财务信息'),
  //   configName: 'caiwuxinxi',
  // },
  sslmInvestgContact: {
    // "联系人信息"
    // configDescription: intl
    //   .get('sslm.enterpriseInform.view.model.sslmInvestgContact.title')
    //   .d('联系人及地址'),
    // configName: 'lianxirenjidizhi',
    titleTooltip: intl
      .get('sslm.supplierEntryDetail.titleTooltip.entry.contactPerson')
      .d('请至少填写一条联系人'),
    isRequired: mustCompanyTabObj.CONTACT,
  },
  sslmInvestgAddress: {
    // "地址信息"
    // configDescription: intl
    //   .get('sslm.enterpriseInform.view.model.sslmInvestgContact.title')
    //   .d('联系人及地址'),
    // configName: 'lianxirenjidizhi',
    isRequired: mustCompanyTabObj.ADDRESS,
  },
  sslmInvestgBankAccount: {
    // "开户行信息"
    isRequired: mustCompanyTabObj.BANK,
  },
  sslmInvestgAttachment: {
    // "附件信息"
    isRequired: mustCompanyTabObj.ATTACHMENT,
  },
  // sslmInvestgCustomer: {
  //   // "主要客户情况"
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgCustomer.title')
  //     .d('合作伙伴'),
  //   configName: 'hezuohuoban',
  // },
  // sslmInvestgSubSupplier: {
  //   // "分供方情况"
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgCustomer.title')
  //     .d('合作伙伴'),
  //   configName: 'hezuohuoban',
  // },
  // sslmInvestgRd: {
  //   // "研发能力"
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgProduce.title')
  //     .d('研发与生产'),
  //   configName: 'yanfayushengchan',
  // },
  // sslmInvestgProduce: {
  //   // "研发能力"
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgProduce.title')
  //     .d('研发与生产'),
  //   configName: 'yanfayushengchan',
  // },
  // sslmInvestgQa: {
  //   // "质保能力"
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgQa.title')
  //     .d('质保与售后'),
  //   configName: 'zhibaoyushouhou',
  // },
  // sslmInvestgCustservice: {
  //   // "售后服务"
  //   configDescription: intl
  //     .get('sslm.enterpriseInform.view.model.sslmInvestgQa.title')
  //     .d('质保与售后'),
  //   configName: 'zhibaoyushouhou',
  // },
});

// Table表格配置表
export const isTable = {
  sslmInvestgContact: true, // 联系人信息
  sslmInvestgAddress: true, // 地址信息
  sslmInvestgFin: true, // 近三年财务状况
  sslmInvestgFinBranch: true, // 分支机构
  sslmInvestgProservice: true, // 产品及服务
  sslmInvestgAuth: true, // 资质信息
  sslmInvestgCustomer: true, // 主要客户情况
  sslmInvestgSubSupplier: true, // 分供方情况
  sslmInvestgEquipment: true, // 设备信息
  sslmInvestgAttachment: true, // 附件信息
  sslmInvestgBankAccount: true, // 开户行信息
  sslmInvestgReserve1: true, // 预留表格页签1
  sslmInvestgReserve2: true, // 预留表格页签2
  sslmInvestgReserve5: true, // 预留表格页签3
  sslmInvestgReserve6: true, // 预留表格页签4
  sslmInvestgReserve7: true, // 预留表格页签5
  sslmInvestgReserve8: true, // 预留表格页签6
  sslmInvestgReserve9: true, // 预留表格页签7
};

// 地区select框联动行
export const addressConfig = {
  sslmInvestgFinBranch: true,
  sslmInvestgAddress: true,
  sslmInvestgBankAccount: true,
  sslmInvestgProservice: true,
  sslmInvestgAttachment: true,
  sslmInvestgAuth: true,
};

// 查询调查表接口配置表
export const fetchUrls = {
  sslmInvestgBasic: 'firm-change-basics/detail',
  sslmInvestgBusiness: 'firm-change-businesss/detail',
  sslmInvestgProservice: 'firm-change-proservices',
  sslmInvestgFin: 'firm-change-fins',
  sslmInvestgFinBranch: 'firm-change-fin-branchs/list',
  sslmInvestgAuth: 'firm-change-auths',
  sslmInvestgContact: 'firm-change-contacts',
  sslmInvestgAddress: 'firm-change-addresss/firm-change-address',
  sslmInvestgBankAccount: 'firm-change-bk-accounts/firm-change-bk-account',
  sslmInvestgCustomer: 'firm-change-customers',
  sslmInvestgSubSupplier: 'firm-change-sub-sups',
  sslmInvestgEquipment: 'firm-change-equipments',
  sslmInvestgRd: 'firm-change-rds/detail',
  sslmInvestgProduce: 'firm-change-produces/detail',
  sslmInvestgQa: 'firm-change-qas/detail',
  sslmInvestgCustservice: 'firm-change-custsers/detail',
  sslmInvestgAttachment: 'firm-change-attachments',
  sslmInvestgReserve1: 'firm-change-reserve1s',
  sslmInvestgReserve2: 'firm-change-reserve2s',
  sslmInvestgReserve3: 'firm-change-reserve3s',
  sslmInvestgReserve4: 'firm-change-reserve4s',
  sslmInvestgReserve5: 'firm-change-reserve5s',
  sslmInvestgReserve6: 'firm-change-reserve6s',
  sslmInvestgReserve7: 'firm-change-reserve7s',
  sslmInvestgReserve8: 'firm-change-reserve8s',
  sslmInvestgReserve9: 'firm-change-reserve9s',
  sslmInvestgReserve10: 'firm-change-reserve10s',
  sslmInvestgReserve11: 'firm-change-reserve11s',
  sslmInvestgReserve12: 'firm-change-reserve12s',
  sslmInvestgReserve13: 'firm-change-reserve13s',
  sslmInvestgReserve14: 'firm-change-reserve14s',
};

// 保存调查表接口配置表
export const saveUrls = {
  sslmInvestgContact: 'firm-change-contacts/firm-change-contact-save', // 联系人信息
  sslmInvestgAddress: 'firm-change-addresss/firm-change-address-save', // 地址信息
  sslmInvestgFin: 'firm-change-fins/save-firm-change-Fin', // 近三年财务状况
  sslmInvestgFinBranch: '/firm-change-fin-branchs/save-firm-change-finbranch', // 分支机构
  sslmInvestgProservice: 'firm-change-proservices/save-firm-change-proservice', // 产品及服务
  sslmInvestgAuth: 'firm-change-auths/save-firm-change-auth', // 资质信息
  sslmInvestgCustomer: 'firm-change-customers/save-firm-change-customer', // 主要客户情况
  sslmInvestgSubSupplier: 'firm-change-sub-sups/save-firm-change-sub-sup', // 分供方情况
  sslmInvestgEquipment: 'firm-change-equipments/save-firm-change-equipment', // 设备信息
  sslmInvestgAttachment: 'firm-change-attachments/save-firm-change-attachment', // 附件信息
  sslmInvestgBankAccount: 'firm-change-bk-accounts/save-firm-change-bk-account', // 开户行信息
  sslmInvestgReserve1: 'firm-change-reserve1s/save-firm-change-reserve1', // 预留表格页签1
  sslmInvestgReserve2: 'firm-change-reserve2s/save-firm-change-reserve2', // 预留表格页签2
  sslmInvestgReserve5: 'firm-change-reserve5s/save-firm-change-reserve5', // 预留表格页签3
  sslmInvestgReserve6: 'firm-change-reserve6s/save-firm-change-reserve6', // 预留表格页签4
  sslmInvestgReserve7: 'firm-change-reserve7s/save-firm-change-reserve7', // 预留表格页签5
  sslmInvestgReserve8: 'firm-change-reserve8s/save-firm-change-reserve8', // 预留表格页签6
  sslmInvestgReserve9: 'firm-change-reserve9s/save-firm-change-reserve9', // 预留表格页签7
};

// 删除调查表数据接口配置
export const deleteUrls = {
  sslmInvestgAttachment: 'firm-change-attachments/delete', // 附件信息
  sslmInvestgFin: 'firm-change-fins/delete', // 近三年财务状况
  sslmInvestgFinBranch: 'firm-change-fin-branchs/delete', // 分支机构
  sslmInvestgProservice: 'firm-change-proservices/delete', // 产品及服务
  sslmInvestgAuth: 'firm-change-auths/delete', // 资质信息
  sslmInvestgCustomer: 'firm-change-customers/delete', // 主要客户情况
  sslmInvestgSubSupplier: 'firm-change-sub-sups/delete', // 分供方情况
  sslmInvestgEquipment: 'firm-change-equipments/delete', // 设备信息
  sslmInvestgReserve1: 'firm-change-reserve1s/delete', // 预留表格页签1
  sslmInvestgReserve2: 'firm-change-reserve2s/delete', // 预留表格页签2
  sslmInvestgReserve5: 'firm-change-reserve5s/delete', // 预留表格页签5
  sslmInvestgReserve6: 'firm-change-reserve6s/delete', // 预留表格页签6
  sslmInvestgReserve7: 'firm-change-reserve7s/delete', // 预留表格页签7
  sslmInvestgReserve8: 'firm-change-reserve8s/delete', // 预留表格页签8
  sslmInvestgReserve9: 'firm-change-reserve9s/delete', // 预留表格页签9
};

export const rowKeys = {
  sslmInvestgProservice: 'investgProserviceId',
  sslmInvestgFin: 'investgFinId',
  sslmInvestgFinBranch: 'investgFinBranchId',
  sslmInvestgAuth: 'investgAuthId',
  sslmInvestgContact: 'investgContactId',
  sslmInvestgAddress: 'investgAddressId',
  sslmInvestgBankAccount: 'investgBankAccountId',
  sslmInvestgCustomer: 'investgCustomerId',
  sslmInvestgSubSupplier: 'investgSubSupplierId',
  sslmInvestgEquipment: 'investgEquipmentId',
  sslmInvestgAttachment: 'investgAttachmentId',
  sslmInvestgSupplierCate: 'firmChangeCateId',
  sslmInvestgReserve1: 'firmChangeReserve1Id',
  sslmInvestgReserve2: 'firmChangeReserve2Id',
  sslmInvestgReserve5: 'firmChangeReserve5Id',
  sslmInvestgReserve6: 'firmChangeReserve6Id',
  sslmInvestgReserve7: 'firmChangeReserve7Id',
  sslmInvestgReserve8: 'firmChangeReserve8Id',
  sslmInvestgReserve9: 'firmChangeReserve9Id',
};

// 删除权限集code
export const deletePermissionCode = {
  sslmInvestgAttachment: 'srm.mdm.firm-info-change.ps.button.tenant-attachment-delete-investg', // 附件信息
};

// 新建权限集code
export const addPermissionCode = {
  sslmInvestgAttachment: 'srm.mdm.firm-info-change.api.ps.button.tenant-attachment-add-investg', // 附件信息
};
