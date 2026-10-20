declare global {
  namespace model {
    interface AppDistribution extends common.AuditDomain {
      distributionPattern: string;
      tenantIds: Array<number | string>;
    }
  }
}

export {};
