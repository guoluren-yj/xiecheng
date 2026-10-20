declare global {
  namespace model {
    namespace baseStructure {
      // 返回值:
      // getInterfaceInfoService
      // 参数：
      // saveApiInterfaceService
      // deleteApiInterfaceService
      interface ModelApiBind extends BaseModelApiBind {}

      interface BaseModelApiBind extends common.AuditDomain {
        logicModelApiBindId: number | string;
        logicModelId: number | string;
        action: string;
        apiCode: string;
        appCode: string;
        tenantId: number;
        apiName: string;
        apiMethod: string;
        apiPath: string;
        serviceCode: string;
        requestBodyBatchFlag: number;
        responseBodyBatchFlag: number;
        modelFieldMappings: BaseModelFieldMapping[];
        text?: string;
        key?: string;
      }

      interface BaseModelFieldMapping extends common.AuditDomain {
        logicModelFieldMappingId: number | string;
        logicModelId: number | string;
        modelFieldCode: string;
        mappingFieldCode: string;
        apiBindId: number | string;
        appCode: string;
        tenantId: number;
        parameterCode: string;
        parameterName: string;
        parameterType: string;
        parameterLocation: string;
        parameterDirection: string;
      }

      // /apis/${apiId}/refresh/reponse 204
      // /apis/tree @see ApiInfoTreeVO
      // getApiMenuList
      interface ApiInfoTreeVO {
        serviceCode: string;
        children: ApiInfo[];
      }

      interface ApiInfo extends common.AuditDomain {
        apiId: number | string;
        apiCode: string;
        apiName: string;
        apiMethod: string;
        apiPath: string;
        description: string;
        serviceCode: string;
        requestBodyBatchFlag: number;
        responseBodyBatchFlag: number;
        appCode: string;
        tenantId: number;
        editApiFlag: number;
        createApiFlag: number;
      }

      // delete /apis  @see ApiInfo
      // post /apis  request @see ExternalApiVO   response @see ApiInfo
      // saveApiInfo
      interface ExternalApiVO {
        apiMethod: string;
        apiPath: string;
        description: string;
        serviceCode: string;
        uniqueKey: string;
      }
    }
  }
}
export {};
