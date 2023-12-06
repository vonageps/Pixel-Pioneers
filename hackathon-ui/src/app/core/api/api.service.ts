import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable()
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  /**
   * The function `post` sends an HTTP POST request to a specified URL with a payload and optional
   * options.
   * @param {string} url - The `url` parameter is a string that represents the URL where the HTTP POST
   * request will be sent to.
   * @param {any} payload - The `payload` parameter is the data that you want to send in the HTTP POST
   * request. It can be of any type, such as an object, array, or string. This data will be sent to the
   * specified URL in the request body.
   * @param {object} [options] - The `options` parameter is an optional object that can be used to
   * specify additional options for the HTTP request. These options can include headers, query
   * parameters, authentication tokens, etc.
   * @returns an Observable of type any.
   */
  public post(url: string, payload: any, options?: object): Observable<any> {
    return this.http.post(`${url}`, payload, options);
  }

  /**
   * The function is a TypeScript method that sends an HTTP GET request to a specified URL and returns
   * an Observable.
   * @param {string} url - A string representing the URL of the resource you want to retrieve data
   * from.
   * @param {object} [options] - The `options` parameter is an optional object that can be used to
   * specify additional options for the HTTP request. These options can include headers, query
   * parameters, request body, etc.
   * @returns The `get` method is returning an `Observable` of type `any`.
   */
  public get(url: string, options?: object): Observable<any> {
    return this.http.get(`${url}`, options);
  }

  /**
   * The function `patch` sends a PATCH request to a specified URL with a payload and optional options.
   * @param {string} url - The `url` parameter is a string that represents the URL of the API endpoint
   * you want to send the PATCH request to. It should include the protocol (e.g., "http://" or
   * "https://") and the domain name or IP address.
   * @param {any} payload - The payload parameter is the data that you want to send in the PATCH
   * request. It can be of any type, such as an object, array, or string. The payload will be sent as
   * the body of the request.
   * @param {object} [options] - The `options` parameter is an optional object that can be used to
   * specify additional options for the HTTP request. These options can include headers, query
   * parameters, authentication tokens, etc.
   * @returns an Observable of type any.
   */
  public patch(url: string, payload: any, options?: object): Observable<any> {
    return this.http.patch(`${url}`, payload, options);
  }

  /**
   * The function sends a PUT request to the specified URL with the provided payload and options.
   * @param {string} url - The `url` parameter is a string that represents the URL where the PUT
   * request will be sent to. It specifies the location of the resource that will be updated.
   * @param {any} payload - The `payload` parameter is the data that you want to send in the request
   * body. It can be of any type, such as an object, array, or string.
   * @param {object} [options] - The `options` parameter is an optional object that can be used to
   * specify additional options for the HTTP request. These options can include headers, query
   * parameters, authentication tokens, etc.
   * @returns an Observable of type any.
   */
  public put(url: string, payload: any, options?: object): Observable<any> {
    return this.http.put(`${url}`, payload, options);
  }

  /**
   * The delete function sends a DELETE request to the specified URL using the HTTP client.
   * @param {string} url - The `url` parameter is a string that represents the URL of the resource you
   * want to delete. It should be a valid URL that points to the specific resource you want to delete.
   * @param {object} [options] - The `options` parameter is an optional object that can be used to
   * specify additional options for the HTTP request. These options can include headers, query
   * parameters, authentication tokens, etc.
   * @returns The delete method is returning an Observable of type any.
   */
  public delete(url: string, options?: object): Observable<any> {
    return this.http.delete(`${url}`, options);
  }
}
