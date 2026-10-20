import { observable, action } from 'mobx';

class InterfaceStore {
  @observable
  exportType = 0;

  @action
  setExportType = (value) => {
    this.exportType = value;
  };
}
const dataStore = new InterfaceStore();
export default dataStore;
