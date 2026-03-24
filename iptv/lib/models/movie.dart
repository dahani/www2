class Movie {
  final int id;
  final String name;
  final String? releaseDate;
  final String? poster;
  final String? backdrop;
  final bool isSeries;
  final double rating;
  final int? runtime;
  final String? status;
  final String? description;
  final int? primaryVideoId;

  Movie({
    required this.id,
    required this.name,
    this.releaseDate,
    this.poster,
    this.backdrop,
    this.isSeries = false,
    this.rating = 0.0,
    this.runtime,
    this.status,
    this.description,
    this.primaryVideoId,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    String name = (json['name'] ?? "")
    .replaceAll(RegExp(r'(HD - مترجم |HD - |مترجم|فيلم)'), '').trim();
    return Movie(
      id: json['id'] as int,
      name: name,
      releaseDate: json['release_date'] as String?,
      poster: json['poster'] as String?,
      backdrop: json['backdrop'] as String?,
      isSeries: json['is_series'] as bool? ?? false,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      runtime: json['runtime'] as int?,
      status: json['status'] as String?,
      description: json['description'] as String?,
      primaryVideoId: json['primary_video']?['id'] as int?,
    );
  }
}

class MovieGenre {
  final int value;
  final String name;

  MovieGenre({
    required this.value,
    required this.name,
  });

  factory MovieGenre.fromJson(Map<String, dynamic> json) {
    return MovieGenre(
      value: json['value'] as int,
      name: json['name'] as String,
    );
  }
}

class MovieDetails {
  final int id;
  final String name;
  final String? type;
  final String? releaseDate;
  final String? description;
  final String? poster;
  final String? backdrop;
  final int? runtime;
  final double rating;
  final int voteCount;
  final String? status;
  final int year;
  final List<MovieVideo> videos;
  final List<Genre> genres;
  final Credits credits;

  MovieDetails({
    required this.id,
    required this.name,
    this.type,
    this.releaseDate,
    this.description,
    this.poster,
    this.backdrop,
    this.runtime,
    this.rating = 0.0,
    this.voteCount = 0,
    this.status,
    required this.year,
    this.videos = const [],
    this.genres = const [],
    required this.credits,
  });

  factory MovieDetails.fromJson(Map<String, dynamic> json) {
    final title = json['title'] as Map<String, dynamic>;
    final videosData = title['videos'] as List<dynamic>? ?? [];
    final genresData = title['genres'] as List<dynamic>? ?? [];

    String name = (title['name'] ?? "")
    .replaceAll(RegExp(r'(HD - مترجم |HD - |مترجم|فيلم)'), '').trim();
    return MovieDetails(
      id: title['id'] as int,
      name:name,
      type: title['type'] as String?,
      releaseDate: title['release_date'] as String?,
      description: title['description'] as String?,
      poster: title['poster'] as String?,
      backdrop: title['backdrop'] as String?,
      runtime: title['runtime'] as int?,
      rating: (title['rating'] as num?)?.toDouble() ?? 0.0,
      voteCount: title['vote_count'] as int? ?? 0,
      status: title['status'] as String?,
      year: title['year'] as int? ?? 0,
      videos: videosData.map((v) => MovieVideo.fromJson(v)).toList(),
      genres: genresData.map((g) => Genre.fromJson(g)).toList(),
      credits: Credits.fromJson(json['credits'] ?? {}),
    );
  }
}

class MovieVideo {
  final int id;
  final String name;
  final String src;
  final String type;
  final String quality;
  final String category;

  MovieVideo({
    required this.id,
    required this.name,
    required this.src,
    required this.type,
    required this.quality,
    required this.category,
  });

  factory MovieVideo.fromJson(Map<String, dynamic> json) {
    return MovieVideo(
      id: json['id'] as int,
      name: json['name'] as String? ?? '',
      src: json['src'] as String? ?? '',
      type: json['type'] as String? ?? 'embed',
      quality: json['quality'] as String? ?? 'hd',
      category: json['category'] as String? ?? 'full',
    );
  }
}

class Genre {
  final int id;
  final String name;
  final String displayName;

  Genre({
    required this.id,
    required this.name,
    required this.displayName,
  });

  factory Genre.fromJson(Map<String, dynamic> json) {
    return Genre(
      id: json['id'] as int,
      name: json['name'] as String,
      displayName: json['display_name'] as String? ?? json['name'] as String,
    );
  }
}

class Credits {
  final List<Person> directors;
  final List<Person> writers;
  final List<Person> actors;

  Credits({
    this.directors = const [],
    this.writers = const [],
    this.actors = const [],
  });

  factory Credits.fromJson(Map<String, dynamic> json) {
    final directing = json['directing'] as List<dynamic>? ?? [];
    final writing = json['writing'] as List<dynamic>? ?? [];
    final actors = json['actors'] as List<dynamic>? ?? [];

    return Credits(
      directors: directing.map((p) => Person.fromJson(p)).toList(),
      writers: writing.map((p) => Person.fromJson(p)).toList(),
      actors: actors.map((p) => Person.fromJson(p)).toList(),
    );
  }
}

class Person {
  final int id;
  final String name;
  final String? poster;
  final String? character;

  Person({
    required this.id,
    required this.name,
    this.poster,
    this.character,
  });

  factory Person.fromJson(Map<String, dynamic> json) {
    return Person(
      id: json['id'] as int,
      name: json['name'] as String,
      poster: json['poster'] as String?,
      character: json['pivot']?['character'] as String?,
    );
  }
}
