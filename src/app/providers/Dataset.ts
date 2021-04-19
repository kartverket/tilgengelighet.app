export interface Dataset {
    readonly access: string;
    readonly id: string;
    readonly name: string;
  }
  
  export class DatasetImpl implements Dataset {
    access: string;
    id: string;
    name: string;
  
    constructor(access: string, id: string, name: string) {
      this.access = access;
      this.id = id;
      this.name = name;
    }
  }