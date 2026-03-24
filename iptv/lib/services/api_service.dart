import 'dart:convert';

import 'package:dio/dio.dart';
import '../models/channel.dart';

class ApiService {
  final Dio _dio = Dio();
  static const String channelsUrl = 'http://wallpapers-app.atspace.cc/tv.json';

  Future<List<Channel>> fetchChannels() async {
    try {
      final response = await _dio.get(channelsUrl);

      if (response.statusCode == 200) {
        final data =jsonDecode( response.data);

        List<Channel> allChannels = [];

        if (data is List) {
          // Data is an array of category objects
          for (var categoryObj in data) {
            if (categoryObj is Map<String, dynamic>) {
              final categoryName = categoryObj['name'] as String? ?? 'Other';
              final channels = categoryObj['channels'] as List<dynamic>? ?? [];

              for (var channelJson in channels) {
                if (channelJson is Map<String, dynamic>) {
   
                  // Use the category from the parent object
                  final channel = Channel(
                    name: channelJson['name'] as String? ?? '',
                    url: channelJson['url'] as String? ?? '',
                    poster: channelJson['poster'] as String?,
                    category: categoryName, // Use parent category name
                    epgId: channelJson['epgId'] as String?,
                  );

                  allChannels.add(channel);
                }
              }
            }
          }
        } else {
          throw Exception('Unexpected JSON format - expected array of categories');
        }

        return allChannels;
      } else {
        throw Exception('Failed to load channels: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    } catch (e) {
      throw Exception('Error parsing channels: $e');
    }
  }
}
