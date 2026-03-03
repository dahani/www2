import 'dart:convert';

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
  final String id;
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
      id: json['id'].toString(),
      name: name,
      poster: json['poster'],
      character: json['pivot']?['character'],
      rating: (json['rating'] as num).toDouble(),
      year: json['year'] ?? 0,
    );
  }
}
class ChannelModel {
  final int id;
  final String name;
  String url;
  final Map<String, dynamic>? resolutions;
  int isFav;
  final String poster;
  final bool isMovie;

  ChannelModel({
    required this.id,
    required this.name,
    required this.url,
    this.resolutions,
    this.isMovie=false,
    this.isFav = 0, required this.poster,
  });

  factory ChannelModel.fromMap(Map<String, dynamic> map) {

    return ChannelModel(
      id: map['id'],
      name: map['name'] ?? '',
      poster: map['poster'] ?? '',
      url: map['url'] ?? '',
      resolutions: jsonDecode(map['resolutions']),
      isFav: map['is_fav'] ?? 0,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'url': url,
      'poster': poster,
      'resolutions': resolutions,
      'is_fav': isFav,
    };
  }
}

class Movie {
  final String id;
  final String title;
  final String image;
  final String duration;
  final String description;
  final String backdrop;
  final double rating;
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'poster': image,
      'backdrop': backdrop,
      'rating': rating,
      'description': description,
    };
  }
 factory  Movie.fromMovieDetails(MovieDetails movie) {
  return Movie(
      id:  movie.id.toString(),
      title:  movie.title,
      image:  movie.poster,
      duration: movie.runtime,
      description: movie.description??"",
       backdrop:  movie.backdrop,
       rating: movie.rating,
  );

  }
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
   String name = (json['name'] ?? json['title'])
   .replaceAll(RegExp(r'(HD - مترجم |HD - |مترجم|فيلم)'), '')
    .trim();
    return Movie(
      id: json['id'].toString(),
      title: name,
      image: json['poster']??"",
      duration:json['runtime']!=null?json['runtime'] is String?json['runtime']: formatRuntime(json['runtime']):'----',
      description: json['description']??"",
       backdrop: json['backdrop']??"",

rating:((json['rating'] as num?)?.toDouble()) ?? 0.0,
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
  final String language;
  final String production;
  final int duration;
Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'poster': poster,
      'backdrop': backdrop,
      'rating': rating,
      'year': year,
      'description': description,
      'runtime': runtime,
      'genres': jsonEncode(genres), // Convert List to String
      'embedUrl': embedUrl,
    };
  }
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
    this.duration=0,
    this.embedUrl, required this.language, required this.production,
  });

  factory MovieDetails.fromJson(Map<String, dynamic> json) {
 var titleData = json['title'];

 String name = (titleData['original_title'] ?? titleData['name']??"")
    .replaceAll(RegExp(r'(مترجم|فيلم)'), '')
    .trim();
    return MovieDetails(
      id: titleData['id']??"",
      title: name,
      production: "eee",
      description: titleData['description']??"",
      language: json['language']??"",
      poster: titleData['poster']??"",
      backdrop: titleData['backdrop']??"",
      duration: titleData['runtime'],
      runtime: titleData['runtime']!=null?formatRuntime(titleData['runtime']):'----',
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
