import 'package:shared_preferences/shared_preferences.dart';

class ServerPreferences {
  static const String prefKey = "selected_server";
  static const _keyBytes = "proxy_total_bytes";
  static const _keyLastPosPrefix = "video_last_pos_";

  static Future<void> saveServer(String url) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(prefKey, url);
  }

  static Future<String> getServer() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(prefKey) ?? "https://egymovies.org/";
  }

  static Future<void> addBytes(int bytes) async {
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getInt(_keyBytes) ?? 0;
    await prefs.setInt(_keyBytes, current + bytes);
  }

  static Future<int> getTotalBytes() async {
    final prefs = await SharedPreferences.getInstance();prefs.reload();
    return prefs.getInt(_keyBytes) ?? 0;
  }

  static Future<void> saveLastPosition(String id, int millis) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt("$_keyLastPosPrefix$id", millis);
  }

  static Future<int?> getLastPosition(String id) async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt("$_keyLastPosPrefix$id");
  }
}
