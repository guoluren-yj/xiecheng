declare global {
  namespace model {
    namespace baseStructure {
      // 返回值：
      // fetchRedAllInfo
      // 参数:
      // createRedTableService
      interface RedundantTableVO {
        id: number | string;
        code: string;
        name: string;
        description: string;
        redundantTableType: ''; // 这个需要确认枚举, 但是后端没找到
        tableColumns: TableColumn[];
        tableIndexes: TableIndex[];
      }
    }
  }
}

export {};
