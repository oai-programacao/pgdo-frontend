import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClientSharedService {
  private clientData: any = null;

  setClientData(data: any) {
    this.clientData = data;
  }

  getClientData() {
    return this.clientData;
  }

  clearClientData() {
    this.clientData = null;
  }
}