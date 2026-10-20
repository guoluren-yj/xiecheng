declare global {
  namespace model {
    import AuditDomain = common.AuditDomain;

    // /tables/refresh  reponse 204
    // /tables/refresh/${tableId} reponse 204
    // /tables/ddl/batch-upload?serviceCode=${query.serviceCode}` upload-file

    // /tables/positive/delete-table reponse 204 request @see Table
    // /tables/positive/create-table
    interface Table extends AuditDomain {
      id: string;
      code: string;
      type: string;
      dataSourceId: string;
      serviceCode: string;
      schemaName: string;
      dataSourceType: string;
      name: string;
      description: string;
      tableColumns: TableColumn[];
      tableIndexes: TableIndex[];
    }

    interface TableColumn extends AuditDomain {
      id: string;
      refTableId: string;
      name: string;
      code: string;
      type: string;
      jdbcType: number;
      dataSize: number;
      decimalDigits: number;
      defaultValue: string;
      description: string;
      requiredFlag: number;
      primaryFlag: number;
    }

    interface TableIndex extends AuditDomain {
      id: string;
      refTableId: string;
      indexName: string;
      indexType: string;
      columnNames: string;
      columnNameList: string[];
    }

    // logic-models/batch-create  request => array reponse => array
    interface TableToModelVO {
      tableId: string;
      serviceCode: string;
      schemaName: string;
      dataSourceType: string;
      tableName: string;
      modelName: string;
      modelDescription: string;
      cause: string;
    }
    interface ErrorTableVO {
      errorMsg: string;
      fileName: string;
    }

    // 基础表授权详情接口
    interface BasicTableAuthorized {
      id: string | number;
      code: string | number;
      type: string;
      dataSourceId: string | number;
      serviceCode: string;
      schemaName: string;
      dataSourceType: string;
      name: string;
      description: string;
      createTableFlag: boolean;
      editTableFlag: boolean;
    }

    // 基础表授权 可分配和已分配表
    interface DataBaseAssign {
      id: number | string;
      code: number | string;
      type: string;
      dataSourceId: number | string;
      serviceCode: string;
      schemaName: string;
      dataSourceType: string;
      name: string;
      description: string;
      createTableFlag: boolean;
      editTableFlag: boolean;
    }
  }
}

export {};
