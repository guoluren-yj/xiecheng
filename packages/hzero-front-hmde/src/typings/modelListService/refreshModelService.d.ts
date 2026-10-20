declare global {
  namespace model {
    // 返回值：
    // refreshModelService
    // refreshWarningSubmitService
    interface SyncModelResultVO {
      statusList: string[];
      tableErrorMsg: string;
      noChangeSuccessMsg: string;
      syncModelFailedList: SyncModelFailedVO[];
      syncModelWarningList: SyncModelWarningVO[];
      syncModelSuccessList: SyncModelSuccessVO[];
    }

    interface SyncModelFailedVO {
      fieldName: string;
      existFlag: number;
      tableDataType: string;
      modelDataType: string;
      tableRequiredFlag: number;
      modelRequiredFlag: number;
      tableDataSize: number;
      modelDataSize: number;
    }

    interface SyncModelWarningVO {
      fieldName: string;
      tableDataType: string;
      modelDataType: string;
      tableRequiredFlag: number;
      modelRequiredFlag: number;
      tableDescription: string;
      modelDescription: string;
      tableDataSize: number;
      modelDataSize: number;
      modelField: ModelField;
    }

    interface SyncModelSuccessVO {
      fieldName: string;
      tableDefaultValue: string;
      modelDefaultValue: string;
    }
  }
}
export {};
