declare global {
  namespace model {
    interface LowcodeAppUserAssign extends common.AuditDomain {
      loginName: string;
      realName: string;
      tenantName: string;
      joinTime: string;
      operationName: string;
    }
  }
}

export {};
