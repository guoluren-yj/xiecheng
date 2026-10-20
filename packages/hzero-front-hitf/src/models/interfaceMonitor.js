import { observable, action } from 'mobx';

class InterfaceMonitor {
  @observable
  interfaceId = null;

  @observable
  selectedKey = '';

  @observable
  dynamicColumn = [];

  @observable
  dynamicSearch = [];

  @observable
  monitorTenantId = '';

  @observable
  loadingFlag = false;

  @action
  setInterfaceId = (interfaceId) => {
    this.interfaceId = interfaceId;
  };

  @action
  setSelectedKey = (selectedKey) => {
    this.selectedKey = selectedKey;
  };

  @action
  setDynamicColumn = (dynamicColumn) => {
    this.dynamicColumn = dynamicColumn;
  };

  @action
  setDynamicSearch = (dynamicSearch) => {
    this.dynamicSearch = dynamicSearch;
  };

  @action
  setMonitorTenantId = (monitorTenantId) => {
    this.monitorTenantId = monitorTenantId;
  };

  @action
  setLoadingFlag = (value) => {
    this.loadingFlag = value;
  };
}
const interfaceMonitor = new InterfaceMonitor();
export default interfaceMonitor;
