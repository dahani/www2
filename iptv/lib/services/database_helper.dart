import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/channel.dart';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('channels3.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 1,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE channels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        poster TEXT,
        category TEXT NOT NULL,
        epgId TEXT,
        isFavorite INTEGER NOT NULL DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE playlist_channels (
        playlistId INTEGER NOT NULL,
        channelId INTEGER NOT NULL,
        position INTEGER NOT NULL,
        PRIMARY KEY (playlistId, channelId),
        FOREIGN KEY (playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY (channelId) REFERENCES channels(id) ON DELETE CASCADE
      )
    ''');
  }

  Future<void> insertChannels(List<Channel> channels) async {
    final db = await database;
    final batch = db.batch();

    for (var channel in channels) {
      batch.insert(
        'channels',
        channel.toMap(),
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }

    await batch.commit(noResult: true);
  }

  Future<void> clearChannels() async {
    final db = await database;
    await db.delete('channels');
  }

  Future<List<Channel>> getChannels() async {
    final db = await database;
    final result = await db.query('channels');
    return result.map((map) => Channel.fromMap(map)).toList();
  }

  Future<List<Channel>> getFavoriteChannels() async {
    final db = await database;
    final result = await db.query(
      'channels',
      where: 'isFavorite = ?',
      whereArgs: [1],
    );
    return result.map((map) => Channel.fromMap(map)).toList();
  }

  Future<List<String>> getCategories() async {
    final db = await database;
    final result = await db.rawQuery(
      'SELECT DISTINCT category FROM channels ',
    );
    return result.map((map) => map['category'] as String).toList();
  }

  Future<List<Channel>> getChannelsByCategory(String category) async {
    final db = await database;
    final result = await db.query(
      'channels',
      where: 'category = ?',
      whereArgs: [category],
    );
    return result.map((map) => Channel.fromMap(map)).toList();
  }

  Future<void> toggleFavorite(int channelId, bool isFavorite) async {
    final db = await database;
    await db.update(
      'channels',
      {'isFavorite': isFavorite ? 1 : 0},
      where: 'id = ?',
      whereArgs: [channelId],
    );
  }

  Future<void> close() async {
    final db = await database;
    await db.close();
  }

  // Playlist Management
  Future<int> createPlaylist(String name, {String? icon}) async {
    final db = await database;
    return await db.insert('playlists', {
      'name': name,
      'icon': icon,
    });
  }

  Future<List<Map<String, dynamic>>> getPlaylists() async {
    final db = await database;
    final playlists = await db.query('playlists', orderBy: 'name');

    // Get channel count for each playlist
    List<Map<String, dynamic>> playlistsWithCount = [];
    for (var playlist in playlists) {
      final count = await db.rawQuery(
        'SELECT COUNT(*) as count FROM playlist_channels WHERE playlistId = ?',
        [playlist['id']],
      );
      playlistsWithCount.add({
        ...playlist,
        'channelCount': count[0]['count'],
      });
    }
    return playlistsWithCount;
  }

  Future<void> deletePlaylist(int playlistId) async {
    final db = await database;
    await db.delete('playlists', where: 'id = ?', whereArgs: [playlistId]);
  }

  Future<void> addChannelToPlaylist(int playlistId, int channelId) async {
    final db = await database;
    final position = await db.rawQuery(
      'SELECT COALESCE(MAX(position), -1) + 1 as pos FROM playlist_channels WHERE playlistId = ?',
      [playlistId],
    );
    await db.insert('playlist_channels', {
      'playlistId': playlistId,
      'channelId': channelId,
      'position': position[0]['pos'],
    });
  }

  Future<void> removeChannelFromPlaylist(int playlistId, int channelId) async {
    final db = await database;
    await db.delete(
      'playlist_channels',
      where: 'playlistId = ? AND channelId = ?',
      whereArgs: [playlistId, channelId],
    );
  }

  Future<List<Channel>> getPlaylistChannels(int playlistId) async {
    final db = await database;
    final result = await db.rawQuery('''
      SELECT c.* FROM channels c
      INNER JOIN playlist_channels pc ON c.id = pc.channelId
      WHERE pc.playlistId = ?
      ORDER BY pc.position
    ''', [playlistId]);
    return result.map((map) => Channel.fromMap(map)).toList();
  }

  Future<bool> isChannelInPlaylist(int playlistId, int channelId) async {
    final db = await database;
    final result = await db.query(
      'playlist_channels',
      where: 'playlistId = ? AND channelId = ?',
      whereArgs: [playlistId, channelId],
    );
    return result.isNotEmpty;
  }
}
