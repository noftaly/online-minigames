class ServersManager {
  constructor() {
    this.usedIds = [];
  }

  getUsedIds() {
    return this.usedIds;
  }

  addNewId(id) {
    this.usedIds.push(id);
  }

  removeId(id) {
    this.usedIds = this.usedIds.filter(elt => elt !== id);
  }
}

const serversManager = new ServersManager();
export default serversManager;
