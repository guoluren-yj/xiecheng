declare global {
  namespace model {
    interface ModelerServiceTree extends common.AuditDomain {
      serviceCode: string;
      grade: string;
      databaseAndTypes: ModelerDatabaseAndType[];
      assignId: number | string;
      schemaName: string;
      dataSourceType: string;
      tables: ModelerTable[];
      tableName: string;
    }

    interface ModelerDatabaseAndType {
      schemaName: string;
      dataSourceType: string;
      grade: string;
      tables: ModelerTable[];
    }

    interface ModelerTable {
      tableName: string;
      grade: string;
    }

    interface QueryAppDetailServicePayload {
      appCode: number | string;
    }
  }
}

export {};
