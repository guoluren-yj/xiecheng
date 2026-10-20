declare global {
  namespace model {
    interface LowcodeModule extends common.AuditDomain {
      id: number | string;
      title: string;
      iconUrl: string;
      appCode: number | string;
      enabled: boolean;
      displayOrder: number;
      tenantId: number | string;
      children: LowcodeFunction[];
    }

    interface LowcodeFunction extends common.AuditDomain {
      id: number | string;
      title: string;
      moduleId: number | string;
      iconUrl: string;
      homePageCode: string;
      locked: boolean;
      lockBy: number;
      enabled: boolean;
      displayOrder: number;
      tenantId: number | string;
      publishStatus: string;
      publishTime: string;
      publishHomePageCode: string;
      platform: string;
      children: LowcodePage[];
      creator: string;
      lockByName: string;
      decryptedId: number | string;
    }

    interface LowcodePage extends BasePage {
      publishStatus: string;
      locked: boolean;
      lockBy: number;
      publishTime: string;
      displayOrder: number;
    }

    interface BasePage extends common.AuditDomain {
      id: number | string;
      code: string;
      title: string;
      layoutType: string;
      functionId: number | string;
      // 属性json
      attributeJson: object;
      tenantId: number | string;
      shared: boolean;
      decryptedFunctionId: number | string;
      platform: string;
      mainPageFlag: boolean;
    }

    interface QueryPageListServicePayload {
      params: string;
    }
  }
}

export {};
