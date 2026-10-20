import { observable, action } from 'mobx';

class InterfaceDefinition {
  @observable
  selectedId = 'all';

  @observable
  selectedCode = 'all';

  @action
  setSelectedCode = (selectedCode) => {
    this.selectedCode = selectedCode;
  };

  @action
  setSelectedId = (selectedId) => {
    this.selectedId = selectedId;
  };
}
const interfaceDefinition = new InterfaceDefinition();
export default interfaceDefinition;
