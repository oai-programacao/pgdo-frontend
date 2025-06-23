import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { DataClient, DadosAgrupadosCliente } from "../../../interfaces/client-info.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConsultClientsService {
    private http = inject(HttpClient);
    private readonly apiUrl = environment.apiUrl;


    postConsultClient(filter: string): Observable<DataClient> {
        const params = { filtro: `Codigo = ${filter}` };
        return this.http.post<DataClient>(`${this.apiUrl}/rbx/consultar-clientes`, null, { params });
    }

    getClientInfo(nameOrCpfCnpj: string): Observable<DadosAgrupadosCliente> {
        const params = new HttpParams().set('nameOrCpfCnpj', nameOrCpfCnpj);

        return this.http.get<DadosAgrupadosCliente>(
        `${this.apiUrl}/rbx/client-info`,
        { params }
        );
    }

}