import 'package:dlna/services/functions.dart';

class ActorDetails {
  final int id;
  final String name;
  final String? poster;
  final String? knownFor;
  final String? birthPlace;
  final List<MovieCredit> credits;
  final List<MovieCredit> creditsList;

  ActorDetails({
    required this.id,
    required this.name,
    this.poster,
    this.knownFor,
    this.birthPlace,
    required this.credits, required this.creditsList,
  });

  factory ActorDetails.fromJson(Map<String, dynamic> json) {
    var p = json['person'];
    return ActorDetails(
      id: p['id'],
      name: p['name'],
      poster: p['poster'],
      knownFor: p['known_for'],
      birthPlace: p['birth_place'],
      credits: (json['knownFor'] as List)
          .map((c) => MovieCredit.fromJson(c))
          .toList(),
      creditsList: (json['credits']['actors'] as List)
          .map((c) => MovieCredit.fromJson(c))
          .toList(),
    );
  }
}

class MovieCredit {
  final int id;
  final String name;
  final String poster;
  final String? character;
  final double rating;
  final int year;

  MovieCredit({
    required this.id,
    required this.name,
    required this.poster,
    this.character,
    required this.rating,
    required this.year,
  });

  factory MovieCredit.fromJson(Map<String, dynamic> json) {
     String name = (json['name'] ?? "")
    .replaceAll(RegExp(r'(HD - مترجم |HD - |مترجم|فيلم)'), '').trim();
    return MovieCredit(
      id: json['id'],
      name: name,
      poster: json['poster'],
      character: json['pivot']?['character'],
      rating: (json['rating'] as num).toDouble(),
      year: json['year'] ?? 0,
    );
  }
}
class Channel {
  final String name;
  final String url;
  final String icon;

  Channel({
    required this.name,
    required this.url,
    required this.icon,
  });

  factory Channel.fromJson(Map<String, dynamic> json) {
    return Channel(
      name: json['name'],
      url: json['url'],
      icon: json['icon'] ??
          "https://cdn-icons-png.flaticon.com/512/483/483947.png",
    );
  }
}
class Movie {
  final int id;
  final String title;
  final String image;
  final String duration;
  final String description;
  final String backdrop;
  final double rating;

  Movie({
    required this.id,
    required this.title,
    required this.image,
    required this.duration,
    required this.description,
    required this.backdrop,
    required this.rating,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
   String name = (json['name'] ?? "")
   .replaceAll(RegExp(r'(HD - مترجم |HD - |مترجم|فيلم)'), '')
    .trim();
    return Movie(
      id: json['id']??"",
      title: name,
      image: json['poster']??"",
      duration: formatRuntime( json['runtime']),
      description: json['description']??"",
       backdrop: json['backdrop']??"",

rating: ((json['rating'] as num?)?.toDouble()) ?? 0.0,
  );
  }
}
// 2965 total egybest
class MovieDetails {
  final int id;
  final String title;
  final String? description;
  final String poster;
  final String backdrop;
  final String runtime;
  final double rating;
  final int year;
  final List<String> genres;
  final List<Actor> actors;
  final String? embedUrl;

  MovieDetails({
    required this.id,
    required this.title,
    this.description,
    required this.poster,
    required this.backdrop,
    required this.runtime,
    required this.rating,
    required this.year,
    required this.genres,
    required this.actors,
    this.embedUrl,
  });

  factory MovieDetails.fromJson(Map<String, dynamic> json) {
 var titleData = json['title'];

 String name = (titleData['original_title'] ?? titleData['name']??"")
    .replaceAll(RegExp(r'(مترجم|فيلم)'), '')
    .trim();
    return MovieDetails(
      id: titleData['id']??"",
      title: name,
      description: titleData['description']??"",
      poster: titleData['poster']??"",
      backdrop: titleData['backdrop']??"",
      runtime: formatRuntime(titleData['runtime']),
      rating: (titleData['rating'] as num).toDouble(),
      year: titleData['year']??"",
      genres: (titleData['genres'] as List).map((g) => g['display_name'].toString()).toList(),
      actors: (json['credits']['actors'] as List).map((a) => Actor.fromJson(a)).toList(),
      embedUrl: (titleData['videos'] as List).isNotEmpty ? titleData['videos'][0]['src'] : null,
    );
  }
}

class Actor {
  final String name;
  final String character;
  final String? poster;
  final String id;

  Actor({required this.name, required this.character, this.poster, required this.id});

  factory Actor.fromJson(Map<String, dynamic> json) {
    return Actor(
      name: json['name'],
      character: json['pivot']['character'] ?? '',
      poster: json['poster'],
      id: json['id'].toString(),
    );
  }
}
class DlnaDevice {
  final String name;
  final String controlUrl;        // pour play / AVTransport
  final String renderingUrl;      // pour volume
  final String icon;
  DlnaDevice({required this.name, required this.controlUrl, required this.renderingUrl, required this.icon});
}
