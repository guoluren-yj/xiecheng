declare global {
  namespace model {
    interface AppServiceAssignUpdate extends common.AuditDomain {
      appCode: string;
      tenantId: number | string;
      addedAssigns: AppServiceAssign[];
      cancelledAssigns: AppServiceAssign[];
    }

    interface AppServiceAssign extends common.AuditDomain {
      assignId: number | string;
      serviceCode: string;
      appCode: string;
      tenantId: number | string;
      appName: string;
    }
  }
}

export {};
