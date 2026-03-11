import 'package:dio/dio.dart';
import 'package:dlna/services/constant.dart';
import 'package:flutter/rendering.dart';

class DioService {
  static final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
  ));

  static Future<Response> get(String url, {Map<String, String> headers=const {}, ResponseType responseType = ResponseType.json}) async {
    debugPrint(url);

    _dio.options.headers['Referer']=defautWebsiteApi;
     final Map<String, dynamic> mergedHeaders = {
      ..._dio.options.headers,
      ...headers,
    };
    return await _dio.get(
      url,
      options: Options(
        headers: mergedHeaders,
        responseType: responseType,
      ),
    );
  }
}