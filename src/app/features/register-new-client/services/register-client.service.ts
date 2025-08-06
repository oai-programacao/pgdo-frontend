import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import {
  CodePlans,
  ContactAttemptResponse,
  CreateRegisterClientDto,
  ViewRegisterClientResponseDto,
} from "../../../interfaces/register-client.model";
import { Observable } from "rxjs";
import { CustomPageResponse } from "../../../interfaces/service-order.model";

@Injectable({
  providedIn: "root",
})
export class RegisterClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  registerClient(
    data: CreateRegisterClientDto
  ): Observable<ViewRegisterClientResponseDto> {
    const url = `${this.apiUrl}/clientRegister`;
    return this.http.post<ViewRegisterClientResponseDto>(url, data);
  }

  getAllRegisteredClients(
    page: number,
    size: number,
    clientType?: "PF" | "PJ",
    day?: string
  ): Observable<CustomPageResponse<ViewRegisterClientResponseDto>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (clientType) {
      params = params.set("clientType", clientType);
    }

    if (day) {
      params = params.set("day", day);
    }

    const url = `${this.apiUrl}/clientRegister`;
    return this.http.get<CustomPageResponse<ViewRegisterClientResponseDto>>(
      url,
      { params }
    );
  }

  getFindOrCreateOnRBX(
    cpfCnpj: string
  ): Observable<ViewRegisterClientResponseDto> {
    return this.http.get<ViewRegisterClientResponseDto>(
      `${this.apiUrl}/clientRegister/find-or-create-rbx/${cpfCnpj}`
    );
  }

  postClientContract(
    contractData: any
  ): Observable<ViewRegisterClientResponseDto> {
    return this.http.post<ViewRegisterClientResponseDto>(
      `${this.apiUrl}/clientContract`,
      contractData
    );
  }

  postCodePlans(): Observable<CodePlans[]> {
    return this.http.post<CodePlans[]>(
      `${this.apiUrl}/clientContract/plans/codes`,
      {}
    );
  }

  getContractsByDateStatus(
    startDate: string,
    endDate: string,
    status: string,
    page: number,
    size: number
  ): Observable<CustomPageResponse<ViewRegisterClientResponseDto>> {
    let params = new HttpParams()
      .set("startDate", startDate)
      .set("endDate", endDate)
      .set("status", status)
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<CustomPageResponse<ViewRegisterClientResponseDto>>(
      `${this.apiUrl}/clientContract/by-date-status`,
      { params }
    );
  }
 

getContactAttempts(status: string, contractId?: string, page: number = 0, size: number = 10): Observable<CustomPageResponse<ContactAttemptResponse>> {
  let params = new HttpParams()
    .set("status", status)
    .set("page", page.toString())
    .set("size", size.toString());

  if (contractId) {
    params = params.set("contractId", contractId);
  }

  return this.http.get<CustomPageResponse<ContactAttemptResponse>>(
    `${this.apiUrl}/contactsSales`,
    { params }
  );
}

getContactAttemptById(id: string): Observable<ContactAttemptResponse> {
  return this.http.get<ContactAttemptResponse>(
    `${this.apiUrl}/contactsSales/${id}`
  );
}

getContactByIdAttempts(id: string): Observable<ContactAttemptResponse[]>{
  return this.http.get<ContactAttemptResponse[]>(
    `${this.apiUrl}/contactsSales/${id}/attempts`
  );
}

postContactAttempt(contractId: string, attemptData: ContactAttemptResponse): Observable<ContactAttemptResponse>{
  return this.http.post<ContactAttemptResponse>(
    `${this.apiUrl}/contactsSales/${contractId}/attempts`, attemptData
  );
}

getclienteContractByIdAdhesionBillet(id: string): Observable<string>{
  return this.http.get<string>(
    `${this.apiUrl}/clientContract/${id}/adhesion-billet`, {
      responseType: 'text' as 'json'
    }
  );
}

getClientContractPermanantPdf(idClient: string, idContract: string): Observable<Blob> {
  return this.http.get(
    `${this.apiUrl}/clientRegister/contrato-permanencia-pdf/${idClient}/${idContract}`,
    {
      params: { idContract },
      responseType: 'blob'
    }
  );
}
getClientRegisterPdf(idClient: string, idContract: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl}/clientRegister/registro-pdf/${idClient}/${idContract}`, {
    responseType: 'blob'
  });
}


}



