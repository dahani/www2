import 'package:dlna/services/constant.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ServerPreferences {

  static Future<void> saveServer(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(ServerConfig.prefKey, url);
  }

  static Future<String> getServer() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(ServerConfig.prefKey)??"https://egymovies.org/";
  }
}
