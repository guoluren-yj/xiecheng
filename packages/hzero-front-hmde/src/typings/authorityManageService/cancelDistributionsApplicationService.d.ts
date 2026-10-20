declare global {
  namespace model {
    interface AppDistribution extends common.AuditDomain {
      appDistributionId: number | string;
      appCode: string;
      tenantId: number | string;
      tenantNum: string;
      tenantName: string;
    }
  }
}

export {};
