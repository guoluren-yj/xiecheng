
import React from 'react';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import request from "hzero-front/lib/utils/request";
import { filterNullValueObject, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import UnitConfig from "../../common/UnitConfig";

@formatterCollections({ code: ['hpfm.individual', 'hpfm.customize'] })
export default class UnitConfigImpl extends UnitConfig<{
  pageId?: string;
  templateId?: string;
  uuid?: string;
  headerCollapse?: string[];
}> {

  tableStyle: () => React.CSSProperties = () => ({
    maxHeight: `calc(100vh - ${(this.themeConfigFlag ? 316 : 311) + (this.props.editable ? 104 : 58) + (this.props.headerCollapse && this.props.headerCollapse.includes("basic") ? 122 : 0)}px)`,
  });

  searchBarStyle = {
    // height: `calc(100vh - ${this.themeConfigFlag ? 273 : 268}px)`,
    height: '100%',
    overflow: "hidden",
  };

  customizedCode = "HPFM.DOC.UNIT_FIELDS";

  queryUnitApi(): Promise<any> {
    return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/tpl/details`, {
      method: "GET",
      query: { unitCode: this.props.unitCode, version: this.props.uuid },
    });
  }

  // eslint-disable-next-line no-unused-vars
  didUpdateReQuery(prevProps: any, _prevState: any): boolean {
    return this.props.uuid !== prevProps.uuid;
  }

  openFieldDetailOptions(baseOptions: any) {
    const { pageId, templateId, uuid } = this.props;
    return {
      ...baseOptions,
      templateId,
      pageId,
      uuid,
      unitId: this.props.unitId,
    };
  }

  saveHeaderApi(_status): Promise<any> {
    const { templateId } = this.props;
    const tempData = this.formDS.current!.toJSONData();
    const _tls: any = filterNullValueObject({
      ...(tempData.config || {})._tls,
      ...(tempData._tls),
    });
    delete _tls.unitName;
    return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/tpl/save-header`, {
      method: "POST",
      body: {
        ...(tempData.config || {}),
        cardMaxCount: tempData.cardMaxCount,
        maxCol: tempData.formMaxCol,
        pageSize: tempData.pageSize,
        sortedEnabled: tempData.sortedEnabled,
        unitTitle: tempData.unitTitle,
        unitCode: tempData.unitCode,
        unitId: tempData.id,
        configId: (tempData.config || {}).id,
        version: this.props.uuid,
        _status,
        _tls,
      },
      query: {
        templateId,
      }
    });
  }

  deleteFieldApi(record): Promise<any> {
    const { templateId } = this.props;
    const config = this.formDS.current!.get("config") || {};
    return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/unit-config/tpl/delete`, {
      method: "DELETE",
      query: {
        configFieldId: record.get("configFieldId"),
        configId: config.id,
        templateId,
      },
    });
  }
}