// ignore_for_file: depend_on_referenced_packages

import 'dart:convert';
import 'package:dlna/models/models.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';
import 'dart:io';
import 'package:external_path/external_path.dart';
import 'package:permission_handler/permission_handler.dart';

class DatabaseService {
  static final DatabaseService instance = DatabaseService._init();
  static Database? _database;

  DatabaseService._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('iptvs1.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, filePath);

    return await openDatabase(
      path,
      version: 3,
      onCreate: _createDB,
    );
  }

  Future _createDB(Database db, int version) async {
    await db.execute('''
      CREATE TABLE categories(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE
      )
    ''');

    await db.execute('''
      CREATE TABLE channels(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER,
        name TEXT,
        poster TEXT,
        url TEXT,
        resolutions TEXT,
        is_fav INTEGER DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      )
    ''');
    await db.execute('''
    CREATE TABLE movies_fav(
      id INTEGER PRIMARY KEY,
      title TEXT,
      poster TEXT,
      backdrop TEXT,
      rating REAL,
      year INTEGER,
      description TEXT,
      runtime INTEGER,
      genres TEXT,
      embedUrl TEXT
    )
  ''');
  }

// ===============================
// MOVIE FAVOURITE METHODS
// ===============================
Future<void> clearMovieFavorite() async {

  final db = await database;

  await db.delete('movies_fav');

}
Future<void> toggleMovieFavourite(Movie movie) async {

  final db = await database;
  final id = movie.id;

  final isExist = await db.query('movies_fav', where: 'id = ?', whereArgs: [id]);

  if (isExist.isEmpty) {
    // Add to favourites
    await db.insert('movies_fav', {
      'id': movie.id,
      'title': movie.title,
      'poster': movie.image,
      'backdrop': movie.backdrop,
      'rating': movie.rating,
      'runtime': movie.duration,
    });
  } else {
    // Remove from favourites
    await db.delete('movies_fav', where: 'id = ?', whereArgs: [id]);
  }
}

Future<bool> isMovieFav(int movieId) async {
  final db = await database;
  final result = await db.query('movies_fav', where: 'id = ?', whereArgs: [movieId]);
  return result.isNotEmpty;
}

Future<List<Movie>> getFavouriteMovies() async {
  final db = await database;
  final result = await db.query('movies_fav');

  // Return mutable list and decode genres
  return result.map((row) => Movie.fromJson(row)).toList();
}
Future<void> setFavourite(int channelId, bool isFav) async {
  final db = await database;

  await db.update(
    'channels',
    {'is_fav': isFav ? 1 : 0},
    where: 'id = ?',
    whereArgs: [channelId],
  );
}

Future<List<Map<String, dynamic>>> getFavourites() async {
  final db = await database;

  final result= await db.query(
    'channels',
    where: 'is_fav = 1',
    orderBy: 'name ASC',
  );
   return  result.map((row) => Map<String, dynamic>.from(row)).toList();
}

Future<bool> isFavourite(int channelId) async {
  final db = await database;

  final result = await db.query(
    'channels',
    columns: ['is_fav'],
    where: 'id = ?',
    whereArgs: [channelId],
  );

  if (result.isEmpty) return false;

  return result.first['is_fav'] == 1;
}


Future<void> exportFavoritesToDownload() async {
 var status = await Permission.manageExternalStorage.request();
  if (!status.isGranted) return;

  final db = await instance.database;

  final favs = await db.query(
    'channels',
    columns: ['name'],
    where: 'is_fav = 1',
  );
  final favNames = favs.map((e) => e['name']).toList();

  final downloadPath =await ExternalPath.getExternalStoragePublicDirectory(ExternalPath.DIRECTORY_DOWNLOAD);

  final file = File('$downloadPath/favorites_backup.json');
  await file.writeAsString(jsonEncode(favNames));
  Fluttertoast.showToast(msg: "Favorite exported to:${file.path}");
}

Future<Set<String>> loadFavoritesFromDownload() async {
 var status = await Permission.manageExternalStorage.request();


  final downloadPath =
      await ExternalPath.getExternalStoragePublicDirectory(ExternalPath.DIRECTORY_DOWNLOAD);

  final file = File('$downloadPath/favorites_backup.json');

  if (await file.exists()) {
    final content = await file.readAsString();
    final List data = jsonDecode(content);
    return data.toSet().cast<String>();
  }

  return {};
}

  // ===============================
  // INSERT FULL JSON
  // ===============================
Future<void> insertFullJson(List data) async {
  final db = await instance.database;

  await db.transaction((txn) async {
    // 1️⃣ Sauvegarder les favoris existants (par nom)
    final favouriteNames = await loadFavoritesFromDownload();


    // 2️⃣ Nettoyer les tables
    await txn.delete('channels');
    await txn.delete('categories');

    // 3️⃣ Réinsertion en conservant is_fav
    for (var category in data) {
      final catId = await txn.insert('categories', {
        'name': category['name']
      });

      for (var ch in category['channels']) {
        final isFav = favouriteNames.contains(ch['name']) ? 1 : 0;

        await txn.insert('channels', {
          'category_id': catId,
          'name': ch['name'],
          'poster': ch['poster'],
          'url': ch['url'],
          'resolutions': jsonEncode(ch['resolutions']),
          'is_fav': isFav,
        });
      }
    }
  });
}

  // ===============================
  // FETCH CHANNELS BY CATEGORY
  // ===============================
Future<List<Map<String, dynamic>>> getChannelsByCategory(int catId) async {
  final db = await instance.database;

  final result = await db.query(
    'channels',
    where: 'category_id = ?',
    whereArgs: [catId],
  );

  final List<Map<String, dynamic>> updated = [];

  for (final row in result) {
    final map = <String, dynamic>{};
    map.addAll(row);

    /*String? url = map['url'];

    if (url == null && map['resolutions'] != null) {
      final resolutions = jsonDecode(map['resolutions']);
      url = resolutions.entries.first.value['url'];
      map['url'] = url;
    }*/

    updated.add(map);
  }

  return updated; // Liste et Maps mutables
}


  Future<void> clearAllFavourites() async {
  final db = await database;
  await db.update(
    'channels',
    {'is_fav': 0},
    where: 'is_fav = 1',
  );
}

Future<List<Map<String, dynamic>>> getCategoriesWithCount() async {
  final db = await instance.database;

  final result = await db.rawQuery('''
    SELECT
      c.id,
      c.name,
      COUNT(ch.id) as cn
    FROM categories c
    LEFT JOIN channels ch
      ON ch.category_id = c.id
    GROUP BY c.id

  ''');

  return result;
}
  // ===============================
  // SEARCH CHANNELS
  // ===============================
Future<List<Map<String, dynamic>>> searchChannels(String query) async {
  final db = await database;
  final result= await db.query(
    'channels',
    where: 'LOWER(name) LIKE ?',
    whereArgs: ['%${query.toLowerCase()}%'],
    limit: 50
  );
 return  result.map((row) => Map<String, dynamic>.from(row)).toList();
}


}
