declare global {
  // editApplicationService
  // applicationEnableService
  // applicationDisableService
  namespace model {
    interface Application extends common.AuditDomain {
      appCode: number | string;
      appName: string;
      appCode: string;
      appType: string;
      iconUrl: string;
      remark: string;
      enabledFlag: number;
      fdLevel: string;
      customFlag: boolean;
      distributionPattern: string;
      tenantId: number | string;
      serviceCodes: string[];
      currentUserId: number | string;
      appRoleCode: string;
      sharedFlag: boolean;
      appRoleId?: string;
      appRoleObjectVersionNumber?: string;
      defaultRole?: string;
    }
  }
}

export {};
