import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AxiosError } from "axios";
import { catchError, firstValueFrom } from "rxjs";
import { EXTERNAL_API_CACHE_EXPIRES, ErrorMessage } from "@libs/constants";
import type { DefiLlamaPoolsApiResponse } from "@libs/model";
import type { DefiLlamaConfig } from "../../common/config/config.interface";
import { Cacheable } from "../../common/decorators/cache.decorator";

// NOTE: This service is sample code for using external API.
// TODO: Change this file after implementing the actual service.

@Injectable()
export class DefiLlamaApiService {
  private readonly logger = new Logger(DefiLlamaApiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  @Cacheable({ keyArgs: ["address"], ttl: EXTERNAL_API_CACHE_EXPIRES })
  async getAllPools() {
    const { baseUrl } = this.configService.get<DefiLlamaConfig>("defiLlama")!;
    const path = baseUrl.concat("/pools");

    const headers = {
      accept: "application/json",
    };

    const { data } = await firstValueFrom(
      this.httpService
        .get<DefiLlamaPoolsApiResponse>(path, {
          headers,
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error);
            throw new Error(ErrorMessage.MSG_EXTERNAL_API_FETCH_FAILED);
          }),
        ),
    );

    if (!data) {
      throw new Error(ErrorMessage.MSG_EXTERNAL_API_FETCH_FAILED);
    }

    return data;
  }
}
