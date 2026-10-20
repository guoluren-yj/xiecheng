import { isEmpty, isArray } from 'lodash';

/**
 * 专家库管理个性化
 * @param {null | string | string[]} codeName - 个性化对应存储的name
 * @return null | string
 */
export function getCustomizeUnitCode(codeName) {
  if (!codeName || isEmpty(codeName)) return null;

  const expertCodeMap = new Map([
    // 专家注册申请 - 列表页
    ['expertRequisitionList', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.REGISTRATION_APPLICATION'],
    // 专家注册申请 - 维护 关联业务对象组合：专家注册申请标准组合
    ['regisBaseFormUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.BASE_FORM'], // 基本信息
    ['regisFieldUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.FIELD_TABLE'], // 专业领域表格
    ['regisAchievementUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['regisCareerUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.CAREER_TABLE'], // 职业履历表格
    ['regisEducationUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.EDUCATION_TABLE'], // 教育经历表格
    ['regisBankInfoUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.BANK_INFO_TABLE'], // 银行信息表格
    ['regisEnclosureUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_UPDATE.ENCLOSURE_TABLE'], // 上传附件表格

    // 专家注册申请 - 详情 关联业务对象组合：专家注册申请标准组合
    ['regisBaseFormDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.DETAIL_BASEFORM'], // 基本信息
    ['regisFieldDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.FIELD_TABLE'], // 专业领域表格
    ['regisAchievementDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['regisCareerDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.CAREER_TABLE'], // 职业履历表格
    ['regisEducationDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.EDUCATION_TABLE'], // 教育经历表格
    ['regisBankInfoDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.BANK_INFO_TABLE'], // 银行信息表格
    ['regisEnclosureDetail', 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.ENCLOSURE_TABLE'], // 上传附件表格

    // 专家信息维护页（管理员） 关联业务对象组合：专家库标准组合
    ['manageAdmTableList', 'SSRC.EXPERT_INFO_MAINTENANCE_ADM.TABLE_LIST'], // 外层列表页
    ['manageAdmBaseForm', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.CREATE_BASEFORM'], // 基本信息
    ['manageAdmFieldUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.FIELD_TABLE'], // 专业领域表格
    ['manageAdmAchievementUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['manageAdmCareerUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.CAREER_TABLE'], // 职业履历表格
    ['manageAdmEducationUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.EDUCATION_TABLE'], // 教育经历表格
    ['manageAdmBankInfoUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.BANK_INFO_TABLE'], // 银行信息表格
    ['manageAdmEnclosureUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.ENCLOSURE_TABLE'], // 上传附件表格

    // 专家信息维护（个人） 关联业务对象组合：专家库标准组合
    ['managePerBaseForm', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.CREATE_BASEFORM'], // 基本信息
    ['managePerFieldUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.FIELD_TABLE'], // 专业领域表格
    ['managePerAchievementUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['managePerCareerUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.CAREER_TABLE'], // 职业履历表格
    ['managePerEducationUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.EDUCATION_TABLE'], // 教育经历表格
    ['managePerBankInfoUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.BANK_INFO_TABLE'], // 银行信息表格
    ['managePerEnclosureUpdate', 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_PER.ENCLOSURE_TABLE'], // 上传附件表格

    // 专家信息查询-列表页
    ['expertQueryTableList', 'SSRC.EXPERT_INFO_LIST.QUERY_TABLE'],
    // 专家信息查询明细页 关联业务对象组合：专家库标准组合
    ['expertQueryBaseForm', 'SSRC.EXPERT_INFO_DETAIL.DETAIL_BASEFORM'], // 基本信息
    ['expertQueryFieldDetail', 'SSRC.EXPERT_INFO_DETAIL.FIELD_TABLE'], // 专业领域表格
    ['expertQueryAchievementDetail', 'SSRC.EXPERT_INFO_DETAIL.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['expertQueryCareerDetail', 'SSRC.EXPERT_INFO_DETAIL.CAREER_TABLE'], // 职业履历表格
    ['expertQueryEducationDetail', 'SSRC.EXPERT_INFO_DETAIL.EDUCATION_TABLE'], // 教育经历表格
    ['expertQueryBankInfoDetail', 'SSRC.EXPERT_INFO_DETAIL.BANK_INFO_TABLE'], // 银行信息表格
    ['expertQueryEnclosureDetail', 'SSRC.EXPERT_INFO_DETAIL.ENCLOSURE_TABLE'], // 上传附件表格

    // 注册申请审批-列表页
    ['regisApprovalTableList', 'SSRC.EXPERT_INFO_APPROVE_LIST.REGISTRATION_APPLICATION_TABLE'],
    // 注册申请审批-明细页  关联业务对象组合：专家注册申请标准组合
    ['regisApprovalBaseForm', 'SSRC.EXPERT_INFO_APPROVE.DETAIL_BASEFORM'], // 基本信息
    ['regisApprovalFieldDetail', 'SSRC.EXPERT_INFO_APPROVE.FIELD_TABLE'], // 专业领域表格
    ['regisApprovalAchievementDetail', 'SSRC.EXPERT_INFO_APPROVE.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['regisApprovalCareerDetail', 'SSRC.EXPERT_INFO_APPROVE.CAREER_TABLE'], // 职业履历表格
    ['regisApprovalEducationDetail', 'SSRC.EXPERT_INFO_APPROVE.EDUCATION_TABLE'], // 教育经历表格
    ['regisApprovalBankInfoDetail', 'SSRC.EXPERT_INFO_APPROVE.BANK_INFO_TABLE'], // 银行信息表格
    ['regisApprovalEnclosureDetail', 'SSRC.EXPERT_INFO_APPROVE.ENCLOSURE_TABLE'], // 上传附件表格

    // 注册申请查询-列表页
    ['regisQueryTableList', 'SSRC.EXPERT_INFO_REQQUERY_LIST.REGISTRATION_APPLICATION_TABLE'],
    // 注册申请查询-明细页  关联业务对象组合：专家注册申请标准组合
    ['regisQueryBaseForm', 'SSRC.EXPERT_INFO_REQQUERY.DETAIL_BASEFORM'], // 基本信息
    ['regisQueryFieldDetail', 'SSRC.EXPERT_INFO_REQQUERY.FIELD_TABLE'], // 专业领域表格
    ['regisQueryAchievementDetail', 'SSRC.EXPERT_INFO_REQQUERY.ACHIEVEMENT_TABLE'], // 专业成果表格
    ['regisQueryCareerDetail', 'SSRC.EXPERT_INFO_REQQUERY.CAREER_TABLE'], // 职业履历表格
    ['regisQueryEducationDetail', 'SSRC.EXPERT_INFO_REQQUERY.EDUCATION_TABLE'], // 教育经历表格
    ['regisQueryBankInfoDetail', 'SSRC.EXPERT_INFO_REQQUERY.BANK_INFO_TABLE'], // 银行信息表格
    ['regisQueryEnclosureDetail', 'SSRC.EXPERT_INFO_REQQUERY.ENCLOSURE_TABLE'], // 上传附件表格
  ]);

  let currentUnitCode = null;

  if (typeof codeName === 'string') {
    currentUnitCode = expertCodeMap.get(codeName);
  }

  if (isArray(codeName)) {
    const codeSet = new Set();
    codeName.forEach((unitCode) => {
      codeSet.add(expertCodeMap.get(unitCode));
    });

    currentUnitCode = codeSet.size ? [...codeSet].join(',') : null;
  }

  return currentUnitCode;
}

/**
 * 处理省份数据
 */
export function dealProvinceData(cityResponse) {
  if (!isEmpty(cityResponse) && isArray(cityResponse)) {
    const newCityResponse = cityResponse.map((n) => {
      const m = {
        ...n,
      };
      m.isLeaf = false;
      return m;
    });
    return newCityResponse;
  }
  return [];
}

/**
 * 处理市、区数据
 */
export function dealCityRegionData(cityResponse) {
  if (!isEmpty(cityResponse) && isArray(cityResponse)) {
    const newCityResponse = cityResponse.map((n) => {
      const m = {
        ...n,
      };
      // 此需求只到市级
      m.isLeaf = true;
      return m;
    });
    return newCityResponse;
  }
  return [];
}
