import React, { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { Button } from 'choerodon-ui/pro';
import intl from 'hzero-front/lib/utils/intl';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';
import UnitConfig from "../../common/UnitConfig";
import {
  queryUnitDetails,
  saveUnitConfigHeader,
  deleteFieldIndividual,
} from '../../../../../services/customizeConfigService';
import { openCopyField } from './modelImpl';
const ObserverButton = observer<ButtonProps & { getDataSet, getBatchFlag }>((props) => {
  return <Button {...props} disabled={props.getDataSet().selected.length === 0 || props.getBatchFlag().flag} />;
});

@formatterCollections({ code: ['hpfm.individual', 'hpfm.customize'] })
export default class UnitConfigImpl extends UnitConfig<{ groupCode?: string }> {
  mode: string = 'customize';

  tableStyle: () => React.CSSProperties = () => ({
    maxHeight: `calc(100vh - ${this.themeConfigFlag ? 332 : 327}px)`,
  });

  searchBarStyle = {
    height: '100%',
    overflow: "hidden",
  };

  customizedCode = "HPFM.CUSTOMIZE.UNIT_FIELDS";

  hasSearchBarConfig: boolean = true;

  selectionMode: SelectionMode = SelectionMode.rowbox;

  implTableButtons: Buttons[] = [
    <ObserverButton
      icon="content_copy"
      getDataSet={() => this.tableDS}
      getBatchFlag={() => this.batchFlag}
      color={ButtonColor.primary}
      onClick={() => openCopyField(this.formDS, this.tableDS)}
    >
      {intl.get('hpfm.individual.model.config.copyField').d('拷贝字段')}
    </ObserverButton>,
  ];

  queryUnitApi(): Promise<any> {
    return queryUnitDetails({ unitId: this.props.unitId });
  }

  // eslint-disable-next-line no-unused-vars
  didUpdateReQuery(prevProps: any, _prevState: any): boolean {
    return false;
  }

  openFieldDetailOptions(baseOptions: any) {
    return {
      ...baseOptions,
      unitId: this.props.unitId,
    };
  }

  saveHeaderApi(_status): Promise<any> {
    const tempData = this.formDS.current!.toJSONData();
    const _tls: any = filterNullValueObject({
      ...(tempData.config || {})._tls,
      ...(tempData._tls),
    });
    delete _tls.unitName;
    return saveUnitConfigHeader({
      ...(tempData.config || {}),
      cardMaxCount: tempData.cardMaxCount,
      maxCol: tempData.formMaxCol,
      pageSize: tempData.pageSize,
      sortedEnabled: tempData.sortedEnabled,
      unitTitle: tempData.unitTitle,
      unitCode: tempData.unitCode,
      configId: (tempData.config || {}).id,
      unitId: tempData.id,
      _status,
      _tls,
    });
  }

  deleteFieldApi(record): Promise<any> {
    return deleteFieldIndividual({
      configFieldId: record.get("configFieldId"),
    });
  }

  get allowEditHeader() {
    const {
      state: {
        unit,
      },
    } = this;
    const {
      unitType,
      unitTag
    } = unit;
    const unitTags = (unitTag || "").split(",");
    if (unitType === "COMMON" && unitTags.includes("AF-EXTRA")) return true;
    return ['FORM', 'FILTER', 'QUERYFORM', 'SECTION', 'GRID', "SEARCHBAR", "WORKFLOW"].includes(unitType);
  }

  renderTitle = (): ReactNode => {
    return (
      <div className='unit-detail-title'>
        <span>
          {this.props.unitName || this.state.unit.unitName}
        </span>
      </div>
    );
  }
}